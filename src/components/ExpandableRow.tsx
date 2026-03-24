import { Tip } from './Tip';

export function ExpandableRow({
  label, value, open, onToggle, children, green, red, tip,
}: {
  label: string; value: string; open: boolean; onToggle: () => void;
  children: React.ReactNode; green?: boolean; red?: boolean; tip?: string;
}) {
  return (
    <div>
      <button onClick={onToggle} className="flex justify-between items-center w-full py-2 cursor-pointer group">
        <span className="text-[13px] text-caption group-hover:text-strong transition-colors flex items-center gap-1.5">
          <svg className={`w-3 h-3 text-faint transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.293 4.293a1 1 0 011.414 0L13.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L10.586 10 6.293 5.707a1 1 0 010-1.414z" />
          </svg>
          {label}
          {tip && <Tip text={tip} />}
        </span>
        <span className={`text-[13px] font-mono tabular-nums font-medium ${green ? 'text-accent' : red ? 'text-danger/80' : 'text-secondary'}`}>
          {value}
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-l border-edge ml-1.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
