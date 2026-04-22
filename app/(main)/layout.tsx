"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-60 bg-gray-900 text-white p-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold mb-4">DoIt</h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="text-left px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Dashboard
        </button>

        <button
          onClick={() => router.push("/tasks")}
          className="text-left px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Tasks
        </button>

        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 rounded text-red-400 hover:bg-gray-800 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
}
