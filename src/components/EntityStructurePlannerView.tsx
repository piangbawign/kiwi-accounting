import React, { useState } from 'react';
import {
  Building2,
  User,
  Users,
  Shield,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { AppState, EntityStructureScenario } from '../types';

interface EntityStructurePlannerViewProps {
  appState: AppState;
}

export const EntityStructurePlannerView: React.FC<EntityStructurePlannerViewProps> = ({ appState }) => {
  const [profitInput, setProfitInput] = useState('180000');
  const [ownerSalaryInput, setOwnerSalaryInput] = useState('100000');

  const profit = parseFloat(profitInput) || 0;
  const salary = parseFloat(ownerSalaryInput) || 0;

  // Sole Trader Marginal Tax Rate Calc (2026/27 NZ Tax Brackets)
  // Up to $14,000 @ 10.5% = $1,470
  // $14,001 to $48,000 @ 17.5% = $5,950
  // $48,001 to $70,000 @ 30.0% = $6,600
  // $70,001 to $180,000 @ 33.0% = $36,300
  // Over $180,000 @ 39.0%
  const calculateNzIndividualTax = (income: number) => {
    let tax = 0;
    if (income <= 14000) return income * 0.105;
    tax += 14000 * 0.105;

    if (income <= 48000) return tax + (income - 14000) * 0.175;
    tax += (48000 - 14000) * 0.175;

    if (income <= 70000) return tax + (income - 48000) * 0.30;
    tax += (70000 - 48000) * 0.30;

    if (income <= 180000) return tax + (income - 70000) * 0.33;
    tax += (180000 - 70000) * 0.33;

    tax += (income - 180000) * 0.39;
    return tax;
  };

  const soleTraderTax = calculateNzIndividualTax(profit);

  // Company Tax (28% flat on company profit after salary deduction)
  const companyRetainedProfit = Math.max(0, profit - salary);
  const companyTax = companyRetainedProfit * 0.28;
  const ownerSalaryTax = calculateNzIndividualTax(salary);
  const totalCompanyAndSalaryTax = companyTax + ownerSalaryTax;

  // Trust Tax (39% Trustee tax rate)
  const trustTax = profit * 0.39;

  // Potential Tax Savings
  const taxSavingsVsSoleTrader = soleTraderTax - totalCompanyAndSalaryTax;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>NZ Entity Tax Structure Comparison & Salary Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Entity Structure & Tax Optimization Modeler</h1>
          <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
            Compare tax outcomes for Sole Trader vs Limited Liability Company vs Look-Through Company (LTC) vs Family Trust. Optimize shareholder salary vs retained earnings at 28%.
          </p>
        </div>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Business Financial Inputs</h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Annual Net Business Profit ($ NZD)</label>
            <input
              type="number"
              value={profitInput}
              onChange={(e) => setProfitInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Owner Shareholder Salary Drawn ($ NZD)</label>
            <input
              type="number"
              value={ownerSalaryInput}
              onChange={(e) => setOwnerSalaryInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-indigo-700"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Deductible expense for company, taxed to individual</span>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 font-medium">
            <span className="font-bold block text-xs">Optimal Tax Mix Result:</span>
            <p className="text-[11px] mt-1">
              By drawing <strong>${salary.toLocaleString()}</strong> as salary and retaining <strong>${companyRetainedProfit.toLocaleString()}</strong> in the company at 28%, you save <strong className="text-emerald-700 font-mono">${Math.max(0, taxSavingsVsSoleTrader).toFixed(0)} NZD</strong> compared to Sole Trader!
            </p>
          </div>
        </div>

        {/* Structure Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sole Trader */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <User className="w-4 h-4 text-slate-600" /> Sole Trader
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Taxed at personal marginal rates (up to 39%)</p>

              <div className="mt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-500">Net Profit:</span>
                  <span>${profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t">
                  <span className="font-sans">Total Tax Due:</span>
                  <span className="text-rose-700">${soleTraderTax.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold text-center block">
              Effective Tax: {profit > 0 ? ((soleTraderTax / profit) * 100).toFixed(1) : 0}%
            </span>
          </div>

          {/* Company */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between border-2 border-indigo-500">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-black text-sm">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Company (Ltd)
                </div>
                <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[9px] rounded">RECOMMENDED</span>
              </div>
              <p className="text-[10px] text-indigo-200 mt-0.5">28% Flat Rate + Shareholder Salary</p>

              <div className="mt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans">Company Tax (28%):</span>
                  <span>${companyTax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans">Salary PAYE Tax:</span>
                  <span>${ownerSalaryTax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-400 pt-2 border-t border-slate-800">
                  <span className="font-sans">Total Combined Tax:</span>
                  <span>${totalCompanyAndSalaryTax.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold text-center block">
              Effective Tax: {profit > 0 ? ((totalCompanyAndSalaryTax / profit) * 100).toFixed(1) : 0}%
            </span>
          </div>

          {/* Family Trust */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Shield className="w-4 h-4 text-slate-600" /> Family Trust
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Flat 39% Trustee Income Tax Rate</p>

              <div className="mt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-500">Trustee Profit:</span>
                  <span>${profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t">
                  <span className="font-sans">Total Tax Due:</span>
                  <span className="text-amber-800">${trustTax.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold text-center block">
              Effective Tax: 39.0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
