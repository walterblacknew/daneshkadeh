
'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
}

const mockMessages: Message[] = [
  { id: '1', text: 'Hello everyone! Anyone working on calculus problems?', sender: { id: 'user1', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40' }, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', text: 'Hi Alice! I am. Stuck on derivatives.', sender: { id: 'user2', name: 'Bob', avatar: 'https://picsum.photos/seed/bob/40/40' }, timestamp: new Date(Date.now() - 1000 * 60 * 3) },
  { id: '3', text: 'Welcome to the MathFluent chat! Feel free to ask questions or discuss math topics.', sender: { id: 'system', name: 'MathFluent Bot', avatar: 'https://picsum.photos/seed/bot/40/40' }, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
];


export default function ChatPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: {
        id: user.id,
        name: user.name || 'Anonymous',
        avatar: `https://picsum.photos/seed/${user.email}/40/40`,
      },
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');
  };
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-full"><UserCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Alert variant="default" className="max-w-md">
          <UserCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need to be logged in to access the chat room.
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
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto border rounded-lg shadow-lg bg-card">
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold text-foreground">Community Chat Room</h1>
      </header>

      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 my-2 ${msg.sender.id === user?.id ? 'justify-end' : ''}`}>
            {msg.sender.id !== user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
              </Avatar>
            )}
            <div className={`p-3 rounded-lg max-w-[70%] ${msg.sender.id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <p className="text-sm font-medium">{msg.sender.name}</p>
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-muted-foreground/80 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
             {msg.sender.id === user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
