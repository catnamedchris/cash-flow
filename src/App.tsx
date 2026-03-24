import { useState, useMemo } from 'react';
import { calculateSavings, TAX_CONSTANTS } from './taxCalculator';
import type { SavingsInputs } from './taxCalculator';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/* ── Tooltip ──────────────────────────────────────────────────────── */
function Tip({ text }: { text: string }) {
  return (
    <span className="relative group/tip inline-flex items-center ml-1.5 cursor-help">
      <svg className="w-3.5 h-3.5 text-white/20 group-hover/tip:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" strokeLinecap="round" />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/95 backdrop-blur border border-white/10 text-[11px] text-slate-300 leading-relaxed w-60 text-left shadow-2xl shadow-black/40 opacity-0 scale-95 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:pointer-events-auto transition-all duration-150 z-50">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900/95" />
      </span>
    </span>
  );
}

/* ── Ring Chart ────────────────────────────────────────────────────── */
function RingChart({ value, baseValue, label, tooltip, gradient }: { value: number; baseValue?: number; label: string; tooltip: string; gradient: string }) {
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
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.04]" />
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
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{pct(value)}</span>
          {hasProjection && (
            <span className="text-[10px] font-mono tabular-nums text-amber-400/80 font-semibold">
              +{(delta * 100).toFixed(1)}pp
            </span>
          )}
        </div>
      </div>
      <span className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-0.5">
        {label}
        <Tip text={tooltip} />
      </span>
    </div>
  );
}

