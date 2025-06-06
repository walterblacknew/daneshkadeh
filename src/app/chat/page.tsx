
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, UserCircle, PlusCircle, Loader2, MessageSquareText, Hash, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getChatRoomsFromFirestore, sendMessageInRoom, subscribeToRoomMessages } from '@/services/firestoreChat';
import type { ChatRoom, Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Timestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const COMMUNITY_CHAT_ID = 'community'; 
const COMMUNITY_CHAT_NAME = 'Community Chat Room';

export default function ChatPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | { id: string; roomName: string } | null>({ id: COMMUNITY_CHAT_ID, roomName: COMMUNITY_CHAT_NAME });

  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const rooms = await getChatRoomsFromFirestore();
      setChatRooms(rooms);
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
      toast({
        title: "Error",
        description: "Could not load chat rooms. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRooms(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoggedIn) { 
      fetchRooms();
    }
  }, [isLoggedIn, fetchRooms]);
  
  useEffect(() => {
    if (unsubscribeMessagesRef.current) {
      unsubscribeMessagesRef.current(); 
      unsubscribeMessagesRef.current = null;
    }

    if (selectedRoom?.id && isLoggedIn) { 
      setMessages([]); 
      const unsubscribe = subscribeToRoomMessages(selectedRoom.id, (updatedMessages) => {
        // Filter out 'sending' status messages if the real one has arrived
        const serverMessages = updatedMessages.filter(msg => msg.status !== 'sending');
        setMessages(prevMessages => {
          const clientSendingMessages = prevMessages.filter(
            pm => pm.status === 'sending' && !serverMessages.find(sm => sm.text === pm.text && sm.sender.id === pm.sender.id) // Basic check
          );
          return [...serverMessages, ...clientSendingMessages];
        });
      });
      unsubscribeMessagesRef.current = unsubscribe;
    } else {
      setMessages([]); 
    }

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [selectedRoom, isLoggedIn]); 

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !selectedRoom || isSending) return;

    const tempId = `temp_${Date.now()}`;
    const senderInfo = { 
      id: user.id, 
      name: user.name || user.email.split('@')[0], 
      avatar: user.avatar || `https://picsum.photos/seed/${user.email}/40/40` 
    };

    const optimisticMessage: Message = {
      id: tempId,
      text: newMessage,
      sender: senderInfo,
      timestamp: new Date(),
      roomId: selectedRoom.id,
      status: 'sending',
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    const messageTextToSend = newMessage;
    setNewMessage('');
    setIsSending(true);

    try {
      await sendMessageInRoom(selectedRoom.id, senderInfo, messageTextToSend);
      setMessages(prev => prev.map(m => m.id === tempId ? {...m, status: 'sent'} : m));
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
      setNewMessage(messageTextToSend);
    } finally {
      setIsSending(false);
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const formatTimestamp = (timestamp: Message['timestamp']): string => {
    if (!timestamp) return '';
    if (typeof (timestamp as Timestamp).toDate === 'function') { // Firestore Timestamp
      return (timestamp as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timestamp instanceof Date) { // JavaScript Date
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(timestamp.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Alert variant="default" className="max-w-md">
          <UserCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need to be logged in to access the chat.
            <div className="mt-4">
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
      <Card className="lg:w-1/3 hidden lg:flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Chat Rooms</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/chat/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Room
            </Link>
          </Button>
        </CardHeader>
        <ScrollArea className="flex-grow">
          <CardContent>
            {isLoadingRooms ? (
              <div className="space-y-2 p-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="space-y-1">
                 <Button
                    variant={selectedRoom?.id === COMMUNITY_CHAT_ID ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRoom({ id: COMMUNITY_CHAT_ID, roomName: COMMUNITY_CHAT_NAME })}
                  >
                    <Hash className="mr-2 h-4 w-4" /> {COMMUNITY_CHAT_NAME}
                  </Button>
                {chatRooms.length > 0 ? chatRooms.map(room => (
                  <Button
                    key={room.id}
                    variant={selectedRoom?.id === room.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" /> {room.roomName}
                  </Button>
                )) : (
                  <p className="text-sm text-muted-foreground p-4 text-center">No rooms created yet. Be the first!</p>
                )}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
      
      <div className="flex flex-col flex-grow h-full border rounded-lg shadow-lg bg-card">
        <header className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">{selectedRoom?.roomName || 'Select a Room'}</h1>
          <Button variant="outline" size="sm" asChild className="lg:hidden">
            <Link href="/chat/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New
            </Link>
          </Button>
        </header>

        {!selectedRoom ? (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            <p>Select a room to start chatting or create a new one.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                  No messages in this room yet. Start the conversation!
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 my-2 ${msg.sender.id === user?.id ? 'justify-end' : ''}`}>
                  {msg.sender.id !== user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} data-ai-hint="user avatar"/>
                      <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`p-3 rounded-lg max-w-[70%] ${msg.sender.id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.sender.id !== user?.id && <p className="text-sm font-medium">{msg.sender.name}</p>}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-xs text-muted-foreground/80 mt-1 flex items-center">
                       <span>{formatTimestamp(msg.timestamp)}</span>
                       {msg.sender.id === user?.id && msg.status === 'sending' && <Loader2 className="h-3 w-3 animate-spin inline-block ml-1" />}
                       {msg.sender.id === user?.id && msg.status === 'failed' && (
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <AlertTriangle className="h-3 w-3 text-destructive inline-block ml-1 cursor-pointer" />
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Failed to send</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                       )}
                    </div>
                  </div>
                  {msg.sender.id === user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || `https://picsum.photos/seed/${user.email}/40/40`} alt={user.name || ''} data-ai-hint="user avatar"/>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Message ${selectedRoom.roomName}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow"
                disabled={!selectedRoom || isSending}
              />
              <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={!selectedRoom || newMessage.trim() === '' || isSending}>
                {isSending && messages.some(m => m.status === 'sending' && m.text === newMessage) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" /> }
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
