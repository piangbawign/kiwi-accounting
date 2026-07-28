import { GSTType, PayrollEmployee, PayslipRecord, Dividend } from '../types';

export interface NZTaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export const NZ_INCOME_TAX_BRACKETS_2026: NZTaxBracket[] = [
  { min: 0, max: 14000, rate: 0.105 },
  { min: 14000, max: 48000, rate: 0.175 },
  { min: 48000, max: 70000, rate: 0.300 },
  { min: 70000, max: 180000, rate: 0.330 },
  { min: 180000, max: null, rate: 0.390 },
];

export const COMPANY_TAX_RATE_NZ = 0.28; // 28%
export const STANDARD_GST_RATE = 0.15; // 15%
export const ACC_EARNERS_LEVY_RATE = 0.016; // 1.60%
export const ACC_MAX_EARNINGS_CAP = 142283; // Max annual earnings for ACC
export const STUDENT_LOAN_THRESHOLD_ANNUAL = 24128; // $24,128
export const STUDENT_LOAN_RATE = 0.12; // 12% above threshold

export interface IRDTaxCodeInfo {
  code: string;
  name: string;
  description: string;
  taxRateText: string;
  hasStudentLoan: boolean;
}

export const IRD_TAX_CODES: IRDTaxCodeInfo[] = [
  { code: 'M', name: 'Main Job', description: 'Primary income source without Student Loan', taxRateText: 'Progressive rates (10.5% - 39%)', hasStudentLoan: false },
  { code: 'M SL', name: 'Main Job + Student Loan', description: 'Primary income source with Student Loan', taxRateText: 'Progressive rates + 12% SL over threshold', hasStudentLoan: true },
  { code: 'S', name: 'Secondary ($14k - $48k)', description: 'Secondary income if total income $14,001 - $48,000', taxRateText: 'Flat 17.5%', hasStudentLoan: false },
  { code: 'S SL', name: 'Secondary ($14k - $48k) + SL', description: 'Secondary income with Student Loan', taxRateText: 'Flat 17.5% + 12% SL', hasStudentLoan: true },
  { code: 'SH', name: 'Secondary ($48k - $70k)', description: 'Secondary income if total income $48,001 - $70,000', taxRateText: 'Flat 30.0%', hasStudentLoan: false },
  { code: 'SH SL', name: 'Secondary ($48k - $70k) + SL', description: 'Secondary income with Student Loan', taxRateText: 'Flat 30.0% + 12% SL', hasStudentLoan: true },
  { code: 'ST', name: 'Secondary ($70k - $180k)', description: 'Secondary income if total income $70,001 - $180,000', taxRateText: 'Flat 33.0%', hasStudentLoan: false },
  { code: 'ST SL', name: 'Secondary ($70k - $180k) + SL', description: 'Secondary income with Student Loan', taxRateText: 'Flat 33.0% + 12% SL', hasStudentLoan: true },
  { code: 'SA', name: 'Secondary (Over $180k)', description: 'Secondary income if total income exceeds $180,000', taxRateText: 'Flat 39.0%', hasStudentLoan: false },
  { code: 'SA SL', name: 'Secondary (Over $180k) + SL', description: 'Secondary income with Student Loan', taxRateText: 'Flat 39.0% + 12% SL', hasStudentLoan: true },
  { code: 'CAE', name: 'Casual Agricultural Worker', description: 'Agricultural / seasonal work', taxRateText: 'Flat 10.5%', hasStudentLoan: false },
  { code: 'EDW', name: 'Election Day Worker', description: 'Temporary election work', taxRateText: 'Flat 17.5%', hasStudentLoan: false },
  { code: 'ND', name: 'Non-Declaration Rate', description: 'When IR330 form is not provided', taxRateText: 'Flat 45.0%', hasStudentLoan: false },
];

/**
 * Calculate NZ Personal Income Tax on Annual Taxable Income
 */
export function calculateNZIncomeTax(annualIncome: number): { totalTax: number; effectiveRate: number; breakdown: { bracket: string; taxableInBracket: number; taxAmount: number }[] } {
  let remainingIncome = Math.max(0, annualIncome);
  let totalTax = 0;
  const breakdown: { bracket: string; taxableInBracket: number; taxAmount: number }[] = [];

  for (const b of NZ_INCOME_TAX_BRACKETS_2026) {
    if (remainingIncome <= 0) break;
    const bracketSize = b.max ? b.max - b.min : Infinity;
    const taxableAmount = Math.min(remainingIncome, bracketSize);
    const taxForBracket = taxableAmount * b.rate;

    totalTax += taxForBracket;
    breakdown.push({
      bracket: b.max ? `$${b.min.toLocaleString()} - $${b.max.toLocaleString()} (${(b.rate * 100).toFixed(1)}%)` : `Over $${b.min.toLocaleString()} (${(b.rate * 100).toFixed(1)}%)`,
      taxableInBracket: taxableAmount,
      taxAmount: taxForBracket,
    });

    remainingIncome -= taxableAmount;
  }

  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  return { totalTax, effectiveRate, breakdown };
}

