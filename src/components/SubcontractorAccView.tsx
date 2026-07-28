import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Calculator,
  Plus,
  DollarSign,
  Percent,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Activity,
} from 'lucide-react';
import { AppState, SubcontractorEntry } from '../types';

interface SubcontractorAccViewProps {
  appState: AppState;
  onUpdateSubcontractors?: (contractors: SubcontractorEntry[]) => void;
}

export const SubcontractorAccView: React.FC<SubcontractorAccViewProps> = ({
  appState,
  onUpdateSubcontractors,
}) => {
  const [activeTab, setActiveTab] = useState<'CONTRACTORS' | 'ACC_ESTIMATOR'>('CONTRACTORS');
  const [showAddContractorModal, setShowAddContractorModal] = useState(false);

  // Subcontractor List
  const [contractors, setContractors] = useState<SubcontractorEntry[]>(
    appState.subcontractors || [
      {
        id: 'SUB-01',
        contractorName: 'Apex Electrical Services NZ Ltd',
        irdNumber: '138-992-041',
        activityCode: 'WT-CONSTRUCTION',
        wtRatePct: 20, // Standard construction WT rate
        hasSpecialTaxRateCert: false,
        totalGrossPaid: 24500,
        totalWithholdingTaxDeducted: 4900,
        lastPaymentDate: '2026-07-15',
      },
      {
        id: 'SUB-02',
        contractorName: 'Kauri Commercial Cleaning',
        irdNumber: '112-458-902',
        activityCode: 'WT-CLEANING',
        wtRatePct: 15, // Cleaning schedular payment rate
        hasSpecialTaxRateCert: true, // Special rate certificate IR330C
        totalGrossPaid: 12000,
        totalWithholdingTaxDeducted: 1800,
        lastPaymentDate: '2026-07-18',
      },
      {
        id: 'SUB-03',
        contractorName: 'DevTek Software Solutions',
        irdNumber: '144-883-201',
        activityCode: 'WT-IT_CONTRACTOR',
        wtRatePct: 20,
        hasSpecialTaxRateCert: false,
        totalGrossPaid: 38000,
        totalWithholdingTaxDeducted: 7600,
        lastPaymentDate: '2026-07-22',
      },
    ]
  );

  // ACC Levy Estimator State (NZ Business Industry Classification BIC / CU code calculator)
  const [bicCode, setBicCode] = useState('M700000'); // Computer System Design / IT
  const [annualPayrollOrEarnings, setAnnualPayrollOrEarnings] = useState('150000');
  const [includeEarnersLevy, setIncludeEarnersLevy] = useState(true);

  // ACC Rates 2026/27 NZ
  // WorkSafe Levy = $0.08 per $100
  // ACC Work Levy varies by industry (e.g. IT = $0.25 per $100, Construction = $2.10 per $100)
  // ACC Earners Levy = $1.60 per $100 (incl. GST) up to cap $142,283
  const earnings = parseFloat(annualPayrollOrEarnings) || 0;
  const workLevyRatePer100 = bicCode.includes('CONSTRUCTION') ? 2.10 : 0.35;
  const worksafeRatePer100 = 0.08;
  const earnersRatePer100 = 1.60;
  const earnersCap = 142283;

  const workLevy = (earnings / 100) * workLevyRatePer100;
  const worksafeLevy = (earnings / 100) * worksafeRatePer100;
  const cappedEarnersEarnings = Math.min(earnings, earnersCap);
  const earnersLevy = includeEarnersLevy ? (cappedEarnersEarnings / 100) * earnersRatePer100 : 0;
  const totalAccLevyEstimate = workLevy + worksafeLevy + earnersLevy;

  // Form State
  const [cName, setCName] = useState('');
  const [irdNum, setIrdNum] = useState('');
  const [actCode, setActCode] = useState('WT-CONSTRUCTION');
  const [rate, setRate] = useState('20');
  const [hasCert, setHasCert] = useState(false);

  const handleAddContractor = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: SubcontractorEntry = {
      id: `SUB-${Date.now()}`,
      contractorName: cName,
      irdNumber: irdNum,
      activityCode: actCode,
      wtRatePct: parseFloat(rate) || 20,
      hasSpecialTaxRateCert: hasCert,
      totalGrossPaid: 0,
      totalWithholdingTaxDeducted: 0,
      lastPaymentDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newSub, ...contractors];
    setContractors(updated);
    if (onUpdateSubcontractors) onUpdateSubcontractors(updated);

    setShowAddContractorModal(false);
    setCName('');
    setIrdNum('');
  };

  const totalGrossPaidAll = contractors.reduce((sum, c) => sum + c.totalGrossPaid, 0);
  const totalWtDeductedAll = contractors.reduce((sum, c) => sum + c.totalWithholdingTaxDeducted, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>IRD Schedular WT-1 & ACC Workplace Levy Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Subcontractor Withholding Tax & ACC Estimator</h1>
            <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
              Manage schedular payment Withholding Tax (WT) rates, deduct WT for NZ contractors, file IRD EMS/IR330C records, and estimate annual ACC WorkSafe & Earners levies.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddContractorModal(true)}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Contractor
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-sky-200">Total Schedular Gross Paid</span>
            <div className="text-2xl font-black font-mono mt-1">${totalGrossPaidAll.toLocaleString()} NZD</div>
            <span className="text-[10px] text-sky-300">{contractors.length} Registered Contractors</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-sky-200">Withholding Tax (WT) Deducted</span>
            <div className="text-2xl font-black font-mono mt-1 text-sky-300">${totalWtDeductedAll.toLocaleString()} NZD</div>
            <span className="text-[10px] text-sky-300">Remitted to IRD on Payday</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-sky-200">ACC WorkSafe & Cover Levy</span>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-400">${totalAccLevyEstimate.toFixed(2)} NZD</div>
            <span className="text-[10px] text-sky-300">Estimated Annual Invoice</span>
          </div>

          <div className="bg-sky-500/10 p-4 rounded-2xl border border-sky-500/20">
            <span className="text-[11px] font-medium text-sky-300">IR330C Rate Certificates</span>
            <div className="mt-2">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Compliant WT Setup
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('CONTRACTORS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'CONTRACTORS'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Schedular Contractors & WT Rates ({contractors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ACC_ESTIMATOR')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'ACC_ESTIMATOR'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> ACC Levy Calculator (BIC / CU Codes)
        </button>
      </div>

      {/* Tab 1: Contractors */}
      {activeTab === 'CONTRACTORS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900">Contractor Schedular Payments Register</h3>
            <span className="text-slate-500">IRD Standard Rate: <strong className="text-slate-900">20%</strong> (or tailored per IR330C)</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Contractor & IRD Number</th>
                  <th className="py-3 px-4">Schedular Activity</th>
                  <th className="py-3 px-4 text-center">WT Rate %</th>
                  <th className="py-3 px-4 text-center">Special Cert (IR330C)</th>
                  <th className="py-3 px-4 text-right">Gross Paid ($)</th>
                  <th className="py-3 px-4 text-right">WT Deducted ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block">{c.contractorName}</span>
                      <span className="font-mono text-[10px] text-sky-600">IRD: {c.irdNumber}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.activityCode}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{c.wtRatePct}%</td>
                    <td className="py-3 px-4 text-center">
                      {c.hasSpecialTaxRateCert ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                          Yes (IR330C)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">${c.totalGrossPaid.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-sky-800">${c.totalWithholdingTaxDeducted.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: ACC Estimator */}
      {activeTab === 'ACC_ESTIMATOR' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">ACC Business Industry Classification (BIC)</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Industry BIC / Classification Code</label>
              <select
                value={bicCode}
                onChange={(e) => setBicCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="M700000">M700000 - Computer System Design / IT Services ($0.35/$100)</option>
                <option value="CONSTRUCTION_ELEC">E323200 - Electrical Contracting ($2.10/$100)</option>
                <option value="PROFESSIONAL_ACCO">M693200 - Accounting / Legal Advisory ($0.25/$100)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Annual Earnings / Payroll Subject to Levy ($ NZD)</label>
              <input
                type="number"
                value={annualPayrollOrEarnings}
                onChange={(e) => setAnnualPayrollOrEarnings(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="earnersLevyCheck"
                checked={includeEarnersLevy}
                onChange={(e) => setIncludeEarnersLevy(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <label htmlFor="earnersLevyCheck" className="font-bold text-slate-700">
                Include ACC Earners' Levy ($1.60 per $100 up to $142,283 cap)
              </label>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold border-b border-slate-800 pb-3 text-sky-300">ACC Levy Calculation Estimate</h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">ACC Work Levy (${workLevyRatePer100}/$100):</span>
                <span>${workLevy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">WorkSafe NZ Levy ($0.08/$100):</span>
                <span>${worksafeLevy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">ACC Earners' Levy ($1.60/$100):</span>
                <span>${earnersLevy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-800">
                <span className="font-sans text-sky-200">Total Estimated ACC Invoice:</span>
                <span className="text-sky-400">${totalAccLevyEstimate.toFixed(2)} NZD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contractor Modal */}
      {showAddContractorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" /> Register Schedular Contractor
            </h3>

            <form onSubmit={handleAddContractor} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contractor Business / Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Electrical Ltd"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IRD Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 138-992-041"
                  value={irdNum}
                  onChange={(e) => setIrdNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity Code</label>
                  <select
                    value={actCode}
                    onChange={(e) => setActCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="WT-CONSTRUCTION">WT-1 Construction</option>
                    <option value="WT-CLEANING">WT-Cleaning</option>
                    <option value="WT-IT_CONTRACTOR">WT-IT Consulting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WT Rate (%)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="certCheck"
                  checked={hasCert}
                  onChange={(e) => setHasCert(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <label htmlFor="certCheck" className="font-bold text-slate-700">
                  Holds Tailored Tax Rate Certificate (IR330C)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContractorModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700">
                  Save Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
