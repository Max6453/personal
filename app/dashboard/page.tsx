'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { SupabaseClient, User } from "@supabase/supabase-js";
import VercelDashboard from "./resources/components/vercel-dashboard";
import GithubDashboard from "./resources/components/github-dashboard";
import GithubPage from "./resources/github/page";
import SupabaseDashboard from "./resources/components/supabase-dashboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-xl">
        <div className="bg-background rounded-lg border border-foreground shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome back, {user?.email}
          </h2>
          <p className="mb-4">
            Last sign in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
          </p>
          <div className="flex gap-5 left-15 relative">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm text-white font-medium bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
          <Link href="/dashboard/account">
          <button
          className="px-4 py-2 border border-foreground rounded-lg shadow-sm text-sm font-medium text-white bg-foreground hover:bg-blue-700">
            Settings
          </button>
          </Link>
          </div>
        </div>
      </main>

       <h1 className="text-4xl font-bold p-15 font-work-sans">Quick View</h1>
      <section className="p-15 grid grid-cols-2 gap-x-10 overflow-y-scroll">
       <div className="h-dvh overflow-scroll">
          <VercelDashboard/>
        </div>
       <GithubPage/>
      </section>
      <section className="p-15 spacing-x-3">
        <SupabaseDashboard/>
      </section>
    </div>
  );
}

export const dynamic = 'force-dynamic';