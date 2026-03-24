// 2026 Tax Calculator for Annual Savings Rate

export const TAX_CONSTANTS = {
  federal: {
    standardDeduction: 16_100,
    brackets: [
      { rate: 0.10, from: 0, to: 12_400 },
      { rate: 0.12, from: 12_400, to: 50_400 },
      { rate: 0.22, from: 50_400, to: 105_700 },
      { rate: 0.24, from: 105_700, to: 201_775 },
      { rate: 0.32, from: 201_775, to: 256_225 },
      { rate: 0.35, from: 256_225, to: 640_600 },
      { rate: 0.37, from: 640_600, to: Infinity },
    ],
  },
  california: {
    standardDeduction: 5_706,
    personalExemptionCredit: 153,
    mentalHealthThreshold: 1_000_000,
    mentalHealthRate: 0.01,
    brackets: [
      { rate: 0.01, from: 0, to: 11_079 },
      { rate: 0.02, from: 11_079, to: 26_264 },
      { rate: 0.04, from: 26_264, to: 41_452 },
      { rate: 0.06, from: 41_452, to: 57_542 },
      { rate: 0.08, from: 57_542, to: 72_724 },
      { rate: 0.093, from: 72_724, to: 371_479 },
      { rate: 0.103, from: 371_479, to: 445_771 },
      { rate: 0.113, from: 445_771, to: 742_953 },
      { rate: 0.123, from: 742_953, to: Infinity },
    ],
  },
  fica: {
    socialSecurityRate: 0.062,
    socialSecurityWageCap: 184_500,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: 200_000,
  },
  caSDI: {
    rate: 0.011,
  },
  retirement: {
    employee401k: 24_500,
    afterTax401k: 29_500,
    total415c: 72_000,
    employerCompLimit: 360_000,
  },
};

function applyBrackets(
  taxableIncome: number,
  brackets: { rate: number; from: number; to: number }[],
): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.from) break;
    const amount = Math.min(taxableIncome, bracket.to) - bracket.from;
    tax += Math.max(0, amount) * bracket.rate;
  }
  return tax;
}

export function calculateFederalTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  return Math.round(applyBrackets(taxableIncome, TAX_CONSTANTS.federal.brackets) * 100) / 100;
}

export function calculateCATax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const { personalExemptionCredit, mentalHealthThreshold, mentalHealthRate } =
    TAX_CONSTANTS.california;

  let tax = applyBrackets(taxableIncome, TAX_CONSTANTS.california.brackets);

  if (taxableIncome > mentalHealthThreshold) {
    tax += (taxableIncome - mentalHealthThreshold) * mentalHealthRate;
  }

  tax = Math.max(0, tax - personalExemptionCredit);

  return Math.round(tax * 100) / 100;
}

export function calculateFICA(grossWages: number): {
  socialSecurity: number;
  medicare: number;
  total: number;
} {
  const { socialSecurityRate, socialSecurityWageCap, medicareRate, additionalMedicareRate, additionalMedicareThreshold } =
    TAX_CONSTANTS.fica;

  const socialSecurity =
    Math.round(Math.min(grossWages, socialSecurityWageCap) * socialSecurityRate * 100) / 100;

  let medicare = grossWages * medicareRate;
  if (grossWages > additionalMedicareThreshold) {
    medicare += (grossWages - additionalMedicareThreshold) * additionalMedicareRate;
  }
  medicare = Math.round(medicare * 100) / 100;

  return {
    socialSecurity,
    medicare,
    total: Math.round((socialSecurity + medicare) * 100) / 100,
  };
}

export function calculateCASDI(grossWages: number): number {
  return Math.round(grossWages * TAX_CONSTANTS.caSDI.rate * 100) / 100;
}

export interface SavingsInputs {
  annualSalary: number;
  annualBonus: number;
  annualRSU: number;
  traditional401k?: number;
  afterTax401k?: number;
  hsaEmployee?: number;
  hsaEmployer?: number;
  employerMatchPercent?: number;
  irsCompLimit?: number;
  dentalPerPaycheck?: number;
  medicalPerPaycheck?: number;
  visionPerPaycheck?: number;
  legalPerPaycheck?: number;
  lifeInsPerPaycheck?: number;
  payPeriodsPerYear?: number;
  annualExpenses: number;
}

export interface SavingsResults {
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  caSDI: number;
  totalTaxes: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  afterTaxIncome: number;
  takeHomePay: number;
  employerMatch: number;
  totalSavings: number;
  grossSavingsRate: number;
  netSavingsRate: number;
  nonRetirementSavings: number;
  retirementSavings: number;
}

