import { ListTodo, Brain, LayoutDashboard, LucideIcon } from "lucide-react";

type Feature = {
  Icon: LucideIcon;
  title: string;
  desc: string;
  gradient: string;
  border: string;
  iconColor: string;
};

const features: Feature[] = [
  {
    Icon: ListTodo,
    title: "Stay organised",
    desc: "Group tasks by project, priority, or date — your way, your rules.",
    gradient: "from-blue-500/10 to-indigo-500/10",
    border: "hover:border-blue-500/40",
    iconColor: "text-amber-500",
  },
  {
    Icon: Brain,
    title: "AI-powered",
    desc: "Let the assistant plan your day and generate task lists instantly.",
    gradient: "from-primary/10 to-violet-500/10",
    border: "hover:border-primary/40",
    iconColor: "text-primary",
  },
  {
    Icon: LayoutDashboard,
    title: "Clear overview",
    desc: "A dashboard that shows what matters, nothing more.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "hover:border-emerald-500/40",
    iconColor: "text-emerald-500",
  },
];

export function Features() {
  return (
    <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl mb-16 sm:mb-20 px-6">
      {features.map(({ Icon, title, desc, gradient, border, iconColor }) => (
        <div
          key={title}
          className={`group relative flex flex-col gap-3 p-5 sm:p-6 rounded-2xl border border-border bg-surface text-left ${border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
        >
          {/* card glow bg */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${gradient} transition-opacity duration-300 rounded-2xl`}
          />
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="font-semibold text-sm text-foreground">{title}</p>
            <p className="text-xs text-foreground-muted leading-relaxed mt-1">
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
