"use client";

import { useEffect, useState } from "react";
import { useTokens } from "@/lib/token-context";

interface Repo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
}

interface Deployment {
  id: number;
  sha: string;
  ref: string;
  environment: string | null;
  created_at: string;
  url: string;
}

export default function LastDeployments() {
  const { githubToken } = useTokens();
  const [items, setItems] = useState<Array<{ repo: string; deployment: Deployment | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!githubToken) return setLoading(false);
    fetchLatestDeployments();
  }, [githubToken]);

  const fetchLatestDeployments = async () => {
    setLoading(true);
    try {
      // Get top repositories for the authenticated user (owner repositories)
      const reposRes = await fetch("https://api.github.com/user/repos?type=owner&sort=updated&per_page=12", {
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      });

      if (!reposRes.ok) throw new Error("Failed to fetch repos");
      const repos: Repo[] = await reposRes.json();

      // For each repo, fetch the most recent deployment (if any)
      const mapped = await Promise.all(
        repos.map(async (r) => {
          try {
            const depRes = await fetch(
              `https://api.github.com/repos/${r.full_name}/deployments?per_page=1`,
              {
                headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
              }
            );

            if (!depRes.ok) return { repo: r.full_name, deployment: null };
            const deps: Deployment[] = await depRes.json();
            return { repo: r.full_name, deployment: deps && deps.length > 0 ? deps[0] : null };
          } catch (e) {
            return { repo: r.full_name, deployment: null };
          }
        })
      );

      setItems(mapped);
    } catch (err) {
      console.error("Failed to fetch deployments", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  if (!githubToken) {
    return (
      <div className="rounded-2xl shadow-sm p-6 text-center border border-gray-100">
        <p className="text-gray-500">Connect GitHub to view recent deployments.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">Latest Deployments</h4>
        <button
          onClick={fetchLatestDeployments}
          className="text-sm text-blue-600 hover:underline"
          aria-label="Refresh deployments"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 && <div className="text-gray-500">No repositories found</div>}
          {items.map((it) => (
            <div key={it.repo} className="flex items-center justify-between p-3 rounded-lg bg-background border border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{it.repo}</div>
                {it.deployment ? (
                  <div className="text-xs text-gray-500">
                    <span className="mr-2">{it.deployment.environment || 'env'}</span>
                    <span className="mr-2">ref: {it.deployment.ref}</span>
                    <span>at {formatDate(it.deployment.created_at)}</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No deployments</div>
                )}
              </div>

              <div className="ml-4">
                <a
                  href={`https://github.com/${it.repo}/deployments`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
