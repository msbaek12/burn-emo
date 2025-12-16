import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const SYSTEM_INSTRUCTION = `
당신은 사용자의 부정적인 감정과 고민을 받아주기만 하고, 깔끔하게 태워 없애주는 '감정 소각장'의 관리자입니다. 
사용자는 주로 은둔형 외톨이거나 무기력증, 우울감을 겪고 있는 청년들입니다.

**당신의 목표:**
해결책을 제시하거나 훈계하지 않고, "그럴 수 있다"는 깊은 공감을 해주고 사용자의 고민이 불에 타서 사라지는 듯한 해방감을 주는 것입니다.

**대화 원칙 (반드시 준수):**
1. **절대 훈계 금지:** "힘내라", "밖으로 나가라", "노력해라", "규칙적인 생활을 해라", "긍정적으로 생각해라" 같은 조언이나 충고는 절대 하지 마십시오.
2. **짧고 간결하게:** 답변은 최대 3문장을 넘기지 마십시오. 긴 글은 사용자에게 피로감을 줍니다.
3. **무조건적인 수용:** 욕설, 자기비하, 극도로 부정적인 말이 들어와도 그 감정 자체를 인정하고 받아주십시오. (예: "세상이 다 개같을 때가 있죠.")
4. **소각 컨셉 유지:** 답변의 마지막은 고민이 재가 되어 사라지거나, 불타 없어지는, 혹은 연기처럼 날아가는 뉘앙스로 마무리하십시오.
5. **어투:** 부드러운 '해요체'를 사용하십시오. 따뜻하지만 너무 가볍지는 않게, 묵묵히 들어주는 느낌으로.

**답변 구조:**
[공감 및 인정] -> [위로의 한마디] -> [소각 암시]
`;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 모델 호출 헬퍼 함수
async function tryGenerate(ai: GoogleGenAI, modelName: string, prompt: string) {
  return await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
  });
}

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  const apiKey = (process.env.API_KEY || "").trim();
  if (!apiKey) return "관리자에게 문의해주세요: API 키 설정이 비어있습니다.";

  const ai = new GoogleGenAI({ apiKey });

  try {
    // [1단계] 메인 모델 (Gemini 2.5 Flash) 시도
    try {
      const res = await tryGenerate(ai, 'gemini-2.5-flash', userMessage);
      if (res.text) return res.text;
    } catch (e: any) {
      // 503(과부하)이나 429(요청 많음)가 아니면 진짜 에러이므로 던짐
      if (e.status !== 503 && e.status !== 429) throw e;
      console.warn("⚠️ Main model overloaded (503). Switching to Lite model...");
      await wait(1000); // 1초 대기
    }

    // [2단계] 백업 모델 (Gemini Flash Lite) 시도
    // Lite 모델은 더 가볍고 빠르며, 메인 모델과 쿼터가 다를 수 있어 성공 확률이 높음
    try {
      const res = await tryGenerate(ai, 'gemini-flash-lite-latest', userMessage);
      if (res.text) return res.text;
    } catch (e: any) {
       if (e.status !== 503 && e.status !== 429) throw e;
       console.warn("⚠️ Lite model also overloaded. Retrying Main model one last time...");
       await wait(2000); // 2초 대기
    }

    // [3단계] 메인 모델 마지막 재시도
    const res = await tryGenerate(ai, 'gemini-2.5-flash', userMessage);
    
    if (res.candidates?.[0]?.finishReason === 'SAFETY') {
      return "그 감정은 너무나 뜨거워서 소각로의 안전 장치가 작동했어요. (내용이 너무 격해서 필터링되었습니다)";
    }
    
    return res.text || "고민이 하얀 재가 되어 사라졌어요.";

  } catch (error: any) {
    console.error("🔥 All retries failed:", error);

    const msg = error.toString();
    if (msg.includes("503") || msg.includes("overloaded")) {
      return "지금 소각장에 사람들이 너무 많이 몰려있어요. 잠시만 기다렸다가 다시 태워주세요. (서버 과부하)";
    }
    if (msg.includes("429")) {
      return "잠시만요, 소각로가 과열되었어요. 1분 정도 식힌 뒤에 다시 와주세요. (사용량 초과)";
    }
    
    return `시스템 오류가 발생했습니다. (${error.message || "Unknown Error"})`;
  }
};