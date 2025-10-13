'use client';

import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VercelProject {
  id: string;
  name: string;
  framework: string;
  link?: { type: string; url: string };
  latestDeployments?: Array<{ id: string; state: string; url: string }>;
}

interface VercelDashboardProps {
  token?: string;
}

export default function VercelDashboard({ token }: VercelDashboardProps) {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VercelProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('https://api.vercel.com/v9/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.projects || []);
      if (data.projects?.length > 0) {
        setSelectedProject(data.projects[0]);
      }
    } catch (err) {
      setError('Failed to load projects. Check your token.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No Vercel Token Connected</p>
        <p className="text-gray-400 text-sm mt-2">Connect your Vercel account in Settings to view deployments</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Vercel Deployments</h2>
        <p className="text-blue-100">Monitor your deployed projects in real-time</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                selectedProject?.id === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:border-blue-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{project.framework || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">No projects found</p>
        </div>
      )}
    </div>
  );
}