import { Message } from '../types';

// NOTE: This file runs in the browser. 
// It MUST NOT import @google/genai or use process.env.API_KEY.
// Its only job is to send the message to our own server (server.js).

export const sendMessageStream = async (
  message: string,
  history: Message[],
  onChunk: (text: string) => void
): Promise<string> => {
  
  try {
    // Filter the history to remove error messages or loading states.
    // We send this clean history to the backend so the AI remembers the conversation.
    const validHistory = history.filter(h => !h.isError && !h.isStreaming);

    // Call our own server endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        // We map the message to a simple structure to send over the network
        history: validHistory.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }))
      }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    // Read the stream coming from server.js
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText);
    }
    
    return fullText;

  } catch (error) {
    console.error("Error sending message to server:", error);
    throw error;
  }
};

export const resetChat = () => {
  // The server is stateless (we pass history every time), 
  // so there is no session object to reset here.
};