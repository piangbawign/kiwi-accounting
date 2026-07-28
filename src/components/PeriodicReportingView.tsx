import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Edit3,
  Sparkles,
  Check,
  Building,
} from 'lucide-react';
import { AppState, PeriodicReportConfig, Transaction } from '../types';

interface PeriodicReportingViewProps {
  appState: AppState;
  onSavePeriodicReport?: (config: PeriodicReportConfig) => void;
}

export const PeriodicReportingView: React.FC<PeriodicReportingViewProps> = ({
  appState,
  onSavePeriodicReport,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'JULY_2026' | 'Q1_FY26' | 'YTD_FY26'>('JULY_2026');
  const [comparisonMode, setComparisonMode] = useState<'PRIOR_PERIOD' | 'BUDGET' | 'NONE'>('PRIOR_PERIOD');
  const [execNotes, setExecNotes] = useState(
    'Strong operating cash flow maintained during July 2026. Revenue exceeded forecast by 14.2% due to expansion in enterprise cloud consulting contracts. GST and PAYE liabilities remain fully provisioned.'
  );

  // Derive Financials from appState.transactions
  const calculatePeriodFinancials = () => {
    let income = 0;
    let expense = 0;

    appState.transactions.forEach((t) => {
      if (t.type === 'INCOME') income += t.amount;
      if (t.type === 'EXPENSE') expense += t.amount;
    });

    // Fallbacks if transaction list is minimal
    if (income === 0) income = 48500;
    if (expense === 0) expense = 24100;

    const netProfit = income - expense;
    const grossMarginPct = ((income - expense * 0.4) / income) * 100;
    const netMarginPct = (netProfit / income) * 100;

    // Prior period mock comparison
    const priorIncome = income * 0.88;
    const priorExpense = expense * 0.92;
    const priorNetProfit = priorIncome - priorExpense;

    return {
      income,
      expense,
      netProfit,
      grossMarginPct,
      netMarginPct,
      priorIncome,
      priorExpense,
      priorNetProfit,
      revenueGrowthPct: ((income - priorIncome) / priorIncome) * 100,
      profitGrowthPct: ((netProfit - priorNetProfit) / priorNetProfit) * 100,
    };
  };

  const fin = calculatePeriodFinancials();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-sky-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-bold">
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span>NZ Financial Accounting & Director Reporting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Periodic Management Reporting Packs</h1>
          <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
            Generate polished Monthly Management Packs, Board Financial Summaries, and Comparative Profit & Loss Reports for company directors, investors, and banks.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Export Pack (PDF)
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-slate-600">Reporting Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
          >
            <option value="JULY_2026">July 2026 (Monthly Pack)</option>
            <option value="Q1_FY26">Q1 FY26 (Quarter Ended 30 June 2026)</option>
            <option value="YTD_FY26">FY2026 Year-To-Date (Apr 2026 - Mar 2027)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-slate-600">Compare With:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setComparisonMode('PRIOR_PERIOD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'PRIOR_PERIOD' ? 'bg-white shadow-xs text-sky-900' : 'text-slate-600'
              }`}
            >
              Prior Period
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('BUDGET')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'BUDGET' ? 'bg-white shadow-xs text-sky-900' : 'text-slate-600'
              }`}
            >
              Budget Target
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('NONE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'NONE' ? 'bg-white shadow-xs text-sky-900' : 'text-slate-600'
              }`}
            >
              Actuals Only
            </button>
          </div>
        </div>
      </div>

      {/* Printable Management Pack Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-8 text-slate-900 print:shadow-none print:border-none print:p-0">
        {/* Pack Cover Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div>
            <span className="text-xs font-black uppercase text-sky-700 tracking-widest block">
              MANAGEMENT FINANCIAL PACK
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {selectedPeriod === 'JULY_2026'
                ? 'July 2026 Financial Performance'
                : selectedPeriod === 'Q1_FY26'
                ? 'Q1 FY26 Board Report'
                : 'FY2026 Year-to-Date Financial Statement'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Prepared for Board of Directors & Management</p>
          </div>

          <div className="text-right text-xs">
            <p className="font-extrabold text-slate-900">{appState.companySettings.legalName || 'Kiwi Enterprise Ltd'}</p>
            <p className="text-slate-500">GST #: {appState.companySettings.gstNumber}</p>
            <p className="font-mono text-slate-400 mt-1">Date: 26 July 2026</p>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" /> Executive Director Commentary
            </h3>
            <span className="text-[10px] text-slate-400">Click below to edit commentary notes</span>
          </div>
          <textarea
            value={execNotes}
            onChange={(e) => setExecNotes(e.target.value)}
            rows={3}
            className="w-full text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-600 leading-relaxed font-sans"
          />
        </div>

        {/* High Level KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900 text-white p-4 rounded-2xl">
            <span className="text-slate-400 text-[11px]">Total Revenue</span>
            <div className="text-2xl font-black font-mono mt-1">${fin.income.toLocaleString()} NZD</div>
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] mt-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +{fin.revenueGrowthPct.toFixed(1)}% vs Prior Period
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl">
            <span className="text-slate-400 text-[11px]">Operating Expenses</span>
            <div className="text-2xl font-black font-mono mt-1">${fin.expense.toLocaleString()} NZD</div>
            <span className="text-[11px] text-slate-400">Cost-to-income ratio: {((fin.expense / fin.income) * 100).toFixed(1)}%</span>
          </div>

          <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800">
            <span className="text-emerald-300 text-[11px]">Net Operating Profit</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">${fin.netProfit.toLocaleString()} NZD</div>
            <div className="flex items-center gap-1 text-emerald-300 text-[11px] mt-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Net Profit Margin: {fin.netMarginPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Detailed Profit & Loss Statement Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Profit & Loss Performance Statement
          </h3>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Financial Account Line</th>
                  <th className="py-3 px-4 text-right">Actual ({selectedPeriod})</th>
                  {comparisonMode !== 'NONE' && (
                    <th className="py-3 px-4 text-right">
                      {comparisonMode === 'PRIOR_PERIOD' ? 'Prior Period' : 'Budget Target'}
                    </th>
                  )}
                  {comparisonMode !== 'NONE' && <th className="py-3 px-4 text-right">Variance ($)</th>}
                  {comparisonMode !== 'NONE' && <th className="py-3 px-4 text-right">Variance (%)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {/* Revenue */}
                <tr className="bg-sky-50/50 font-extrabold text-sky-950">
                  <td className="py-2.5 px-4">REVENUE / TRADING INCOME</td>
                  <td className="py-2.5 px-4 text-right font-mono">${fin.income.toLocaleString()}</td>
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono">${fin.priorIncome.toLocaleString()}</td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700">
                      +${(fin.income - fin.priorIncome).toLocaleString()}
                    </td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                      +{fin.revenueGrowthPct.toFixed(1)}%
                    </td>
                  )}
                </tr>

                {/* Operating Expenses */}
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-600">Personnel & Staff Salaries</td>
                  <td className="py-2.5 px-4 text-right font-mono">${(fin.expense * 0.5).toLocaleString()}</td>
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono">${(fin.priorExpense * 0.5).toLocaleString()}</td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">
                      +${(fin.expense * 0.5 - fin.priorExpense * 0.5).toLocaleString()}
                    </td>
                  )}
                  {comparisonMode !== 'NONE' && <td className="py-2.5 px-4 text-right font-bold">+8.7%</td>}
                </tr>

                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-600">Software, Cloud & IT Infrastructure</td>
                  <td className="py-2.5 px-4 text-right font-mono">${(fin.expense * 0.3).toLocaleString()}</td>
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono">${(fin.priorExpense * 0.3).toLocaleString()}</td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">
                      +${(fin.expense * 0.3 - fin.priorExpense * 0.3).toLocaleString()}
                    </td>
                  )}
                  {comparisonMode !== 'NONE' && <td className="py-2.5 px-4 text-right font-bold">+8.7%</td>}
                </tr>

                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-600">Rent, Utilities & Office Expenses</td>
                  <td className="py-2.5 px-4 text-right font-mono">${(fin.expense * 0.2).toLocaleString()}</td>
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono">${(fin.priorExpense * 0.2).toLocaleString()}</td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">
                      +${(fin.expense * 0.2 - fin.priorExpense * 0.2).toLocaleString()}
                    </td>
                  )}
                  {comparisonMode !== 'NONE' && <td className="py-2.5 px-4 text-right font-bold">+8.7%</td>}
                </tr>

                {/* Net Profit Row */}
                <tr className="bg-slate-900 text-white font-black text-sm">
                  <td className="py-3 px-4">NET OPERATING PROFIT BEFORE TAX</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">${fin.netProfit.toLocaleString()}</td>
                  {comparisonMode !== 'NONE' && (
                    <td className="py-3 px-4 text-right font-mono">${fin.priorNetProfit.toLocaleString()}</td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      +${(fin.netProfit - fin.priorNetProfit).toLocaleString()}
                    </td>
                  )}
                  {comparisonMode !== 'NONE' && (
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      +{fin.profitGrowthPct.toFixed(1)}%
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Balance Sheet Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider block">Assets Summary</span>
            <div className="flex justify-between text-slate-600">
              <span>Bank & Cash Equivalents:</span>
              <span className="font-mono font-bold text-slate-900">$84,200 NZD</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Accounts Receivable:</span>
              <span className="font-mono font-bold text-slate-900">$19,500 NZD</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Current Assets:</span>
              <span className="font-mono">$103,700 NZD</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider block">Liabilities & Tax Provision</span>
            <div className="flex justify-between text-slate-600">
              <span>NZ GST Payable (15%):</span>
              <span className="font-mono font-bold text-slate-900">$6,820 NZD</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PAYE & KiwiSaver Liability:</span>
              <span className="font-mono font-bold text-slate-900">$4,150 NZD</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Current Liabilities:</span>
              <span className="font-mono">$10,970 NZD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
