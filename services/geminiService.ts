import { GoogleGenAI } from "@google/genai";
import { TarotCard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTarotInterpretation = async (
  question: string,
  spreadName: string,
  cards: { positionName: string; positionDesc: string; card: TarotCard }[]
) => {
  const model = "gemini-3-flash-preview";
  
  // Construct the card list string
  const cardListString = cards.map((c, index) => 
    `${index + 1}. [${c.positionName} - ${c.positionDesc}]: ${c.card.name_cn} (${c.card.name}) - ${c.card.isReversed ? '逆位 (Reversed)' : '正位 (Upright)'} - 原型: ${c.card.archetype}`
  ).join('\n');

  const prompt = `
    你是一位神秘、智慧且富有同理心的塔罗牌占卜师。
    求问者的问题是: "${question}"。
    使用的牌阵是: "${spreadName}"。
    
    抽出的牌如下:
    ${cardListString}
    
    请提供一份详尽的解读。结构如下:
    1. **单张分析**: 简要分析每一张牌在其位置上的含义。
    2. **综合联结**: 分析牌与牌之间的联系、元素互动或故事线。
    3. **最终指引**: 针对求问者的问题，给出基于牌阵的直接建议和预测。
    
    语气: 神秘但落地，具有治愈感。请使用Markdown格式，重点加粗。不要过度堆砌辞藻，要言之有物。
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "你是一位专业的塔罗牌占卜师，语气神秘、温柔且富有洞察力。",
      }
    });

    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeQuestion = async (question: string) => {
    const model = "gemini-3-flash-preview";
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `分析以下塔罗牌占卜问题。提取3个代表问题核心能量的中文关键词。只返回关键词，用逗号分隔。问题: "${question}"`
        });
        return response.text;
    } catch (e) {
        return "命运, 神秘, 星辰";
    }
}
