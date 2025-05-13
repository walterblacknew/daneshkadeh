
import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface ChatRoomFormData {
  roomName: string;
  description?: string;
  roomType: 'public' | 'private';
  enableAIAssistant: boolean;
}

export interface ChatRoom extends ChatRoomFormData {
  id: string; // Firestore document ID
  createdBy: string; // User ID of the creator
  createdAt: Timestamp | FieldValue; // Firestore Timestamp or FieldValue for server timestamp
  members: string[]; // Array of user IDs who are members
}

export interface MessageSender {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string; // Firestore document ID or client-generated for display
  text: string;
  sender: MessageSender;
  timestamp: Timestamp | FieldValue; // Firestore Timestamp or FieldValue for server timestamp
  roomId?: string; // For group chat messages
  dmThreadId?: string; // For direct messages
}

export interface PeerUser {
  id: string;
  name?: string;
  email: string;
  avatar?: string; // Optional: Construct from picsum or if stored
  role?: 'student' | 'teacher';
}

