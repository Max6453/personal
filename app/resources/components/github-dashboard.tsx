'use client';

import { useState, useEffect } from 'react';
import { Github, Users, TrendingUp, Activity } from 'lucide-react';
import { StatCard } from './stat-card';

interface GithubDashboardProps {
  token?: string;
}

export default function GithubDashboard({ token }: GithubDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <Github className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No GitHub Token Connected</p>
        <p className="text-gray-400 text-sm mt-2">Connect your GitHub account in Settings to view profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">GitHub Profile</h2>
        <p className="text-gray-400">Your repositories and contributions</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600"></div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Github} title="Repositories" value={stats.public_repos || 0} />
          <StatCard icon={Users} title="Followers" value={stats.followers || 0} />
          <StatCard icon={TrendingUp} title="Following" value={stats.following || 0} />
          <StatCard icon={Activity} title="Gists" value={stats.public_gists || 0} />
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold text-gray-900">{stats.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-semibold text-gray-900">{stats.login}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-semibold text-gray-900">{stats.company || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold text-gray-900">{stats.location || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}