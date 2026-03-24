const MILESTONES = [
  { threshold: 0.20, label: 'Solid Saver', emoji: '✦' },
  { threshold: 0.30, label: 'Above Average', emoji: '◆' },
  { threshold: 0.40, label: 'Wealth Builder', emoji: '★' },
  { threshold: 0.50, label: 'Financial Freedom', emoji: '✶' },
  { threshold: 0.60, label: 'Exceptional', emoji: '❖' },
  { threshold: 0.70, label: 'Legendary', emoji: '◈' },
];

export function Milestone({ rate }: { rate: number }) {
  const milestone = [...MILESTONES].reverse().find((m) => rate >= m.threshold);
  if (!milestone) return null;

  return (
    <div className="flex justify-center mt-3 animate-[fadeIn_0.5s_ease-out]">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 dark:bg-accent/[0.08] border border-accent/20 shadow-[0_0_12px_rgba(5,150,105,0.1)] dark:shadow-[0_0_16px_rgba(52,211,153,0.08)]">
        <span className="text-accent text-xs">{milestone.emoji}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
          {milestone.label}
        </span>
      </div>
    </div>
  );
}
