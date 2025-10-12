'use client'
import Link from "next/link";
import Header from "@/components/header";
import VercelAnalyticsDashboard from "@/components/dashboard";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

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
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <main className="max-w-xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome back, {user?.email}
          </h2>
          <div className="flex gap-5 left-15 relative">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
          <button
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-foreground hover:bg-blue-700">
            Manage account
          </button>
          </div>
        </div>
      </main>
      <section>
        <VercelAnalyticsDashboard />
      </section>
    </div>
  );
}