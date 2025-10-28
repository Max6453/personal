'use client';

import { useEffect, useState } from 'react';
import { getPlatformToken, savePlatformToken, deletePlatformToken } from '@/lib/platform-tokens';
import GithubDashboard from '@/app/resources/components/github-dashboard';
import Link from 'next/link';
import Header from '@/components/sideHeader';

interface GitHubIssue {
  id: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  repository_url: string;
  user: {
    login: string;
  };
}

interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  created_at: string;
  updated_at: string;
  description: string;
}

interface GitHubPullRequest {
  id: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  user: {
    login: string;
  };
}

export default function GithubPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newToken, setNewToken] = useState('');
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'prs' | 'dashboard'>('dashboard');

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchGitHubData();
    }
  }, [token]);

  const loadToken = async () => {
    const savedToken = await getPlatformToken('github');
    setToken(savedToken);
    setLoading(false);
  };

  const fetchGitHubData = async () => {
    if (!token) return;
    
    setDataLoading(true);
    try {
      // Fetch issues
      const issuesResponse = await fetch('https://api.github.com/issues?filter=all&state=all&per_page=10', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        setIssues(issuesData);
      }

      // Fetch pull requests
      const prsResponse = await fetch('https://api.github.com/search/issues?q=is:pr+author:@me&sort=created&order=desc&per_page=10', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (prsResponse.ok) {
        const prsData = await prsResponse.json();
        setPullRequests(prsData.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
    } finally {
      setDataLoading(false);
    }
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
      setIssues([]);
      setPullRequests([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRepoName = (url: string) => {
    const parts = url.split('/');
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
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
          <h1 className="text-2xl font-bold">GitHub Dashboard</h1>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'issues'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-foreground'
            }`}
          >
            Issues ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab('prs')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'prs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-foreground'
            }`}
          >
            Pull Requests ({pullRequests.length})
          </button>
        </div>

        {dataLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-600"></div>
          </div>
        ) : (
          <>
            {/* Issues Tab */}
            {activeTab === 'issues' && (
              <div className="space-y-3">
                {issues.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No issues found
                  </div>
                ) : (
                  issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="text-foreground rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                issue.state === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {issue.state}
                            </span>
                            <span className="text-xs text-foreground">
                              {getRepoName(issue.repository_url)}
                            </span>
                          </div>
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-medium hover:text-blue-600"
                          >
                            {issue.title}
                          </a>
                          <div className="text-xs text-gray-500 mt-2">
                            Opened {formatDate(issue.created_at)} by {issue.user.login}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pull Requests Tab */}
            {activeTab === 'prs' && (
              <div className="space-y-3">
                {pullRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No pull requests found
                  </div>
                ) : (
                  pullRequests.map((pr) => (
                    <div
                      key={pr.id}
                      className="rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pr.state === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : pr.state === 'closed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {pr.state}
                            </span>
                          </div>
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-medium hover:text-blue-600"
                          >
                            {pr.title}
                          </a>
                          <div className="text-xs text-foreground mt-2">
                            Created {formatDate(pr.created_at)} by {pr.user.login}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && <GithubDashboard token={token} />}
          </>
        )}
      </div>
    </div>
  );
}