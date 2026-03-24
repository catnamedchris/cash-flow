import { useId } from 'react';

export function Tip({ text }: { text: string }) {
  const id = useId();
  return (
    <span className="relative group/tip inline-flex items-center ml-1.5 cursor-help">
      <span
        tabIndex={0}
        role="button"
        aria-describedby={id}
        className="inline-flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/40 rounded-full"
      >
        <svg className="w-3.5 h-3.5 text-white/20 group-hover/tip:text-white/50 group-focus-within/tip:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4m0-4h.01" strokeLinecap="round" />
        </svg>
      </span>
      <span
        id={id}
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/95 backdrop-blur border border-white/10 text-[11px] text-slate-300 leading-relaxed w-60 text-left shadow-2xl shadow-black/40 opacity-0 scale-95 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:pointer-events-auto group-focus-within/tip:opacity-100 group-focus-within/tip:scale-100 group-focus-within/tip:pointer-events-auto transition-all duration-150 z-50"
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900/95" />
      </span>
    </span>
  );
}
