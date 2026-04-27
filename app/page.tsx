"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { useTheme } from "@/app/context/ThemeContext";
import { ContactModal } from "@/app/components/ContactModal";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { Hero } from "@/app/components/home/Hero";



/* ─────────────────────── main page ─────────────────────── */
export default function Home() {
  const { isLoading } = useUser();
  const { mounted } = useTheme();
  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading || !mounted) return null;

  return (
    <>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}

      <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden w-full">
        <Navbar onContactClick={() => setContactOpen(true)} />

        <main className="flex-1 flex flex-col w-full overflow-x-hidden">
          <Hero />
         
        </main>

        <Footer onContactClick={() => setContactOpen(true)} />
      </div>
    </>
  );
}
