'use client';

import { useEffect, useState } from 'react';
import GithubDashboard from '../components/github-dashboard';
import { useTokens } from '@/lib/token-context';

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
  const { githubToken } = useTokens();
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'prs' | 'dashboard'>('dashboard');

  useEffect(() => {
    if (githubToken) {
      fetchGitHubData();
    }
  }, [githubToken]);

  const fetchGitHubData = async () => {
    if (!githubToken) return;
    
    setDataLoading(true);
    try {
      // Fetch issues
      const issuesResponse = await fetch('https://api.github.com/issues?filter=all&state=all&per_page=10', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
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
          Authorization: `Bearer ${githubToken}`,
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

  if (!githubToken) {
    return (
      <div>
        <div className="max-w-md mx-auto p-6 mt-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Connect GitHub</h1>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 mb-4">
              Please connect your GitHub account in Settings to view your profile, repositories, and activity.
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
    <div className='w-full h-dvh'>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">GitHub Dashboard</h1>
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
            {activeTab === 'dashboard' && <GithubDashboard />}
          </>
        )}
      </div>
    </div>
  );
}