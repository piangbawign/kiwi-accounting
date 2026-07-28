import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Download,
  Users,
  Cpu,
  Layers,
  HelpCircle,
  ShieldCheck,
  Building,
  Check,
} from 'lucide-react';
import { AppState, RdProject, RdExpenditureLog, Transaction } from '../types';

interface RdTaxCreditViewProps {
  appState: AppState;
  onUpdateRdProjects?: (projects: RdProject[]) => void;
  onUpdateRdExpenditures?: (logs: RdExpenditureLog[]) => void;
}

export const RdTaxCreditView: React.FC<RdTaxCreditViewProps> = ({
  appState,
  onUpdateRdProjects,
  onUpdateRdExpenditures,
}) => {
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'EXPENDITURE' | 'IRD_CLAIM'>('PROJECTS');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Initial Mock / Default Projects if empty
  const [projects, setProjects] = useState<RdProject[]>(
    appState.rdProjects || [
      {
        id: 'RD-2026-001',
        projectName: 'AI Real-time Algorithmic Tax Reconciliation Engine',
        code: 'RD-AI-RECON',
        description: 'Developing proprietary NLP and graph neural networks for automated IRD tax rule matching.',
        scientificUncertainty: 'Uncertainty in achieving <15ms latency while processing non-deterministic banking descriptions under strict NZ tax graph constraints.',
        startDate: '2026-01-10',
        status: 'ACTIVE',
        eligiblePersonnelCost: 95000,
        eligibleDirectCost: 28000,
        eligibleSubcontractorCost: 15000,
        totalEligibleExpenditure: 138000,
        estimatedTaxCredit15Pct: 20700,
        isOver50kThreshold: true,
        irdApprovalReference: 'RDTI-2026-NZ-8841',
      },
      {
        id: 'RD-2026-002',
        projectName: 'Biometric Encrypted Offline POS Sync Protocol',
        code: 'RD-BIO-POS',
        description: 'Engineering zero-knowledge mesh networking for resilient store sales sync during network outages.',
        scientificUncertainty: 'Technological uncertainty in cryptographic consensus over peer-to-peer Bluetooth Low Energy in high-noise retail environments.',
        startDate: '2026-03-01',
        status: 'ACTIVE',
        eligiblePersonnelCost: 42000,
        eligibleDirectCost: 12000,
        eligibleSubcontractorCost: 8000,
        totalEligibleExpenditure: 62000,
        estimatedTaxCredit15Pct: 9300,
        isOver50kThreshold: true,
      },
    ]
  );

  const [expenditures, setExpenditures] = useState<RdExpenditureLog[]>(
    appState.rdExpenditures || [
      {
        id: 'LOG-001',
        projectId: 'RD-2026-001',
        date: '2026-06-15',
        description: 'Senior ML Software Engineer Salary (R&D dedicated)',
        category: 'LABOUR',
        amount: 15000,
        eligibilityPercentage: 100,
        eligibleAmount: 15000,
      },
      {
        id: 'LOG-002',
        projectId: 'RD-2026-001',
        date: '2026-06-20',
        description: 'AWS GPU Cloud Training Cluster (Model Training)',
        category: 'SOFTWARE_CLOUD',
        amount: 8500,
        eligibilityPercentage: 80,
        eligibleAmount: 6800,
      },
    ]
  );

  // New Project Form State
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projUncertainty, setProjUncertainty] = useState('');
  const [projPersonnel, setProjPersonnel] = useState('50000');
  const [projDirect, setProjDirect] = useState('15000');
  const [projSubcontractor, setProjSubcontractor] = useState('10000');

  // New Expense Form State
  const [expProjectId, setExpProjectId] = useState(projects[0]?.id || '');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expCat, setExpCat] = useState<RdExpenditureLog['category']>('LABOUR');
  const [expAmount, setExpAmount] = useState('5000');
  const [expEligibility, setExpEligibility] = useState('100');

  // Totals
  const totalRndExpenditure = projects.reduce((sum, p) => sum + p.totalEligibleExpenditure, 0);
  const totalTaxCredit = totalRndExpenditure * 0.15;
  const isEligibleForCredit = totalRndExpenditure >= 50000;

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const personnel = parseFloat(projPersonnel) || 0;
    const direct = parseFloat(projDirect) || 0;
    const sub = parseFloat(projSubcontractor) || 0;
    const total = personnel + direct + sub;
    const credit = total * 0.15;

    const newProj: RdProject = {
      id: `RD-${Date.now()}`,
      projectName: projName,
      code: projCode || `RD-${projects.length + 1}`,
      description: projDesc,
      scientificUncertainty: projUncertainty,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      eligiblePersonnelCost: personnel,
      eligibleDirectCost: direct,
      eligibleSubcontractorCost: sub,
      totalEligibleExpenditure: total,
      estimatedTaxCredit15Pct: credit,
      isOver50kThreshold: total >= 50000,
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    if (onUpdateRdProjects) onUpdateRdProjects(updated);

    setShowAddProjectModal(false);
    setProjName('');
    setProjCode('');
    setProjDesc('');
    setProjUncertainty('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount) || 0;
    const pct = parseFloat(expEligibility) || 100;
    const eligibleAmt = amt * (pct / 100);

    const newLog: RdExpenditureLog = {
      id: `LOG-${Date.now()}`,
      projectId: expProjectId,
      date: expDate,
      description: expDesc,
      category: expCat,
      amount: amt,
      eligibilityPercentage: pct,
      eligibleAmount: eligibleAmt,
    };

    const updated = [newLog, ...expenditures];
    setExpenditures(updated);
    if (onUpdateRdExpenditures) onUpdateRdExpenditures(updated);

    setShowAddExpenseModal(false);
    setExpDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
              <span>NZ IRD & Callaghan Innovation R&D Incentive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">R&D Tax Credit (RDTI) Hub</h1>
            <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
              New Zealand offers a 15% tax credit on eligible Research & Development expenditure over $50,000 NZD per year.
              Track scientific uncertainty, core vs supporting activities, and prepare IRD-ready supplementary returns.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add R&D Project
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/60">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Total R&D Eligible Spend</span>
            <div className="text-2xl font-black font-mono mt-1">${totalRndExpenditure.toLocaleString()} NZD</div>
            <span className="text-[10px] text-indigo-300">Minimum threshold: $50,000</span>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/20">
            <span className="text-[11px] font-medium text-emerald-300">15% Tax Credit Refund</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ${totalTaxCredit.toLocaleString()} NZD
            </div>
            <span className="text-[10px] text-emerald-300/80">Direct IRD tax credit / refund</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Threshold Status</span>
            <div className="flex items-center gap-2 mt-2">
              {isEligibleForCredit ? (
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Threshold Met (&gt;$50k)
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Need ${(50000 - totalRndExpenditure).toLocaleString()} more
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Active R&D Projects</span>
            <div className="text-2xl font-black font-mono mt-1">{projects.length} Projects</div>
            <span className="text-[10px] text-indigo-300">Scientific uncertainty documented</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('PROJECTS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'PROJECTS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" /> R&D Projects Register ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('EXPENDITURE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'EXPENDITURE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Expenditure Logs ({expenditures.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('IRD_CLAIM')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'IRD_CLAIM'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> IRD Supplementary Return (IR1042)
        </button>
      </div>

      {/* Tab 1: R&D Projects Register */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs space-y-3 transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {p.code}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{p.projectName}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                    15% Credit: ${p.estimatedTaxCredit15Pct.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Scientific / Technological Uncertainty:
                  </span>
                  <p className="text-slate-700 italic text-[11px] leading-snug">{p.scientificUncertainty}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 block">Personnel/Wages</span>
                    <span className="font-mono font-bold text-slate-800">${p.eligiblePersonnelCost.toLocaleString()}</span>
                  </div>
                  <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 block">Direct & Software</span>
                    <span className="font-mono font-bold text-slate-800">${p.eligibleDirectCost.toLocaleString()}</span>
                  </div>
                  <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 block">Subcontractors</span>
                    <span className="font-mono font-bold text-slate-800">${p.eligibleSubcontractorCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 text-[11px]">Total Project Spend: <strong className="text-slate-900 font-mono">${p.totalEligibleExpenditure.toLocaleString()}</strong></span>
                  {p.irdApprovalReference && (
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> IRD Ref: {p.irdApprovalReference}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Expenditure Logs */}
      {activeTab === 'EXPENDITURE' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Itemised R&D Expense Audit Trail</h3>
            <button
              type="button"
              onClick={() => setShowAddExpenseModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log R&D Cost Item
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Gross Cost</th>
                  <th className="py-3 px-4 text-center">Eligibility %</th>
                  <th className="py-3 px-4 text-right">Eligible Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {expenditures.map((e) => {
                  const proj = projects.find((p) => p.id === e.projectId);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-slate-500">{e.date}</td>
                      <td className="py-3 px-4 font-bold text-indigo-700">{proj?.code || 'RD-AI'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{e.description}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">${e.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{e.eligibilityPercentage}%</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-indigo-900">
                        ${e.eligibleAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: IRD Supplementary Return IR1042 */}
      {activeTab === 'IRD_CLAIM' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-black text-indigo-700 uppercase tracking-widest block">Inland Revenue Department (IRD)</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">IR1042 R&D Tax Incentive Supplementary Schedule</h2>
              <p className="text-xs text-slate-500 mt-1">Tax Year Ending 31 March 2026</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-800 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export IRD Schedule (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">Taxpayer Details</span>
              <div className="flex justify-between text-slate-600">
                <span>Legal Entity Name:</span>
                <span className="font-bold text-slate-900">{appState.companySettings.legalName || 'Kiwi Enterprise Ltd'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IRD Number:</span>
                <span className="font-mono font-bold text-slate-900">{appState.companySettings.irdNumber || '123-456-789'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>NZBN:</span>
                <span className="font-mono text-slate-900">{appState.companySettings.nzbn || '9429000000000'}</span>
              </div>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-2">
              <span className="font-bold text-indigo-900 uppercase tracking-wider block">RDTI Summary Calculation</span>
              <div className="flex justify-between text-slate-700">
                <span>Total Core & Supporting R&D Expenditure:</span>
                <span className="font-mono font-bold">${totalRndExpenditure.toLocaleString()} NZD</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Minimum Threshold ($50,000):</span>
                <span className="font-bold text-emerald-700">PASS ✓</span>
              </div>
              <div className="flex justify-between text-base font-black text-indigo-950 pt-2 border-t border-indigo-200">
                <span>15% Tax Credit Receivable (Box 12):</span>
                <span className="font-mono text-indigo-700">${totalTaxCredit.toLocaleString()} NZD</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-2">Detailed Project Schedule for IR1042 Attachment</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Project Title</th>
                    <th className="py-2.5 px-3">Uncertainty Field</th>
                    <th className="py-2.5 px-3 text-right">Eligible Spend</th>
                    <th className="py-2.5 px-3 text-right">15% Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{p.projectName}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">{p.scientificUncertainty}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">${p.totalEligibleExpenditure.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">${p.estimatedTaxCredit15Pct.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" /> Register R&D Project for RDTI
            </h3>

            <form onSubmit={handleAddProject} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Quantum Graph Encryption Engine"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Code</label>
                <input
                  type="text"
                  placeholder="e.g., RD-QUANTUM-01"
                  value={projCode}
                  onChange={(e) => setProjCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scientific or Technological Uncertainty</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe why the solution was not readily deducible by a competent professional in the field..."
                  value={projUncertainty}
                  onChange={(e) => setProjUncertainty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personnel ($)</label>
                  <input
                    type="number"
                    value={projPersonnel}
                    onChange={(e) => setProjPersonnel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct ($)</label>
                  <input
                    type="number"
                    value={projDirect}
                    onChange={(e) => setProjDirect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subcontractor ($)</label>
                  <input
                    type="number"
                    value={projSubcontractor}
                    onChange={(e) => setProjSubcontractor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save R&D Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900">Log Itemised R&D Expense</h3>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select R&D Project</label>
                <select
                  value={expProjectId}
                  onChange={(e) => setExpProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GPU Cloud Instance Cluster"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">R&D Eligibility %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={expEligibility}
                    onChange={(e) => setExpEligibility(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
