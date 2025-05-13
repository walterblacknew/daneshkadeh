
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
  setDoc,
  onSnapshot,
  Timestamp,
  where,
  limit,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import type { ChatRoom, ChatRoomFormData, Message, MessageSender } from '@/types/chat';

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
      createdAt: serverTimestamp(),
      members: [userId], 
    });
    return newRoomRef.id;
  } catch (error) {
    console.error("Error adding chat room to Firestore: ", error);
    throw new Error("Failed to create chat room.");
  }
}

/**
 * Fetches all chat rooms from Firestore, ordered by creation date.
 * TODO: Implement pagination or limit for large numbers of rooms.
 * TODO: Filter for public rooms or rooms user is a member of if not an admin.
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
        createdAt: data.createdAt || Timestamp.now(), 
      } as ChatRoom;
    });
  } catch (error) {
    console.error("Error fetching chat rooms from Firestore: ", error);
    throw new Error("Failed to fetch chat rooms.");
  }
}


/**
 * Generates a consistent, sorted ID for a direct message thread between two users.
 * @param userId1 First user ID.
 * @param userId2 Second user ID.
 * @returns A string representing the direct message thread ID.
 */
function generateDMThreadId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

/**
 * Gets or creates a direct message thread ID and ensures the thread document exists.
 * @param userId1 Current user's ID.
 * @param userId2 Peer user's ID.
 * @returns The ID of the direct message thread.
 */
export async function getOrCreateDirectMessageThreadId(userId1: string, userId2: string): Promise<string> {
  const threadId = generateDMThreadId(userId1, userId2);
  const threadDocRef = doc(db, 'directMessageThreads', threadId);
  
  try {
    const threadDocSnap = await getDoc(threadDocRef);
    if (!threadDocSnap.exists()) {
      await setDoc(threadDocRef, {
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(), // Initialize last message time
      });
    }
    return threadId;
  } catch (error) {
    console.error("Error getting or creating DM thread:", error);
    throw new Error("Failed to initialize direct message thread.");
  }
}

/**
 * Sends a message in a direct message thread.
 * @param threadId The ID of the DM thread.
 * @param sender The sender's information.
 * @param text The message text.
 */
export async function sendDirectMessage(threadId: string, sender: MessageSender, text: string): Promise<void> {
  try {
    const messagesColRef = collection(db, 'directMessageThreads', threadId, 'messages');
    await addDoc(messagesColRef, {
      text,
      sender,
      timestamp: serverTimestamp(),
      dmThreadId: threadId,
    });
    // Update last message timestamp on the thread document for sorting/notifications
    const threadDocRef = doc(db, 'directMessageThreads', threadId);
    await setDoc(threadDocRef, { lastMessageAt: serverTimestamp() }, { merge: true });
    // TODO: Trigger notification for the recipient.
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw new Error("Failed to send message.");
  }
}

/**
 * Subscribes to messages in a direct message thread.
 * @param threadId The ID of the DM thread.
 * @param onMessagesUpdate Callback function to handle updated messages.
 * @returns An unsubscribe function.
 */
export function subscribeToDirectMessages(
  threadId: string,
  onMessagesUpdate: (messages: Message[]) => void
): () => void {
  const messagesColRef = collection(db, 'directMessageThreads', threadId, 'messages');
  const q = query(messagesColRef, orderBy('timestamp', 'asc'), limit(50)); // Get latest 50, consider pagination

  const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const messages = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Message));
    onMessagesUpdate(messages);
  }, (error) => {
    console.error("Error subscribing to direct messages:", error);
    // Potentially call onMessagesUpdate with an empty array or an error indicator
  });

  return unsubscribe;
}


/**
 * Sends a message in a chat room.
 * @param roomId The ID of the chat room.
 * @param sender The sender's information.
 * @param text The message text.
 */
export async function sendMessageInRoom(roomId: string, sender: MessageSender, text: string): Promise<void> {
  try {
    const messagesColRef = collection(db, 'chatRooms', roomId, 'messages');
    await addDoc(messagesColRef, {
      text,
      sender,
      timestamp: serverTimestamp(),
      roomId: roomId,
    });
    // TODO: Trigger notification for room members.
  } catch (error) {
    console.error("Error sending message in room:", error);
    throw new Error("Failed to send message in room.");
  }
}

/**
 * Subscribes to messages in a chat room.
 * @param roomId The ID of the chat room.
 * @param onMessagesUpdate Callback function to handle updated messages.
 * @returns An unsubscribe function.
 */
export function subscribeToRoomMessages(
  roomId: string,
  onMessagesUpdate: (messages: Message[]) => void
): () => void {
  const messagesColRef = collection(db, 'chatRooms', roomId, 'messages');
  const q = query(messagesColRef, orderBy('timestamp', 'asc'), limit(100)); // Get latest 100, consider pagination

  const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const messages = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Message));
    onMessagesUpdate(messages);
  }, (error) => {
    console.error(`Error subscribing to room messages for ${roomId}:`, error);
    // Potentially call onMessagesUpdate with an empty array or an error indicator
  });

  return unsubscribe;
}
