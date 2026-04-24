"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/app/context/UserContext";
import { ThemeProvider } from "@/app/context/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
}
