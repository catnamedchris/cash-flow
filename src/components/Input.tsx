import { useId } from 'react';

export function Input({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string; value: number | undefined; onChange: (v: number) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">{label}</label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          value={value !== undefined && value !== null ? value : ''}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === '' ? 0 : Number(raw));
          }}
          className={`w-full rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-white/15 py-3 text-sm focus:outline-none focus:bg-white/[0.07] focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200 ${
            prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}
