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
    setIsSubmitting(true);
    // Mock submission
    console.log('Creating chat room:', data);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    toast({
      title: 'Chat Room Created (Mock)',
      description: `Room "${data.roomName}" has been notionally created. This is a mock action.`,
    });
    setIsSubmitting(false);
    // In a real app, you'd redirect to the new room or the chat list
    router.push('/chat'); 
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
                      Public rooms are open to all. Private rooms require invitation or approval (feature mocked).
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
                        Add an AI helper to this chat room (feature mocked).
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
