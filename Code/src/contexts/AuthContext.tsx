import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateName: (newName: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'patient@neurosense.ai': {
    password: 'patient123',
    user: { id: 'p1', email: 'patient@neurosense.ai', name: 'Anubhav', role: 'patient', createdAt: '2024-01-15' }
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // --- SAFE CLOUD HANDSHAKE ---
      // We skip the cloud request if the URL is a placeholder to prevent browser hangs
      const isPlaceholder = import.meta.env.VITE_SUPABASE_URL === undefined || 
                            import.meta.env.VITE_SUPABASE_URL?.includes('placeholder');

      if (isPlaceholder) {
        console.log('[Auth] Clinical Sandbox Mode Active');
        if (mounted) setLoading(false);
        return;
      }

      try {
        // Add a 3-second timeout to the session sync to prevent Vercel "hanging"
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        
        const { data: { session } } = await (Promise.race([sessionPromise, timeoutPromise]) as any);
        
        if (mounted && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'patient',
            createdAt: session.user.created_at
          });
        }
      } catch (err) {
        console.warn('[Auth] Cloud sync timed out or skipped. Using local identity pool.', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Only subscribe to changes if we have a valid supabase client
    let subscription: any = null;
    if (!import.meta.env.VITE_SUPABASE_URL?.includes('placeholder')) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'patient',
            createdAt: session.user.created_at
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const isPlaceholder = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder');
      if (!isPlaceholder) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return true;
      }

      // Fallback to Demo Pool
      const demo = DEMO_USERS[email];
      if (demo && demo.password === password) {
        setUser(demo.user);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
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
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateName, isAuthenticated: !!user }}>
      {loading ? (
        <div className="fixed inset-0 bg-[#03040a] flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-6">
             <div className="h-16 w-16 rounded-full border-4 border-[#00f59b] border-t-transparent animate-spin shadow-[0_0_20px_rgba(0,245,155,0.2)]"></div>
             <p className="text-[#00f59b] font-mono text-sm tracking-[0.3em] uppercase animate-pulse">Initializing Identity Shield...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
