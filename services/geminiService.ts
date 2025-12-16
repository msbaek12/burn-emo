import { GoogleGenAI, Chat } from "@google/genai";

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

let chatSession: Chat | null = null;

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7, // Slightly creative for metaphors
        },
      });
    }

    const response = await chatSession.sendMessage({ message: userMessage });
    return response.text || "죄송해요, 연기가 너무 매워서 말을 잇지 못했어요. 다시 한번 말씀해 주시겠어요?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "시스템에 문제가 생겨 감정을 태우지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
};