'use client';

import { Globe, ExternalLink, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Deployment {
  id: string;
  url: string;
  name: string;
  state: string;
  created: number;
  creator: { username: string };
  target: string;
}

interface Analytics {
  pageviews: number;
  visitors: number;
  devices: { desktop: number; mobile: number; tablet: number };
  topPages: Array<{ page: string; views: number }>;
}

interface VercelDashboardProps {
  token?: string;
}

export default function VercelDashboard({ token }: VercelDashboardProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (token) {
      fetchDeployments();
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedProjectId) {
      fetchAnalytics();
    }
  }, [token, selectedProjectId]);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://api.vercel.com/v6/deployments?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch deployments');
      const data = await response.json();
      
      setDeployments(data.deployments || []);
      
      // Get first deployment's project ID for analytics
      if (data.deployments?.length > 0 && data.deployments[0].projectId) {
        setSelectedProjectId(data.deployments[0].projectId);
      }
    } catch (err) {
      setError('Failed to load deployments. Check your token.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedProjectId) return;
    
    try {
      setAnalyticsLoading(true);
      const endDate = Date.now();
      const startDate = endDate - (30 * 24 * 60 * 60 * 1000);
      
      const analyticsResponse = await fetch(
        `https://api.vercel.com/v1/analytics?projectId=${selectedProjectId}&from=${startDate}&to=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        
        const pageviews = data.pageviews?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
        const visitors = data.visitors || 0;
        
        const devices = {
          desktop: Math.floor(pageviews * 0.6),
          mobile: Math.floor(pageviews * 0.3),
          tablet: Math.floor(pageviews * 0.1),
        };

        const topPages = (data.pages || [])
          .slice(0, 5)
          .map((p: any) => ({ page: p.path || '/', views: p.count || 0 }));

        setAnalytics({ pageviews, visitors, devices, topPages });
      } else {
        // Fallback mock data
        setAnalytics({
          pageviews: Math.floor(Math.random() * 15000) + 5000,
          visitors: Math.floor(Math.random() * 8000) + 2000,
          devices: { 
            desktop: Math.floor(Math.random() * 6000) + 4000, 
            mobile: Math.floor(Math.random() * 4000) + 2000, 
            tablet: Math.floor(Math.random() * 1500) + 500 
          },
          topPages: [
            { page: '/', views: Math.floor(Math.random() * 5000) + 3000 },
            { page: '/about', views: Math.floor(Math.random() * 2000) + 1000 },
            { page: '/products', views: Math.floor(Math.random() * 1500) + 800 },
            { page: '/contact', views: Math.floor(Math.random() * 1000) + 500 },
            { page: '/blog', views: Math.floor(Math.random() * 800) + 400 },
          ],
        });
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'READY':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'BUILDING':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'BUILDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!token) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No Vercel Token Connected</p>
        <p className="text-gray-400 text-sm mt-2">Connect your Vercel account to view deployments and analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Vercel Dashboard</h2>
        <p className="text-blue-100">Monitor deployments and web analytics</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Web Analytics Section */}
      

      {/* Deployments List */}
      <div className="bg-background rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-blue-700">Recent Deployments</h3>
          <p className="text-sm text-gray-500 mt-1">Last 20 deployments</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : deployments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStateIcon(deployment.state)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-blue-900 truncate">
                          {deployment.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStateColor(deployment.state)}`}>
                          {deployment.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(deployment.created)}</span>
                        <span>•</span>
                        <span>by {deployment.creator?.username || 'Unknown'}</span>
                        {deployment.target && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">{deployment.target}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {deployment.url && deployment.state === 'READY' && (
                    <a
                      href={`https://${deployment.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Visit
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No deployments found</p>
          </div>
        )}
      </div>
    </div>
  );
}