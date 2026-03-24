import { pct } from '../format';
import { Tip } from './Tip';

export function RingChart({ value, baseValue, label, tooltip, gradient }: { value: number; baseValue?: number; label: string; tooltip: string; gradient: string }) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - clamped);
  const hasProjection = baseValue !== undefined && baseValue !== value;
  const baseClamped = hasProjection ? Math.min(Math.max(baseValue, 0), 1) : 0;
  const baseOffset = circumference * (1 - baseClamped);
  const delta = hasProjection ? value - baseValue : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-edge-subtle" />
          {hasProjection && (
            <circle
              cx="60" cy="60" r="54" fill="none"
              strokeWidth="8" strokeLinecap="round"
              stroke={`url(#${gradient})`}
              strokeDasharray={circumference}
              strokeDashoffset={baseOffset}
              className="transition-all duration-700 ease-out opacity-20"
            />
          )}
          <circle
            cx="60" cy="60" r="54" fill="none"
            strokeWidth="8" strokeLinecap="round"
            stroke={`url(#${gradient})`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="ring-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ring-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-heading tracking-tight">{pct(value)}</span>
          {hasProjection && (
            <span className="text-[10px] font-mono tabular-nums text-warning/80 font-semibold">
              +{(delta * 100).toFixed(1)}pp
            </span>
          )}
        </div>
      </div>
      <span className="text-xs sm:text-sm text-muted font-medium flex items-center gap-0.5">
        {label}
        <Tip text={tooltip} />
      </span>
    </div>
  );
}
