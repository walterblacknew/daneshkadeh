
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserNav() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 animate-pulse bg-muted"></Button>;
  }

  if (!user) {
    return null; // Should be handled by AppHeader logic to show Sign In/Up buttons
  }

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return 'U';

    const validNameParts = name
      .trim()
      .split(/\s+/) // Split by one or more spaces
      .filter(part => part.length > 0); // Remove any empty strings

    if (validNameParts.length === 0) return 'U';

    if (validNameParts.length === 1) {
      return validNameParts[0][0].toUpperCase();
    }

    // More than one valid name part
    return (
      validNameParts[0][0].toUpperCase() +
      validNameParts[validNameParts.length - 1][0].toUpperCase()
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {/* Placeholder image, replace with actual user avatar if available */}
            <AvatarImage src={user.avatar || `https://picsum.photos/seed/${user.email}/40/40`} alt={user.name || user.email} data-ai-hint="profile avatar" />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

