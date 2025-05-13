
import type { Timestamp } from 'firebase/firestore';

export interface ChatRoomFormData {
  roomName: string;
  description?: string;
  roomType: 'public' | 'private';
  enableAIAssistant: boolean;
}

export interface ChatRoom extends ChatRoomFormData {
  id: string; // Firestore document ID
  createdBy: string; // User ID of the creator
  createdAt: Timestamp; // Firestore Timestamp
  members: string[]; // Array of user IDs who are members
}

// Existing Message interface from chat page, potentially to be expanded
export interface Message {
  id: string;
  roomId?: string; // To associate message with a room
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date | Timestamp; // Can be JS Date or Firestore Timestamp
}
