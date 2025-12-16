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

export const getGeminiResponse = async (userMessage: string, retryCount = 0): Promise<string> => {
  try {
    // API 키 공백 제거 및 확인
    const apiKey = (process.env.API_KEY || "").trim();
    if (!apiKey) throw new Error("MISSING_API_KEY");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // 공감 능력을 위해 창의성 높임
        // 안전 설정: 감정 배설을 위해 모든 필터를 끕니다 (BLOCK_NONE)
        // 주의: BLOCK_NONE을 사용해도 아동 안전 등 절대적인 기준은 걸릴 수 있습니다.
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    // 1. 정상적으로 텍스트가 나온 경우
    if (response.text) {
        return response.text;
    }

    // 2. 텍스트가 없으면 안전 필터(Safety) 혹은 기타 사유로 차단된 것
    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
        return "그 감정은 너무나 뜨겁고 강렬해서, 소각로의 안전 장치가 작동했어요. (내용이 너무 격해서 필터링되었습니다. 조금만 더 순화해서 태워주세요.)";
    }

    return "고민이 흔적도 없이 사라졌어요. (AI가 응답을 생성하지 못했습니다)";

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // 429 에러 (Too Many Requests) - 1회 재시도
    if ((error.status === 429 || error.status === 503) && retryCount < 1) {
        await wait(2000);
        return getGeminiResponse(userMessage, retryCount + 1);
    }

    // 사용자에게 보여줄 에러 메시지 가공
    const errorMsg = error.toString();

    if (errorMsg.includes("429")) {
        return "소각장이 너무 붐비네요. 잠시 열기를 식히고 1분 뒤에 다시 와주세요. (사용량 초과)";
    }

    if (errorMsg.includes("API_KEY")) {
        return "관리자에게 문의해주세요: API 키 설정에 문제가 있습니다.";
    }

    if (errorMsg.includes("SAFETY")) {
         return "감정이 너무 격렬해서 소각로가 잠시 멈췄어요. (안전 필터 차단)";
    }

    // 디버깅을 위해 실제 에러 메시지를 화면에 출력 (개발 단계)
    return `시스템 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`;
  }
};