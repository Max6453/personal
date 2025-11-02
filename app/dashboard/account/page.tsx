'use client';

import { useState, useEffect } from 'react';
import { Settings, LogOut, Key, User, Mail, Shield, ExternalLink } from 'lucide-react';
import { Connection } from '@/types/dashboard';
import ConnectionCard from '../resources/components/connection-card';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
interface SettingsPageProps {
  user?: any;
  onLogout?: () => void;
}

export default function SettingsPage({ 
  user = null, 
  onLogout = () => {}
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('account');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('platform_connections', JSON.stringify(connections));
    }
  }, [connections]);

const handleConnect = (id: string, token: string) => {
  setConnections((prev) =>
    prev.map((c) =>
      c.id === id ? { ...c, isConnected: true, connectedAt: new Date().toLocaleDateString(), token } : c
    )
  );
  
  // Trigger custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tokensUpdated'));
  }
};

const handleDisconnect = (id: string) => {
  setConnections((prev) =>
    prev.map((c) =>
      c.id === id ? { ...c, isConnected: false, connectedAt: undefined, token: undefined } : c
    )
  );
  
  // Trigger custom event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tokensUpdated'));
  }
};
  
  const supabase = createClient();

  const updateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Email update confirmation has been sent to your new email address.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-background rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-700">Account Settings</h2>
            <p className="text-gray-600 mt-1">Manage your account and connected services</p>
          </div>
          <Link href="/dashboard">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            Return
          </button>
          </Link>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'account' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'integrations' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Key className="w-4 h-4" />
            Integrations
          </button>
        </div>

        {activeTab === 'account' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">Profile Information</h3>
            <form onSubmit={updateEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">Change Password</h3>
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2 mb-8 border border-white rounded-lg p-4 text-sm">
              <h4 className="font-medium text-foreground">Where to find your tokens:</h4>
              <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" 
                className="flex items-center text-blue-600 hover:text-blue-700">
                Vercel <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700">
                GitHub <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <span>Supabase: Project settings - API keys</span>
            </div>

            <h3 className="text-xl font-bold text-blue-500">Connected Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections && connections.length > 0 ? (
                connections.map((connection: Connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No connections configured yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';