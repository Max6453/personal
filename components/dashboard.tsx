'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { Connection } from '@/types/dashboard';
import VercelDashboardComponent from '@/app/resources/components/vercel-dashboard';
import SupabaseDashboardComponent from '@/app/resources/components/supabase-dashboard';
import GithubDashboardComponent from '@/app/resources/components/github-dashboard';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Hub</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                currentPage === 'settings'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            {user?.email && (
              <div className="text-sm text-gray-600 px-4 py-2 border-l border-gray-200">{user.email}</div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        {currentPage === 'settings' ? (
          <SettingsPage
            connections={connections}
            user={user}
            onLogout={handleLogout}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
              {['vercel', 'supabase', 'github'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setCurrentPage(platform as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    currentPage === platform
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
            </div>

            {/* Dashboard Sections */}
            {currentPage === 'vercel' && <VercelDashboardComponent token={vercelToken} />}
            {currentPage === 'supabase' && <SupabaseDashboardComponent token={supabaseToken} />}
            {currentPage === 'github' && <GithubDashboardComponent token={githubToken} />}
          </>
        )}
      </div>
    </div>
  );
}
