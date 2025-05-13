
import { db } from '@/lib/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { ChatRoom, ChatRoomFormData } from '@/types/chat';

/**
 * Adds a new chat room to Firestore.
 * @param roomData - The data for the new chat room.
 * @param userId - The ID of the user creating the room.
 * @returns The ID of the newly created chat room.
 */
export async function addChatRoomToFirestore(roomData: ChatRoomFormData, userId: string): Promise<string> {
  try {
    const newRoomRef = await addDoc(collection(db, 'chatRooms'), {
      ...roomData,
      createdBy: userId,
      createdAt: serverTimestamp(), // Uses server's timestamp
      members: [userId], // Creator is initially the only member
    });
    return newRoomRef.id;
  } catch (error) {
    console.error("Error adding chat room to Firestore: ", error);
    throw new Error("Failed to create chat room.");
  }
}

/**
 * Fetches all chat rooms from Firestore, ordered by creation date.
 * @returns A promise that resolves to an array of ChatRoom objects.
 */
export async function getChatRoomsFromFirestore(): Promise<ChatRoom[]> {
  try {
    const q = query(collection(db, 'chatRooms'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(), // Ensure createdAt is a Timestamp
      } as ChatRoom;
    });
  } catch (error) {
    console.error("Error fetching chat rooms from Firestore: ", error);
    throw new Error("Failed to fetch chat rooms.");
  }
}

// Future functions might include:
// export async function getChatRoomByIdFromFirestore(roomId: string): Promise<ChatRoom | null> { ... }
// export async function addUserToChatRoom(roomId: string, userId: string): Promise<void> { ... }
