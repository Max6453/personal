'use client';

import { useEffect, useState } from 'react';
import { getPlatformToken, savePlatformToken, deletePlatformToken } from '@/lib/platform-tokens';
import GithubDashboard from '@/app/resources/components/github-dashboard';
import Link from 'next/link';
import Header from '@/components/sideHeader';

export default function GithubPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newToken, setNewToken] = useState('');

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const savedToken = await getPlatformToken('github');
    setToken(savedToken);
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!newToken) return;
    
    const success = await savePlatformToken('github', newToken);
    if (success) {
      setToken(newToken);
      setNewToken('');
    }
  };

  const handleDisconnect = async () => {
    const success = await deletePlatformToken('github');
    if (success) {
      setToken(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Connect GitHub</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-gray-600 mb-4">
            Connect your GitHub account to view your profile, repositories, and activity.
          </p>
          <input
            type="password"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            placeholder="Paste your GitHub token"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mb-4">
            Get your token from GitHub Settings &gt; Developer settings &gt; Personal access tokens
          </p>
          <button
            onClick={handleConnect}
            disabled={!newToken}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect GitHub Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
        <Header/>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">GitHub Dashboard</h1>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
      <GithubDashboard token={token} />
    </div>
  </div>
  );
}