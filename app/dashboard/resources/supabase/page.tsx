'use client';

import SupabaseDashboard from '../components/supabase-dashboard';
import { useTokens } from '@/lib/token-context';

export default function SupabasePage() {
  const { supabaseToken } = useTokens();

  if (!supabaseToken) {
    return (
      <div>
        <div className="max-w-md mx-auto p-6 mt-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Connect Supabase</h1>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 mb-4">
              Please connect your Supabase account in Settings to view your projects and database stats.
            </p>
            <a
              href="/settings"
              className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className="p-6">
        <SupabaseDashboard/>
      </div>
    </div>
  );
}