import { fmt } from '../format';
import { Tip } from './Tip';

export function Row({
  label, value, sub, green, bold, tip, red, delta,
}: {
  label: string; value: string; sub?: boolean; green?: boolean; bold?: boolean; tip?: string; red?: boolean; delta?: number;
}) {
  const hasDelta = delta !== undefined && Math.abs(delta) >= 1;
  return (
    <div className={`flex justify-between items-center py-2 ${sub ? 'pl-5' : ''}`}>
      <span className={`text-[13px] flex items-center ${sub ? 'text-white/30' : bold ? 'text-white/70 font-medium' : 'text-white/50'}`}>
        {label}
        {tip && <Tip text={tip} />}
      </span>
      <span className={`text-[13px] font-mono tabular-nums flex items-center gap-2 ${
        green ? 'text-emerald-400 font-semibold' : red ? 'text-red-400/80 font-medium' : bold ? 'text-white font-semibold' : 'text-white/60'
      }`}>
        {value}
        {hasDelta && (
          <span className="text-[11px] text-amber-400/70 font-medium">
            {delta > 0 ? '+' : ''}{fmt(delta)}
          </span>
        )}
      </span>
    </div>
  );
}
