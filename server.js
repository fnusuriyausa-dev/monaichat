import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Gemini Client (Server-side only)
// The API key is safe here because this code runs on the server, not the browser.
// Ensure process.env.API_KEY is set in your environment variables.
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

// API Endpoint for Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Convert frontend message format to Gemini content format
    // We filter out any empty messages or errors just in case
    const contents = history
      .filter(msg => msg.text && msg.text.trim() !== "")
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    // Create chat with gemini-2.5-flash (Standard model for text tasks)
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: contents
    });

    // Send the new message and get a stream
    const resultStream = await chat.sendMessageStream({ message });

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream chunks back to the client
    for await (const chunk of resultStream) {
      const chunkText = chunk.text || "";
      res.write(chunkText);
    }
    
    res.end();

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(join(__dirname, 'dist')));

// Handle client-side routing by serving index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});