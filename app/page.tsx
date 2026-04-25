"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useTheme } from "@/app/context/ThemeContext";
import { ContactModal } from "@/app/components/ContactModal";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { Hero } from "@/app/components/home/Hero";
import { Stats } from "@/app/components/home/Stats";
import { Features } from "@/app/components/home/Features";

/* ─────────────────────── main page ─────────────────────── */
export default function Home() {
  const { user, isLoading } = useUser();
  const { mounted } = useTheme();
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !mounted || user) return null;

  return (
    <>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}

      <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden w-full">
        <Navbar onContactClick={() => setContactOpen(true)} />

        <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">
          {/* decorative background blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[min(600px,100vw)] h-[300px] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, var(--color-primary) 0%, transparent 70%)",
            }}
          />

          <Hero />
          <Stats />
          <Features />
        </main>

        <Footer onContactClick={() => setContactOpen(true)} />
      </div>
    </>
  );
}
