import React, { useState } from 'react';
import {
  Calculator,
  FileCheck2,
  HelpCircle,
  Calendar,
  Building,
  User,
  Percent,
  CheckCircle2,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { CompanySettings, Transaction } from '../types';
import {
  calculateNZIncomeTax,
  calculateProvisionalTax,
  IRD_TAX_CODES,
  COMPANY_TAX_RATE_NZ,
} from '../services/nzTaxEngine';

interface IncomeTaxViewProps {
  transactions: Transaction[];
  companySettings: CompanySettings;
}

export const IncomeTaxView: React.FC<IncomeTaxViewProps> = ({
  transactions,
  companySettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PROVISIONAL' | 'IR3_IR4' | 'IR330_CODES'>('PROVISIONAL');

  // Compute Total Income and Expense for tax year
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + (t.amount - t.gstAmount), 0); // Excl GST

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + (t.amount - t.gstAmount), 0); // Excl GST

  const taxableProfit = Math.max(0, totalIncome - totalExpense);

  // Individual Tax Calc
  const personalTax = calculateNZIncomeTax(taxableProfit);

  // Company Tax Calc
  const companyTax = taxableProfit * COMPANY_TAX_RATE_NZ;

  // Provisional Tax Standard Option
  const provisional = calculateProvisionalTax(taxableProfit * 0.28, 5);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">NZ Income Tax & IR Forms Worksheets</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
              FY2026 IRD Tax Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Provisional tax planning, IR3 Individual & IR4 Company tax return previews
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('PROVISIONAL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'PROVISIONAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Provisional Tax
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('IR3_IR4')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'IR3_IR4' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            IR3 / IR4 Returns
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('IR330_CODES')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'IR330_CODES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            IR330 Tax Codes
          </button>
        </div>
      </div>

      {/* Subtab 1: Provisional Tax Estimator */}
      {activeSubTab === 'PROVISIONAL' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                  Provisional Tax Planning (Standard Method +5%)
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  ${provisional.standardProvisionalTax.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Estimated 2026/2027 provisional tax payable in 3 equal installments
                </p>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold">Installment Amount</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  ${provisional.installmentAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {provisional.installments.map((inst, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    Installment {i + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">{inst.dueDate}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{inst.name}</h4>
                <div className="text-xl font-black font-mono text-slate-900 mt-3">${inst.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: IR3 / IR4 Returns Preview */}
      {activeSubTab === 'IR3_IR4' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                {companySettings.entityType === 'NZ_COMPANY' ? 'IR4 Company Tax Return Worksheet' : 'IR3 Individual Income Tax Worksheet'}
              </h3>
              <p className="text-xs text-slate-500">Taxable net profit summary for 31 March financial year end</p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Form Worksheet
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-semibold">
              <span>Gross Taxable Business Income (Excl GST):</span>
              <span className="font-mono font-bold text-slate-900">${totalIncome.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-semibold">
              <span>Allowable Tax Deductible Expenses (Excl GST):</span>
              <span className="font-mono font-bold text-rose-600">-${totalExpense.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl flex justify-between font-bold text-sm text-teal-900 border border-teal-200">
              <span>Net Taxable Income / Profit:</span>
              <span className="font-mono font-black">${taxableProfit.toFixed(2)}</span>
            </div>

            {companySettings.entityType === 'NZ_COMPANY' ? (
              <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold">NZ Company Income Tax (Flat 28%):</span>
                  <p className="text-[11px] text-slate-400">IR4 Company Income Tax Assessment</p>
                </div>
                <span className="font-mono font-black text-emerald-400 text-xl">${companyTax.toFixed(2)} NZD</span>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Individual Personal Income Tax (Progressive Brackets):</span>
                  <span className="font-mono font-black text-emerald-400 text-xl">${personalTax.totalTax.toFixed(2)} NZD</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  {personalTax.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{b.bracket}:</span>
                      <span className="font-mono text-slate-200">${b.taxAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: IR330 Tax Code Declaration Guide */}
      {activeSubTab === 'IR330_CODES' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">IRD Tax Code Reference (IR330 Declaration Guide)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {IRD_TAX_CODES.map((tc) => (
              <div key={tc.code} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-xs px-2.5 py-1 rounded bg-teal-100 text-teal-800">
                    {tc.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">{tc.taxRateText}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2">{tc.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{tc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