/**
 * Calculate GST portion from an amount
 */
export function calculateGST(amount: number, gstType: GSTType, isInclusive: boolean = true): { gstAmount: number; exclusiveAmount: number; totalAmount: number } {
  if (gstType !== 'STANDARD_15') {
    return { gstAmount: 0, exclusiveAmount: amount, totalAmount: amount };
  }

  if (isInclusive) {
    // NZ GST Inclusive formula: Total * 3 / 23
    const gstAmount = (amount * 3) / 23;
    const exclusiveAmount = amount - gstAmount;
    return { gstAmount: Math.round(gstAmount * 100) / 100, exclusiveAmount: Math.round(exclusiveAmount * 100) / 100, totalAmount: amount };
  } else {
    // Exclusive: Add 15%
    const gstAmount = amount * STANDARD_GST_RATE;
    const totalAmount = amount + gstAmount;
    return { gstAmount: Math.round(gstAmount * 100) / 100, exclusiveAmount: amount, totalAmount: Math.round(totalAmount * 100) / 100 };
  }
}

/**
 * Compute NZ PAYE Payroll calculation for employee
 */
export function calculateNZPayroll(emp: PayrollEmployee, payDate: string): PayslipRecord {
  const grossPay = emp.grossWage;
  
  // Frequency multiplier & Student Loan threshold per period
  let periodsPerYear = 52;
  let slThresholdPeriod = STUDENT_LOAN_THRESHOLD_ANNUAL / 52;
  if (emp.payFrequency === 'FORTNIGHTLY') {
    periodsPerYear = 26;
    slThresholdPeriod = STUDENT_LOAN_THRESHOLD_ANNUAL / 26;
  } else if (emp.payFrequency === 'MONTHLY') {
    periodsPerYear = 12;
    slThresholdPeriod = STUDENT_LOAN_THRESHOLD_ANNUAL / 12;
  }

  const annualizedGross = grossPay * periodsPerYear;

  // 1. Calculate Annual Income Tax based on tax code
  let annualPAYE = 0;
  const isMainJob = emp.taxCode.startsWith('M');
  const isSecondaryS = emp.taxCode.startsWith('S') && !emp.taxCode.startsWith('SH') && !emp.taxCode.startsWith('ST') && !emp.taxCode.startsWith('SA');
  const isSecondarySH = emp.taxCode.startsWith('SH');
  const isSecondaryST = emp.taxCode.startsWith('ST');
  const isSecondarySA = emp.taxCode.startsWith('SA');

  if (isMainJob) {
    annualPAYE = calculateNZIncomeTax(annualizedGross).totalTax;
  } else if (isSecondaryS) {
    annualPAYE = annualizedGross * 0.175;
  } else if (isSecondarySH) {
    annualPAYE = annualizedGross * 0.30;
  } else if (isSecondaryST) {
    annualPAYE = annualizedGross * 0.33;
  } else if (isSecondarySA) {
    annualPAYE = annualizedGross * 0.39;
  } else if (emp.taxCode === 'ND') {
    annualPAYE = annualizedGross * 0.45;
  } else {
    annualPAYE = calculateNZIncomeTax(annualizedGross).totalTax;
  }

  const basePayeTax = annualPAYE / periodsPerYear;

  // 2. Student Loan Repayment Calculation (12% above threshold + voluntary extra)
  const isStudentLoanActive = emp.hasStudentLoan || emp.taxCode.includes('SL');
  let studentLoanDeduction = 0;
  if (isStudentLoanActive) {
    const amountAboveThreshold = Math.max(0, grossPay - slThresholdPeriod);
    studentLoanDeduction = amountAboveThreshold * STUDENT_LOAN_RATE;
  }

  if (emp.voluntaryStudentLoanDeduction && emp.voluntaryStudentLoanDeduction > 0) {
    studentLoanDeduction += emp.voluntaryStudentLoanDeduction;
  }

  // Combined PAYE & Student Loan total for PAYE line
  const payeTax = basePayeTax + studentLoanDeduction;

  // 3. ACC Earners Levy (Standard 1.60% or custom Employee ACC Rate) & Employer ACC Work Levy (default 0.72%)
  const cappedAnnualEarnings = Math.min(annualizedGross, ACC_MAX_EARNINGS_CAP);
  const employeeAccRate = emp.employeeAccLevyRate !== undefined ? emp.employeeAccLevyRate : (ACC_EARNERS_LEVY_RATE * 100);
  const accLevy = (cappedAnnualEarnings * (employeeAccRate / 100)) / periodsPerYear;
  const employerAccRate = emp.employerAccLevyRate !== undefined ? emp.employerAccLevyRate : 0.72;
  const employerAccLevy = (grossPay * employerAccRate) / 100;

  // 4. KiwiSaver & ESCT (Employer Superannuation Contribution Tax)
  const kiwiSaverEmployee = grossPay * (emp.kiwiSaverEmployeeRate / 100);
  const kiwiSaverEmployer = grossPay * (emp.kiwiSaverEmployerRate / 100);

  // ESCT Tier Rate based on Annual Gross
  let esctRate = 0.175;
  if (annualizedGross <= 16800) esctRate = 0.105;
  else if (annualizedGross <= 57600) esctRate = 0.175;
  else if (annualizedGross <= 84000) esctRate = 0.30;
  else if (annualizedGross <= 216000) esctRate = 0.33;
  else esctRate = 0.39;

  const esctTax = kiwiSaverEmployer * esctRate;

  // 5. Child Support & Court Order Attachment Deductions (mandated via IRD)
  const childSupportDeduction = emp.childSupportDeduction || 0;
  const courtAttachmentDeduction = emp.courtAttachmentDeduction || 0;

  // 6. Employer Contributions & Total Cost of Employment
  const totalEmployerContributions = kiwiSaverEmployer + employerAccLevy + esctTax;
  const totalEmployerCost = grossPay + totalEmployerContributions;

  // 7. Total IRD Deduction Payable = Base PAYE + Student Loan + ACC Levy + ESCT + Child Support + Attachments
  const totalIrdPayable = basePayeTax + studentLoanDeduction + accLevy + esctTax + childSupportDeduction + courtAttachmentDeduction;

  // 8. Net Pay to Employee Bank Account
  const netPay = grossPay - basePayeTax - studentLoanDeduction - accLevy - kiwiSaverEmployee - childSupportDeduction - courtAttachmentDeduction;

  const effectiveTaxCode = isStudentLoanActive && !emp.taxCode.includes('SL') ? `${emp.taxCode} SL` : emp.taxCode;

  return {
    id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeEmail: emp.email,
    payDate,
    payPeriodStart: payDate,
    payPeriodEnd: payDate,
    grossPay: Math.round(grossPay * 100) / 100,
    basePayeTax: Math.round(basePayeTax * 100) / 100,
    studentLoanDeduction: Math.round(studentLoanDeduction * 100) / 100,
    payeTax: Math.round(payeTax * 100) / 100,
    accLevy: Math.round(accLevy * 100) / 100,
    employerAccLevy: Math.round(employerAccLevy * 100) / 100,
    kiwiSaverEmployee: Math.round(kiwiSaverEmployee * 100) / 100,
    kiwiSaverEmployer: Math.round(kiwiSaverEmployer * 100) / 100,
    esctTax: Math.round(esctTax * 100) / 100,
    childSupportDeduction: Math.round(childSupportDeduction * 100) / 100,
    courtAttachmentDeduction: Math.round(courtAttachmentDeduction * 100) / 100,
    totalEmployerContributions: Math.round(totalEmployerContributions * 100) / 100,
    totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
    totalIrdPayable: Math.round(totalIrdPayable * 100) / 100,
    netPay: Math.round(Math.max(0, netPay) * 100) / 100,
    taxCode: effectiveTaxCode,
  };
}

