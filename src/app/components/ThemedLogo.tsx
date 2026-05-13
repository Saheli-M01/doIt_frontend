"use client";

import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";

export function ThemedLogo() {
  const { theme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-end gap-2 ">
      {/* Logo */}
      <Image
        src={isDark ? "/logo_light.png" : "/logo_dark.png"}
        alt="GetDoIt Logo"
        width={26}
        height={26}
        priority
      />

      {/* Brand */}
      <Image
        src={isDark ? "/brand_light.png" : "/brand_dark.png"}
        alt="GetDoIt Brand"
        width={120}
        height={0}
        style={{ height: "auto" }}
        priority
      />
    </div>
  );
}
