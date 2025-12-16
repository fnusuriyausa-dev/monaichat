import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the client
// The API key is guaranteed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to enforce Mon and English languages
const SYSTEM_INSTRUCTION = `
You are a helpful, intelligent assistant that speaks ONLY in Mon and English.

RULES:
1. If the user inputs text in Mon (Burmese script/Mon language), you MUST respond in Mon.
2. If the user inputs text in English, you MUST respond in English.
3. If the user inputs text in a mixed language, respond in the language that is most dominant or ask for clarification in both languages.
4. If the user inputs text in a language other than Mon or English (e.g., Spanish, French, Burmese, Thai), you must politely refuse to answer in that language. You should reply with a standard message in both English and Mon stating that you only support Mon and English.
5. Keep your responses helpful, polite, and culturally appropriate.
6. For Mon language, ensure you use proper grammar and vocabulary suitable for a general audience.

CONTEXT:
The user is using a specialized app designed to bridge communication between English and Mon speakers or to assist native Mon speakers.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  const chat = getChatSession();
  
  try {
    const resultStream = await chat.sendMessageStream({ message });
    
    let fullText = "";
    
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const chunkText = c.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
    
    return fullText;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};