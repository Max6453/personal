'use client';

import { Database } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SupabaseDashboardProps {
  token?: string;
}

export default function SupabaseDashboard({ token }: SupabaseDashboardProps) {
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
      // Note: This is a placeholder - Supabase API structure varies by endpoint
      const response = await fetch('https://api.supabase.com/v1/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({ projects: data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No Supabase Token Connected</p>
        <p className="text-gray-400 text-sm mt-2">Connect your Supabase account in Settings to view database stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Supabase Database</h2>
        <p className="text-green-100">Real-time database and authentication</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
        </div>
      )}

      {stats ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Projects</h3>
          <div className="space-y-3">
            {stats.projects?.map((project: any) => (
              <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{project.name}</p>
                <p className="text-sm text-gray-500">ID: {project.id}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">Unable to fetch Supabase data</p>
        </div>
      )}
    </div>
  );
}