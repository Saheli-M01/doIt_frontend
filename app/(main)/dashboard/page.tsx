"use client";

import { useUser } from "../../context/UserContext";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome, {user?.name || "User"} 👋
      </h1>

      <p className="text-gray-600 mt-2">{user?.email}</p>
    </div>
  );
}
