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
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">{prefix}</span>
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
