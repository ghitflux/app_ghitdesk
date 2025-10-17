'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/services/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'agent';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.request<{ user: User }>('/auth/me');
        setUser(response.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Extrair user do token (simulado por enquanto, na prática viria do backend)
    setUser({
      id: '1',
      email,
      name: 'User',
      role: 'agent',
    });
  }, []);

  const logout = useCallback(async () => {
    await apiClient.request('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
