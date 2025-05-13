
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, Send, UserCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription as UIDescription } from '@/components/ui/alert'; // Renamed to avoid conflict
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { Message, PeerUser } from '@/types/chat';
import { getUserById } from '@/services/firestoreUser';
import { 
  getOrCreateDirectMessageThreadId, 
  sendDirectMessage, 
  subscribeToDirectMessages 
} from '@/services/firestoreChat';
import type { Timestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function DirectMessagePage() {
  const params = useParams();
  const router = useRouter();
  const peerId = params.peerId as string; 
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [peerUser, setPeerUser] = useState<PeerUser | null>(null);
  const [isLoadingPeerUser, setIsLoadingPeerUser] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/signin');
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (peerId) {
      setIsLoadingPeerUser(true);
      getUserById(peerId)
        .then(data => {
          if (data) {
            setPeerUser({
              id: data.id,
              name: data.name || data.email.split('@')[0],
              email: data.email,
              avatar: data.avatar || `https://picsum.photos/seed/${data.email}/40/40`,
              role: data.role,
            });
          } else {
            toast({ title: "Error", description: "Could not find user.", variant: "destructive" });
          }
        })
        .catch(err => {
          console.error("Failed to fetch peer user:", err);
          toast({ title: "Error", description: "Failed to load user details.", variant: "destructive" });
        })
        .finally(() => setIsLoadingPeerUser(false));
    }
  }, [peerId, toast]);

  useEffect(() => {
    if (user && peerUser) {
      getOrCreateDirectMessageThreadId(user.id, peerUser.id)
        .then(id => {
          setThreadId(id);
          const unsubscribe = subscribeToDirectMessages(id, (updatedMessages) => {
            // Filter out 'sending' status messages if the real one has arrived
            // This assumes server messages don't have 'sending' status
            const serverMessages = updatedMessages.filter(msg => msg.status !== 'sending');
            setMessages(prevMessages => {
              const clientSendingMessages = prevMessages.filter(
                pm => pm.status === 'sending' && !serverMessages.find(sm => sm.text === pm.text && sm.sender.id === pm.sender.id) // Basic check
              );
              return [...serverMessages, ...clientSendingMessages];
            });
          });
          return () => unsubscribe(); 
        })
        .catch(err => {
          console.error("Failed to get/create DM thread:", err);
          toast({ title: "Chat Error", description: "Could not initialize chat.", variant: "destructive" });
        });
    }
  }, [user, peerUser, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !threadId || !peerUser || isSending) return;

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
      dmThreadId: threadId,
      status: 'sending',
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    const messageTextToSend = newMessage;
    setNewMessage(''); 
    setIsSending(true); 

    try {
      await sendDirectMessage(threadId, senderInfo, messageTextToSend);
      // On success, Firestore listener will update. We can remove the 'sending' status or the temp message if needed,
      // but onSnapshot replacing the array usually handles this.
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


  if (authLoading || isLoadingPeerUser) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Alert variant="default" className="max-w-md">
          <UserCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <UIDescription>
            You need to be logged in to send messages.
            <div className="mt-4">
              <Button asChild><Link href="/signin">Sign In</Link></Button>
            </div>
          </UIDescription>
        </Alert>
      </div>
    );
  }

  if (!peerUser) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center p-4">
         <Alert variant="destructive" className="max-w-md">
           <UserCircle className="h-4 w-4" />
           <AlertTitle>User Not Found</AlertTitle>
           <UIDescription>
             The user you are trying to message could not be found.
             <div className="mt-4">
               <Button variant="outline" asChild><Link href={params.teacherId ? "/teachers" : "/chat"}>Back</Link></Button>
             </div>
           </UIDescription>
         </Alert>
       </div>
     );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <Button variant="outline" asChild className="mb-4 self-start">
        <Link href={peerUser.role === 'teacher' ? "/teachers" : "/chat"}> 
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={peerUser.avatar} alt={peerUser.name} data-ai-hint="user avatar"/>
              <AvatarFallback>{getInitials(peerUser.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold">{peerUser.name}</CardTitle>
              <CardDescription>Direct message</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground">No messages yet. Say hello!</p>
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
                    <AvatarImage src={user.avatar || `https://picsum.photos/seed/${user.email}/40/40`} alt={user.name} data-ai-hint="user avatar"/>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2 shrink-0">
            <Input
              type="text"
              placeholder={`Message ${peerUser.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
              disabled={isSending || !threadId}
            />
            <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={isSending || !threadId || newMessage.trim() === ''}>
              {isSending && messages.some(m => m.status === 'sending' && m.text === newMessage /* very basic check */) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
