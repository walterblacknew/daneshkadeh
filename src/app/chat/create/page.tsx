
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { addChatRoomToFirestore } from '@/services/firestoreChat';
import type { ChatRoomFormData } from '@/types/chat';


const createChatRoomSchema = z.object({
  roomName: z.string().min(3, { message: 'Room name must be at least 3 characters.' }).max(50, { message: 'Room name must be 50 characters or less.' }),
  description: z.string().max(200, { message: 'Description must be 200 characters or less.' }).optional(),
  roomType: z.enum(['public', 'private'], { required_error: 'Please select a room type.' }),
  enableAIAssistant: z.boolean().default(false),
});

type CreateChatRoomFormValues = z.infer<typeof createChatRoomSchema>;

export default function CreateChatRoomPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateChatRoomFormValues>({
    resolver: zodResolver(createChatRoomSchema),
    defaultValues: {
      roomName: '',
      description: '',
      roomType: 'public',
      enableAIAssistant: false,
    },
  });

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/signin');
    }
  }, [authLoading, isLoggedIn, router]);

  const onSubmit = async (data: CreateChatRoomFormValues) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a room.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const roomData: ChatRoomFormData = {
        roomName: data.roomName,
        description: data.description,
        roomType: data.roomType,
        enableAIAssistant: data.enableAIAssistant,
      };
      const roomId = await addChatRoomToFirestore(roomData, user.id);
      
      toast({
        title: 'Chat Room Created!',
        description: `Room "${data.roomName}" has been successfully created.`,
      });
      router.push(`/chat?roomId=${roomId}`); // Optionally redirect to the new room or chat list
    } catch (error) {
      console.error('Failed to create chat room:', error);
      toast({
        title: 'Creation Failed',
        description: (error instanceof Error ? error.message : 'Could not create the chat room. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || !isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
       <Button variant="outline" asChild className="mb-4">
        <Link href="/chat">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Link>
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground">Create New Chat Room</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Set up a new space for discussions and collaboration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="roomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Calculus Study Group" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the room's purpose." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="public" />
                          </FormControl>
                          <FormLabel className="font-normal">Public</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="private" />
                          </FormControl>
                          <FormLabel className="font-normal">Private</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Public rooms are open to all. Private rooms may require invitation (feature to be expanded).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="enableAIAssistant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enable AI Assistant
                      </FormLabel>
                      <FormDescription>
                        Add an AI helper to this chat room (functionality to be expanded).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <MessageSquarePlus className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Creating Room...' : 'Create Chat Room'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
