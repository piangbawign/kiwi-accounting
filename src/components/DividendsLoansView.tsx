import React, { useState } from 'react';
import {
  Coins,
  Building,
  Plus,
  Landmark,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  PieChart,
  Trash2,
} from 'lucide-react';
import { DividendRecord, LoanRecord, Account, Transaction } from '../types';
import { calculateNZDividend } from '../services/nzTaxEngine';

interface DividendsLoansViewProps {
  dividends: DividendRecord[];
  loans: LoanRecord[];
  accounts: Account[];
  onAddDividend: (div: Omit<DividendRecord, 'id'>) => void;
  onAddLoan: (loan: Omit<LoanRecord, 'id'>) => void;
  onDeleteDividend?: (id: string) => void;
  onDeleteLoan?: (id: string) => void;
}

export const DividendsLoansView: React.FC<DividendsLoansViewProps> = ({
  dividends,
  loans,
  accounts,
  onAddDividend,
  onAddLoan,
  onDeleteDividend,
  onDeleteLoan,
}) => {
  const [activeTab, setActiveTab] = useState<'DIVIDENDS' | 'LOANS'>('DIVIDENDS');

  // Dividend Form State
  const [netDiv, setNetDiv] = useState('');
  const [shareholder, setShareholder] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Loan Form State
  const [loanName, setLoanName] = useState('');
  const [lender, setLender] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');

  // Dividend Calc
  const netDivNum = parseFloat(netDiv) || 0;
  const divCalc = calculateNZDividend(netDivNum);

  const handleSaveDividend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareholder || netDivNum <= 0) return;

    onAddDividend({
      date: paymentDate,
      companyName: 'Small Business Company Limited',
      shareholderName: shareholder.trim(),
      netDividend: divCalc.netDividend,
      imputationCredits: divCalc.imputationCredits,
      grossDividend: divCalc.grossDividend,
      rwtDeducted: divCalc.rwtDeducted,
      paymentDate,
      certificateNumber: `DIV-${Date.now().toString().slice(-4)}`,
    });

    setNetDiv('');
    setShareholder('');
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName || !principal) return;

    const principalNum = parseFloat(principal) || 0;
    onAddLoan({
      name: loanName.trim(),
      lender: lender.trim(),
      totalPrincipal: principalNum,
      remainingBalance: principalNum,
      interestRatePct: parseFloat(interestRate) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
      startDate: new Date().toISOString().split('T')[0],
      termMonths: 360,
      loanType: 'BUSINESS_LOAN',
      taxDeductibleInterestPct: 100,
    });

    setLoanName('');
    setLender('');
    setPrincipal('');
    setInterestRate('');
    setMonthlyPayment('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              NZ Dividends Imputation & Business Loans
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
              28/72 Imputation Ratio
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Declare dividends with IRD imputation tax credits & manage mortgages and equipment loans
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('DIVIDENDS')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'DIVIDENDS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dividends & Imputation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOANS')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'LOANS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Loans & Mortgages ({loans.length})
          </button>
        </div>
      </div>

      {activeTab === 'DIVIDENDS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dividend Entry Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-teal-600" /> Declare Company Dividend
            </h3>

            <form onSubmit={handleSaveDividend} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shareholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., John Smith"
                  value={shareholder}
                  onChange={(e) => setShareholder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Net Cash Dividend ($ NZD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="7200.00"
                  value={netDiv}
                  onChange={(e) => setNetDiv(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-bold"
                />
              </div>

              {/* Instant Imputation Breakdown */}
              {netDivNum > 0 && (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Paid To Shareholder:</span>
                    <span className="font-mono font-bold">${divCalc.netDividend.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-teal-400">
                    <span>Imputation Credit (28/72):</span>
                    <span className="font-mono font-bold">${divCalc.imputationCredits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>RWT Deducted (33% Top Up):</span>
                    <span className="font-mono font-bold">${divCalc.rwtDeducted.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-slate-200">
                    <span>Gross Dividend:</span>
                    <span className="font-mono">${divCalc.grossDividend.toFixed(2)} NZD</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Record Dividend
              </button>
            </form>
          </div>

          {/* Dividend Records Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Issued Dividend Records</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Shareholder</th>
                    <th className="py-2.5 px-3 text-right">Net Dividend</th>
                    <th className="py-2.5 px-3 text-right">Imputation Credits</th>
                    <th className="py-2.5 px-3 text-right">RWT Deducted</th>
                    <th className="py-2.5 px-3 text-right">Gross Dividend</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dividends && dividends.length > 0 ? (
                    dividends.map((d) => {
                      const netVal = Number(d.netDividend ?? (d as any).netDividendPaid ?? 0);
                      const impVal = Number(d.imputationCredits ?? (d as any).imputationCreditsAttached ?? 0);
                      const rwtVal = Number(d.rwtDeducted ?? 0);
                      const grossVal = Number(d.grossDividend ?? 0);
                      const dateVal = d.paymentDate || d.date || '';

                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-600">{dateVal}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{d.shareholderName}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            ${netVal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-teal-700">
                            ${impVal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                            ${rwtVal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            ${grossVal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {onDeleteDividend && (
                              <button
                                type="button"
                                onClick={() => onDeleteDividend(d.id)}
                                title="Delete dividend record"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No dividend records declared yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'LOANS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Loan Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-teal-600" /> Add Loan / Mortgage
            </h3>

            <form onSubmit={handleSaveLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ANZ Commercial Mortgage"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lender / Bank</label>
                <input
                  type="text"
                  required
                  placeholder="ANZ / ASB / BNZ"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Principal ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="6.75"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Repayment ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1850.00"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Save Loan Account
              </button>
            </form>
          </div>

          {/* Active Loans List */}
          <div className="lg:col-span-2 space-y-4">
            {loans && loans.length > 0 ? (
              loans.map((loan) => {
                const ratePct = Number(loan.interestRatePct ?? (loan as any).interestRate ?? 0);
                const balanceVal = Number(loan.remainingBalance ?? (loan as any).currentBalance ?? loan.totalPrincipal ?? 0);
                const monthlyPayVal = Number(loan.monthlyPayment ?? 0);

                return (
                  <div key={loan.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                          {loan.lender}
                        </span>
                        <span className="text-xs font-mono font-bold text-teal-700">{ratePct}% p.a.</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{loan.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Monthly Repayment: ${monthlyPayVal.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold block">Outstanding Balance</span>
                        <span className="text-xl font-black text-slate-900 font-mono">
                          ${balanceVal.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {onDeleteLoan && (
                        <button
                          type="button"
                          onClick={() => onDeleteLoan(loan.id)}
                          title="Delete loan record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No active loans or mortgages recorded.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
