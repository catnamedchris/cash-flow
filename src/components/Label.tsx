export function Label({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${first ? '' : 'pt-6'} pb-2`}>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">{children}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-edge to-transparent" />
    </div>
  );
}
