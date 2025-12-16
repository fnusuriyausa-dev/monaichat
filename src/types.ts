export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}