/**
 * Compute NZ Dividend Imputation Credit & RWT
 * Company Tax Rate = 28%, Dividend RWT = 33%
 */
export function calculateNZDividend(netDividend: number): {
  netDividend: number;
  imputationCredits: number;
  grossDividend: number;
  rwtDeducted: number;
  cashReceived: number;
} {
  // Imputation ratio for fully imputed NZ dividend: 28 / 72
  const imputationCredits = netDividend * (28 / 72);
  const grossDividend = netDividend + imputationCredits;
  // Total Tax required at 33%
  const totalTaxAt33 = grossDividend * 0.33;
  // RWT to deduct = Total Tax 33% - Imputation Credits
  const rwtDeducted = Math.max(0, totalTaxAt33 - imputationCredits);
  const cashReceived = netDividend - rwtDeducted;

  return {
    netDividend: Math.round(netDividend * 100) / 100,
    imputationCredits: Math.round(imputationCredits * 100) / 100,
    grossDividend: Math.round(grossDividend * 100) / 100,
    rwtDeducted: Math.round(rwtDeducted * 100) / 100,
    cashReceived: Math.round(cashReceived * 100) / 100,
  };
}

/**
 * Provisional Tax Estimator (NZ IRD Standard Option)
 */
export function calculateProvisionalTax(priorYearRIT: number, growthRatePct: number = 5): {
  standardProvisionalTax: number;
  installmentAmount: number;
  installments: { name: string; dueDate: string; amount: number }[];
} {
  const standardProvisionalTax = priorYearRIT * (1 + growthRatePct / 100);
  const installmentAmount = Math.round((standardProvisionalTax / 3) * 100) / 100;

  const currentYear = new Date().getFullYear();

  return {
    standardProvisionalTax: Math.round(standardProvisionalTax * 100) / 100,
    installmentAmount,
    installments: [
      { name: 'First Installment (1/3)', dueDate: `${currentYear}-08-28`, amount: installmentAmount },
      { name: 'Second Installment (2/3)', dueDate: `${currentYear + 1}-01-15`, amount: installmentAmount },
      { name: 'Third Installment (3/3)', dueDate: `${currentYear + 1}-05-07`, amount: Math.round((standardProvisionalTax - installmentAmount * 2) * 100) / 100 },
    ],
  };
}
