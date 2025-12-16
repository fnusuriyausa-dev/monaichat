import { Message, Sender } from '../types';

// We no longer import GoogleGenAI here. 
// The frontend only knows how to talk to our own /api/chat endpoint.

export const sendMessageStream = async (
  message: string,
  history: Message[],
  onChunk: (text: string) => void
): Promise<string> => {
  
  try {
    // Filter history to remove error messages or loading states if necessary
    // and exclude the current message being sent (as it's passed separately)
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
  // Since the server is stateless (we pass history every time), 
  // there is nothing to reset in the service layer.
  // The UI simply clears its messages state.
};
