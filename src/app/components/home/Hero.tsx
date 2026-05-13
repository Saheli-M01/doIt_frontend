"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Zap, Target, ListTodo, Brain, LayoutDashboard, LucideIcon } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useTheme } from "@/app/context/ThemeContext";
import { motion } from "framer-motion";

type Feature = {
  Icon: LucideIcon;
  title: string;
  desc: string;
};

const features: Feature[] = [
  {
    Icon: ListTodo,
    title: "Stay organised",
    desc: "Group tasks by project, priority, or date — your way, your rules.",
  },
  {
    Icon: Brain,
    title: "AI-powered",
    desc: "Let the assistant plan your day and generate task lists instantly.",
  },
  {
    Icon: LayoutDashboard,
    title: "Clear overview",
    desc: "A dashboard that shows what matters, nothing more.",
  },
];

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 28 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" as const, delay },
    },
  };
}

function fadeIn(delay: number) {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.45, ease: "easeOut" as const, delay },
    },
  };
}

function scaleIn(delay: number) {
  return {
    initial: { opacity: 0, scale: 0.93 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" as const, delay },
    },
  };
}

export function Hero() {
  const { user } = useUser();
  const { theme } = useTheme();

  const heroFeatures = [
    { icon: <Target size={16} />, title: "Smart task breakdown" },
    { icon: <Zap size={16} />, title: "Priority-aware planning" },
    { icon: <CheckCircle size={16} />, title: "Faster execution" },
  ];

  return (
    <>
      <section className="relative flex items-center overflow-hidden w-full bg-white dark:bg-[#0a0a0a] transition-colors duration-300 min-h-[100svh] lg:min-h-[80vh]">

        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: theme === "dark"
              ? "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)"
              : "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Mesh Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: theme === "dark"
              ? "radial-gradient(circle at 50% 50%, rgba(90, 159, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(161, 201, 255, 0.1) 0%, transparent 40%)"
              : "radial-gradient(circle at 50% 50%, rgba(90, 159, 237, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(161, 201, 255, 0.05) 0%, transparent 40%)",
          }}
        />

        <div className="flex flex-col gap-8 w-full">
          {/* Top section */}
          <div className="relative z-10 md:max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-0 lg:px-8 w-full">
            <div className="grid lg:grid-cols-[1.3fr_0.8fr] gap-6 lg:gap-10 xl:gap-16 items-center">

              {/* Left: Text Content */}
              <div className="space-y-6 lg:space-y-8 px-3">

                {/* Badge */}
                <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest bg-zinc-100/80 dark:bg-zinc-900/60 backdrop-blur-xl border-zinc-300/50 dark:border-white/10 text-blue-700 dark:text-blue-300 transition-colors duration-300">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  AI-FIRST TASK COMMAND CENTER
                </motion.div>

                {/* Heading */}
                <motion.div {...fadeUp(0.1)} className="space-y-3 lg:space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-zinc-900 dark:text-white transition-colors duration-300">
                    Plan with AI.
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-[#a1c9ff] dark:to-[#5a9fed] bg-clip-text text-transparent">
                      Execute with focus.
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-full leading-relaxed transition-colors duration-300">
                    Experience the next evolution of productivity. DoIt syncs your cognitive load with
                    high-performance neural tasking, turning chaos into crystalline execution.
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row gap-3">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-[#005087] to-[#5a9fed] text-white rounded-full font-bold text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{ boxShadow: "0 0 20px rgba(90, 159, 237, 0.3)" }}
                    >
                      Go to Dashboard
                      <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-[#005087] to-[#5a9fed] text-white rounded-full font-bold text-base transition-all duration-300 hover:scale-[1.02]"
                        style={{ boxShadow: "0 0 20px rgba(90, 159, 237, 0.3)" }}
                      >
                        Get started
                        <ArrowRight size={18} />
                      </Link>
                     
                    </>
                  )}
                </motion.div>

                {/* Feature Pills */}
                <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-2 pt-2">
                  {heroFeatures.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      {...fadeIn(0.35 + idx * 0.08)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border transition-colors bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-zinc-200/50 dark:border-white/5 hover:border-primary/30"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-blue-100/80 dark:bg-blue-500/10 shadow-sm dark:shadow-[0_0_15px_rgba(161,201,255,0.2)] transition-colors duration-300">
                        {feature.icon}
                      </div>
                      <span className="font-medium text-sm text-zinc-900 dark:text-white transition-colors duration-300">
                        {feature.title}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Hero Image */}
              <motion.div
                {...scaleIn(0.15)}
                className="relative h-[450px] lg:h-[550px] flex justify-end"
              >
                <div className="relative h-full w-full">
                  <Image
                    src="/hero.png"
                    alt="DoIt Task Management Interface"
                    fill
                    className="object-contain lg:translate-x-6"
                    priority
                  />
                </div>
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 dark:bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 dark:bg-[#005087]/20 blur-[100px] rounded-full pointer-events-none" />
              </motion.div>
            </div>
          </div>

          {/* Bottom: Feature Cards */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map(({ Icon, title, desc }, idx) => (
                <motion.div
                  key={title}
                  {...fadeUp(0.4 + idx * 0.1)}
                  className="group relative flex gap-3 py-6 px-3 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-zinc-200/50 dark:border-white/10 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
