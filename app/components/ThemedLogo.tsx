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
        <div className="flex items-center gap-2">
            {/* Logo */}
            <Image
                src={isDark ? "/logo_dark.png" : "/logo_light.png"}
                alt="DoIt Logo"
                width={32}
                height={32}
                priority
            />

            {/* Brand */}
            <Image
                src={isDark ? "/brand_dark.png" : "/brand_light.png"}
                alt="DoIt Brand"
                width={80}
                height={0}
                style={{ height: "auto" }}

                priority
            />
        </div>
    );
}