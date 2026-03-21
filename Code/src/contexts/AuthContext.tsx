import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateName: (newName: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PATIENT_NAME = 'Anubhav';

const normalizeDemoUser = <T extends { email?: string; name?: string }>(record: T): T => {
  if (record.email === 'patient@neurosense.ai' && record.name === 'Sarah Johnson') {
    return { ...record, name: DEFAULT_PATIENT_NAME };
  }

  return record;
};

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

  useEffect(() => {
    const stored = localStorage.getItem('neurosense_user');
    if (stored) {
      const normalizedUser = normalizeDemoUser(JSON.parse(stored));
      setUser(normalizedUser);
      localStorage.setItem('neurosense_user', JSON.stringify(normalizedUser));
    }

    const storedUsers = localStorage.getItem('neurosense_users');
    if (storedUsers) {
      const normalizedUsers = JSON.parse(storedUsers).map((entry: any) => normalizeDemoUser(entry));
      localStorage.setItem('neurosense_users', JSON.stringify(normalizedUsers));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const demo = DEMO_USERS[email];
    if (demo && demo.password === password) {
      setUser(demo.user);
      localStorage.setItem('neurosense_user', JSON.stringify(demo.user));
      return true;
    }
    const stored = localStorage.getItem('neurosense_users');
    if (stored) {
      const users = JSON.parse(stored);
      const found = users.find((u: any) => u.email === email && u.password === password);
      if (found) {
        const { password: _, ...userData } = found;
        setUser(userData);
        localStorage.setItem('neurosense_user', JSON.stringify(userData));
        return true;
      }
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    const newUser: User = { id: uuidv4(), email, name, role, createdAt: new Date().toISOString() };
    const stored = localStorage.getItem('neurosense_users');
    const users = stored ? JSON.parse(stored) : [];
    users.push({ ...newUser, password });
    localStorage.setItem('neurosense_users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('neurosense_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neurosense_user');
  };

  const updateName = (newName: string) => {
    if (!user) return;
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem('neurosense_user', JSON.stringify(updatedUser));
    
    // Also update in registered users if exists
    const stored = localStorage.getItem('neurosense_users');
    if (stored) {
      const users = JSON.parse(stored);
      const index = users.findIndex((u: any) => u.id === user.id);
      if (index !== -1) {
        users[index].name = newName;
        localStorage.setItem('neurosense_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateName, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
