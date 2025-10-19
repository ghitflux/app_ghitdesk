'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeroUIProvider } from '@heroui/react';
import { AuthService, type User } from '@/services/auth/AuthService';
import { RealtimeService } from '@/services/realtime/RealtimeService';

/**
 * React Query Client
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Auth Context
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = AuthService.getInstance();

  useEffect(() => {
    // Initialize auth state
    const currentUser = authService.getUser();
    setUser(currentUser);
    setIsLoading(false);

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((newUser) => {
      setUser(newUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await authService.signIn({ email, password });
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const session = await authService.signUp({ email, password, name });
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Realtime Provider
 */
function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const realtimeService = RealtimeService.getInstance();

  useEffect(() => {
    // Initialize WebSocket connection
    realtimeService.init();

    return () => {
      // Disconnect on unmount
      realtimeService.disconnect();
    };
  }, []);

  return <>{children}</>;
}

/**
 * Root Providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HeroUIProvider>
  );
}
