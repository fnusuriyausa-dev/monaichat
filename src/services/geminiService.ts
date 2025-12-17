import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

// Initialize the client directly in the browser
// The API key is injected by Vite at build time via vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

// Store the chat session in memory
let chatSession: Chat | null = null;

const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
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
  // We accept history but ignore it here because the 'chatSession' object maintains it automatically
  history: Message[], 
  onChunk: (text: string) => void
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    const errorMsg = "API Key is missing. Please add API_KEY to your Render Environment Variables.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

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
    // If the session becomes invalid (e.g. token limit), reset it for next time
    chatSession = null; 
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};