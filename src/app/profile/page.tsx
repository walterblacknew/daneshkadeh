'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }).optional().or(z.literal('')),
});

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const { user, isLoading: authLoading, isLoggedIn, updateProfile, isLoading: isUpdating } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      newPassword: '',
    },
  });

 useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/signin');
    }
    if (user) {
      form.reset({ name: user.name || '', newPassword: '' });
    }
  }, [authLoading, isLoggedIn, router, user, form]);

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    const updateData: Partial<Pick<User, 'name'>> & { newPassword?: string } = {};
    if (data.name && data.name !== user?.name) {
      updateData.name = data.name;
    }
    if (data.newPassword) {
      updateData.newPassword = data.newPassword;
    }
    
    if (Object.keys(updateData).length > 0) {
      await updateProfile(updateData);
      form.reset({ name: user?.name || data.name, newPassword: '' }); // Reset password field
    }
  };

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
          {user.role && (
            <Badge variant="secondary" className="mx-auto mt-1 capitalize">{user.role}</Badge>
          )}
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <FormControl>
                      <Input id="newPassword" type="password" placeholder="Leave blank to keep current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
