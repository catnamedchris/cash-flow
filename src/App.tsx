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
function RingChart({ value, label, tooltip, gradient }: { value: number; label: string; tooltip: string; gradient: string }) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - clamped);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.04]" />
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{pct(value)}</span>
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
  label, value, sub, green, bold, tip, red,
}: {
  label: string; value: string; sub?: boolean; green?: boolean; bold?: boolean; tip?: string; red?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${sub ? 'pl-5' : ''}`}>
      <span className={`text-[13px] flex items-center ${sub ? 'text-white/30' : bold ? 'text-white/70 font-medium' : 'text-white/50'}`}>
        {label}
        {tip && <Tip text={tip} />}
      </span>
      <span className={`text-[13px] font-mono tabular-nums ${
        green ? 'text-emerald-400 font-semibold' : red ? 'text-red-400/80 font-medium' : bold ? 'text-white font-semibold' : 'text-white/60'
      }`}>
        {value}
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

  const [payrollOpen, setPayrollOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [retOpen, setRetOpen] = useState(false);

  const set = (field: keyof SavingsInputs) => (v: number) =>
    setInputs((prev) => ({ ...prev, [field]: v }));

  const hasIncome = inputs.annualSalary > 0 || inputs.annualBonus > 0 || inputs.annualRSU > 0;
  const r = useMemo(() => hasIncome ? calculateSavings(inputs) : null, [inputs, hasIncome]);

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

            <Label>Retirement</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="401k" value={inputs.traditional401k} onChange={set('traditional401k')} prefix="$" />
              <Input label="After-Tax 401k" value={inputs.afterTax401k} onChange={set('afterTax401k')} prefix="$" />
              <Input label="HSA (You)" value={inputs.hsaEmployee} onChange={set('hsaEmployee')} prefix="$" />
              <Input label="HSA (Employer)" value={inputs.hsaEmployer} onChange={set('hsaEmployer')} prefix="$" />
            </div>

            <Label>Employer Match</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Match %" value={inputs.employerMatchPercent} onChange={set('employerMatchPercent')} suffix="%" />
              <Input label="Comp Limit" value={inputs.irsCompLimit} onChange={set('irsCompLimit')} prefix="$" />
            </div>

            {/* Collapsible Payroll */}
            <div className="pt-5">
              <button
                onClick={() => setPayrollOpen(!payrollOpen)}
                className="flex items-center gap-2 text-white/25 hover:text-white/50 text-[11px] font-semibold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <svg className={`w-3 h-3 transition-transform duration-200 ${payrollOpen ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.293 4.293a1 1 0 011.414 0L13.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L10.586 10 6.293 5.707a1 1 0 010-1.414z" />
                </svg>
                Payroll Deductions
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${payrollOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
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

          {/* ── Results ── */}
          {r && (
            <div className="lg:col-span-3 space-y-5">
              {/* Ring Charts */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8">
                <div className="flex justify-around items-start">
                  <RingChart
                    value={r.grossSavingsRate}
                    label="Gross Rate"
                    tooltip="Total savings as a percentage of gross income (before taxes). Best for comparing across different tax situations."
                    gradient="ring-green"
                  />
                  <RingChart
                    value={r.netSavingsRate}
                    label="Net Rate"
                    tooltip="Total savings as a percentage of after-tax income (gross minus taxes). Reflects what you're saving out of money you actually control."
                    gradient="ring-cyan"
                  />
                </div>
                {/* Total savings callout */}
                <div className="mt-6 pt-5 border-t border-white/[0.04] text-center">
                  <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Total Saved</span>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">{fmt(r.totalSavings)}</div>
                  <span className="text-white/20 text-xs mt-1 inline-flex items-center">per year <Tip text="Retirement savings plus non-retirement savings. This is the numerator for both savings rates." /></span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sm:p-6 space-y-1">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30 pb-3">Breakdown</h3>

                <Row label="Gross Income" value={fmt(r.grossIncome)} bold tip="Total compensation before any taxes or deductions: salary + bonus + RSUs." />

                <ExpandableRow
                  label="Total Taxes" value={`−${fmt(r.totalTaxes)}`} red
                  open={taxOpen} onToggle={() => setTaxOpen(!taxOpen)}
                >
                  <Row label="Federal" value={fmt(r.federalTax)} sub />
                  <Row label="California" value={fmt(r.stateTax)} sub />
                  <Row label="Social Security" value={fmt(r.socialSecurity)} sub />
                  <Row label="Medicare" value={fmt(r.medicare)} sub />
                  <Row label="CA SDI" value={fmt(r.caSDI)} sub />
                </ExpandableRow>

                <Row label="After-Tax Income" value={fmt(r.afterTaxIncome)} bold tip="Gross income minus all taxes. This is the denominator for your net savings rate — it represents all the money available to you before voluntary deductions." />

                <div className="border-t border-white/[0.04] my-1" />

                <Row label="Take-Home Pay" value={fmt(r.takeHomePay)} bold tip="What actually hits your bank account: gross income minus taxes, minus all pre-tax deductions (401k, HSA, insurance), minus post-tax deductions (after-tax 401k, legal, life insurance)." />

                <div className="border-t border-white/[0.04] my-1" />

                <ExpandableRow
                  label="Retirement Savings" value={fmt(r.retirementSavings)} green
                  open={retOpen} onToggle={() => setRetOpen(!retOpen)}
                  tip="Sum of all tax-advantaged contributions: 401k, mega backdoor Roth, HSA (employee + employer), and employer match."
                >
                  <Row label="Traditional 401k" value={fmt(inputs.traditional401k)} sub />
                  <Row label="Mega Backdoor Roth" value={fmt(inputs.afterTax401k)} sub />
                  <Row label="HSA (Employee)" value={fmt(inputs.hsaEmployee)} sub />
                  <Row label="HSA (Employer)" value={fmt(inputs.hsaEmployer)} sub />
                  <Row label="Employer Match" value={fmt(r.employerMatch)} sub />
                </ExpandableRow>

                <Row label="Non-Retirement Savings" value={fmt(r.nonRetirementSavings)} green tip="Take-home pay minus annual expenses. This is money left over for brokerage accounts or other non-tax-advantaged savings." />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
