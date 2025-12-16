import { Message } from '../types';

// We DO NOT import GoogleGenAI here.
// This file runs in the browser, so it must not have API keys.
// It simply sends a message to our own server.

export const sendMessageStream = async (
  message: string,
  history: Message[],
  onChunk: (text: string) => void
): Promise<string> => {
  
  try {
    // Filter history to remove error messages or loading states
    // We send this history to the server so it knows the context
    const validHistory = history.filter(h => !h.isError && !h.isStreaming);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
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
        throw new Error(`Server error: ${response.status}`);
    }

    // Read the stream from our server
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
  // so there is no session to reset on the backend.
};