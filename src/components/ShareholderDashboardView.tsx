import React, { useState } from 'react';
import {
  Users,
  Plus,
  TrendingUp,
  Percent,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Briefcase,
  Download,
} from 'lucide-react';
import { AppState, Shareholder, ShareholderCurrentAccountEntry, Dividend } from '../types';

interface ShareholderDashboardViewProps {
  appState: AppState;
  onUpdateShareholders?: (shareholders: Shareholder[]) => void;
  onUpdateScaEntries?: (entries: ShareholderCurrentAccountEntry[]) => void;
  onAddDividend?: (dividend: Dividend) => void;
}

export const ShareholderDashboardView: React.FC<ShareholderDashboardViewProps> = ({
  appState,
  onUpdateShareholders,
  onUpdateScaEntries,
  onAddDividend,
}) => {
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'CURRENT_ACCOUNTS' | 'DIVIDENDS'>('REGISTER');
  const [showAddShareholderModal, setShowAddShareholderModal] = useState(false);
  const [showAddScaEntryModal, setShowAddScaEntryModal] = useState(false);
  const [showDeclareDividendModal, setShowDeclareDividendModal] = useState(false);
  const [selectedDividendCert, setSelectedDividendCert] = useState<Dividend | null>(null);

  // Default Shareholders if empty
  const [shareholders, setShareholders] = useState<Shareholder[]>(
    appState.shareholders || [
      {
        id: 'SH-001',
        name: 'Johnathan Vance',
        irdNumber: '128-491-002',
        email: 'johnathan@kiwibusiness.co.nz',
        shareClass: 'Ordinary Class A',
        numberOfShares: 60,
        sharePercentage: 60,
        currentAccountBalance: 14500, // Positive = Credit (company owes Johnathan)
        fbtBenchmarkInterestRatePct: 8.41,
        isDirector: true,
      },
      {
        id: 'SH-002',
        name: 'Sarah Chen-Vance',
        irdNumber: '139-201-884',
        email: 'sarah@kiwibusiness.co.nz',
        shareClass: 'Ordinary Class A',
        numberOfShares: 40,
        sharePercentage: 40,
        currentAccountBalance: -3200, // Negative = Debit/Overdrawn (Shareholder owes company)
        fbtBenchmarkInterestRatePct: 8.41,
        isDirector: true,
      },
    ]
  );

  // Default SCA Entries
  const [scaEntries, setScaEntries] = useState<ShareholderCurrentAccountEntry[]>(
    appState.shareholderAccountEntries || [
      {
        id: 'SCA-LOG-001',
        shareholderId: 'SH-001',
        shareholderName: 'Johnathan Vance',
        date: '2026-06-15',
        description: 'Personal funds injected for capital equipment purchase',
        type: 'FUNDS_INJECTED',
        amount: 10000,
      },
      {
        id: 'SCA-LOG-002',
        shareholderId: 'SH-002',
        shareholderName: 'Sarah Chen-Vance',
        date: '2026-06-28',
        description: 'Owner drawing for private household expenses',
        type: 'DRAWING',
        amount: -3200,
      },
    ]
  );

  // Form States
  const [shName, setShName] = useState('');
  const [shIrd, setShIrd] = useState('');
  const [shEmail, setShEmail] = useState('');
  const [shClass, setShClass] = useState('Ordinary Class A');
  const [shShares, setShShares] = useState('50');

  // SCA Entry Form State
  const [scaShId, setScaShId] = useState(shareholders[0]?.id || '');
  const [scaDate, setScaDate] = useState(new Date().toISOString().split('T')[0]);
  const [scaDesc, setScaDesc] = useState('');
  const [scaType, setScaType] = useState<ShareholderCurrentAccountEntry['type']>('DRAWING');
  const [scaAmount, setScaAmount] = useState('1000');

  // Dividend Form State
  const [divShId, setDivShId] = useState(shareholders[0]?.id || '');
  const [divNetAmount, setDivNetAmount] = useState('10000');
  const [divDate, setDivDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const totalShares = shareholders.reduce((acc, s) => acc + s.numberOfShares, 0);
  const netScaBalance = shareholders.reduce((acc, s) => acc + s.currentAccountBalance, 0);
  const overdrawnShareholders = shareholders.filter((s) => s.currentAccountBalance < 0);

  const handleAddShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(shShares) || 1;
    const newTotalShares = totalShares + count;

    const newSh: Shareholder = {
      id: `SH-${Date.now()}`,
      name: shName,
      irdNumber: shIrd,
      email: shEmail,
      shareClass: shClass,
      numberOfShares: count,
      sharePercentage: (count / newTotalShares) * 100,
      currentAccountBalance: 0,
      fbtBenchmarkInterestRatePct: 8.41,
      isDirector: true,
    };

    const updated = [...shareholders, newSh].map((s) => ({
      ...s,
      sharePercentage: (s.numberOfShares / newTotalShares) * 100,
    }));

    setShareholders(updated);
    if (onUpdateShareholders) onUpdateShareholders(updated);
    setShowAddShareholderModal(false);
    setShName('');
    setShIrd('');
  };

  const handleAddScaEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSh = shareholders.find((s) => s.id === scaShId);
    if (!targetSh) return;

    const rawAmt = parseFloat(scaAmount) || 0;
    // Drawings & Interest Charged reduce balance (negative or subtracted), Funds injected & Dividend credits increase balance
    const effectiveAmt = scaType === 'DRAWING' || scaType === 'INTEREST_CHARGED' ? -Math.abs(rawAmt) : Math.abs(rawAmt);

    const newEntry: ShareholderCurrentAccountEntry = {
      id: `SCA-${Date.now()}`,
      shareholderId: targetSh.id,
      shareholderName: targetSh.name,
      date: scaDate,
      description: scaDesc,
      type: scaType,
      amount: effectiveAmt,
    };

    // Update shareholder balance
    const updatedShs = shareholders.map((s) =>
      s.id === targetSh.id ? { ...s, currentAccountBalance: s.currentAccountBalance + effectiveAmt } : s
    );

    setShareholders(updatedShs);
    if (onUpdateShareholders) onUpdateShareholders(updatedShs);

    const updatedEntries = [newEntry, ...scaEntries];
    setScaEntries(updatedEntries);
    if (onUpdateScaEntries) onUpdateScaEntries(updatedEntries);

    setShowAddScaEntryModal(false);
    setScaDesc('');
  };

  const handleDeclareDividend = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSh = shareholders.find((s) => s.id === divShId);
    if (!targetSh) return;

    const netDiv = parseFloat(divNetAmount) || 0;
    // NZ Tax Rule: 28% Company Tax Imputation Credit = Net * (0.28 / 0.72)
    const imputationCredits = netDiv * (0.28 / 0.72);
    const grossDiv = netDiv + imputationCredits;
    // 33% Total Resident Withholding Tax required; 5% RWT top-up = Gross * 0.05
    const rwtDeducted = grossDiv * 0.05;

    const newDiv: Dividend = {
      id: `DIV-${Date.now()}`,
      date: divDate,
      companyName: appState.companySettings.legalName || 'Kiwi Enterprise Ltd',
      shareholderName: targetSh.name,
      netDividend: netDiv,
      imputationCredits: imputationCredits,
      rwtDeducted: rwtDeducted,
      grossDividend: grossDiv,
      paymentDate: divDate,
      certificateNumber: `DIV-CERT-2026-${Math.floor(100 + Math.random() * 900)}`,
    };

    if (onAddDividend) onAddDividend(newDiv);
    setSelectedDividendCert(newDiv);
    setShowDeclareDividendModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-teal-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>NZ Companies Act & IRD Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Shareholder Dashboard & Current Accounts</h1>
            <p className="text-xs text-teal-200/80 max-w-2xl leading-relaxed">
              Manage shareholdings, track Shareholder Current Accounts (SCA), enforce IRD FBT benchmark interest rules on debit balances, and generate Imputation Credit Dividend Certificates.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeclareDividendModal(true)}
              className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <TrendingUp className="w-4 h-4" /> Declare Dividend
            </button>
            <button
              type="button"
              onClick={() => setShowAddShareholderModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Shareholder
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-teal-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-teal-200">Total Issued Shares</span>
            <div className="text-2xl font-black font-mono mt-1">{totalShares} Shares</div>
            <span className="text-[10px] text-teal-300">{shareholders.length} Registered Shareholders</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-teal-200">Net SCA Balance</span>
            <div className={`text-2xl font-black font-mono mt-1 ${netScaBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${netScaBalance.toLocaleString()} NZD
            </div>
            <span className="text-[10px] text-teal-300">
              {netScaBalance >= 0 ? 'Company owes shareholders' : 'Shareholders owe company'}
            </span>
          </div>

          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
            <span className="text-[11px] font-medium text-amber-300">IRD FBT Benchmark Rate</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">8.41% p.a.</div>
            <span className="text-[10px] text-amber-300/80">Applies to overdrawn debit balances</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-teal-200">Imputation Credit Ratio</span>
            <div className="text-2xl font-black font-mono text-teal-300 mt-1">28:72 Max</div>
            <span className="text-[10px] text-teal-300">28% Full Company Tax Credit</span>
          </div>
        </div>
      </div>

      {/* Warning for overdrawn accounts */}
      {overdrawnShareholders.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase tracking-wide">IRD FBT / Deemed Dividend Alert</span>
            <p>
              {overdrawnShareholders.map((s) => s.name).join(', ')} has an overdrawn Shareholder Current Account balance.
              Inward IRD rules require charging the IRD benchmark interest rate (8.41% p.a.) or treating uncharged interest as Fringe Benefit / Deemed Dividend.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('REGISTER')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'REGISTER'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Share Register
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CURRENT_ACCOUNTS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'CURRENT_ACCOUNTS'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Current Account Ledger (SCA)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DIVIDENDS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'DIVIDENDS'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Dividend Distributions ({appState.dividends.length})
        </button>
      </div>

      {/* Tab 1: Share Register */}
      {activeTab === 'REGISTER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareholders.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">IRD #: {s.irdNumber}</p>
                </div>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-bold">
                  {s.sharePercentage.toFixed(1)}% Ownership
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block">Share Class:</span>
                  <span className="font-bold text-slate-800">{s.shareClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Shares Held:</span>
                  <span className="font-mono font-extrabold text-slate-900">{s.numberOfShares} Shares</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Current Account (SCA):</span>
                <span
                  className={`font-mono font-black text-sm ${
                    s.currentAccountBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {s.currentAccountBalance >= 0 ? '+' : ''}${s.currentAccountBalance.toLocaleString()} NZD
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Current Account Ledger */}
      {activeTab === 'CURRENT_ACCOUNTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shareholder Current Account Movement Log</h3>
            <button
              type="button"
              onClick={() => setShowAddScaEntryModal(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log Drawing / Funds Injected
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Shareholder</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {scaEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500">{e.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{e.shareholderName}</td>
                    <td className="py-3 px-4 text-slate-700">{e.description}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          e.amount >= 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {e.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={e.amount >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {e.amount >= 0 ? '+' : ''}${e.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Dividends */}
      {activeTab === 'DIVIDENDS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Shareholder</th>
                  <th className="py-3 px-4 text-right">Net Dividend</th>
                  <th className="py-3 px-4 text-right">Imputation Credits (28%)</th>
                  <th className="py-3 px-4 text-right">Gross Dividend</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appState.dividends.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500">{d.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{d.shareholderName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">${d.netDividend.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-teal-700">${d.imputationCredits.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-950">${d.grossDividend.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDividendCert(d)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700 flex items-center gap-1 mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5" /> Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Shareholder Modal */}
      {showAddShareholderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" /> Add New Shareholder
            </h3>
            <form onSubmit={handleAddShareholder} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input type="text" required value={shName} onChange={(e) => setShName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">IRD Number</label>
                <input type="text" required value={shIrd} onChange={(e) => setShIrd(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" required value={shEmail} onChange={(e) => setShEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Share Class</label>
                  <select value={shClass} onChange={(e) => setShClass(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                    <option value="Ordinary Class A">Ordinary Class A</option>
                    <option value="Ordinary Class B">Ordinary Class B</option>
                    <option value="Preference">Preference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Number of Shares</label>
                  <input type="number" required value={shShares} onChange={(e) => setShShares(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddShareholderModal(false)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700">Add Shareholder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SCA Entry Modal */}
      {showAddScaEntryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" /> Log SCA Drawing / Funds
            </h3>
            <form onSubmit={handleAddScaEntry} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shareholder</label>
                <select value={scaShId} onChange={(e) => setScaShId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                  {shareholders.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input type="date" required value={scaDate} onChange={(e) => setScaDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input type="text" required value={scaDesc} onChange={(e) => setScaDesc(e.target.value)} placeholder="e.g. Owner drawing for private expenses" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Type</label>
                  <select value={scaType} onChange={(e) => setScaType(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                    <option value="DRAWING">Drawing (Decrease)</option>
                    <option value="FUNDS_INJECTED">Funds Injected (Increase)</option>
                    <option value="INTEREST_CHARGED">Interest Charged (Decrease)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount ($ NZD)</label>
                  <input type="number" required value={scaAmount} onChange={(e) => setScaAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddScaEntryModal(false)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Declare Dividend Modal */}
      {showDeclareDividendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" /> Declare Dividend & Attach Imputation Credits
            </h3>

            <form onSubmit={handleDeclareDividend} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shareholder</label>
                <select
                  value={divShId}
                  onChange={(e) => setDivShId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {shareholders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.sharePercentage}% Shares)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Net Dividend Amount ($ NZD)</label>
                <input
                  type="number"
                  required
                  value={divNetAmount}
                  onChange={(e) => setDivNetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={divDate}
                  onChange={(e) => setDivDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1 text-slate-700">
                <span className="font-bold text-teal-900 block">NZ Tax Calculation Preview:</span>
                <div className="flex justify-between">
                  <span>Imputation Credits (28%):</span>
                  <span className="font-mono font-bold">${((parseFloat(divNetAmount) || 0) * (0.28 / 0.72)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Dividend:</span>
                  <span className="font-mono font-bold">${((parseFloat(divNetAmount) || 0) / 0.72).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeclareDividendModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700">
                  Issue Dividend Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dividend Certificate Modal */}
      {selectedDividendCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-900 space-y-4 border border-slate-300">
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-black uppercase text-teal-700 tracking-widest block">Inland Revenue IR4J Compliant</span>
                <h3 className="text-xl font-black">DIVIDEND STATEMENT</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{selectedDividendCert.certificateNumber}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company Name:</span>
                <span className="font-bold">{selectedDividendCert.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shareholder:</span>
                <span className="font-bold text-indigo-900">{selectedDividendCert.shareholderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-mono">{selectedDividendCert.paymentDate}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-slate-600">Net Dividend Paid:</span>
                <span className="font-bold">${selectedDividendCert.netDividend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-teal-800">
                <span className="font-sans">Imputation Credits Attached (28%):</span>
                <span className="font-bold">${selectedDividendCert.imputationCredits.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">RWT Deducted (5%):</span>
                <span className="font-bold">${selectedDividendCert.rwtDeducted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300 font-sans">
                <span>Gross Dividend Total:</span>
                <span className="font-mono">${selectedDividendCert.grossDividend.toFixed(2)} NZD</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setSelectedDividendCert(null)}
                className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
