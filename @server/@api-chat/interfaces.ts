// src/api-chat/interfaces.ts
import { Socket } from 'socket.io';

export interface SocketWithUsername extends Socket {
  username?: string;
}

export interface DirectMessageData {
  recipient: string;
  content: string;
}

export interface MessageResponse {
  sender?: string;
  content: string;
  timestamp: string;
}
