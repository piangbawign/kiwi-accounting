import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  DollarSign,
  TrendingUp,
  Sparkles,
  Calendar,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { CompanySettings } from '../types';
import { IrdTooltip, IRD_DICTIONARY } from './IrdTooltip';

interface TaxQuickCalcWidgetProps {
  companySettings: CompanySettings;
  ytdIncome: number;
  ytdExpenses: number;
  onNavigateTab?: (tabId: string) => void;
}

export const TaxQuickCalcWidget: React.FC<TaxQuickCalcWidgetProps> = ({
  companySettings,
  ytdIncome,
  ytdExpenses,
  onNavigateTab,
}) => {
  const [calcMode, setCalcMode] = useState<'PROVISIONAL' | 'GST'>('PROVISIONAL');
  const [entityType, setEntityType] = useState<'SOLE_TRADER' | 'COMPANY'>(
    companySettings.entityType === 'NZ_COMPANY' ? 'COMPANY' : 'SOLE_TRADER'
  );

  // Annual Estimated Profit / Income for Provisional Tax
  const defaultEstIncome = Math.max(30000, Math.round(ytdIncome - ytdExpenses));
  const [estAnnualProfit, setEstAnnualProfit] = useState<number>(defaultEstIncome || 75000);

  // GST Inputs
  const [gstSales, setGstSales] = useState<number>(ytdIncome || 100000);
  const [gstExpenses, setGstExpenses] = useState<number>(ytdExpenses || 40000);
  const [gstFrequency, setGstFrequency] = useState<'BI_MONTHLY' | 'SIX_MONTHLY'>('BI_MONTHLY');

  // NZ Income Tax Bracket calculation for Individuals
  const calculateNZIndividualTax = (income: number): number => {
    if (income <= 0) return 0;
    let tax = 0;
    
    // Tier 1: $0 - $14,000 @ 10.5%
    const tier1 = Math.min(income, 14000);
    tax += tier1 * 0.105;

    // Tier 2: $14,001 - $48,000 @ 17.5%
    if (income > 14000) {
      const tier2 = Math.min(income - 14000, 34000);
      tax += tier2 * 0.175;
    }

    // Tier 3: $48,001 - $70,000 @ 30%
    if (income > 48000) {
      const tier3 = Math.min(income - 48000, 22000);
      tax += tier3 * 0.3;
    }

    // Tier 4: $70,001 - $180,000 @ 33%
    if (income > 70000) {
      const tier4 = Math.min(income - 70000, 110000);
      tax += tier4 * 0.33;
    }

    // Tier 5: > $180,000 @ 39%
    if (income > 180000) {
      const tier5 = income - 180000;
      tax += tier5 * 0.39;
    }

    return tax;
  };

  // Compute Income Tax based on Entity
  const estimatedTax =
    entityType === 'COMPANY'
      ? estAnnualProfit * 0.28
      : calculateNZIndividualTax(estAnnualProfit);

  // ACC Earner/Working Owner Levy Estimate (~1.6%)
  const estAccLevy = entityType === 'SOLE_TRADER' ? Math.min(estAnnualProfit, 142283) * 0.016 : 0;

  // Total Tax Liability & Provisional Installment (3 Installments)
  const totalTaxAndAcc = estimatedTax + estAccLevy;
  const isProvTaxRequired = totalTaxAndAcc > 5000; // IRD threshold for Provisional Tax is $5,000 RIT
  const provInstallmentAmount = isProvTaxRequired ? totalTaxAndAcc / 3 : 0;

  // Effective Tax Rate
  const effectiveRate = estAnnualProfit > 0 ? ((totalTaxAndAcc / estAnnualProfit) * 100).toFixed(1) : '0.0';

  // GST Calculations
  const totalGstCollected = gstSales * (0.15 / 1.15); // assuming inclusive sales
  const totalGstPaid = gstExpenses * (0.15 / 1.15); // assuming inclusive expenses
  const netAnnualGst = Math.max(0, totalGstCollected - totalGstPaid);
  const periodsCount = gstFrequency === 'BI_MONTHLY' ? 6 : 2;
  const netGstPerPeriod = netAnnualGst / periodsCount;

  const handleSyncYTD = () => {
    const calcProfit = Math.max(0, ytdIncome - ytdExpenses);
    setEstAnnualProfit(calcProfit);
    setGstSales(ytdIncome);
    setGstExpenses(ytdExpenses);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between">
      <div>
        {/* Widget Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                NZ Tax Quick Estimator
              </h3>
              <p className="text-[10px] text-slate-500">IRD Provisional Tax & GST Calculator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncYTD}
            title="Sync with current ledger YTD figures"
            className="px-2 py-1 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800 rounded-lg text-[10px] font-bold border border-slate-200 transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-teal-600" /> Use YTD Ledger
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl my-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCalcMode('PROVISIONAL')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              calcMode === 'PROVISIONAL'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Provisional Tax (RIT)
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('GST')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              calcMode === 'GST'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            GST Return Estimate
          </button>
        </div>

        {calcMode === 'PROVISIONAL' ? (
          <div className="space-y-3">
            {/* Entity Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Entity Structure:</span>
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setEntityType('SOLE_TRADER')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    entityType === 'SOLE_TRADER'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sole Trader (IR3)
                </button>
                <button
                  type="button"
                  onClick={() => setEntityType('COMPANY')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    entityType === 'COMPANY'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Company (28% IR4)
                </button>
              </div>
            </div>

            {/* Income Slider / Input */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Est. Annual Net Profit:</span>
                <span className="font-mono text-teal-800">
                  ${estAnnualProfit.toLocaleString('en-NZ')}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={300000}
                step={5000}
                value={estAnnualProfit}
                onChange={(e) => setEstAnnualProfit(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                <span>$10k</span>
                <span>$150k</span>
                <span>$300k+</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Est. Income Tax ({effectiveRate}% eff.):</span>
                <span className="font-mono font-bold text-slate-900">
                  ${estimatedTax.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {entityType === 'SOLE_TRADER' && (
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-600 flex items-center">
                    Est. ACC Working Owner Levy:
                    <IrdTooltip
                      term={IRD_DICTIONARY.ACC_LEVY.title}
                      explanation={IRD_DICTIONARY.ACC_LEVY.text}
                    />
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    ${estAccLevy.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-200 flex justify-between text-xs font-extrabold text-slate-900">
                <span>Total Tax & ACC Reserve:</span>
                <span className="font-mono text-teal-700">
                  ${totalTaxAndAcc.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Provisional Tax Installment Breakdown */}
            <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-teal-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  3x Provisional Tax Installments
                  <IrdTooltip
                    term={IRD_DICTIONARY.PROVISIONAL_TAX.title}
                    explanation={IRD_DICTIONARY.PROVISIONAL_TAX.text}
                  />
                </span>
                {isProvTaxRequired ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-200 text-teal-900 rounded">
                    RIT &gt; $5,000
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                    Under $5k RIT
                  </span>
                )}
              </div>

              {isProvTaxRequired ? (
                <div className="text-[11px] text-teal-800 space-y-0.5 mt-1">
                  <div className="flex justify-between">
                    <span>Inst 1 (28 Aug):</span>
                    <strong className="font-mono">${provInstallmentAmount.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Inst 2 (15 Jan):</span>
                    <strong className="font-mono">${provInstallmentAmount.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Inst 3 (7 May):</span>
                    <strong className="font-mono">${provInstallmentAmount.toFixed(2)}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-teal-700">
                  Your estimated tax liability is under $5,000. Provisional tax installments are not mandatory, pay annually via terminal tax.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* GST Calculator Mode */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Est. Sales (GST Incl)</label>
                <input
                  type="number"
                  value={gstSales}
                  onChange={(e) => setGstSales(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Est. Expenses (GST Incl)</label>
                <input
                  type="number"
                  value={gstExpenses}
                  onChange={(e) => setGstExpenses(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Box 5 (Sales GST @ 15%):</span>
                <span className="font-mono font-bold text-emerald-700">${totalGstCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Box 8 (Purchases GST @ 15%):</span>
                <span className="font-mono font-bold text-slate-700">${totalGstPaid.toFixed(2)}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-extrabold text-slate-900">
                <span>Annual Net GST Payable:</span>
                <span className="font-mono text-teal-800">${netAnnualGst.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-teal-900">Est. GST per Return Period</span>
                <select
                  value={gstFrequency}
                  onChange={(e) => setGstFrequency(e.target.value as any)}
                  className="text-[10px] font-bold bg-white text-teal-900 border border-teal-300 rounded px-1.5 py-0.5"
                >
                  <option value="BI_MONTHLY">2-Monthly (6x/yr)</option>
                  <option value="SIX_MONTHLY">6-Monthly (2x/yr)</option>
                </select>
              </div>
              <div className="text-sm font-black text-teal-900 font-mono mt-1">
                ${netGstPerPeriod.toFixed(2)}{' '}
                <span className="text-[10px] font-normal text-teal-700">/ return</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {onNavigateTab && (
        <button
          type="button"
          onClick={() => onNavigateTab('TAX_CALENDAR')}
          className="w-full mt-3 py-2 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1"
        >
          View IRD Filing Calendar & Rules →
        </button>
      )}
    </div>
  );
};
