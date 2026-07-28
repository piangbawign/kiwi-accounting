import React, { useState } from 'react';
import {
  FileText,
  Download,
  Building,
  User,
  Users,
  CheckCircle2,
  Printer,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AppState, IrdTaxFormDraft } from '../types';

interface IrdTaxFormsExporterViewProps {
  appState: AppState;
  onSaveTaxFormDraft?: (draft: IrdTaxFormDraft) => void;
}

export const IrdTaxFormsExporterView: React.FC<IrdTaxFormsExporterViewProps> = ({
  appState,
  onSaveTaxFormDraft,
}) => {
  const [selectedFormType, setSelectedFormType] = useState<'IR3' | 'IR4' | 'IR7'>('IR4');
  const [taxYear, setTaxYear] = useState('2026');

  // Form Fields State
  const [entityName, setEntityName] = useState('Vance Tech Ltd');
  const [irdNumber, setIrdNumber] = useState('134-889-102');
  const [grossSales, setGrossSales] = useState('480000');
  const [costOfGoodsSold, setCostOfGoodsSold] = useState('120000');
  const [salariesWages, setSalariesWages] = useState('140000');
  const [depreciationClaimed, setDepreciationClaimed] = useState('12500');
  const [otherDeductibleExpenses, setOtherDeductibleExpenses] = useState('85000');
  const [nonDeductibleEntertainment, setNonDeductibleEntertainment] = useState('2400'); // 50% non-deductible add-back
  const [provisionalTaxPaid, setProvisionalTaxPaid] = useState('28000');

  // Math Calculations for NZ Income Tax Return
  const grossIncome = parseFloat(grossSales) || 0;
  const cogs = parseFloat(costOfGoodsSold) || 0;
  const grossProfit = grossIncome - cogs;

  const totalExpenses = (parseFloat(salariesWages) || 0) + (parseFloat(depreciationClaimed) || 0) + (parseFloat(otherDeductibleExpenses) || 0);
  const netAccountingProfit = grossProfit - totalExpenses;

  // IRD Tax Adjustments (e.g. Add back 50% non-deductible entertainment)
  const taxAdjustments = parseFloat(nonDeductibleEntertainment) || 0;
  const taxableNetIncome = netAccountingProfit + taxAdjustments;

  // Tax Rates: IR4 Company = 28%, IR3 Individual = Graduated tax brackets, IR7 Partnership = Allocated to partners
  const companyTaxRatePct = 28;
  const taxLiabilityGross = selectedFormType === 'IR4' ? taxableNetIncome * (companyTaxRatePct / 100) : taxableNetIncome * 0.33; // Approx
  const taxBalanceDueOrRefund = taxLiabilityGross - (parseFloat(provisionalTaxPaid) || 0);

  const handleExportFormPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official IRD Income Tax Return Draft Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">NZ IRD Tax Returns (IR3, IR4, IR7) Exporter</h1>
            <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
              Auto-populate line-by-line IRD field codes for Companies (IR4), Sole Traders (IR3), and Partnerships (IR7). Includes 50% entertainment add-backs and tax calculation breakdowns.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportFormPDF}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save IRD Draft PDF
            </button>
          </div>
        </div>

        {/* Form Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-900/60">
          <button
            type="button"
            onClick={() => setSelectedFormType('IR4')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedFormType === 'IR4'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="text-sm font-black">Form IR4</span>
            </div>
            <p className="text-[11px] opacity-80 mt-1">Companies (28% Flat Income Tax Rate)</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormType('IR3')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedFormType === 'IR3'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-black">Form IR3</span>
            </div>
            <p className="text-[11px] opacity-80 mt-1">Individual / Sole Trader Income Tax</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormType('IR7')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedFormType === 'IR7'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-black">Form IR7</span>
            </div>
            <p className="text-[11px] opacity-80 mt-1">Partnerships & Look-Through Companies (LTC)</p>
          </button>
        </div>
      </div>

      {/* Form Details Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Input Form Column */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Draft Return Inputs</h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Taxpayer / Entity Name</label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">IRD Number</label>
            <input
              type="text"
              value={irdNumber}
              onChange={(e) => setIrdNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Gross Trading Revenue / Sales ($ NZD)</label>
            <input
              type="number"
              value={grossSales}
              onChange={(e) => setGrossSales(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cost of Goods Sold (COGS) ($ NZD)</label>
            <input
              type="number"
              value={costOfGoodsSold}
              onChange={(e) => setCostOfGoodsSold(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Salaries & Wages Paid ($ NZD)</label>
            <input
              type="number"
              value={salariesWages}
              onChange={(e) => setSalariesWages(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">IRD Tax Depreciation Claimed ($ NZD)</label>
            <input
              type="number"
              value={depreciationClaimed}
              onChange={(e) => setDepreciationClaimed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">50% Non-Deductible Entertainment Add-back ($ NZD)</label>
            <input
              type="number"
              value={nonDeductibleEntertainment}
              onChange={(e) => setNonDeductibleEntertainment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-amber-700"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Added back to accounting net profit for tax</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Provisional Tax Paid During Year ($ NZD)</label>
            <input
              type="number"
              value={provisionalTaxPaid}
              onChange={(e) => setProvisionalTaxPaid(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-700"
            />
          </div>
        </div>

        {/* Official IRD Form Preview Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-xl space-y-6 text-slate-900 font-sans">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <span className="px-2.5 py-1 bg-slate-900 text-white font-black text-xs rounded">
                INLAND REVENUE DRAFT FORM {selectedFormType}
              </span>
              <h2 className="text-xl font-black mt-2">New Zealand Income Tax Return</h2>
              <p className="text-xs text-slate-600">Tax Year Ending 31 March {taxYear}</p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-bold text-slate-500 block">IRD Number:</span>
              <span className="text-base font-black tracking-wider">{irdNumber}</span>
            </div>
          </div>

          {/* Line by line IRD boxes */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 bg-slate-200 font-bold rounded text-[10px] mr-2">BOX 11</span>
                <span className="font-sans font-bold">Total Sales / Operating Income</span>
              </div>
              <span className="font-black text-base">${grossIncome.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 bg-slate-200 font-bold rounded text-[10px] mr-2">BOX 12</span>
                <span className="font-sans font-bold">Cost of Goods Sold (COGS)</span>
              </div>
              <span className="font-black text-base">-${cogs.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-emerald-900">
              <div>
                <span className="px-2 py-0.5 bg-emerald-200 font-bold rounded text-[10px] mr-2">BOX 14</span>
                <span className="font-sans font-bold">Gross Trading Profit</span>
              </div>
              <span className="font-black text-base">${grossProfit.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 bg-slate-200 font-bold rounded text-[10px] mr-2">BOX 18</span>
                <span className="font-sans font-bold">Total Allowable Deductions (Expenses & Deprec)</span>
              </div>
              <span className="font-black text-base">-${totalExpenses.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center text-amber-900">
              <div>
                <span className="px-2 py-0.5 bg-amber-200 font-bold rounded text-[10px] mr-2">BOX 22</span>
                <span className="font-sans font-bold">Tax Adjustments (Non-deductible entertainment)</span>
              </div>
              <span className="font-black text-base">+${taxAdjustments.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black rounded text-[10px] mr-2">BOX 26</span>
                <span className="font-sans font-black text-sm">Net Taxable Income</span>
              </div>
              <span className="font-black text-xl font-mono text-emerald-400">${taxableNetIncome.toLocaleString()} NZD</span>
            </div>

            <div className="p-4 bg-emerald-950 text-white rounded-xl flex justify-between items-center border border-emerald-500/30">
              <div>
                <span className="font-sans font-bold text-xs text-emerald-200 block">Gross Income Tax Liability (28%)</span>
                <span className="font-sans text-[10px] text-emerald-300">Less Provisional Tax Paid: ${provisionalTaxPaid}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-xl font-mono text-emerald-300">
                  ${taxBalanceDueOrRefund >= 0 ? `${taxBalanceDueOrRefund.toFixed(2)} DUE` : `${Math.abs(taxBalanceDueOrRefund).toFixed(2)} REFUND`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
