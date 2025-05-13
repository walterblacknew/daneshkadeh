
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>; // pass is unused for mock
  signup: (name: string, email: string, pass: string) => Promise<void>; // pass is unused for mock
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mathfluent-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user from localStorage', error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _pass: string) => {
    // Mock login
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const mockUser: User = { id: Date.now().toString(), email, name: email.split('@')[0] };
    setUser(mockUser);
    try {
      localStorage.setItem('mathfluent-user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Failed to save user to localStorage', error);
    }
    setIsLoading(false);
    toast({ title: 'Login Successful', description: `Welcome back, ${mockUser.name}!` });
    router.push('/');
  }, [router, toast]);

  const signup = useCallback(async (name: string, email: string, _pass: string) => {
    // Mock signup
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const mockUser: User = { id: Date.now().toString(), email, name };
    setUser(mockUser);
    try {
      localStorage.setItem('mathfluent-user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Failed to save user to localStorage', error);
    }
    setIsLoading(false);
    toast({ title: 'Signup Successful', description: `Welcome, ${name}!` });
    router.push('/');
  }, [router, toast]);

  const logout = useCallback(() => {
    setIsLoading(true);
    setUser(null);
    try {
      localStorage.removeItem('mathfluent-user');
    } catch (error) {
      console.error('Failed to remove user from localStorage', error);
    }
    setIsLoading(false);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/signin');
  }, [router, toast]);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
