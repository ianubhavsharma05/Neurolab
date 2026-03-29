import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateName: (newName: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PATIENT_NAME = 'Anubhav';

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'patient@neurosense.ai': {
    password: 'patient123',
    user: { id: 'p1', email: 'patient@neurosense.ai', name: DEFAULT_PATIENT_NAME, role: 'patient', createdAt: '2024-01-15' }
  },
  'doctor@neurosense.ai': {
    password: 'doctor123',
    user: { id: 'd1', email: 'doctor@neurosense.ai', name: 'Dr. Michael Chen', role: 'doctor', createdAt: '2024-01-10' }
  },
  'admin@neurosense.ai': {
    password: 'admin123',
    user: { id: 'a1', email: 'admin@neurosense.ai', name: 'Admin User', role: 'admin', createdAt: '2024-01-01' }
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // --- SUPABASE SESSION SYNC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'patient',
          createdAt: session.user.created_at
        };
        setUser(userData);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'patient',
          createdAt: session.user.created_at
        };
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn('[Supabase] Login fallback:', error.message);
      const demo = DEMO_USERS[email];
      if (demo && demo.password === password) {
        setUser(demo.user);
        return true;
      }
      return false;
    }
    return true;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role } }
    });
    return !error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateName = (newName: string) => {
    if (!user) return;
    setUser({ ...user, name: newName });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, updateName, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
