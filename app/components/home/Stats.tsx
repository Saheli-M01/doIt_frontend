const stats = [
  { value: "10x", label: "More productive" },
  { value: "∞", label: "Tasks supported" },
  { value: "AI", label: "Powered planner" },
];

export function Stats() {
  return (
    <div className="mt-12 sm:mt-16 w-full flex items-center justify-center gap-8 sm:gap-10 lg:gap-16 px-6">
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
            {value}
          </span>
          <span className="text-[10px] sm:text-xs text-foreground-muted text-center">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
