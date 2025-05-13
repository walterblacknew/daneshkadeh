'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquareDashed } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Loader2 } from 'lucide-react';

// This is a placeholder page for Direct Messages with a teacher.
// Actual chat functionality would be implemented here in a future iteration.

export default function DirectMessagePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <Alert variant="default" className="max-w-md">
          <UserCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need to be logged in to send messages.
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
  
  // Mock teacher name - in a real app, fetch teacher details based on teacherId
  const teacherName = `Teacher ${teacherId.substring(0,5)}...`;


  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/teachers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Link>
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Direct Message with {teacherName}</CardTitle>
          <CardDescription>This is where your private conversation will appear.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center">
            <MessageSquareDashed className="h-24 w-24 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Direct messaging functionality is coming soon!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You'll be able to chat one-on-one with {teacherName} here.
          </p>
          {/* Placeholder for chat input and message display */}
        </CardContent>
      </Card>
    </div>
  );
}
