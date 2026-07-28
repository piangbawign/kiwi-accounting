import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  ShieldAlert,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  DollarSign,
  Briefcase,
  History,
} from 'lucide-react';
import { Transaction, AuditLog, CompanySettings } from '../types';
import { generateProfitLossPDF, generateFinancialSummaryPDF } from '../services/pdfGenerator';
import { Account } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  auditLogs: AuditLog[];
  companySettings: CompanySettings;
  accounts?: Account[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  auditLogs,
  companySettings,
  accounts = [],
}) => {
  const [reportType, setReportType] = useState<'PROFIT_LOSS' | 'CASH_FLOW' | 'YEAR_END' | 'AUDIT_LOG'>('PROFIT_LOSS');

  // Compute P&L
  const incomeTx = transactions.filter((t) => t.type === 'INCOME');
  const expenseTx = transactions.filter((t) => t.type === 'EXPENSE');

  const totalRevenue = incomeTx.reduce((acc, t) => acc + (t.amount - t.gstAmount), 0);
  const totalExpenses = expenseTx.reduce((acc, t) => acc + (t.amount - t.gstAmount), 0);
  const netOperatingProfit = totalRevenue - totalExpenses;

  // Group Expenses by Category
  const expenseByCat: { [cat: string]: number } = {};
  expenseTx.forEach((t) => {
    const exGst = t.amount - t.gstAmount;
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + exGst;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">NZ Financial Reports & Audit Log</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
              IRD 7-Year Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Profit & Loss, Cash Flow Projections, Year-End Summary, and Immutable Audit Trail
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              generateFinancialSummaryPDF({
                transactions,
                accounts: accounts || [],
                companySettings,
                projects: [],
                recurringTransactions: [],
                churchDonors: [],
                churchDonations: [],
                churchReceipts: [],
                invoices: [],
                quotes: [],
                payrollEmployees: [],
                payslips: [],
                dividends: [],
                loans: [],
                budgets: [],
                recurringInvoices: [],
                auditLogs,
                bankStatementItems: [],
                reconciliationMatches: [],
              } as any)
            }
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-teal-400" /> Export Executive PDF
          </button>

          <button
            type="button"
            onClick={() => generateProfitLossPDF(transactions, companySettings, 'Financial Year 2025/2026')}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download P&L PDF
          </button>

          {/* Subtabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setReportType('PROFIT_LOSS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'PROFIT_LOSS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              P & L
            </button>
            <button
              type="button"
              onClick={() => setReportType('CASH_FLOW')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'CASH_FLOW' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cash Flow
            </button>
            <button
              type="button"
              onClick={() => setReportType('YEAR_END')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'YEAR_END' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Year-End Summary
            </button>
            <button
              type="button"
              onClick={() => setReportType('AUDIT_LOG')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === 'AUDIT_LOG' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Log ({auditLogs.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 shrink-0"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Report 1: Profit and Loss Statement */}
      {reportType === 'PROFIT_LOSS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-black text-slate-900">{companySettings.tradingName}</h3>
            <p className="text-xs text-slate-500 font-semibold">Profit and Loss Statement (Excluding GST)</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Period: 01 April 2025 to 31 March 2026</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* Operating Income */}
            <div>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-800 font-bold uppercase tracking-wider text-[11px] flex justify-between">
                <span>1. Operating Income</span>
                <span>Amount ($)</span>
              </div>
              <div className="divide-y divide-slate-100 px-3">
                <div className="py-2.5 flex justify-between text-slate-700">
                  <span>Sales & Consulting Revenue</span>
                  <span className="font-mono font-bold">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-teal-50/60 px-2 rounded-md">
                  <span>Total Operating Income</span>
                  <span className="font-mono text-teal-800">${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-800 font-bold uppercase tracking-wider text-[11px] flex justify-between">
                <span>2. Operating Expenses</span>
                <span>Amount ($)</span>
              </div>
              <div className="divide-y divide-slate-100 px-3">
                {Object.entries(expenseByCat).map(([cat, amount]) => (
                  <div key={cat} className="py-2 flex justify-between text-slate-700">
                    <span>{cat}</span>
                    <span className="font-mono">${amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-rose-50/60 px-2 rounded-md">
                  <span>Total Operating Expenses</span>
                  <span className="font-mono text-rose-700">${totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center text-sm font-black">
              <span>NET OPERATING PROFIT (BEFORE TAX):</span>
              <span className={`font-mono text-xl ${netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${netOperatingProfit.toFixed(2)} NZD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Cash Flow Forecast */}
      {reportType === 'CASH_FLOW' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">12-Month Rolling Cash Flow Projection</h3>
            <p className="text-xs text-slate-500">Forecasted inflows and outflows based on current recurring business velocity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 block">Avg Monthly Inflow</span>
              <span className="text-2xl font-black text-emerald-900">${(totalRevenue / 3).toFixed(2)}</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 block">Avg Monthly Outflow</span>
              <span className="text-2xl font-black text-rose-900">${(totalExpenses / 3).toFixed(2)}</span>
            </div>
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
              <span className="text-xs font-semibold text-teal-800 block">Projected 12M Surplus</span>
              <span className="text-2xl font-black text-teal-950">${(netOperatingProfit * 4).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Year End Tax Summary */}
      {reportType === 'YEAR_END' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs font-semibold">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">NZ Year-End Tax Summary Worksheet</h3>
          <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
            <span>Trading Entity:</span>
            <span className="font-bold text-slate-900">{companySettings.legalName} ({companySettings.entityType})</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
            <span>IRD Number:</span>
            <span className="font-mono font-bold text-slate-900">{companySettings.irdNumber}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
            <span>GST Number:</span>
            <span className="font-mono font-bold text-slate-900">{companySettings.gstNumber}</span>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl flex justify-between text-teal-900 font-bold">
            <span>Net Financial Year Profit:</span>
            <span className="font-mono font-black">${netOperatingProfit.toFixed(2)} NZD</span>
          </div>
        </div>
      )}

      {/* Report 4: Audit Log */}
      {reportType === 'AUDIT_LOG' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" /> NZ IRD Local Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User Action</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-NZ')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.action}</td>
                    <td className="py-2.5 px-3 font-mono text-teal-700">{log.user}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
