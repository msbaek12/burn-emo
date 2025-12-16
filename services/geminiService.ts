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

// 간단한 지수 백오프 재시도 로직
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getGeminiResponse = async (userMessage: string, retryCount = 0): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("MISSING_API_KEY");

    // 매 요청마다 새로운 클라이언트를 생성하는 것이 stateless 환경(Vercel 등)에서 더 안전합니다.
    const ai = new GoogleGenAI({ apiKey });

    // ChatSession 대신 generateContent를 사용합니다.
    // 감정 소각장은 이전 대화를 기억할 필요가 없으며(이미 태웠으므로),
    // 기억을 못 하는 것이 컨셉에 더 맞고 오류도 적습니다.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage, // 단순 텍스트 혹은 content object
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8, // 감성적인 표현을 위해 창의성 높임
        // 안전 설정: 사용자가 부정적인 감정(욕설, 비관 등)을 쏟아낼 때 차단되지 않도록 완화
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      },
    });

    // 텍스트가 없으면(필터링됨) 대체 메시지 반환
    const text = response.text;
    if (!text) {
        return "그 감정은 너무나 뜨거워서, 하얀 재만 남기고 순식간에 사라졌어요. (내용이 너무 격렬해서 말이 나오지 않았나 봐요.)";
    }

    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // 503 (Server Overload) 에러 시 1회 재시도
    if (error.status === 503 && retryCount < 1) {
        console.log("Retrying request due to 503...");
        await wait(1500);
        return getGeminiResponse(userMessage, retryCount + 1);
    }

    // 에러 메시지 분기
    if (error.message === "MISSING_API_KEY") {
        return "관리자님, 소각로의 점화 플러그(API KEY)가 빠져있습니다. 설정 확인이 필요해요.";
    }

    // 안전 필터나 기타 이유로 블락된 경우
    if (error.toString().includes("SAFETY") || error.toString().includes("blocked")) {
        return "당신의 감정이 너무 강렬해서 소각로가 잠시 멈췄어요. 하지만 그 마음은 확실히 받았습니다.";
    }

    return "연기가 너무 매워서 잠시 눈을 뜰 수가 없네요. 잠시 후 다시 태워주세요.";
  }
};