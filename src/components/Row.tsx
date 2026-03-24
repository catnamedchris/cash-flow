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
      <span className={`text-[13px] flex items-center ${sub ? 'text-caption' : bold ? 'text-strong font-medium' : 'text-caption'}`}>
        {label}
        {tip && <Tip text={tip} />}
      </span>
      <span className={`text-[13px] font-mono tabular-nums flex items-center gap-2 ${
        green ? 'text-accent font-semibold' : red ? 'text-danger/80 font-medium' : bold ? 'text-heading font-semibold' : 'text-secondary'
      }`}>
        {value}
        {hasDelta && (
          <span className="text-[11px] text-warning/70 font-medium">
            {delta > 0 ? '+' : ''}{fmt(delta)}
          </span>
        )}
      </span>
    </div>
  );
}
