import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Detect mock mode: if the URL contains placeholder-project.supabase.co
  const isMockMode = import.meta.env.VITE_SUPABASE_URL === undefined ||
                     import.meta.env.VITE_SUPABASE_URL === '' ||
                     import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project');

  useEffect(() => {
    if (isMockMode) {
      // Check local storage for mock session
      const storedMockUser = localStorage.getItem('mock_user');
      if (storedMockUser) {
        const mockUserObj = JSON.parse(storedMockUser);
        setUser(mockUserObj);
        setSession({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUserObj,
        });
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isMockMode]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        // Mock authorization: accepts admin@enterprise.com / admin123
        if (email === 'admin@enterprise.com' && password === 'admin123') {
          const mockUser: User = {
            id: 'mock-user-uuid-12345',
            app_metadata: {},
            user_metadata: { name: 'Enterprise Admin' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: email,
          };
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
          setUser(mockUser);
          setSession({
            access_token: 'mock-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: mockUser,
          });
          setLoading(false);
          return { error: null };
        } else {
          setLoading(false);
          return { error: new Error('Invalid email or password in Mock Mode (Use: admin@enterprise.com / admin123)') };
        }
      }

      // Real Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      return { error };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isMockMode) {
      localStorage.removeItem('mock_user');
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isMockMode, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
