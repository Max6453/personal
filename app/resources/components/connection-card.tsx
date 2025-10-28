'use client';

import { useState } from 'react';
import { Globe, Database, Github, Trash2 } from 'lucide-react';
import { Connection } from '@/types/dashboard';

interface ConnectionCardProps {
  connection: Connection;
  onConnect: (id: string, token: string) => void;
  onDisconnect: (id: string) => void;
}

export default function ConnectionCard({ connection, onConnect, onDisconnect }: ConnectionCardProps) {
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState(connection.token || '');

  const icons: any = {
    vercel: Globe,
    supabase: Database,
    github: Github,
  };
  
  const Icon = icons[connection.platform];
  const colors: any = {
    vercel: 'from-black to-gray-800',
    supabase: 'from-green-600 to-green-700',
    github: 'from-gray-900 to-black',
  };

  const descriptions: any = {
    vercel: 'Get your token from https://vercel.com/account/tokens',
    supabase: 'Get your token from Supabase project settings',
    github: 'Get your token from GitHub Settings > Developer settings > Personal access tokens',
  };

  return (
    <div className="rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colors[connection.platform]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {connection.isConnected && (
          <div className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            Connected
          </div>
        )}
      </div>
      <h3 className="font-bold text-blue-900 mb-1 capitalize">{connection.platform}</h3>
      <p className="text-sm text-gray-500 mb-4">{connection.name}</p>
      <p className="text-xs text-gray-400 mb-3">{descriptions[connection.platform]}</p>
      
      {!connection.isConnected ? (
        <>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your API token here"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (token) {
                onConnect(connection.id, token);
                setToken('');
              }
            }}
            disabled={!token}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">Connected since {connection.connectedAt}</p>
          <button
            onClick={() => onDisconnect(connection.id)}
            className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Disconnect
          </button>
        </>
      )}
    </div>
  );
}