import React, { useState } from 'react';
import {
  Map,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  DollarSign,
  Percent,
  FileText,
  Calculator,
  Building2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  X,
  Target,
} from 'lucide-react';
import { CompanySettings } from '../types';

interface TaxMapViewProps {
  companySettings: CompanySettings;
  onNavigateTab?: (tabId: string) => void;
}

interface TaxMilestone {
  id: string;
  title: string;
  code: string; // e.g. GST101, IR3, IR4, PAYE
  dueDate: string;
  frequency: string;
  category: 'GST' | 'PROVISIONAL' | 'PAYE' | 'ANNUAL' | 'FBT' | 'ACC';
  status: 'UPCOMING' | 'URGENT' | 'COMPLETED' | 'SCHEDULED';
  description: string;
  irdFormUrl: string;
  thresholdNote?: string;
  penaltyWarning: string;
}

export const TaxMapView: React.FC<TaxMapViewProps> = ({ companySettings, onNavigateTab }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<TaxMilestone | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Late Payment Penalty Calculator states
  const [calcTaxAmount, setCalcTaxAmount] = useState<number>(2500);
  const [calcDaysLate, setCalcDaysLate] = useState<number>(30);

  // NZ IRD Tax Milestones Data
  const milestones: TaxMilestone[] = [
    {
      id: 'm-paye-aug',
      title: 'PAYE & Employer Deductions (July Period)',
      code: 'IR348 / IR345',
      dueDate: '20th Aug 2026',
      frequency: 'Monthly (20th)',
      category: 'PAYE',
      status: 'URGENT',
      description: 'Filing employer schedule for staff wages, PAYE tax deducted, KiwiSaver employee & employer contributions, and ACC earners levy.',
      irdFormUrl: 'https://www.ird.govt.nz/paye',
      thresholdNote: 'Mandatory for all registered NZ employers paying salaries or wage draws.',
      penaltyWarning: '$250 late filing penalty + 4.63% use-of-money interest charged per annum by IRD.',
    },
    {
      id: 'm-prov-p1',
      title: 'Provisional Tax 1st Installment (P1)',
      code: 'IR3 / IR4 Provisional',
      dueDate: '28th Aug 2026',
      frequency: 'Tri-annual (Aug, Jan, May)',
      category: 'PROVISIONAL',
      status: 'URGENT',
      description: 'First installment of income tax in advance if residual income tax liability exceeded $5,000 in previous tax year.',
      irdFormUrl: 'https://www.ird.govt.nz/income-tax/provisional-tax',
      thresholdNote: 'Applies if RIT > $5,000 NZD. Standard option = 105% of prior year tax.',
      penaltyWarning: 'IRD Use of Money Interest (UOMI) charged at 9.84% per annum on unpaid provisional tax balances.',
    },
    {
      id: 'm-gst-julaug',
      title: 'GST Return (July - August Period)',
      code: 'GST101',
      dueDate: '28th Sep 2026',
      frequency: '2-Monthly',
      category: 'GST',
      status: 'UPCOMING',
      description: 'Calculate Box 5 (Sales GST 15%) minus Box 8 (Purchases GST 15%) to determine net Box 10 refund or tax payable.',
      irdFormUrl: 'https://www.ird.govt.nz/gst',
      thresholdNote: 'Mandatory for businesses with annual turnover exceeding $60,000 NZD.',
      penaltyWarning: '$50 late filing fee + 1% initial late payment penalty on day 1, plus 4% on day 7.',
    },
    {
      id: 'm-paye-sep',
      title: 'PAYE & Employer Deductions (August Period)',
      code: 'IR348 / IR345',
      dueDate: '20th Sep 2026',
      frequency: 'Monthly (20th)',
      category: 'PAYE',
      status: 'SCHEDULED',
      description: 'Monthly payroll deductions return for staff salaries and wage records.',
      irdFormUrl: 'https://www.ird.govt.nz/paye',
      penaltyWarning: '$250 late filing penalty.',
    },
    {
      id: 'm-fbt-q2',
      title: 'Fringe Benefit Tax (FBT) Quarterly Return',
      code: 'IR420',
      dueDate: '20th Oct 2026',
      frequency: 'Quarterly',
      category: 'FBT',
      status: 'SCHEDULED',
      description: 'FBT on non-cash benefits provided to employees (e.g. company vehicles, low-interest loans, gym memberships).',
      irdFormUrl: 'https://www.ird.govt.nz/fbt',
      thresholdNote: 'Calculated using single-rate 63.93% or alternate rate calculation.',
      penaltyWarning: 'Late filing penalties apply.',
    },
    {
      id: 'm-gst-sepoct',
      title: 'GST Return (September - October Period)',
      code: 'GST101',
      dueDate: '28th Nov 2026',
      frequency: '2-Monthly',
      category: 'GST',
      status: 'SCHEDULED',
      description: '2-Monthly GST filing for September and October turnover.',
      irdFormUrl: 'https://www.ird.govt.nz/gst',
      penaltyWarning: '$50 late filing fee.',
    },
    {
      id: 'm-prov-p2',
      title: 'Provisional Tax 2nd Installment (P2)',
      code: 'IR3 / IR4 Provisional',
      dueDate: '15th Jan 2027',
      frequency: 'Tri-annual',
      category: 'PROVISIONAL',
      status: 'SCHEDULED',
      description: 'Second installment of provisional income tax for FY2027 tax year.',
      irdFormUrl: 'https://www.ird.govt.nz/income-tax/provisional-tax',
      penaltyWarning: 'IRD Use of Money Interest (UOMI) applies.',
    },
    {
      id: 'm-annual-ir34',
      title: 'Annual Income Tax Return (IR3 / IR4)',
      code: companySettings.entityType === 'NZ_COMPANY' ? 'IR4 Company' : 'IR3 Sole Trader',
      dueDate: '31st Mar 2027 (Tax Agent) / 7th Jul 2026',
      frequency: 'Annual',
      category: 'ANNUAL',
      status: 'SCHEDULED',
      description: 'Final annual income tax return declaring net profit, non-deductible expenses, depreciation schedules, and tax liability.',
      irdFormUrl: 'https://www.ird.govt.nz/income-tax',
      thresholdNote: 'NZ Company Tax Rate = 28%. Sole Trader = Progressive rates (10.5% - 39%).',
      penaltyWarning: 'Late filing fee up to $250 + interest penalties.',
    },
  ];

  const filteredMilestones = milestones.filter(
    (m) => selectedCategory === 'ALL' || m.category === selectedCategory
  );

  // Late Fee Calculations
  const initialLatePenalty = calcTaxAmount * 0.01; // 1%
  const day7LatePenalty = calcTaxAmount * 0.04; // 4%
  const uomiInterest = calcTaxAmount * (0.0984 / 365) * calcDaysLate; // ~9.84% per annum
  const totalEstimatedPenalties = initialLatePenalty + day7LatePenalty + uomiInterest + 50;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              NZ Tax Roadmap & IRD Milestones
            </span>
            <span className="text-xs text-slate-400">• Registered GST & Income Tax Guide</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-400" /> Interactive IRD NZ Tax Map & Compliance Roadmap
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Visual milestone guide of all New Zealand tax obligations, GST deadlines, provisional tax installments, PAYE schedules, and tax rate thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Print Tax Roadmap
          </button>
        </div>
      </div>

      {/* Tax Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Target className="w-4 h-4 text-emerald-600" /> Filter Obligations:
        </span>
        {[
          { id: 'ALL', label: 'All Obligations' },
          { id: 'GST', label: 'GST Returns (GST101)' },
          { id: 'PROVISIONAL', label: 'Provisional Tax' },
          { id: 'PAYE', label: 'PAYE & Wages' },
          { id: 'ANNUAL', label: 'Annual Income Tax' },
          { id: 'FBT', label: 'Fringe Benefit (FBT)' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 font-bold text-xs rounded-xl transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Interactive Milestone Timeline Node Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm">
            NZ Tax Year Milestone Timeline ({filteredMilestones.length} Active Nodes)
          </h3>
          <span className="text-xs text-slate-400">Click any milestone node for IRD rules & form links</span>
        </div>

        <div className="relative border-l-2 border-emerald-200 pl-6 space-y-6 my-2">
          {filteredMilestones.map((m) => (
            <div key={m.id} className="relative group">
              {/* Timeline Marker Circle */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                  m.status === 'URGENT'
                    ? 'border-amber-500 ring-4 ring-amber-100'
                    : m.status === 'UPCOMING'
                    ? 'border-emerald-500 ring-4 ring-emerald-100'
                    : 'border-slate-400'
                }`}
              />

              <div
                onClick={() => setSelectedMilestone(m)}
                className="p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {m.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">• {m.frequency}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : m.status === 'UPCOMING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Due Date</span>
                    <span className="font-bold font-mono text-xs text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> {m.dueDate}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Thresholds & Rates Interactive Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NZ Tax Thresholds Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-600" /> NZ Tax Rates & Statutory Thresholds Map
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center font-bold text-slate-900 mb-1">
                <span>GST Registration Threshold</span>
                <span className="font-mono text-emerald-700">$60,000 NZD / Year</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Must register for GST within 21 days if gross turnover in any 12-month period exceeds $60k.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center font-bold text-slate-900 mb-1">
                <span>Provisional Tax Threshold</span>
                <span className="font-mono text-emerald-700">$5,000 NZD Tax Due</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Applies if residual income tax liability is over $5,000 in your previous year income tax return.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center font-bold text-slate-900 mb-1">
                <span>NZ Company Flat Income Tax Rate</span>
                <span className="font-mono text-emerald-700">28.0%</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Flat rate on net profit for registered NZ Limited Companies. Fully imputable with dividends.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center font-bold text-slate-900 mb-1">
                <span>Individual / Sole Trader Tax Brackets</span>
                <span className="font-mono text-emerald-700">10.5% - 39% Progressive</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                $0-$14k @ 10.5% • $14k-$48k @ 17.5% • $48k-$70k @ 30% • $70k-$180k @ 33% • $180k+ @ 39%.
              </p>
            </div>
          </div>
        </div>

        {/* IRD Late Filing & UOMI Penalty Calculator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-600" /> IRD Late Filing & Interest Penalty Calculator
          </h3>
          <p className="text-xs text-slate-500">
            Estimate potential IRD late payment charges if taxes are paid after statutory due dates:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Outstanding Tax Liability ($ NZD)</label>
              <input
                type="number"
                value={calcTaxAmount}
                onChange={(e) => setCalcTaxAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Days Overdue</label>
              <input
                type="number"
                value={calcDaysLate}
                onChange={(e) => setCalcDaysLate(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
              <div className="flex justify-between text-amber-900">
                <span>IRD Late Filing Admin Fee:</span>
                <span className="font-mono font-bold">$50.00</span>
              </div>
              <div className="flex justify-between text-amber-900">
                <span>Initial 1% + 4% Late Penalties:</span>
                <span className="font-mono font-bold">${(initialLatePenalty + day7LatePenalty).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-900">
                <span>UOMI Interest (9.84% p.a.):</span>
                <span className="font-mono font-bold">${uomiInterest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-950 font-black text-sm pt-2 border-t border-amber-300">
                <span>Total Penalty Risk:</span>
                <span className="font-mono text-rose-700">${totalEstimatedPenalties.toFixed(2)} NZD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-emerald-100 text-emerald-800">
                  {selectedMilestone.code}
                </span>
                <h3 className="font-black text-slate-900 text-base">{selectedMilestone.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Statutory Due Date</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-emerald-600" /> {selectedMilestone.dueDate}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Compliance Overview</span>
                <p className="text-slate-700 mt-1 leading-relaxed">{selectedMilestone.description}</p>
              </div>

              {selectedMilestone.thresholdNote && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <span className="font-bold block text-[11px]">Applicable Rules & Thresholds:</span>
                  <p className="text-[11px] mt-0.5">{selectedMilestone.thresholdNote}</p>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Non-Compliance Risk:
                </span>
                <p className="text-[11px] mt-0.5">{selectedMilestone.penaltyWarning}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={selectedMilestone.irdFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  Visit myIR Inland Revenue Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
