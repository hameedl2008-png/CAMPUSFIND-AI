import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, clearStoredToken } from '../api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    mobile: string;
    studentId: string;
    department: string;
    year: string;
    email?: string;
    password: string;
  }) => Promise<void>;
  updateProfile: (payload: {
    fullName?: string;
    mobile?: string;
    studentId?: string;
    department?: string;
    year?: string;
    email?: string;
  }) => Promise<void>;
  logout: () => void;
  isProfileComplete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.getMe();
        setUser(user);
      } catch (err) {
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const { user } = await api.login(identifier, pass);
    setUser(user);
  };

  const register = async (payload: {
    fullName: string;
    mobile: string;
    studentId: string;
    department: string;
    year: string;
    email?: string;
    password: string;
  }) => {
    const { user } = await api.register(payload);
    setUser(user);
  };

  const updateProfile = async (payload: {
    fullName?: string;
    mobile?: string;
    studentId?: string;
    department?: string;
    year?: string;
    email?: string;
  }) => {
    const { user } = await api.updateProfile(payload);
    setUser(user);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  // Rule 12 & 15: Check profile completeness (name, mobile, student ID, department, year)
  const isProfileComplete = (): boolean => {
    if (!user) return false;
    return Boolean(
      user.fullName?.trim() &&
      user.mobile?.trim() &&
      user.studentId?.trim() &&
      user.department?.trim() &&
      user.year?.trim()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
