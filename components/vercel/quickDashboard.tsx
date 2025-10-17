'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, MousePointerClick, Globe, Clock, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  series: Array<{ date: string; visitors: number; pageViews: number }>;
  countries: Array<{ country: string; visitors: number; percentage: number }>;
  devices: Array<{ name: string; value: number; color: string }>;
  pages: Array<{ path: string; views: number; bounceRate: number }>;
  total: {
    visitors: string;
    pageViews: string;
    bounceRate: string;
    avgSession: string;
  };
}

type TimeRange = '24h' | '7d' | '30d' | '90d';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [useRealData, setUseRealData] = useState(false);

  const PROJECT_ID = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || '';
  const TEAM_ID = process.env.NEXT_PUBLIC_VERCEL_TEAM_ID || '';

  // Fetch real data from your API route
  const fetchRealData = async () => {
    if (!PROJECT_ID) {
      setError('Project ID not configured');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const daysMap = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
      const days = daysMap[timeRange];
      const to = Date.now();
      const from = to - days * 24 * 60 * 60 * 1000;

      const params = new URLSearchParams({
        projectId: PROJECT_ID,
        from: String(from),
        to: String(to),
      });

      if (TEAM_ID) {
        params.append('teamId', TEAM_ID);
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setLastUpdated(new Date());
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data
  const generateMockData = (): AnalyticsData => {
    const days = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }[timeRange];
    const series = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const baseVisitors = 1500 + Math.random() * 800;
      const multiplier = 1 + (Math.sin(i / 2) * 0.3);
      
      series.push({
        date: dateStr,
        visitors: Math.floor(baseVisitors * multiplier),
        pageViews: Math.floor(baseVisitors * multiplier * (2.5 + Math.random() * 0.5))
      });
    }

    const totalVisitors = series.reduce((sum, d) => sum + d.visitors, 0);
    const totalPageViews = series.reduce((sum, d) => sum + d.pageViews, 0);

    return {
      series,
      countries: [
        { country: 'United States', visitors: Math.floor(totalVisitors * 0.35), percentage: 35 },
        { country: 'United Kingdom', visitors: Math.floor(totalVisitors * 0.18), percentage: 18 },
        { country: 'Germany', visitors: Math.floor(totalVisitors * 0.13), percentage: 13 },
        { country: 'Canada', visitors: Math.floor(totalVisitors * 0.10), percentage: 10 },
        { country: 'France', visitors: Math.floor(totalVisitors * 0.08), percentage: 8 },
        { country: 'Japan', visitors: Math.floor(totalVisitors * 0.06), percentage: 6 },
        { country: 'Others', visitors: Math.floor(totalVisitors * 0.10), percentage: 10 },
      ],
      devices: [
        { name: 'Desktop', value: 54, color: '#3b82f6' },
        { name: 'Mobile', value: 36, color: '#8b5cf6' },
        { name: 'Tablet', value: 10, color: '#ec4899' },
      ],
      pages: [
        { path: '/', views: Math.floor(totalPageViews * 0.28), bounceRate: 38 },
        { path: '/blog', views: Math.floor(totalPageViews * 0.15), bounceRate: 42 },
        { path: '/products', views: Math.floor(totalPageViews * 0.12), bounceRate: 45 },
        { path: '/docs', views: Math.floor(totalPageViews * 0.10), bounceRate: 32 },
        { path: '/about', views: Math.floor(totalPageViews * 0.08), bounceRate: 48 },
        { path: '/pricing', views: Math.floor(totalPageViews * 0.07), bounceRate: 35 },
      ],
      total: {
        visitors: totalVisitors.toLocaleString(),
        pageViews: totalPageViews.toLocaleString(),
        bounceRate: '41.2%',
        avgSession: '3m 42s',
      }
    };
  };

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(generateMockData());

  useEffect(() => {
    const loadData = async () => {
      if (useRealData) {
        const data = await fetchRealData();
        if (data) {
          setAnalyticsData(data);
        }
      } else {
        setAnalyticsData(generateMockData());
        setLastUpdated(new Date());
      }
    };
    loadData();
  }, [timeRange, useRealData]);

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    change, 
    trend 
  }: { 
    icon: any; 
    title: string; 
    value: string; 
    change?: string; 
    trend?: 'up' | 'down' 
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">
                {useRealData ? 'Live Data' : 'Demo Data'} • Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              {PROJECT_ID && (
                <button
                  onClick={() => setUseRealData(!useRealData)}
                  className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  {useRealData ? 'Switch to Demo' : 'Use Real Data'}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setUseRealData(prev => prev ? fetchRealData().then(() => {}) : Promise.resolve())}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {(['24h', '7d', '30d', '90d'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Total Visitors"
            value={analyticsData.total.visitors}
            change="+12.5%"
            trend="up"
          />
          <StatCard
            icon={Eye}
            title="Page Views"
            value={analyticsData.total.pageViews}
            change="+8.3%"
            trend="up"
          />
          <StatCard
            icon={MousePointerClick}
            title="Bounce Rate"
            value={analyticsData.total.bounceRate}
            change="-2.8%"
            trend="down"
          />
          <StatCard
            icon={Clock}
            title="Avg. Session"
            value={analyticsData.total.avgSession}
            change="+18s"
            trend="up"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Visitors & Page Views Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Traffic Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} dot={false} name="Visitors" />
                <Line type="monotone" dataKey="pageViews" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Device Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analyticsData.devices.map((device, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                    <span className="text-sm text-gray-700">{device.name}</span>
                  </div>
                  <span className="text-sm font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold">Top Countries</h2>
            </div>
            <div className="space-y-4">
              {analyticsData.countries.map((country, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{country.country}</span>
                    <span className="text-sm text-gray-600">{country.visitors.toLocaleString()} visitors</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
            <div className="space-y-3">
              {analyticsData.pages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{page.path}</p>
                    <p className="text-xs text-gray-500 mt-1">{page.views.toLocaleString()} views</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${page.bounceRate > 45 ? 'text-red-600' : 'text-green-600'}`}>
                      {page.bounceRate}%
                    </span>
                    <p className="text-xs text-gray-500 mt-1">bounce</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;