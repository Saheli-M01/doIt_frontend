"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";

type User = {
  id: string;
  name?: string;
  email?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void; // kept for API compatibility
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useClerkUser();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        name:
          clerkUser.fullName ??
          clerkUser.primaryEmailAddress?.emailAddress ??
          "User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      }
    : null;

  // no-op — Clerk manages auth state; kept so existing call-sites don't break
  const setUser = (_u: User | null) => {};

  return (
    <UserContext.Provider value={{ user, setUser, isLoading: !isLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