export function calculateSavings(inputs: SavingsInputs): SavingsResults {
  const {
    annualSalary,
    annualBonus,
    annualRSU,
    traditional401k = 24_500,
    afterTax401k = 29_500,
    hsaEmployee = 3_900,
    hsaEmployer = 500,
    employerMatchPercent = 5,
    irsCompLimit = 360_000,
    dentalPerPaycheck = 23.05,
    medicalPerPaycheck = 24.87,
    visionPerPaycheck = 1.37,
    legalPerPaycheck = 11.88,
    lifeInsPerPaycheck = 2.70,
    payPeriodsPerYear = 24,
    annualExpenses,
  } = inputs;

  const grossIncome = annualSalary + annualBonus + annualRSU;

  // Employer match: based on salary + bonus (not RSU), capped at IRS comp limit
  const eligibleComp = annualSalary + annualBonus;
  const uncappedEmployerMatch =
    Math.round(Math.min(eligibleComp, irsCompLimit) * (employerMatchPercent / 100) * 100) / 100;

  // Enforce IRS 415(c) limit on total employer plan contributions
  const total415c = TAX_CONSTANTS.retirement.total415c;
  const employerMatch = Math.min(uncappedEmployerMatch, Math.max(0, total415c - traditional401k - afterTax401k));

  // Section 125 cafeteria plan deductions (pre-tax, exempt from income tax AND FICA)
  const annualDental = dentalPerPaycheck * payPeriodsPerYear;
  const annualMedical = medicalPerPaycheck * payPeriodsPerYear;
  const annualVision = visionPerPaycheck * payPeriodsPerYear;
  const cafeteriaPlanDeductions = annualDental + annualMedical + annualVision;

  // Pre-tax deductions (reduce income tax)
  const preTaxDeductions = traditional401k + hsaEmployee + cafeteriaPlanDeductions;

  // Post-tax deductions
  const annualLegal = legalPerPaycheck * payPeriodsPerYear;
  const annualLifeIns = lifeInsPerPaycheck * payPeriodsPerYear;
  const postTaxDeductions = afterTax401k + annualLegal + annualLifeIns;

  // Federal tax: gross income minus pre-tax deductions minus standard deduction
  const federalTaxableIncome =
    grossIncome - preTaxDeductions - TAX_CONSTANTS.federal.standardDeduction;
  const federalTax = calculateFederalTax(federalTaxableIncome);

  // California tax: CA does not recognize HSA as pre-tax, and employer HSA is taxable imputed income
  const caPreTaxDeductions = traditional401k + cafeteriaPlanDeductions;
  const caTaxableIncome =
    grossIncome - caPreTaxDeductions + hsaEmployer - TAX_CONSTANTS.california.standardDeduction;
  const stateTax = calculateCATax(caTaxableIncome);

  // FICA wages: gross income minus HSA employee minus cafeteria plan deductions
  // (401k contributions ARE subject to FICA; HSA and Section 125 are NOT)
  const ficaWages = grossIncome - hsaEmployee - cafeteriaPlanDeductions;
  const fica = calculateFICA(ficaWages);
  const { socialSecurity, medicare } = fica;

  // CA SDI: same wage base as FICA
  const caSDI = calculateCASDI(ficaWages);

  const totalTaxes =
    Math.round((federalTax + stateTax + socialSecurity + medicare + caSDI) * 100) / 100;

  const takeHomePay =
    Math.round((grossIncome - totalTaxes - preTaxDeductions - postTaxDeductions) * 100) / 100;

  const nonRetirementSavings = Math.round((takeHomePay - annualExpenses) * 100) / 100;
  const retirementSavings =
    Math.round((traditional401k + afterTax401k + hsaEmployee + hsaEmployer + employerMatch) * 100) / 100;
  const totalSavings = Math.round((nonRetirementSavings + retirementSavings) * 100) / 100;

  const afterTaxIncome = grossIncome - totalTaxes;
  const grossSavingsRate = Math.round((totalSavings / grossIncome) * 10000) / 10000;
  const netSavingsRate = Math.round((totalSavings / afterTaxIncome) * 10000) / 10000;

  return {
    grossIncome,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    caSDI,
    totalTaxes,
    preTaxDeductions,
    postTaxDeductions,
    afterTaxIncome,
    takeHomePay,
    employerMatch,
    totalSavings,
    grossSavingsRate,
    netSavingsRate,
    nonRetirementSavings,
    retirementSavings,
  };
}