/* ── Input ─────────────────────────────────────────────────────────── */
function Input({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">{label}</label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          type="number"
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
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

/* ── Section Label ─────────────────────────────────────────────────── */
function Label({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${first ? '' : 'pt-6'} pb-2`}>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">{children}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
    </div>
  );
}

/* ── Result Row ────────────────────────────────────────────────────── */
function Row({
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

/* ── Expandable Row ────────────────────────────────────────────────── */
function ExpandableRow({
  label, value, open, onToggle, children, green, red, tip,
}: {
  label: string; value: string; open: boolean; onToggle: () => void;
  children: React.ReactNode; green?: boolean; red?: boolean; tip?: string;
}) {
  return (
    <div>
      <button onClick={onToggle} className="flex justify-between items-center w-full py-2 cursor-pointer group">
        <span className="text-[13px] text-white/50 group-hover:text-white/70 transition-colors flex items-center gap-1.5">
          <svg className={`w-3 h-3 text-white/20 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.293 4.293a1 1 0 011.414 0L13.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L10.586 10 6.293 5.707a1 1 0 010-1.414z" />
          </svg>
          {label}
          {tip && <Tip text={tip} />}
        </span>
        <span className={`text-[13px] font-mono tabular-nums font-medium ${green ? 'text-emerald-400' : red ? 'text-red-400/80' : 'text-white/60'}`}>
          {value}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-l border-white/[0.04] ml-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Scenario Presets ──────────────────────────────────────────────── */
interface ScenarioPreset {
  id: string;
  label: string;
  field: keyof SavingsInputs;
  defaultAmount: number;
  monthly: boolean;
  direction: 'expense' | 'income';
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  { id: 'housing',   label: 'Reduce Housing',        field: 'annualExpenses', defaultAmount: 500,   monthly: true,  direction: 'expense' },
  { id: 'food',      label: 'Cut Food & Dining',     field: 'annualExpenses', defaultAmount: 300,   monthly: true,  direction: 'expense' },
  { id: 'subs',      label: 'Drop Subscriptions',    field: 'annualExpenses', defaultAmount: 150,   monthly: true,  direction: 'expense' },
  { id: 'transport', label: 'Reduce Transportation', field: 'annualExpenses', defaultAmount: 200,   monthly: true,  direction: 'expense' },
  { id: 'raise',     label: 'Negotiate a Raise',     field: 'annualSalary',   defaultAmount: 15000, monthly: false, direction: 'income' },
  { id: 'side',      label: 'Side Income',           field: 'annualBonus',    defaultAmount: 1000,  monthly: true,  direction: 'income' },
];

type ScenarioState = Record<string, { active: boolean; amount: number }>;

/* ── Main App ──────────────────────────────────────────────────────── */
function App() {
  const [inputs, setInputs] = useState<SavingsInputs>({
    annualSalary: 157914,
    annualBonus: 20000,
    annualRSU: 48000,
    traditional401k: TAX_CONSTANTS.retirement.employee401k,
    afterTax401k: TAX_CONSTANTS.retirement.afterTax401k,
    hsaEmployee: 3900,
    hsaEmployer: 500,
    employerMatchPercent: 5,
    irsCompLimit: TAX_CONSTANTS.retirement.employerCompLimit,
    dentalPerPaycheck: 23.05,
    medicalPerPaycheck: 24.87,
    visionPerPaycheck: 1.37,
    legalPerPaycheck: 11.88,
    lifeInsPerPaycheck: 2.70,
    payPeriodsPerYear: 24,
    annualExpenses: 80000,
  });

  const [planOpen, setPlanOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [retOpen, setRetOpen] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioState>(() =>
    Object.fromEntries(SCENARIO_PRESETS.map((s) => [s.id, { active: false, amount: s.defaultAmount }])),
  );

  const set = (field: keyof SavingsInputs) => (v: number) =>
    setInputs((prev) => ({ ...prev, [field]: v }));

  const toggle = (id: string) =>
    setScenarios((prev) => ({ ...prev, [id]: { ...prev[id], active: !prev[id].active } }));
  const setAmount = (id: string, amount: number) =>
    setScenarios((prev) => ({ ...prev, [id]: { ...prev[id], amount } }));
  const activeCount = Object.values(scenarios).filter((s) => s.active).length;

  const hasIncome = inputs.annualSalary > 0 || inputs.annualBonus > 0 || inputs.annualRSU > 0;
  const r = useMemo(() => hasIncome ? calculateSavings(inputs) : null, [inputs, hasIncome]);

  const projected = useMemo(() => {
    if (!r || activeCount === 0) return null;
    const adj = { ...inputs };
    for (const preset of SCENARIO_PRESETS) {
      const state = scenarios[preset.id];
      if (!state.active) continue;
      const annualAmount = preset.monthly ? state.amount * 12 : state.amount;
      if (preset.direction === 'expense') {
        (adj[preset.field] as number) = ((adj[preset.field] as number) ?? 0) - annualAmount;
      } else {
        (adj[preset.field] as number) = ((adj[preset.field] as number) ?? 0) + annualAmount;
      }
    }
    return calculateSavings(adj);
  }, [inputs, scenarios, r, activeCount]);

  const savingsDelta = projected && r ? projected.totalSavings - r.totalSavings : 0;

  const rankedPresets = useMemo(() => {
    if (!r) return [];
    return SCENARIO_PRESETS.map((preset) => {
      const state = scenarios[preset.id];
      const annualAmt = preset.monthly ? state.amount * 12 : state.amount;
      const tweakedInputs = { ...inputs };
      if (preset.direction === 'expense') {
        (tweakedInputs[preset.field] as number) = ((tweakedInputs[preset.field] as number) ?? 0) - annualAmt;
      } else {
        (tweakedInputs[preset.field] as number) = ((tweakedInputs[preset.field] as number) ?? 0) + annualAmt;
      }
      const tweaked = calculateSavings(tweakedInputs);
      const ppDelta = (tweaked.netSavingsRate - r.netSavingsRate) * 100;
      const dollarDelta = tweaked.totalSavings - r.totalSavings;
      return { preset, ppDelta, dollarDelta };
    }).sort((a, b) => b.dollarDelta - a.dollarDelta);
  }, [inputs, scenarios, r]);

  const maxDollars = Math.max(0, ...rankedPresets.map((rp) => Math.abs(rp.dollarDelta)));

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white selection:bg-emerald-500/30">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="text-center pt-12 sm:pt-16 pb-10 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">2026 Tax Year</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Savings Rate</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Calculator</span>
          </h1>
        </header>

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Input Form ── */}
          <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sm:p-6 space-y-1">
            <Label first>Income</Label>
            <div className="space-y-3">
              <Input label="Salary" value={inputs.annualSalary} onChange={set('annualSalary')} prefix="$" placeholder="0" />
              <Input label="Bonus" value={inputs.annualBonus} onChange={set('annualBonus')} prefix="$" placeholder="0" />
              <Input label="RSU" value={inputs.annualRSU} onChange={set('annualRSU')} prefix="$" placeholder="0" />
            </div>

            <Label>Expenses</Label>
            <Input label="Annual Expenses" value={inputs.annualExpenses} onChange={set('annualExpenses')} prefix="$" placeholder="0" />

            {/* Collapsible Plan & Benefits */}
            <div className="pt-5">
              <button
                onClick={() => setPlanOpen(!planOpen)}
                className="flex items-center gap-2 text-white/25 hover:text-white/50 text-[11px] font-semibold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <svg className={`w-3 h-3 transition-transform duration-200 ${planOpen ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.293 4.293a1 1 0 011.414 0L13.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L10.586 10 6.293 5.707a1 1 0 010-1.414z" />
                </svg>
                Plan & Benefits
              </button>
              {!planOpen && (
                <div className="text-[10px] text-white/15 mt-1.5 ml-5 font-mono tabular-nums">
                  401k {fmt(inputs.traditional401k)} · HSA {fmt(inputs.hsaEmployee)} · {inputs.employerMatchPercent}% match
                </div>
              )}
              <div className={`overflow-hidden transition-all duration-300 ${planOpen ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2">Retirement</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="401k" value={inputs.traditional401k} onChange={set('traditional401k')} prefix="$" />
                      <Input label="After-Tax 401k" value={inputs.afterTax401k} onChange={set('afterTax401k')} prefix="$" />
                      <Input label="HSA (You)" value={inputs.hsaEmployee} onChange={set('hsaEmployee')} prefix="$" />
                      <Input label="HSA (Employer)" value={inputs.hsaEmployer} onChange={set('hsaEmployer')} prefix="$" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2">Employer Match</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Match %" value={inputs.employerMatchPercent} onChange={set('employerMatchPercent')} suffix="%" />
                      <Input label="Comp Limit" value={inputs.irsCompLimit} onChange={set('irsCompLimit')} prefix="$" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2">Payroll Deductions</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Dental" value={inputs.dentalPerPaycheck} onChange={set('dentalPerPaycheck')} prefix="$" />
                      <Input label="Medical" value={inputs.medicalPerPaycheck} onChange={set('medicalPerPaycheck')} prefix="$" />
                      <Input label="Vision" value={inputs.visionPerPaycheck} onChange={set('visionPerPaycheck')} prefix="$" />
                      <Input label="Legal" value={inputs.legalPerPaycheck} onChange={set('legalPerPaycheck')} prefix="$" />
                      <Input label="Life Ins" value={inputs.lifeInsPerPaycheck} onChange={set('lifeInsPerPaycheck')} prefix="$" />
                      <Input label="Pay Periods" value={inputs.payPeriodsPerYear} onChange={set('payPeriodsPerYear')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Label>What If…</Label>
            <div className="space-y-1.5">
              {rankedPresets.map(({ preset, dollarDelta }) => {
                const state = scenarios[preset.id];
                const isActive = state.active;
                const isExpense = preset.direction === 'expense';
                const barWidth = maxDollars > 0 ? (Math.abs(dollarDelta) / maxDollars) * 100 : 0;

                return (
                  <button
                    key={preset.id}
                    onClick={() => toggle(preset.id)}
                    className={`w-full text-left rounded-xl border px-3 py-2 transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? isExpense
                          ? 'bg-amber-500/[0.06] border-amber-500/20'
                          : 'bg-violet-500/[0.06] border-violet-500/20'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive
                            ? isExpense ? 'border-amber-400 bg-amber-400' : 'border-violet-400 bg-violet-400'
                            : 'border-white/20'
                        }`}>
                          {isActive && (
                            <svg className="w-1.5 h-1.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[12px] font-medium truncate block ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                            {preset.label}
                          </span>
                          <span className="text-[10px] text-white/20 font-mono tabular-nums">
                            {isExpense ? '−' : '+'}{preset.monthly ? `${fmt(state.amount)}/mo` : `${fmt(state.amount)}/yr`}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono tabular-nums font-semibold flex-shrink-0 ${
                        isExpense ? 'text-amber-400/80' : 'text-violet-400/80'
                      }`}>
                        +{fmt(dollarDelta)}/yr
                      </span>
                    </div>
                    {/* Impact bar */}
                    <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden ml-4.5 mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isExpense ? 'bg-amber-400/40' : 'bg-violet-400/40'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    {/* Inline amount editor */}
                    {isActive && (
                      <div className="mt-1.5 ml-4.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-flex items-center">
                          <span className="absolute left-2 text-white/25 text-[11px] pointer-events-none">$</span>
                          <input
                            type="number"
                            value={state.amount || ''}
                            onChange={(e) => setAmount(preset.id, Number(e.target.value) || 0)}
                            className="w-20 rounded-lg bg-black/30 border border-white/[0.08] text-white text-[11px] py-1 pl-5 pr-2 focus:outline-none focus:border-white/20 font-mono tabular-nums"
                          />
                          <span className="ml-1 text-[10px] text-white/25">{preset.monthly ? '/mo' : '/yr'}</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {activeCount > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setScenarios(Object.fromEntries(SCENARIO_PRESETS.map((s) => [s.id, { active: false, amount: s.defaultAmount }])))}
                  className="text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                >
                  Reset scenarios
                </button>
              </div>
            )}
          </div>

          {/* ── Results ── */}
          {r && (() => {
            const d = projected ?? r;
            const dl = (base: number, proj: number) => projected ? proj - base : undefined;

            return (
            <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-5">
              {/* Ring Charts */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8">
                {activeCount > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      {activeCount} scenario{activeCount > 1 ? 's' : ''} active
                    </span>
                  </div>
                )}
                <div className="flex justify-around items-start">
                  <RingChart
                    value={projected ? projected.grossSavingsRate : r.grossSavingsRate}
                    baseValue={projected ? r.grossSavingsRate : undefined}
                    label="Gross Rate"
                    tooltip="Total savings as a percentage of gross income (before taxes). Best for comparing across different tax situations."
                    gradient="ring-green"
                  />
                  <RingChart
                    value={projected ? projected.netSavingsRate : r.netSavingsRate}
                    baseValue={projected ? r.netSavingsRate : undefined}
                    label="Net Rate"
                    tooltip="Total savings as a percentage of after-tax income (gross minus taxes). Reflects what you're saving out of money you actually control."
                    gradient="ring-cyan"
                  />
                </div>
                {/* Total savings callout */}
                <div className="mt-6 pt-5 border-t border-white/[0.04] text-center">
                  <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Total Saved</span>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 font-mono tabular-nums transition-all duration-500">
                    {fmt(projected ? projected.totalSavings : r.totalSavings)}
                  </div>
                  {projected ? (
                    <div className="mt-1 space-y-1">
                      <span className="text-amber-400/70 text-xs font-mono tabular-nums font-semibold">
                        +{fmt(savingsDelta)}/yr
                      </span>
                      {(() => {
                        const realReturn = 0.07;
                        const fvAnnuity = (pmt: number, rate: number, n: number) =>
                          pmt * ((Math.pow(1 + rate, n) - 1) / rate);
                        const delta10 = fvAnnuity(projected.totalSavings, realReturn, 10) - fvAnnuity(r.totalSavings, realReturn, 10);
                        return (
                          <div className="text-white/20 text-[11px] flex items-center justify-center gap-1">
                            <span className="text-amber-400/50 font-mono tabular-nums">+{fmt(delta10)}</span>
                            <span>over 10yr at 7%</span>
                            <Tip text="Extra wealth accumulated over 10 years by investing the additional annual savings at a 7% real (inflation-adjusted) return." />
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="text-white/20 text-xs mt-1 inline-flex items-center">per year <Tip text="Retirement savings plus non-retirement savings. This is the numerator for both savings rates." /></span>
                  )}
                </div>
              </div>

              {/* Breakdown */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sm:p-6">
                <div className="flex items-center gap-3 pb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">Breakdown</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                </div>
                <div className="space-y-1">
                  <Row label="Gross Income" value={fmt(d.grossIncome)} bold tip="Total compensation before any taxes or deductions: salary + bonus + RSUs." delta={dl(r.grossIncome, d.grossIncome)} />

                  <ExpandableRow
                    label="Total Taxes" value={`−${fmt(d.totalTaxes)}`} red
                    open={taxOpen} onToggle={() => setTaxOpen(!taxOpen)}
                  >
                    <Row label="Federal" value={fmt(d.federalTax)} sub delta={dl(r.federalTax, d.federalTax)} />
                    <Row label="California" value={fmt(d.stateTax)} sub delta={dl(r.stateTax, d.stateTax)} />
                    <Row label="Social Security" value={fmt(d.socialSecurity)} sub delta={dl(r.socialSecurity, d.socialSecurity)} />
                    <Row label="Medicare" value={fmt(d.medicare)} sub delta={dl(r.medicare, d.medicare)} />
                    <Row label="CA SDI" value={fmt(d.caSDI)} sub delta={dl(r.caSDI, d.caSDI)} />
                  </ExpandableRow>

                  <Row label="After-Tax Income" value={fmt(d.afterTaxIncome)} bold tip="Gross income minus all taxes. This is the denominator for your net savings rate — it represents all the money available to you before voluntary deductions." delta={dl(r.afterTaxIncome, d.afterTaxIncome)} />

                  <div className="border-t border-white/[0.04] my-1" />

                  <Row label="Take-Home Pay" value={fmt(d.takeHomePay)} bold tip="What actually hits your bank account: gross income minus taxes, minus all pre-tax deductions (401k, HSA, insurance), minus post-tax deductions (after-tax 401k, legal, life insurance)." delta={dl(r.takeHomePay, d.takeHomePay)} />

                  <div className="border-t border-white/[0.04] my-1" />

                  <ExpandableRow
                    label="Retirement Savings" value={fmt(d.retirementSavings)} green
                    open={retOpen} onToggle={() => setRetOpen(!retOpen)}
                    tip="Sum of all tax-advantaged contributions: 401k, mega backdoor Roth, HSA (employee + employer), and employer match."
                  >
                    <Row label="Traditional 401k" value={fmt(inputs.traditional401k)} sub />
                    <Row label="Mega Backdoor Roth" value={fmt(inputs.afterTax401k)} sub />
                    <Row label="HSA (Employee)" value={fmt(inputs.hsaEmployee)} sub />
                    <Row label="HSA (Employer)" value={fmt(inputs.hsaEmployer)} sub />
                    <Row label="Employer Match" value={fmt(d.employerMatch)} sub delta={dl(r.employerMatch, d.employerMatch)} />
                  </ExpandableRow>

                  <Row label="Non-Retirement Savings" value={fmt(d.nonRetirementSavings)} green tip="Take-home pay minus annual expenses. This is money left over for brokerage accounts or other non-tax-advantaged savings." delta={dl(r.nonRetirementSavings, d.nonRetirementSavings)} />
                </div>
              </div>
            </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}

export default App;
