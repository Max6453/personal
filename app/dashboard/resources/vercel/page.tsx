'use client';

import VercelDashboard from '../components/vercel-dashboard';
import { useTokens } from '@/lib/token-context';

export default function VercelPage() {
  const { vercelToken } = useTokens();

  if (!vercelToken) {
    return (
      <div>
        <div className="max-w-md mx-auto p-6 mt-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Connect Vercel</h1>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 mb-4">
              Please connect your Vercel account in Settings to view your deployments and projects.
            </p>
            <a
              href="/settings"
              className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Go to Settings
            </a>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Get your token from https://vercel.com/account/tokens
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 pt-5">
          <h1 className="text-2xl font-bold text-gray-900">Vercel Dashboard</h1>
        </div>
        <VercelDashboard />
      </div>
    </div>
  );
}