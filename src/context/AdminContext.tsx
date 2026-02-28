import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check-auth');
        const data = await res.json();
        setIsAdmin(data.authenticated);
      } catch (e) {
        console.error('Auth check failed', e);
      }
    };
    checkAuth();
  }, []);

  const login = async (password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        return true;
      }
    } catch (e) {
      console.error('Login failed', e);
    }
    return false;
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setIsAdmin(false);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
