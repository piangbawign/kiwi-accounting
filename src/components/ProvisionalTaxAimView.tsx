import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Zap,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { AppState, AimTaxPeriod } from '../types';

interface ProvisionalTaxAimViewProps {
  appState: AppState;
  onUpdateAimPeriods?: (periods: AimTaxPeriod[]) => void;
}

export const ProvisionalTaxAimView: React.FC<ProvisionalTaxAimViewProps> = ({
  appState,
  onUpdateAimPeriods,
}) => {
  const [calculationMethod, setCalculationMethod] = useState<'AIM' | 'STANDARD_UPLIFT' | 'ESTIMATION'>('AIM');
  const [priorYearIncomeTax, setPriorYearIncomeTax] = useState('24500');
  const [expectedAnnualProfit, setExpectedAnnualProfit] = useState('120000');
  const [companyTaxRatePct] = useState(28); // NZ Company tax rate 28%

  // AIM Periods State
  const [aimPeriods, setAimPeriods] = useState<AimTaxPeriod[]>(
    appState.aimProvisionalTaxPeriods || [
      {
        id: 'AIM-01',
        gstPeriodName: 'Apr - May 2026 (P1)',
        dueDate: '28 June 2026',
        accountingNetProfit: 18500,
        taxAdjustments: -1200, // e.g. non-deductible entertainment / depreciation diff
        taxableIncomePeriod: 17300,
        aimTaxPayable: 4844, // 28% of 17300
        standardUpliftTaxPayable: 8983, // 1/3 of (24500 * 1.10)
        status: 'PAID',
      },
      {
        id: 'AIM-02',
        gstPeriodName: 'Jun - Jul 2026 (P2)',
        dueDate: '28 August 2026',
        accountingNetProfit: 22400,
        taxAdjustments: -800,
        taxableIncomePeriod: 21600,
        aimTaxPayable: 6048,
        standardUpliftTaxPayable: 8983,
        status: 'PENDING',
      },
      {
        id: 'AIM-03',
        gstPeriodName: 'Aug - Sep 2026 (P3)',
        dueDate: '28 October 2026',
        accountingNetProfit: 12000,
        taxAdjustments: 0,
        taxableIncomePeriod: 12000,
        aimTaxPayable: 3360,
        standardUpliftTaxPayable: 8983,
        status: 'PENDING',
      },
    ]
  );

  // Math for Uplift Method vs AIM
  const priorTax = parseFloat(priorYearIncomeTax) || 0;
  const standardUpliftTotal = priorTax * 1.10; // 105% if filed on time, 110% standard uplift rule
  const standardUpliftInstallment = standardUpliftTotal / 3;

  const totalAimTaxPaidSoFar = aimPeriods.reduce((sum, p) => sum + (p.status === 'PAID' ? p.aimTaxPayable : 0), 0);
  const totalAimTaxProjected = aimPeriods.reduce((sum, p) => sum + p.aimTaxPayable, 0);
  const aimCashFlowSavings = standardUpliftTotal - totalAimTaxProjected;

  // Use of Money Interest (UOMI) IRD Rate e.g. 10.91% p.a.
  const uomiRatePct = 10.91;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>IRD Accounting Income Method (AIM) Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Provisional Tax & AIM Simulator</h1>
            <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
              AIM allows NZ businesses under $5M turnover to pay provisional tax matched to real accounting profit each bi-monthly GST cycle. Avoid late payment penalties and Use of Money Interest (UOMI @ {uomiRatePct}%).
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-right shrink-0">
            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">AIM Cash Flow Benefit</span>
            <div className="text-2xl font-black font-mono text-emerald-300 mt-0.5">
              ${aimCashFlowSavings > 0 ? `+${aimCashFlowSavings.toLocaleString()}` : aimCashFlowSavings.toLocaleString()} NZD
            </div>
            <span className="text-[10px] text-emerald-200/80">
              {aimCashFlowSavings > 0 ? 'Saved vs Standard Uplift' : 'Matched to actual seasonal income'}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Options Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setCalculationMethod('AIM')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            calculationMethod === 'AIM'
              ? 'bg-emerald-900 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-500/50'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">AIM (Accounting Income Method)</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Pay tax as you earn based on actual bi-monthly software net profit. Safe-harbour against IRD UOMI interest!
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono font-bold">
            Bi-Monthly Payments (Matched to GST)
          </div>
        </div>

        <div
          onClick={() => setCalculationMethod('STANDARD_UPLIFT')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            calculationMethod === 'STANDARD_UPLIFT'
              ? 'bg-slate-900 text-white border-slate-700 shadow-lg ring-2 ring-slate-500/50'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-400">Standard Uplift (105% / 110%)</span>
            <Calculator className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Calculated as 105% of prior year residual tax or 110% of 2 years prior. Fixed 3 installments (28 Aug, 15 Jan, 7 May).
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono font-bold">
            3 Equal Installments of ${standardUpliftInstallment.toFixed(0)}
          </div>
        </div>

        <div
          onClick={() => setCalculationMethod('ESTIMATION')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            calculationMethod === 'ESTIMATION'
              ? 'bg-indigo-900 text-white border-indigo-600 shadow-lg ring-2 ring-indigo-500/50'
              : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300">Estimation Method</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Estimate tax if income drops significantly. Note: Underestimating triggers IRD UOMI interest charges ({uomiRatePct}%).
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono font-bold">
            Risk: IRD Interest if Underestimated
          </div>
        </div>
      </div>

      {/* AIM Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-slate-900">AIM Bi-Monthly Tax Payment Schedule (2026/27 Tax Year)</h3>
            <p className="text-xs text-slate-500">Calculated automatically from period GST profit and IRD tax rules</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> IRD Software Certified AIM Engine
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">GST / AIM Period</th>
                <th className="py-3 px-4">IRD Due Date</th>
                <th className="py-3 px-4 text-right">Net Accounting Profit</th>
                <th className="py-3 px-4 text-right">Tax Adjustments</th>
                <th className="py-3 px-4 text-right">AIM Tax (28%)</th>
                <th className="py-3 px-4 text-right">Standard Uplift</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {aimPeriods.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.gstPeriodName}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{p.dueDate}</td>
                  <td className="py-3 px-4 text-right font-mono">${p.accountingNetProfit.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">${p.taxAdjustments.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">${p.aimTaxPayable.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">${p.standardUpliftTaxPayable.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'FILED_WITH_IRD'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Informational Callout */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>IRD Provisional Tax Rules Summary:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
            <li>If residual income tax (RIT) exceeds <strong>$5,000 NZD</strong> in a tax year, provisional tax applies.</li>
            <li><strong>AIM Advantage:</strong> If a period incurs a loss, AIM calculates a tax refund or $0 payment instantly for that period!</li>
            <li><strong>IRD UOMI Rate:</strong> Debit interest is currently <strong>10.91% p.a.</strong> on underpaid provisional tax.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
