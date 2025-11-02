'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { Connection } from '@/types/dashboard';
import VercelDashboardComponent from '@/app/dashboard/resources/components/vercel-dashboard';
import SupabaseDashboardComponent from '@/app/dashboard/resources/components/supabase-dashboard';
import GithubDashboardComponent from '@/app/dashboard/resources/components/github-dashboard';
import SettingsPage from '@/app/dashboard/account/page';

interface MultiPlatformDashboardProps {
  user?: {
    email?: string;
  };
}

export default function MultiPlatformDashboard({ user: initialUser }: MultiPlatformDashboardProps) {
  const [user] = useState(initialUser);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings' | 'vercel' | 'supabase' | 'github'>('dashboard');
  const [connections, setConnections] = useState<Connection[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('platform_connections');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 'vercel', platform: 'vercel', name: 'Vercel Deployments', isConnected: false },
      { id: 'supabase', platform: 'supabase', name: 'Database & Auth', isConnected: false },
      { id: 'github', platform: 'github', name: 'GitHub Profile', isConnected: false },
    ];
  });

  // persist connection state in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('platform_connections', JSON.stringify(connections));
    }
  }, [connections]);

  // handle connect/disconnect actions
  const handleConnect = (id: string, token: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isConnected: true, connectedAt: new Date().toLocaleDateString(), token } : c
      )
    );
  };

  const handleDisconnect = (id: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isConnected: false, connectedAt: undefined, token: undefined } : c
      )
    );
  };

  const handleLogout = () => setCurrentPage('dashboard');

  // tokens for each platform
  const vercelToken = connections.find((c) => c.id === 'vercel')?.token;
  const supabaseToken = connections.find((c) => c.id === 'supabase')?.token;
  const githubToken = connections.find((c) => c.id === 'github')?.token;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navbar */}
    </div>
  );
}
