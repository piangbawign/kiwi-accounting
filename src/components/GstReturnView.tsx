import React, { useState } from 'react';
import {
  Percent,
  Download,
  Printer,
  Calendar,
  CalendarDays,
  ListFilter,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { Transaction, CompanySettings } from '../types';
import { generateGstReturnPDF, printGstReturnPDF } from '../services/pdfGenerator';
import { IrdTooltip, IRD_DICTIONARY } from './IrdTooltip';

interface GstReturnViewProps {
  transactions: Transaction[];
  companySettings: CompanySettings;
}

interface PeriodPreset {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  group: '2_MONTHLY' | 'MONTHLY' | '6_MONTHLY';
}

const PERIOD_PRESETS: PeriodPreset[] = [
  // 2-Monthly Periods
  { key: '2M_JUN_JUL_2026', label: '2-Monthly: Jun 2026 – Jul 2026', startDate: '2026-06-01', endDate: '2026-07-31', group: '2_MONTHLY' },
  { key: '2M_APR_MAY_2026', label: '2-Monthly: Apr 2026 – May 2026', startDate: '2026-04-01', endDate: '2026-05-31', group: '2_MONTHLY' },
  { key: '2M_FEB_MAR_2026', label: '2-Monthly: Feb 2026 – Mar 2026', startDate: '2026-02-01', endDate: '2026-03-31', group: '2_MONTHLY' },
  { key: '2M_DEC_JAN_2026', label: '2-Monthly: Dec 2025 – Jan 2026', startDate: '2025-12-01', endDate: '2026-01-31', group: '2_MONTHLY' },
  { key: '2M_OCT_NOV_2025', label: '2-Monthly: Oct 2025 – Nov 2025', startDate: '2025-10-01', endDate: '2025-11-30', group: '2_MONTHLY' },

  // Monthly Periods
  { key: '1M_JUL_2026', label: 'Monthly: July 2026', startDate: '2026-07-01', endDate: '2026-07-31', group: 'MONTHLY' },
  { key: '1M_JUN_2026', label: 'Monthly: June 2026', startDate: '2026-06-01', endDate: '2026-06-30', group: 'MONTHLY' },
  { key: '1M_MAY_2026', label: 'Monthly: May 2026', startDate: '2026-05-01', endDate: '2026-05-31', group: 'MONTHLY' },
  { key: '1M_APR_2026', label: 'Monthly: April 2026', startDate: '2026-04-01', endDate: '2026-04-30', group: 'MONTHLY' },

  // 6-Monthly Periods
  { key: '6M_APR_SEP_2026', label: '6-Monthly: Apr 2026 – Sep 2026', startDate: '2026-04-01', endDate: '2026-09-30', group: '6_MONTHLY' },
  { key: '6M_OCT_MAR_2026', label: '6-Monthly: Oct 2025 – Mar 2026', startDate: '2025-10-01', endDate: '2026-03-31', group: '6_MONTHLY' },
];

export const GstReturnView: React.FC<GstReturnViewProps> = ({
  transactions,
  companySettings,
}) => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('2M_JUN_JUL_2026');
  const [startDate, setStartDate] = useState<string>('2026-06-01');
  const [endDate, setEndDate] = useState<string>('2026-07-31');
  const [showTxBreakdown, setShowTxBreakdown] = useState<boolean>(false);

  // Get display label
  const activePreset = PERIOD_PRESETS.find((p) => p.key === selectedPresetKey);
  const periodLabel = activePreset
    ? activePreset.label
    : `Custom Range (${startDate} to ${endDate})`;

  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    if (key === 'CUSTOM') return;
    const preset = PERIOD_PRESETS.find((p) => p.key === key);
    if (preset) {
      setStartDate(preset.startDate);
      setEndDate(preset.endDate);
    }
  };

  const handleCustomStartDateChange = (val: string) => {
    setStartDate(val);
    setSelectedPresetKey('CUSTOM');
  };

  const handleCustomEndDateChange = (val: string) => {
    setEndDate(val);
    setSelectedPresetKey('CUSTOM');
  };

  // Filter transactions strictly by date range
  const periodTx = transactions.filter((t) => {
    if (!t.date) return false;
    return t.date >= startDate && t.date <= endDate;
  });

  const incomeTx = periodTx.filter((t) => t.type === 'INCOME');
  const expenseTx = periodTx.filter((t) => t.type === 'EXPENSE');

  // Box 5: Total sales & income (incl GST)
  const box5TotalSales = incomeTx.reduce((acc, t) => acc + t.amount, 0);

  // Box 6: Zero-rated sales
  const box6ZeroRatedSales = incomeTx
    .filter((t) => t.gstType === 'ZERO_RATED')
    .reduce((acc, t) => acc + t.amount, 0);

  // Box 7: GST on sales (Box 5 minus Box 6) * 3 / 23
  const box7GstOnSales = ((box5TotalSales - box6ZeroRatedSales) * 3) / 23;

  // Box 8: Total purchases & expenses (incl GST)
  const box8TotalPurchases = expenseTx.reduce((acc, t) => acc + t.amount, 0);

  // Box 9: GST on purchases (Box 8 * 3 / 23)
  const box9GstOnPurchases = (box8TotalPurchases * 3) / 23;

  // Box 10: Difference (Box 7 - Box 9)
  const box10Difference = box7GstOnSales - box9GstOnPurchases;
  const isPayable = box10Difference >= 0;

  const gstReturnPdfData = {
    totalSales: box5TotalSales,
    zeroRatedSales: box6ZeroRatedSales,
    gstOnSales: box7GstOnSales,
    totalPurchases: box8TotalPurchases,
    gstOnPurchases: box9GstOnPurchases,
    netGstPayable: Math.abs(box10Difference),
    isPayable,
    periodLabel,
    startDate,
    endDate,
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              IRD GST Return (GST101 Worksheet)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
              Official IRD Box Structure
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-calculated GST return for Inland Revenue NZ filing ({companySettings.gstFilingFrequency.replace('_', ' ')})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => generateGstReturnPDF(gstReturnPdfData, companySettings)}
            className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" /> Download Official GST101 PDF
          </button>

          <button
            type="button"
            onClick={() => printGstReturnPDF(gstReturnPdfData, companySettings)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" /> Print PDF Worksheet
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Web View
          </button>
        </div>
      </div>

      {/* Period Selector & Calendar Date Range Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Registered Business Name</span>
            <p className="text-base font-extrabold text-teal-300 mt-0.5">{companySettings.legalName}</p>
            <p className="text-xs text-slate-400">Trading as: {companySettings.tradingName}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">IRD GST Number</span>
            <p className="text-base font-mono font-black text-white mt-0.5">{companySettings.gstNumber || companySettings.irdNumber}</p>
            <p className="text-xs text-slate-400">Basis: {companySettings.gstBasis} Accounting</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Filing Frequency</span>
            <p className="text-base font-bold text-amber-300 mt-0.5">{companySettings.gstFilingFrequency.replace('_', ' ')}</p>
            <p className="text-xs text-slate-400">Due: 28th of month following period</p>
          </div>
        </div>

        {/* Calendar & Return Period Controls */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Select GST Return Period & Calendar Date Range</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* Return Period Preset Dropdown */}
            <div className="lg:col-span-5">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Preset Return Periods ({companySettings.gstFilingFrequency.replace('_', ' ')})
              </label>
              <select
                value={selectedPresetKey}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-teal-500"
              >
                <optgroup label="2-Monthly Filing Periods">
                  {PERIOD_PRESETS.filter((p) => p.group === '2_MONTHLY').map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Monthly Filing Periods">
                  {PERIOD_PRESETS.filter((p) => p.group === 'MONTHLY').map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="6-Monthly Filing Periods">
                  {PERIOD_PRESETS.filter((p) => p.group === '6_MONTHLY').map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>

                <option value="CUSTOM">Custom Calendar Date Range...</option>
              </select>
            </div>

            {/* Calendar Start Date Picker */}
            <div className="lg:col-span-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-teal-400" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleCustomStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Calendar End Date Picker */}
            <div className="lg:col-span-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-teal-400" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleCustomEndDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Transaction Count Badge */}
            <div className="lg:col-span-1 flex lg:justify-end">
              <div className="bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-center w-full">
                <span className="text-[10px] text-slate-400 block font-semibold">Matched</span>
                <span className="text-xs font-black font-mono text-teal-300">{periodTx.length} Tx</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Warning banner if 0 transactions in selected period */}
      {periodTx.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-4 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">No recorded transactions found between {startDate} and {endDate}.</p>
            <p className="text-[11px] opacity-90">
              The calculations below reflect zero sales and purchases for this range. Select a different return period or custom date range in the calendar above.
            </p>
          </div>
        </div>
      )}

      {/* GST101 Official Boxes */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Percent className="w-5 h-5 text-teal-600" /> GST101 Return Calculation Worksheet
          </h3>
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            Period: {startDate} to {endDate}
          </span>
        </div>

        {/* Section 1: Sales & Income */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Section A: Sales and Income (Output GST)
          </h4>

          <div className="space-y-3 text-xs">
            
            {/* Box 5 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded mr-2">Box 5</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Total Sales & Income for the period (including GST)</span>
                <IrdTooltip
                  term={IRD_DICTIONARY.BOX_5.title}
                  explanation={IRD_DICTIONARY.BOX_5.text}
                />
              </div>
              <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">${box5TotalSales.toFixed(2)}</span>
            </div>

            {/* Box 6 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded mr-2">Box 6</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Zero-rated sales included in Box 5</span>
                <IrdTooltip
                  term={IRD_DICTIONARY.BOX_6.title}
                  explanation={IRD_DICTIONARY.BOX_6.text}
                />
              </div>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${box6ZeroRatedSales.toFixed(2)}</span>
            </div>

            {/* Box 7 */}
            <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800/80 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-mono font-bold text-teal-900 dark:text-teal-200 bg-teal-200 dark:bg-teal-900 px-2 py-0.5 rounded mr-2">Box 7</span>
                <span className="font-bold text-teal-900 dark:text-teal-200">GST on sales and income (Box 5 minus Box 6) × 3/23</span>
                <IrdTooltip
                  term={IRD_DICTIONARY.BOX_7.title}
                  explanation={IRD_DICTIONARY.BOX_7.text}
                />
              </div>
              <span className="font-mono font-black text-base text-teal-900 dark:text-teal-200">${box7GstOnSales.toFixed(2)}</span>
            </div>

          </div>
        </div>

        {/* Section 2: Purchases & Expenses */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Section B: Purchases and Expenses (Input GST)
          </h4>

          <div className="space-y-3 text-xs">
            
            {/* Box 8 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded mr-2">Box 8</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Total Purchases & Expenses (including GST)</span>
                <IrdTooltip
                  term={IRD_DICTIONARY.BOX_8.title}
                  explanation={IRD_DICTIONARY.BOX_8.text}
                />
              </div>
              <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">${box8TotalPurchases.toFixed(2)}</span>
            </div>

            {/* Box 9 */}
            <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800/80 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-mono font-bold text-teal-900 dark:text-teal-200 bg-teal-200 dark:bg-teal-900 px-2 py-0.5 rounded mr-2">Box 9</span>
                <span className="font-bold text-teal-900 dark:text-teal-200">GST on purchases and expenses (Box 8 × 3/23)</span>
                <IrdTooltip
                  term={IRD_DICTIONARY.BOX_9.title}
                  explanation={IRD_DICTIONARY.BOX_9.text}
                />
              </div>
              <span className="font-mono font-black text-base text-teal-900 dark:text-teal-200">${box9GstOnPurchases.toFixed(2)}</span>
            </div>

          </div>
        </div>

        {/* Section 3: Net GST Result (Box 10) */}
        <div className="p-6 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs bg-teal-400 text-slate-950 px-2.5 py-1 rounded-md flex items-center">
                  BOX 10
                  <IrdTooltip
                    term={IRD_DICTIONARY.BOX_10.title}
                    explanation={IRD_DICTIONARY.BOX_10.text}
                  />
                </span>
                <h4 className="text-lg font-extrabold text-white">Net GST Result for Period</h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">Difference between Box 7 (Sales GST) and Box 9 (Purchases GST)</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                {isPayable ? 'GST PAYABLE TO IRD' : 'GST REFUND DUE FROM IRD'}
              </span>
              <span
                className={`text-3xl font-black font-mono tracking-tight ${
                  isPayable ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                ${Math.abs(box10Difference).toFixed(2)} NZD
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Inspector Table for Included Transactions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowTxBreakdown(!showTxBreakdown)}
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1.5"
          >
            {showTxBreakdown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTxBreakdown ? 'Hide Included Transactions Audit Breakdown' : `Inspect ${periodTx.length} Included Transactions for Period`}
          </button>

          {showTxBreakdown && (
            <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-150">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Transaction Ledger Audit ({startDate} to {endDate})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {periodTx.length} records matching date criteria
                </span>
              </div>

              {periodTx.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No transaction records found in date range {startDate} to {endDate}.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">GST Rate</th>
                        <th className="p-2.5 text-right">Gross Total</th>
                        <th className="p-2.5 text-right">GST Portion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {periodTx.map((tx) => {
                        const gstAmount = tx.gstType === 'EXEMPT' || tx.gstType === 'ZERO_RATED'
                          ? 0
                          : (tx.amount * 3) / 23;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{tx.date}</td>
                            <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  tx.type === 'INCOME'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">{tx.category}</td>
                            <td className="p-2.5 text-slate-500">{tx.gstType || 'STANDARD_15'}</td>
                            <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">${tx.amount.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-bold text-teal-600 dark:text-teal-400">${gstAmount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

