import { useId, useRef, useCallback } from 'react';

function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null || n === 0) return '';
  return n.toLocaleString('en-US');
}

function parseNumber(s: string): number {
  const cleaned = s.replace(/[^0-9.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return 0;
  return Number(cleaned);
}

export function Input({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string; value: number | undefined; onChange: (v: number) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const cursorPos = el.selectionStart ?? 0;
    const oldVal = el.value;
    const parsed = parseNumber(oldVal);
    onChange(parsed);

    // Restore cursor: count digits before cursor in old value, then find the same position in formatted value
    const digitsBefore = oldVal.slice(0, cursorPos).replace(/[^0-9]/g, '').length;
    const formatted = parsed ? parsed.toLocaleString('en-US') : '';
    let newCursor = 0;
    let counted = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (counted === digitsBefore) break;
      if (/[0-9]/.test(formatted[i])) counted++;
      newCursor = i + 1;
    }
    requestAnimationFrame(() => {
      el.setSelectionRange(newCursor, newCursor);
    });
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          value={formatNumber(value)}
          placeholder={placeholder}
          onChange={handleChange}
          className={`w-full rounded-xl bg-input-field border border-edge text-heading placeholder:text-ghost py-3 text-sm focus:outline-none focus:bg-input-focus focus:border-accent/30 focus:ring-2 focus:ring-accent/15 focus:shadow-[0_0_16px_rgba(5,150,105,0.08)] dark:focus:shadow-[0_0_20px_rgba(52,211,153,0.06)] transition-all duration-300 ${
            prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}
