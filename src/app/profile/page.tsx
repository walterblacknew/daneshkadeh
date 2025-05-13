
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const router = useRouter();

 useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/signin');
    }
  }, [authLoading, isLoggedIn, router]);


  if (authLoading || !isLoggedIn || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary ring-offset-2 ring-offset-background">
            <AvatarImage src={`https://picsum.photos/seed/${user.email}/100/100`} alt={user.name || 'User Avatar'} data-ai-hint="profile avatar" />
            <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{user.name || 'User Profile'}</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user.name || ''} placeholder="Your Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New Password (Optional)</Label>
            <Input id="password" type="password" placeholder="Leave blank to keep current password" />
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
