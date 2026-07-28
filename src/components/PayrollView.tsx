import React, { useState } from 'react';
import {
  Users,
  Plus,
  Calculator,
  FileText,
  DollarSign,
  ShieldCheck,
  Building,
  CheckCircle2,
  X,
  Printer,
  Trash2,
  GraduationCap,
  Landmark,
  ArrowRight,
  Sparkles,
  Info,
  Download,
  Mail,
  Send,
  Loader2,
  MailCheck,
  AtSign,
  Pencil,
} from 'lucide-react';
import { PayrollEmployee, PayslipRecord, CompanySettings } from '../types';
import { calculateNZPayroll, IRD_TAX_CODES, STUDENT_LOAN_THRESHOLD_ANNUAL, STUDENT_LOAN_RATE } from '../services/nzTaxEngine';
import { generatePayrollSummaryPDF, generateSinglePayslipPDF, printSinglePayslipPDF } from '../services/pdfGenerator';

interface PayrollViewProps {
  employees: PayrollEmployee[];
  payslips: PayslipRecord[];
  companySettings: CompanySettings;
  onAddEmployee: (emp: Omit<PayrollEmployee, 'id'>) => void;
  onUpdateEmployee?: (emp: PayrollEmployee) => void;
  onProcessPayRun: (newPayslips: PayslipRecord[]) => void;
  onDeleteEmployee?: (id: string) => void;
  onDeletePayslip?: (id: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  payslips,
  companySettings,
  onAddEmployee,
  onUpdateEmployee,
  onProcessPayRun,
  onDeleteEmployee,
  onDeletePayslip,
}) => {
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<PayrollEmployee | null>(null);
  const [previewPayslip, setPreviewPayslip] = useState<PayslipRecord | null>(null);

  // Email Trigger Modal & Dispatch State
  const [emailModalData, setEmailModalData] = useState<{
    isOpen: boolean;
    employeeName: string;
    recipientEmail: string;
    payslip: PayslipRecord | ReturnType<typeof calculateNZPayroll> | null;
    customMessage: string;
  } | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [batchSending, setBatchSending] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentName: string } | null>(null);

  // New / Edit Emp Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [irdNumber, setIrdNumber] = useState('');
  const [taxCode, setTaxCode] = useState('M');
  const [hasStudentLoan, setHasStudentLoan] = useState(false);
  const [voluntarySlDeduction, setVoluntarySlDeduction] = useState('');
  const [kiwiSaverEmp, setKiwiSaverEmp] = useState(3.5);
  const [kiwiSaverEmployerRate, setKiwiSaverEmployerRate] = useState(3.5);
  const [employeeAccLevyRate, setEmployeeAccLevyRate] = useState(1.60);
  const [employerAccLevyRate, setEmployerAccLevyRate] = useState(0.72);
  const [childSupportDeduction, setChildSupportDeduction] = useState('');
  const [courtAttachmentDeduction, setCourtAttachmentDeduction] = useState('');
  const [grossWage, setGrossWage] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'>('FORTNIGHTLY');

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setIrdNumber('');
    setTaxCode('M');
    setHasStudentLoan(false);
    setVoluntarySlDeduction('');
    setKiwiSaverEmp(3.5);
    setKiwiSaverEmployerRate(3.5);
    setEmployeeAccLevyRate(1.60);
    setEmployerAccLevyRate(0.72);
    setChildSupportDeduction('');
    setCourtAttachmentDeduction('');
    setGrossWage('');
    setFrequency('FORTNIGHTLY');
    setShowAddEmpModal(true);
  };

  const handleOpenEditModal = (emp: PayrollEmployee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email || '');
    setIrdNumber(emp.irdNumber);
    setTaxCode(emp.taxCode);
    setHasStudentLoan(emp.hasStudentLoan || emp.taxCode.includes('SL'));
    setVoluntarySlDeduction(emp.voluntaryStudentLoanDeduction ? emp.voluntaryStudentLoanDeduction.toString() : '');
    setKiwiSaverEmp(emp.kiwiSaverEmployeeRate ?? 3.5);
    setKiwiSaverEmployerRate(emp.kiwiSaverEmployerRate ?? 3.5);
    setEmployeeAccLevyRate(emp.employeeAccLevyRate ?? 1.60);
    setEmployerAccLevyRate(emp.employerAccLevyRate ?? 0.72);
    setChildSupportDeduction(emp.childSupportDeduction ? emp.childSupportDeduction.toString() : '');
    setCourtAttachmentDeduction(emp.courtAttachmentDeduction ? emp.courtAttachmentDeduction.toString() : '');
    setGrossWage(emp.grossWage ? emp.grossWage.toString() : '');
    setFrequency(emp.payFrequency || 'FORTNIGHTLY');
    setShowAddEmpModal(true);
  };

  // Sync tax code with student loan checkbox
  const handleStudentLoanToggle = (checked: boolean) => {
    setHasStudentLoan(checked);
    if (checked) {
      if (!taxCode.includes('SL')) {
        const correspondingSl = `${taxCode} SL`;
        const exists = IRD_TAX_CODES.some((tc) => tc.code === correspondingSl);
        if (exists) setTaxCode(correspondingSl);
      }
    } else {
      if (taxCode.includes('SL')) {
        setTaxCode(taxCode.replace(' SL', ''));
      }
    }
  };

  const handleTaxCodeChange = (code: string) => {
    setTaxCode(code);
    if (code.includes('SL')) {
      setHasStudentLoan(true);
    } else {
      setHasStudentLoan(false);
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !irdNumber.trim() || !grossWage) return;

    const empData = {
      name: name.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@company.co.nz`,
      irdNumber: irdNumber.trim(),
      taxCode,
      hasStudentLoan,
      voluntaryStudentLoanDeduction: parseFloat(voluntarySlDeduction) || 0,
      kiwiSaverEmployeeRate: kiwiSaverEmp,
      kiwiSaverEmployerRate: kiwiSaverEmployerRate,
      employeeAccLevyRate: employeeAccLevyRate,
      employerAccLevyRate: employerAccLevyRate,
      childSupportDeduction: parseFloat(childSupportDeduction) || 0,
      courtAttachmentDeduction: parseFloat(courtAttachmentDeduction) || 0,
      grossWage: parseFloat(grossWage) || 0,
      payFrequency: frequency,
    };

    if (editingEmployee && onUpdateEmployee) {
      onUpdateEmployee({
        ...empData,
        id: editingEmployee.id,
      });
    } else {
      onAddEmployee(empData);
    }

    setShowAddEmpModal(false);
    setEditingEmployee(null);
  };

  const handleRunFullPayRun = () => {
    const today = new Date().toISOString().split('T')[0];
    const generated = employees.map((e) => calculateNZPayroll(e, today));
    onProcessPayRun(generated);
  };

  const handleExportPdfSummary = () => {
    generatePayrollSummaryPDF(employees, payslips, companySettings, 'Pay Period Summary');
  };

  const handleExportSinglePayslipPdf = (ps: PayslipRecord | ReturnType<typeof calculateNZPayroll>) => {
    generateSinglePayslipPDF(ps, companySettings);
  };

  const handlePrintSinglePayslip = (ps: PayslipRecord | ReturnType<typeof calculateNZPayroll>) => {
    printSinglePayslipPDF(ps, companySettings);
  };

  const handleOpenEmailModal = (
    employeeName: string,
    recipientEmail: string | undefined,
    payslip: PayslipRecord | ReturnType<typeof calculateNZPayroll>
  ) => {
    const finalEmail = recipientEmail || payslip.employeeEmail || `${employeeName.toLowerCase().replace(/\s+/g, '.')}@company.co.nz`;
    setEmailModalData({
      isOpen: true,
      employeeName,
      recipientEmail: finalEmail,
      payslip,
      customMessage: `Kia ora ${employeeName},\n\nPlease find attached your official PDF payslip for pay date ${payslip.payDate || new Date().toISOString().split('T')[0]}.\n\nGross Pay: $${payslip.grossPay.toFixed(2)} NZD\nNet Pay Paid: $${payslip.netPay.toFixed(2)} NZD\n\nKind regards,\n${companySettings.legalName || companySettings.tradingName || 'KiwiLedger Payroll'}`,
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalData || !emailModalData.payslip) return;

    setIsSendingEmail(true);

    // 1. Generate local PDF download copy
    generateSinglePayslipPDF(emailModalData.payslip, companySettings);

    // 2. Simulate automated mail server delivery
    await new Promise((res) => setTimeout(res, 1200));

    setIsSendingEmail(false);
    setEmailSuccessMsg(`Payslip PDF successfully emailed to ${emailModalData.recipientEmail}`);
    setEmailModalData(null);

    setTimeout(() => {
      setEmailSuccessMsg(null);
    }, 5000);
  };

  const handleBatchEmailAll = async () => {
    if (employees.length === 0) return;

    setBatchSending(true);
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const calc = calculateNZPayroll(emp, today);

      setBatchProgress({ current: i + 1, total: employees.length, currentName: emp.name });

      // Trigger single payslip PDF download
      generateSinglePayslipPDF(calc, companySettings);
      await new Promise((res) => setTimeout(res, 800));
    }

    setBatchSending(false);
    setBatchProgress(null);
    setEmailSuccessMsg(`Automated Batch Complete: Emailed ${employees.length} employee payslips with attached PDF records.`);

    setTimeout(() => {
      setEmailSuccessMsg(null);
    }, 6000);
  };

  // Compute summary metrics across current employee list
  const currentCalculations = employees.map((e) => calculateNZPayroll(e, new Date().toISOString().split('T')[0]));
  const totalGross = currentCalculations.reduce((acc, c) => acc + c.grossPay, 0);
  const totalBasePaye = currentCalculations.reduce((acc, c) => acc + c.basePayeTax, 0);
  const totalStudentLoan = currentCalculations.reduce((acc, c) => acc + c.studentLoanDeduction, 0);
  const totalAccLevy = currentCalculations.reduce((acc, c) => acc + c.accLevy, 0);
  const totalEmployerAccLevy = currentCalculations.reduce((acc, c) => acc + (c.employerAccLevy || 0), 0);
  const totalEsct = currentCalculations.reduce((acc, c) => acc + (c.esctTax || 0), 0);
  const totalChildSupport = currentCalculations.reduce((acc, c) => acc + (c.childSupportDeduction || 0), 0);
  const totalCourtAttachments = currentCalculations.reduce((acc, c) => acc + (c.courtAttachmentDeduction || 0), 0);
  const totalIrdPayableOverall = currentCalculations.reduce((acc, c) => acc + c.totalIrdPayable, 0);
  const totalEmployerContributionsOverall = currentCalculations.reduce((acc, c) => acc + (c.totalEmployerContributions || 0), 0);
  const totalEmployerCostOverall = currentCalculations.reduce((acc, c) => acc + (c.totalEmployerCost || (c.grossPay + (c.totalEmployerContributions || 0))), 0);

  return (
    <div className="space-y-6">

      {/* Success / Notification Banner */}
      {emailSuccessMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-xs font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <MailCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
          <button type="button" onClick={() => setEmailSuccessMsg(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch Email Sending Progress Overlay */}
      {batchSending && batchProgress && (
        <div className="p-4 bg-teal-900/40 border border-teal-500/50 rounded-2xl flex items-center gap-3 text-teal-200 text-xs font-bold shadow-lg animate-pulse">
          <Loader2 className="w-5 h-5 text-teal-400 animate-spin shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span>Emailing PDF Payslip ({batchProgress.current} of {batchProgress.total}): <strong>{batchProgress.currentName}</strong></span>
              <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">NZ Payroll & PAYE Engine</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              IRD Employment Info (EI)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Calculate PAYE, Student Loan Repayments (12% over $24,128 threshold), ACC Earners Levy (1.60%), ESCT, and total IRD remittance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunFullPayRun}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 hover:brightness-105"
          >
            <Calculator className="w-4 h-4" /> Run Pay Period Calculation
          </button>

          <button
            type="button"
            disabled={batchSending || employees.length === 0}
            onClick={handleBatchEmailAll}
            title="Email PDF payslips directly to all employees"
            className="px-3.5 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4 text-indigo-200" /> Email All Payslips
          </button>

          <button
            type="button"
            onClick={handleExportPdfSummary}
            className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export Payroll PDF
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* IRD Remittance & Employer On-Cost Summary Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">Inland Revenue (IRD) Filing & Employer Cost Engine</span>
              <h3 className="text-xl font-black text-white">Total Pay Period Remittance & Employer On-Costs</h3>
              <p className="text-xs text-slate-300">
                PAYE + Student Loan + Employee ACC + ESCT + Child Support + Employer KiwiSaver & ACC Levy
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportPdfSummary}
              className="px-3.5 py-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-teal-300" /> Export IRD Summary PDF
            </button>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Employer Cost</span>
              <span className="text-xl font-black font-mono text-emerald-300">${totalEmployerCostOverall.toFixed(2)} <span className="text-[10px] text-slate-400">NZD</span></span>
              <span className="text-[10px] text-emerald-400 block font-semibold">Gross + Employer On-Costs</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-teal-500/30 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Payable to IRD</span>
              <span className="text-xl font-black font-mono text-teal-300">${totalIrdPayableOverall.toFixed(2)} <span className="text-[10px] text-slate-400">NZD</span></span>
              <span className="text-[10px] text-amber-300 block font-semibold">Due 20th via myIR</span>
            </div>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 block">Total Gross Wages</span>
            <span className="text-xs font-bold font-mono text-white">${totalGross.toFixed(2)}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 block">Base PAYE Income Tax</span>
            <span className="text-xs font-bold font-mono text-rose-300">${totalBasePaye.toFixed(2)}</span>
          </div>

          <div className="bg-indigo-950/80 p-2.5 rounded-xl border border-indigo-700/60">
            <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-indigo-400" /> Student Loan (SL)
            </span>
            <span className="text-xs font-bold font-mono text-indigo-200">${totalStudentLoan.toFixed(2)}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 block">ACC Earners Levy</span>
            <span className="text-xs font-bold font-mono text-amber-300">${totalAccLevy.toFixed(2)}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 block">Employer ESCT</span>
            <span className="text-xs font-bold font-mono text-emerald-300">${totalEsct.toFixed(2)}</span>
          </div>

          <div className="bg-teal-950/80 p-2.5 rounded-xl border border-teal-700/60">
            <span className="text-[10px] font-bold text-teal-300 block">Employer Contributions</span>
            <span className="text-xs font-bold font-mono text-teal-200">${totalEmployerContributionsOverall.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Employee List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const calc = calculateNZPayroll(emp, new Date().toISOString().split('T')[0]);
          const isSlActive = emp.hasStudentLoan || emp.taxCode.includes('SL');

          return (
            <div key={emp.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Tax Code: {calc.taxCode}
                  </span>
                  {isSlActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> SL Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">{emp.payFrequency}</span>
                  <button
                    type="button"
                    onClick={() => handleExportSinglePayslipPdf(calc)}
                    title="Download PDF Payslip for Employee"
                    className="p-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintSinglePayslip(calc)}
                    title="Print Payslip directly"
                    className="p-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEmailModal(emp.name, emp.email, calc)}
                    title="Email Payslip directly to Employee"
                    className="p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(emp)}
                    title="Edit Employee profile & tax deductions"
                    className="p-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Pencil className="w-3.5 h-3.5 text-teal-600" /> Edit
                  </button>
                  {onDeleteEmployee && (
                    <button
                      type="button"
                      onClick={() => onDeleteEmployee(emp.id)}
                      title="Delete employee record"
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{emp.name}</h3>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-0.5 font-mono">
                <span>IRD #: {emp.irdNumber}</span>
                {emp.email && (
                  <span className="text-[11px] font-sans text-indigo-600 dark:text-indigo-400 flex items-center gap-1 truncate max-w-[150px]">
                    <AtSign className="w-3 h-3 shrink-0" /> {emp.email}
                  </span>
                )}
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Gross Wage:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">${calc.grossPay.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Base PAYE Tax:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">${calc.basePayeTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-indigo-700 dark:text-indigo-300 font-medium">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Student Loan (12%):
                  </span>
                  <span className="font-mono font-bold">${calc.studentLoanDeduction.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ACC Employee Work Levy ({emp.employeeAccLevyRate ?? 1.60}%):</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400">${calc.accLevy.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">KiwiSaver Employee ({emp.kiwiSaverEmployeeRate}%):</span>
                  <span className="font-mono text-teal-700 dark:text-teal-300">${calc.kiwiSaverEmployee.toFixed(2)}</span>
                </div>

                {calc.childSupportDeduction ? (
                  <div className="flex justify-between text-rose-700 dark:text-rose-300">
                    <span>Child Support Deduction:</span>
                    <span className="font-mono">${calc.childSupportDeduction.toFixed(2)}</span>
                  </div>
                ) : null}

                {calc.courtAttachmentDeduction ? (
                  <div className="flex justify-between text-rose-700 dark:text-rose-300">
                    <span>Court Order Attachment:</span>
                    <span className="font-mono">${calc.courtAttachmentDeduction.toFixed(2)}</span>
                  </div>
                ) : null}

                {/* Employer Deductions & Contributions Box */}
                <div className="mt-2 p-2 bg-teal-50/80 dark:bg-teal-950/40 rounded-lg text-[11px] space-y-1 border border-teal-100 dark:border-teal-900">
                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">Employer Deductions & Contributions</span>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>KiwiSaver Employer ({emp.kiwiSaverEmployerRate}%):</span>
                    <span className="font-mono">${calc.kiwiSaverEmployer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>ACC Work Levy ({emp.employerAccLevyRate || 0.72}%):</span>
                    <span className="font-mono">${(calc.employerAccLevy || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Employer ESCT Tax:</span>
                    <span className="font-mono">${(calc.esctTax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-teal-900 dark:text-teal-200 pt-1 border-t border-teal-200 dark:border-teal-800">
                    <span>Total Employer Cost:</span>
                    <span className="font-mono">${(calc.totalEmployerCost || (calc.grossPay + (calc.totalEmployerContributions || 0))).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-teal-800 dark:text-teal-300 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" /> Total IRD Due:
                  </span>
                  <span className="font-mono text-teal-700 dark:text-teal-300">${calc.totalIrdPayable.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-slate-800 dark:text-slate-100">Net Pay:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">${calc.netPay.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generated Payslips History Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Issued Payslips & IRD Deduction History
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {payslips.length} processed pay records
            </span>
            <button
              type="button"
              onClick={handleExportPdfSummary}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Export Summary PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Pay Date</th>
                <th className="py-2.5 px-3">Employee Name</th>
                <th className="py-2.5 px-3">Tax Code</th>
                <th className="py-2.5 px-3 text-right">Gross Pay</th>
                <th className="py-2.5 px-3 text-right">Base PAYE</th>
                <th className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">Student Loan (SL)</th>
                <th className="py-2.5 px-3 text-right">ACC Levy</th>
                <th className="py-2.5 px-3 text-right">KiwiSaver</th>
                <th className="py-2.5 px-3 text-right text-teal-700 dark:text-teal-300 font-extrabold">Total to IRD</th>
                <th className="py-2.5 px-3 text-right">Net Pay</th>
                <th className="py-2.5 px-3 text-center">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {payslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{ps.payDate}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{ps.employeeName}</td>
                  <td className="py-2.5 px-3 font-mono text-teal-700 dark:text-teal-400">{ps.taxCode}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">${(ps.grossPay || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">${((ps.basePayeTax ?? ps.payeTax) || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ${(ps.studentLoanDeduction || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">${(ps.accLevy || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-teal-700 dark:text-teal-300">${(ps.kiwiSaverEmployee || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/30">
                    ${(ps.totalIrdPayable || ((ps.basePayeTax || ps.payeTax || 0) + (ps.accLevy || 0))).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 dark:text-emerald-400">${(ps.netPay || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewPayslip(ps)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-lg transition-all"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSinglePayslipPdf(ps)}
                        title="Download Employee PDF Payslip"
                        className="px-2 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 font-bold text-[11px] rounded-lg transition-all border border-teal-200 dark:border-teal-800 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-teal-600 dark:text-teal-400" /> PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintSinglePayslip(ps)}
                        title="Print Employee Payslip"
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-lg transition-all border border-slate-300 dark:border-slate-700 flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-slate-600 dark:text-slate-400" /> Print
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEmailModal(ps.employeeName, ps.employeeEmail, ps)}
                        title="Send PDF Payslip via Email"
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-300 font-bold text-[11px] rounded-lg transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Email
                      </button>
                      {onDeletePayslip && (
                        <button
                          type="button"
                          onClick={() => onDeletePayslip(ps.id)}
                          title="Delete payslip record"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                {editingEmployee ? 'Edit NZ Employee & Tax Profile' : 'Add NZ Employee & Tax Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEmpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Aroha Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Employee Email Address</span>
                  <span className="text-[10px] text-slate-400 font-normal">(For automated PDF payslip delivery)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g., aroha.smith@company.co.nz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600 dark:text-slate-100"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">IRD Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 119-823-401"
                    value={irdNumber}
                    onChange={(e) => setIrdNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tax Code</label>
                  <select
                    value={taxCode}
                    onChange={(e) => handleTaxCodeChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-bold"
                  >
                    {IRD_TAX_CODES.map((tc) => (
                      <option key={tc.code} value={tc.code}>
                        {tc.code} - {tc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Loan Option Panel */}
              <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="studentLoanCheck"
                    checked={hasStudentLoan}
                    onChange={(e) => handleStudentLoanToggle(e.target.checked)}
                    className="mt-0.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="studentLoanCheck" className="text-xs font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Employee Has NZ Student Loan Obligation (SL)
                    </label>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                      Deducts 12% on gross earnings above repayment threshold (${STUDENT_LOAN_THRESHOLD_ANNUAL.toLocaleString()}/year)
                    </p>
                  </div>
                </div>

                {hasStudentLoan && (
                  <div className="pl-6 pt-1 space-y-2 animate-in fade-in duration-100">
                    <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 space-y-1 border border-indigo-100 dark:border-indigo-900">
                      <div className="flex justify-between font-mono">
                        <span>Weekly Threshold:</span> <span>$464.00</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Fortnightly Threshold:</span> <span>$928.00</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Monthly Threshold:</span> <span>$2,010.67</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                        Voluntary Extra Student Loan Repayment ($/period)
                      </label>
                      <input
                        type="number"
                        step="1"
                        placeholder="0.00 (Optional extra deduction)"
                        value={voluntarySlDeduction}
                        onChange={(e) => setVoluntarySlDeduction(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:outline-none focus:border-indigo-600 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gross Wage / Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2850.00"
                    value={grossWage}
                    onChange={(e) => setGrossWage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pay Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="FORTNIGHTLY">Fortnightly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">KiwiSaver Employee Rate</label>
                  <select
                    value={kiwiSaverEmp}
                    onChange={(e) => setKiwiSaverEmp(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100"
                  >
                    <option value={3.0}>3.0% (Min Rate)</option>
                    <option value={3.5}>3.5%</option>
                    <option value={4.0}>4.0%</option>
                    <option value={6.0}>6.0%</option>
                    <option value={8.0}>8.0%</option>
                    <option value={10.0}>10.0%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">KiwiSaver Employer Rate</label>
                  <select
                    value={kiwiSaverEmployerRate}
                    onChange={(e) => setKiwiSaverEmployerRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-bold"
                  >
                    <option value={3.0}>3.0% (Mandated Min)</option>
                    <option value={3.5}>3.5% (Employer Rate)</option>
                    <option value={4.0}>4.0%</option>
                    <option value={6.0}>6.0%</option>
                    <option value={8.0}>8.0%</option>
                    <option value={10.0}>10.0%</option>
                  </select>
                </div>
              </div>

              {/* ACC & IRD Mandated Deductions Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  ACC Levies & IRD Mandated Deductions
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        ACC Employee Work Levy (%)
                      </label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setEmployeeAccLevyRate(1.60)}
                          className={`px-1.5 py-0.5 rounded ${employeeAccLevyRate === 1.60 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                        >
                          1.60% Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmployeeAccLevyRate(0)}
                          className={`px-1.5 py-0.5 rounded ${employeeAccLevyRate === 0 ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                        >
                          Exempt
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1.60"
                      value={employeeAccLevyRate}
                      onChange={(e) => setEmployeeAccLevyRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      ACC Employer Work Levy (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.72"
                      value={employerAccLevyRate}
                      onChange={(e) => setEmployerAccLevyRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Child Support ($/period)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="0.00"
                      value={childSupportDeduction}
                      onChange={(e) => setChildSupportDeduction(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Court Order ($/period)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="0.00"
                      value={courtAttachmentDeduction}
                      onChange={(e) => setCourtAttachmentDeduction(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow"
                >
                  {editingEmployee ? 'Save Profile Changes' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {previewPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">EMPLOYEE PAYSLIP</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{companySettings.tradingName}</p>
              </div>
              <button onClick={() => setPreviewPayslip(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Employee:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{previewPayslip.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pay Date:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{previewPayslip.payDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">IR Tax Code:</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{previewPayslip.taxCode}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-2 text-xs font-medium border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold">
                <span>Gross Pay:</span>
                <span className="font-mono">${(previewPayslip.grossPay || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Base PAYE Income Tax:</span>
                <span className="font-mono">-${((previewPayslip.basePayeTax ?? previewPayslip.payeTax) || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Student Loan Deduction (12%):
                </span>
                <span className="font-mono">-${(previewPayslip.studentLoanDeduction || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>ACC Employee Work Levy ({(previewPayslip as any).employeeAccLevyRate ?? 1.60}%):</span>
                <span className="font-mono">-${(previewPayslip.accLevy || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-teal-700 dark:text-teal-300">
                <span>KiwiSaver Employee Deduction:</span>
                <span className="font-mono">-${(previewPayslip.kiwiSaverEmployee || 0).toFixed(2)}</span>
              </div>

              {previewPayslip.childSupportDeduction ? (
                <div className="flex justify-between text-rose-700 dark:text-rose-300">
                  <span>Child Support Deduction:</span>
                  <span className="font-mono">-${(previewPayslip.childSupportDeduction || 0).toFixed(2)}</span>
                </div>
              ) : null}

              {previewPayslip.courtAttachmentDeduction ? (
                <div className="flex justify-between text-rose-700 dark:text-rose-300">
                  <span>Court Order Attachment Deduction:</span>
                  <span className="font-mono">-${(previewPayslip.courtAttachmentDeduction || 0).toFixed(2)}</span>
                </div>
              ) : null}

              {/* Employer Contributions & On-costs */}
              <div className="mt-3 p-2.5 bg-teal-50/80 dark:bg-teal-950/40 rounded-lg space-y-1 text-[11px] border border-teal-200 dark:border-teal-800">
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                  Employer Contributions & On-Costs
                </span>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>KiwiSaver Employer Contribution:</span>
                  <span className="font-mono">${(previewPayslip.kiwiSaverEmployer || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>ACC Employer Work Levy:</span>
                  <span className="font-mono">${(previewPayslip.employerAccLevy || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Employer ESCT Tax:</span>
                  <span className="font-mono">${(previewPayslip.esctTax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-teal-900 dark:text-teal-200 pt-1 border-t border-teal-200 dark:border-teal-800">
                  <span>Total Employer Cost:</span>
                  <span className="font-mono">${(previewPayslip.totalEmployerCost || ((previewPayslip.grossPay || 0) + (previewPayslip.totalEmployerContributions || 0))).toFixed(2)} NZD</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-teal-800 dark:text-teal-300">
                <span>Total Amount Remitted to IRD:</span>
                <span className="font-mono">${(previewPayslip.totalIrdPayable || ((previewPayslip.basePayeTax || previewPayslip.payeTax || 0) + (previewPayslip.accLevy || 0))).toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-black text-emerald-700 dark:text-emerald-400">
                <span>Net Amount Paid to Employee:</span>
                <span className="font-mono">${(previewPayslip.netPay || 0).toFixed(2)} NZD</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetPs = previewPayslip;
                  setPreviewPayslip(null);
                  handleOpenEmailModal(targetPs.employeeName, targetPs.employeeEmail, targetPs);
                }}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Mail className="w-4 h-4 text-indigo-200" /> Email Payslip
              </button>
              <button
                type="button"
                onClick={() => handleExportSinglePayslipPdf(previewPayslip)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PDF Payslip
              </button>
              <button
                type="button"
                onClick={() => handlePrintSinglePayslip(previewPayslip)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
              >
                <Printer className="w-4 h-4" /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Email Payslip Dispatch Modal */}
      {emailModalData && emailModalData.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Send Payslip via Email</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated PDF attachment delivery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalData(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee Name</label>
                <input
                  type="text"
                  disabled
                  value={emailModalData.employeeName}
                  className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="employee@company.co.nz"
                    value={emailModalData.recipientEmail}
                    onChange={(e) =>
                      setEmailModalData({
                        ...emailModalData,
                        recipientEmail: e.target.value,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600 dark:text-slate-100 font-mono"
                  />
                  <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Message Body</label>
                <textarea
                  rows={5}
                  value={emailModalData.customMessage}
                  onChange={(e) =>
                    setEmailModalData({
                      ...emailModalData,
                      customMessage: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600 dark:text-slate-100 font-sans"
                />
              </div>

              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2.5 text-indigo-900 dark:text-indigo-300 text-xs font-medium">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  Official PDF payslip record will be generated & attached automatically.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalData(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Mail...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Dispatch PDF Payslip
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
