'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TokenContextType {
  vercelToken: string | undefined;
  githubToken: string | undefined;
  supabaseToken: string | undefined;
  refreshTokens: () => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState({
    vercelToken: undefined as string | undefined,
    githubToken: undefined as string | undefined,
    supabaseToken: undefined as string | undefined,
  });

  const refreshTokens = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('platform_connections');
      if (saved) {
        const connections = JSON.parse(saved);
        setTokens({
          vercelToken: connections.find((c: any) => c.id === 'vercel')?.token,
          githubToken: connections.find((c: any) => c.id === 'github')?.token,
          supabaseToken: connections.find((c: any) => c.id === 'supabase')?.token,
        });
      }
    }
  };

  useEffect(() => {
    refreshTokens();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      refreshTokens();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokensUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokensUpdated', handleStorageChange);
    };
  }, []);

  return (
    <TokenContext.Provider value={{ ...tokens, refreshTokens }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
}