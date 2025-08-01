import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { StockAnalysis, Source } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a professional stock analyst providing long-term value investment analysis.

**TASK:**
Analyze the provided stock name and return a detailed analysis in a specific JSON format.

**PROCESS:**
1.  **Use Google Search:** You MUST use Google Search to get the most recent and accurate financial data for the analysis.
2.  **Apply Scoring Rubric:** Strictly follow the detailed scoring rubric provided below to calculate scores for each category.
3.  **Write Commentary:** 약 1000자 분량으로 상세한 애널리스트 코멘트를 한국어로 작성하세요. 코멘트는 반드시 3가지 주요 분석 기준(1. 수익성/저평가, 2. 주주 환원, 3. 미래 성장 잠재력) 각각에 대한 상세한 설명을 포함해야 합니다. 최종 투자 의견으로 마무리하세요. JSON의 모든 'value' 필드도 한국어로 작성해야 합니다.


**SCORING RUBRIC:**
*   **1. Profitability/Undervaluation**
    *   per (20p): <5: 20, <8: 15, <10: 10, >=10: 5
    *   pbr (5p): <0.3: 5, <0.6: 4, <1.0: 3, >=1.0: 0
    *   sustainability (5p): '대체로 지속 가능': 5, '불안정한 이익 창출력': 0
    *   duplicateListing (5p): '단독 상장': 5, '중복 상장': 0
*   **2. Shareholder Return**
    *   dividendYield (10p): >7%: 10, >5%: 7, >3%: 5, <=3%: 2
    *   quarterlyDividends (5p): '예': 5, '아니요': 0
    *   dividendIncreaseYears (5p): 10+y: 5, 5+y: 4, 3+y: 3, N/A: 0
    *   buybackAndCancellation (7p): '예': 7, '아니요': 0
    *   annualCancellationRate (8p): >2%: 8, >1.5%: 5, >0.5%: 3, <=0.5% or N/A: 0
    *   treasuryStockRatio (5p): '없음': 5, <2%: 4, <5%: 2, >=5%: 0
*   **3. Future Growth Potential**
    *   futurePotential (10p): '매우 높다': 10, '높다': 7, '보통': 5, '낮다': 3
    *   corporateGovernance (10p): '우수한 경영': 10, '전문 경영': 5, '저조한 실적 오너 경영': 0
    *   globalBrand (5p): '있다': 5, '없다': 0

**OUTPUT FORMAT (MUST BE ONLY THIS JSON OBJECT):**
{
  "companyName": "The name of the company analyzed",
  "profitability": {
    "per": { "value": "...", "score": ... },
    "pbr": { "value": "...", "score": ... },
    "sustainability": { "value": "...", "score": ... },
    "duplicateListing": { "value": "...", "score": ... }
  },
  "shareholderReturn": {
    "dividendYield": { "value": "...", "score": ... },
    "quarterlyDividends": { "value": "...", "score": ... },
    "dividendIncreaseYears": { "value": "...", "score": ... },
    "buybackAndCancellation": { "value": "...", "score": ... },
    "annualCancellationRate": { "value": "...", "score": ... },
    "treasuryStockRatio": { "value": "...", "score": ... }
  },
  "growthPotential": {
    "futurePotential": { "value": "...", "score": ... },
    "corporateGovernance": { "value": "...", "score": ... },
    "globalBrand": { "value": "...", "score": ... }
  },
  "analystCommentary": "약 1000자 분량의 상세 분석 (한국어). 3가지 기준(수익성, 주주환원, 성장성)에 대한 상세 설명과 최종 투자 의견을 포함해야 합니다."
}
`;


export const analyzeStock = async (stockName: string): Promise<Partial<StockAnalysis>> => {
  const modelResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the stock: ${stockName}`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    }
  });

  const responseText = modelResponse.text.trim();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    console.error("Failed to find JSON in response:", responseText);
    throw new Error("모델 응답에서 유효한 분석 데이터를 찾지 못했습니다.");
  }

  const jsonText = jsonMatch[0];
  let parsedData: Partial<StockAnalysis>;
  
  try {
    parsedData = JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonText, e);
    throw new Error("모델이 반환한 데이터의 형식이 올바르지 않습니다.");
  }

  const groundingMetadata = modelResponse.candidates?.[0]?.groundingMetadata;
  const sources: Source[] = groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({
      uri: chunk.web?.uri,
      title: chunk.web?.title,
    }))
    .filter((source: any): source is Source => !!source.uri && !!source.title)
    .filter((source: Source) => !source.uri.startsWith('https://www.google.com/search')) ?? [];

  const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

  return {
    ...parsedData,
    sources: uniqueSources,
  };
};


export const startChat = async (): Promise<Chat> => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful stock analyst assistant. You are answering follow-up questions based on a previous, comprehensive analysis. Be concise and helpful. Answer in Korean.',
        }
    });
    return chat;
};

export const sendMessage = async (chat: Chat, message: string): Promise<AsyncGenerator<string>> => {
    const result = await chat.sendMessageStream({ message });
    
    // Create an async generator to yield text parts
    async function* streamGenerator(): AsyncGenerator<string> {
        for await (const chunk of result) {
            yield chunk.text;
        }
    }

    return streamGenerator();
};