import { useState, useMemo } from 'react';
import { calculateSavings, TAX_CONSTANTS } from './taxCalculator';
import type { SavingsInputs } from './taxCalculator';
import { fmt } from './format';
import { Tip } from './components/Tip';
import { RingChart } from './components/RingChart';
import { Input } from './components/Input';
import { Label } from './components/Label';
import { Row } from './components/Row';
import { ExpandableRow } from './components/ExpandableRow';
import { ThemeToggle } from './components/ThemeToggle';
import { AnimatedNumber } from './components/AnimatedNumber';
import { EmptyState } from './components/EmptyState';
import { Milestone } from './components/Milestone';

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

  const [titleClicks, setTitleClicks] = useState(0);
  const easterEgg = titleClicks >= 5;

  const tagline = useMemo(() => {
    if (!r) return '';
    const rate = projected ? projected.netSavingsRate : r.netSavingsRate;
    if (rate >= 0.7) return 'Legendary status.';
    if (rate >= 0.5) return 'Financial freedom awaits.';
    if (rate >= 0.4) return 'Building serious wealth.';
    if (rate >= 0.3) return 'Ahead of the curve.';
    if (rate >= 0.2) return 'Solid foundation.';
    if (rate >= 0.1) return 'Every dollar counts.';
    return 'Room to grow.';
  }, [r, projected]);

  return (
    <div className="min-h-screen bg-page text-heading selection:bg-accent/30">
      <ThemeToggle />

      {/* Ambient glow (dark mode only) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden dark:block">
        <div className="absolute top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        <div className="absolute top-[20%] right-[-30%] w-[50%] h-[50%] rounded-full bg-violet-500/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="text-center pt-12 sm:pt-16 pb-10 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">2026 Tax Year</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold tracking-tight cursor-default select-none"
            onClick={() => setTitleClicks((c) => c + 1)}
          >
            <span className="bg-gradient-to-b from-heading to-heading/50 bg-clip-text text-transparent">Cash</span>
            {' '}
            <span className={`bg-gradient-to-r from-accent via-accent-alt to-accent bg-[length:200%_100%] bg-clip-text text-transparent ${easterEgg ? 'animate-[shimmer_1.5s_ease-in-out_infinite]' : 'animate-[shimmer_6s_ease-in-out_infinite]'}`}>Flow</span>
          </h1>
          {easterEgg && (
            <p className="text-[11px] text-accent/60 mt-2 animate-[fadeIn_0.5s_ease-out] font-mono">
              ✶ you found the secret ✶
            </p>
          )}
          {tagline && (
            <p className="text-sm text-muted mt-3 animate-[fadeIn_0.6s_ease-out] font-medium tracking-wide">
              {tagline}
            </p>
          )}
        </header>

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 lg:pb-20 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Input Form ── */}
          <div className="lg:col-span-2 rounded-2xl bg-panel border border-edge p-5 sm:p-6 space-y-1 shadow-sm dark:shadow-none dark:border-edge">
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
                className="flex items-center gap-2 text-muted hover:text-caption text-[11px] font-semibold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <svg className={`w-3 h-3 transition-transform duration-200 ${planOpen ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.293 4.293a1 1 0 011.414 0L13.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L10.586 10 6.293 5.707a1 1 0 010-1.414z" />
                </svg>
                Plan & Benefits
              </button>
              {!planOpen && (
                <div className="text-[10px] text-faint mt-1.5 ml-5 font-mono tabular-nums">
                  401k {fmt(inputs.traditional401k ?? 0)} · HSA {fmt(inputs.hsaEmployee ?? 0)} · {inputs.employerMatchPercent ?? 0}% match
                </div>
              )}
              <div className={`grid transition-all duration-300 ${planOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">Retirement</label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="401k" value={inputs.traditional401k} onChange={set('traditional401k')} prefix="$" />
                        <Input label="After-Tax 401k" value={inputs.afterTax401k} onChange={set('afterTax401k')} prefix="$" />
                        <Input label="HSA (You)" value={inputs.hsaEmployee} onChange={set('hsaEmployee')} prefix="$" />
                        <Input label="HSA (Employer)" value={inputs.hsaEmployer} onChange={set('hsaEmployer')} prefix="$" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">Employer Match</label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Match %" value={inputs.employerMatchPercent} onChange={set('employerMatchPercent')} suffix="%" />
                        <Input label="Comp Limit" value={inputs.irsCompLimit} onChange={set('irsCompLimit')} prefix="$" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">Payroll Deductions</label>
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
            </div>

            <Label>What If…</Label>
            <div className="space-y-1.5">
              {rankedPresets.map(({ preset, dollarDelta }) => {
                const state = scenarios[preset.id];
                const isActive = state.active;
                const isExpense = preset.direction === 'expense';
                const barWidth = maxDollars > 0 ? (Math.abs(dollarDelta) / maxDollars) * 100 : 0;

                return (
                  <div
                    key={preset.id}
                    className={`rounded-xl border px-3 py-2 transition-all duration-200 ${
                      isActive
                        ? isExpense
                          ? 'bg-warning/[0.08] border-warning/20'
                          : 'bg-info/[0.08] border-info/20'
                        : 'bg-panel-alt border-edge hover:bg-panel-hover'
                    }`}
                  >
                    <button
                      onClick={() => toggle(preset.id)}
                      className="w-full text-left cursor-pointer group active:scale-[0.98] transition-transform duration-150"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive
                              ? isExpense ? 'border-warning bg-warning' : 'border-info bg-info'
                              : 'border-faint'
                          }`}>
                            {isActive && (
                              <svg className="w-1.5 h-1.5 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-[12px] font-medium truncate block ${isActive ? 'text-strong' : 'text-caption'}`}>
                              {preset.label}
                            </span>
                            <span className="text-[10px] text-faint font-mono tabular-nums">
                              {isExpense ? '−' : '+'}{preset.monthly ? `${fmt(state.amount)}/mo` : `${fmt(state.amount)}/yr`}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[11px] font-mono tabular-nums font-semibold flex-shrink-0 ${
                          isExpense ? 'text-warning/80' : 'text-info/80'
                        }`}>
                          +{fmt(dollarDelta)}/yr
                        </span>
                      </div>
                      {/* Impact bar */}
                      <div className="h-1 rounded-full bg-edge-subtle overflow-hidden ml-4.5 mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isExpense ? 'bg-warning/40' : 'bg-info/40'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </button>
                    {/* Inline amount editor */}
                    {isActive && (
                      <div className="mt-1.5 ml-4.5">
                        <div className="relative inline-flex items-center">
                          <span className="absolute left-2 text-faint text-[11px] pointer-events-none">$</span>
                          <input
                            type="number"
                            value={state.amount !== undefined && state.amount !== null ? state.amount : ''}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setAmount(preset.id, raw === '' ? 0 : Number(raw));
                            }}
                            className="w-20 rounded-lg bg-inset border border-edge text-heading text-[11px] py-1 pl-5 pr-2 focus:outline-none focus:border-faint font-mono tabular-nums"
                          />
                          <span className="ml-1 text-[10px] text-faint">{preset.monthly ? '/mo' : '/yr'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {activeCount > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setScenarios(Object.fromEntries(SCENARIO_PRESETS.map((s) => [s.id, { active: false, amount: s.defaultAmount }])))}
                  className="text-[10px] text-faint hover:text-muted transition-colors cursor-pointer"
                >
                  Reset scenarios
                </button>
              </div>
            )}
          </div>

          {/* ── Results ── */}
          {!r && <EmptyState />}
          {r && (() => {
            const d = projected ?? r;
            const dl = (base: number, proj: number) => projected ? proj - base : undefined;

            return (
            <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-5">
              {/* Ring Charts */}
              <div className="rounded-2xl bg-panel border border-edge p-6 sm:p-8 shadow-sm dark:shadow-[0_0_40px_rgba(52,211,153,0.04)] animate-[slideUp_0.5s_ease-out]">
                {activeCount > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
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
                <div className="mt-6 pt-5 border-t border-edge-subtle text-center">
                  <span className="text-muted text-xs font-semibold uppercase tracking-widest">Total Saved</span>
                  <div className="text-2xl sm:text-3xl font-bold mt-1 font-mono tabular-nums bg-gradient-to-r from-accent to-accent-alt bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(5,150,105,0.3)] dark:drop-shadow-[0_0_24px_rgba(52,211,153,0.25)]">
                    <AnimatedNumber value={projected ? projected.totalSavings : r.totalSavings} format={fmt} />
                  </div>
                  {projected ? (
                    <div className="mt-1 space-y-1">
                      <span className="text-warning/70 text-xs font-mono tabular-nums font-semibold">
                        +<AnimatedNumber value={savingsDelta} format={fmt} />/yr
                      </span>
                      {(() => {
                        const realReturn = 0.07;
                        const fvAnnuity = (pmt: number, rate: number, n: number) =>
                          pmt * ((Math.pow(1 + rate, n) - 1) / rate);
                        const delta10 = fvAnnuity(projected.totalSavings, realReturn, 10) - fvAnnuity(r.totalSavings, realReturn, 10);
                        return (
                          <div className="text-faint text-[11px] flex items-center justify-center gap-1">
                            <span className="text-warning/50 font-mono tabular-nums">+<AnimatedNumber value={delta10} format={fmt} /></span>
                            <span>over 10yr at 7%</span>
                            <Tip text="Extra wealth accumulated over 10 years by investing the additional annual savings at a 7% real (inflation-adjusted) return." />
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="text-faint text-xs mt-1 inline-flex items-center">per year <Tip text="Retirement savings plus non-retirement savings. This is the numerator for both savings rates." /></span>
                  )}
                  <Milestone rate={projected ? projected.netSavingsRate : r.netSavingsRate} />
                </div>
              </div>

              {/* Breakdown */}
              <div className="rounded-2xl bg-panel border border-edge p-5 sm:p-6 shadow-sm dark:shadow-none animate-[slideUp_0.6s_ease-out]">
                <div className="flex items-center gap-3 pb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">Breakdown</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-edge to-transparent" />
                </div>
                <div className="space-y-1">
                  <Row label="Gross Income" value={d.grossIncome} bold tip="Total compensation before any taxes or deductions: salary + bonus + RSUs." delta={dl(r.grossIncome, d.grossIncome)} />

                  <ExpandableRow
                    label="Total Taxes" value={`−${fmt(d.totalTaxes)}`} red
                    open={taxOpen} onToggle={() => setTaxOpen(!taxOpen)}
                  >
                    <Row label="Federal" value={d.federalTax} sub delta={dl(r.federalTax, d.federalTax)} />
                    <Row label="California" value={d.stateTax} sub delta={dl(r.stateTax, d.stateTax)} />
                    <Row label="Social Security" value={d.socialSecurity} sub delta={dl(r.socialSecurity, d.socialSecurity)} />
                    <Row label="Medicare" value={d.medicare} sub delta={dl(r.medicare, d.medicare)} />
                    <Row label="CA SDI" value={d.caSDI} sub delta={dl(r.caSDI, d.caSDI)} />
                  </ExpandableRow>

                  <Row label="After-Tax Income" value={d.afterTaxIncome} bold tip="Gross income minus all taxes. This is the denominator for your net savings rate — it represents all the money available to you before voluntary deductions." delta={dl(r.afterTaxIncome, d.afterTaxIncome)} />

                  <div className="border-t border-edge my-1" />

                  <Row label="Take-Home Pay" value={d.takeHomePay} bold tip="What actually hits your bank account: gross income minus taxes, minus all pre-tax deductions (401k, HSA, insurance), minus post-tax deductions (after-tax 401k, legal, life insurance)." delta={dl(r.takeHomePay, d.takeHomePay)} />

                  <div className="border-t border-edge my-1" />

                  <ExpandableRow
                    label="Retirement Savings" value={fmt(d.retirementSavings)} green
                    open={retOpen} onToggle={() => setRetOpen(!retOpen)}
                    tip="Sum of all tax-advantaged contributions: 401k, mega backdoor Roth, HSA (employee + employer), and employer match."
                  >
                    <Row label="Traditional 401k" value={inputs.traditional401k ?? 0} sub />
                    <Row label="Mega Backdoor Roth" value={inputs.afterTax401k ?? 0} sub />
                    <Row label="HSA (Employee)" value={inputs.hsaEmployee ?? 0} sub />
                    <Row label="HSA (Employer)" value={inputs.hsaEmployer ?? 0} sub />
                    <Row label="Employer Match" value={d.employerMatch} sub delta={dl(r.employerMatch, d.employerMatch)} />
                  </ExpandableRow>

                  <Row label="Non-Retirement Savings" value={d.nonRetirementSavings} green tip="Take-home pay minus annual expenses. This is money left over for brokerage accounts or other non-tax-advantaged savings." delta={dl(r.nonRetirementSavings, d.nonRetirementSavings)} />
                </div>
              </div>
            </div>
            );
          })()}
        </main>

        {/* Mobile sticky bottom bar */}
        {r && (
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            <div className="bg-panel/90 backdrop-blur-xl border-t border-edge px-4 py-3 flex items-center justify-around">
              <div className="text-center">
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted">Gross Rate</div>
                <div className="text-sm font-bold font-mono tabular-nums text-heading">
                  <AnimatedNumber
                    value={(projected ? projected.grossSavingsRate : r.grossSavingsRate) * 100}
                    format={(n) => `${n.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="w-px h-6 bg-edge" />
              <div className="text-center">
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted">Net Rate</div>
                <div className="text-sm font-bold font-mono tabular-nums text-heading">
                  <AnimatedNumber
                    value={(projected ? projected.netSavingsRate : r.netSavingsRate) * 100}
                    format={(n) => `${n.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="w-px h-6 bg-edge" />
              <div className="text-center">
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted">Saved</div>
                <div className="text-sm font-bold font-mono tabular-nums bg-gradient-to-r from-accent to-accent-alt bg-clip-text text-transparent">
                  <AnimatedNumber value={projected ? projected.totalSavings : r.totalSavings} format={fmt} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom spacer */}
      {r && <div className="h-16 lg:hidden" />}
    </div>
  );
}

export default App;
