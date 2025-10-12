'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, Globe, Eye, Clock, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';

// Types
interface VercelProject {
  id: string;
  name: string;
  framework: string;
  link?: {
    type: string;
    url: string;
  };
  latestDeployments?: Array<{
    id: string;
    state: string;
    url: string;
  }>;
}

interface AnalyticsData {
  visitors: Array<{
    date: string;
    visitors: number;
    pageviews: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  metrics: {
    totalVisitors: number;
    totalPageviews: number;
    avgLoadTime: string;
    bounceRate: string;
  };
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
}

const StatCard = ({ icon: Icon, title, value, change, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const ProjectCard = ({ 
  project, 
  isSelected, 
  onClick 
}: { 
  project: VercelProject; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-5 cursor-pointer transition-all duration-300 border-2 ${
      isSelected 
        ? 'border-blue-500 shadow-lg scale-105' 
        : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{project.name}</h3>
        <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          {project.framework || 'Next.js'}
        </span>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
        project.latestDeployments?.[0]?.state === 'READY' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {project.latestDeployments?.[0]?.state || 'Unknown'}
      </div>
    </div>
    
    {project.latestDeployments?.[0]?.url && (
      <a
        href={`https://${project.latestDeployments[0].url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors group"
        onClick={(e) => e.stopPropagation()}
      >
        <Globe className="w-4 h-4" />
        <span className="truncate group-hover:underline">{project.latestDeployments[0].url}</span>
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
      </a>
    )}
  </div>
);

export default function VercelAnalyticsDashboard() {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VercelProject | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVercelProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchVercelProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/vercel/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
      
      if (data.projects && data.projects.length > 0) {
        setSelectedProject(data.projects[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching Vercel projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (projectId: string) => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/analytics?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Globe className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="text-red-600 mb-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={fetchVercelProjects}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your Vercel projects in real-time</p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
            <button
              onClick={fetchVercelProjects}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No projects found</p>
              <p className="text-gray-400 text-sm mt-2">Make sure your API token is configured correctly</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedProject && (
          <>
            {/* Selected Project Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">{selectedProject.name}</h2>
                <p className="text-blue-100 text-lg">Real-time Analytics & Insights</p>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading analytics data...</p>
                </div>
              </div>
            ) : analyticsData ? (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    icon={Users}
                    title="Total Visitors"
                    value={analyticsData.metrics.totalVisitors.toLocaleString()}
                    change={12}
                    trend="up"
                  />
                  <StatCard
                    icon={Eye}
                    title="Page Views"
                    value={analyticsData.metrics.totalPageviews.toLocaleString()}
                    change={8}
                    trend="up"
                  />
                  <StatCard
                    icon={Clock}
                    title="Avg Load Time"
                    value={analyticsData.metrics.avgLoadTime}
                    change={5}
                    trend="down"
                  />
                  <StatCard
                    icon={Activity}
                    title="Bounce Rate"
                    value={analyticsData.metrics.bounceRate}
                    change={3}
                    trend="down"
                  />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Visitors Trend */}
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      7-Day Visitor Trend
                    </h3>
                    <div className="space-y-4">
                      {analyticsData.visitors.map((day) => {
                        const maxVisitors = Math.max(...analyticsData.visitors.map(d => d.visitors));
                        const percentage = (day.visitors / maxVisitors) * 100;
                        
                        return (
                          <div key={day.date} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">{day.date}</span>
                              <span className="text-sm text-gray-500">{day.pageviews.toLocaleString()} views</span>
                            </div>
                            <div className="relative bg-gray-100 rounded-full h-10 overflow-hidden">
                              <div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-4 text-white text-sm font-bold shadow-sm transition-all duration-500 group-hover:from-blue-600 group-hover:to-purple-600"
                                style={{ width: `${percentage}%` }}
                              >
                                {day.visitors.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Pages */}
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                      Top Pages
                    </h3>
                    <div className="space-y-5">
                      {analyticsData.topPages.map((page, index) => {
                        const maxViews = Math.max(...analyticsData.topPages.map(p => p.views));
                        const percentage = (page.views / maxViews) * 100;
                        
                        return (
                          <div key={page.page} className="group">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold shadow-sm group-hover:scale-110 transition-transform">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{page.page}</p>
                                <p className="text-sm text-gray-500">{page.views.toLocaleString()} views</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 ml-14">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 group-hover:from-purple-600 group-hover:to-pink-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )
           : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No Analytics Data Available</p>
                <p className="text-gray-400 text-sm mt-2">Configure your analytics provider in the API route</p>
              </div>
            )
          }
          </>
        )}
      </div>
    </div>
  );
}