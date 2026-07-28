import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  PlusCircle,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { AppState } from '../types';

interface CashFlowForecastViewProps {
  appState: AppState;
}

export const CashFlowForecastView: React.FC<CashFlowForecastViewProps> = ({ appState }) => {
  const [forecastPeriod, setForecastPeriod] = useState<30 | 60 | 90>(60);
  const [scenario, setScenario] = useState<'EXPECTED' | 'OPTIMISTIC' | 'CONSERVATIVE'>('EXPECTED');
  const [customExpenseTitle, setCustomExpenseTitle] = useState('');
  const [customExpenseAmount, setCustomExpenseAmount] = useState('');
  const [plannedExpenses, setPlannedExpenses] = useState<{ id: string; title: string; amount: number }[]>([
    { id: '1', title: 'Planned IT Equipment Upgrade', amount: 3200 },
  ]);

  // Calculate current liquid cash across all bank accounts
  const totalCash = appState.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // Unpaid invoices (Accounts Receivable)
  const unpaidInvoices = appState.invoices.filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE');
  const totalAR = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Monthly recurring burn (payroll + recurring expenses)
  const monthlyPayroll = appState.employees.reduce((sum, emp) => sum + emp.grossWage, 0);
  const monthlyRecurringExpenses = appState.recurringTransactions
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalMonthlyOutflow = monthlyPayroll + monthlyRecurringExpenses + 2500; // estimated overheads
  const totalMonthlyInflow = appState.recurringTransactions
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0) + 12500; // baseline sales revenue

  // Apply Scenario Multiplier
  const scenarioMultiplier = scenario === 'OPTIMISTIC' ? 1.15 : scenario === 'CONSERVATIVE' ? 0.8 : 1.0;
  const totalPlannedCustomExpenses = plannedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Runway in months
  const monthlyNetBurn = (totalMonthlyOutflow + totalPlannedCustomExpenses / 3) - (totalMonthlyInflow * scenarioMultiplier);
  const runwayMonths = monthlyNetBurn <= 0 ? 24 : Math.max(0.5, (totalCash / monthlyNetBurn));

  // Generate 6-month projected monthly chart data
  const monthNames = ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'];
  let currentBalance = totalCash;

  const chartData = monthNames.map((m, idx) => {
    const projectedInflow = (totalMonthlyInflow * scenarioMultiplier) + (idx === 0 ? totalAR * 0.6 : idx === 1 ? totalAR * 0.4 : 0);
    const projectedOutflow = totalMonthlyOutflow + (idx === 1 ? totalPlannedCustomExpenses : 0);
    const netFlow = projectedInflow - projectedOutflow;
    currentBalance += netFlow;

    return {
      month: m,
      Inflow: Math.round(projectedInflow),
      Outflow: Math.round(projectedOutflow),
      'Closing Balance': Math.round(Math.max(0, currentBalance)),
    };
  });

  const handleAddPlannedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(customExpenseAmount);
    if (!customExpenseTitle.trim() || isNaN(num) || num <= 0) return;

    setPlannedExpenses((prev) => [...prev, { id: Date.now().toString(), title: customExpenseTitle, amount: num }]);
    setCustomExpenseTitle('');
    setCustomExpenseAmount('');
  };

  const handleRemovePlannedExpense = (id: string) => {
    setPlannedExpenses((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Predictive Cash Flow Forecast</h1>
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold rounded-full">
              NZD ($)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predict liquid reserves, cash runway, and upcoming capital obligations for Small Business Company Limited.
          </p>
        </div>

        {/* Forecast Period Selector */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setForecastPeriod(days as 30 | 60 | 90)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                forecastPeriod === days ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Cash */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Current Bank Cash</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">${totalCash.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          <p className="text-[11px] text-slate-500">Across {appState.accounts.length} active bank accounts</p>
        </div>

        {/* Accounts Receivable */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Pending Invoices (AR)</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">${totalAR.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          <p className="text-[11px] text-slate-500">{unpaidInvoices.length} outstanding customer invoices</p>
        </div>

        {/* Projected 60-Day Runway */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Cash Runway</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {runwayMonths >= 24 ? '24+ Months' : `${runwayMonths.toFixed(1)} Months`}
          </div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${runwayMonths >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {runwayMonths >= 6 ? 'Healthy Runway' : 'Watch Burn Rate'}
          </span>
        </div>

        {/* Monthly Net Position */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Monthly Net Cashflow</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className={`text-2xl font-black ${monthlyNetBurn <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {monthlyNetBurn <= 0 ? `+$${Math.abs(monthlyNetBurn).toLocaleString()}/mo` : `-$${monthlyNetBurn.toLocaleString()}/mo`}
          </div>
          <p className="text-[11px] text-slate-500">Based on {scenario.toLowerCase()} scenario modeling</p>
        </div>
      </div>

      {/* Main Forecast Chart & Scenario Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Projected 6-Month Cash Curve</h2>
              <p className="text-xs text-slate-500">Inflows vs Outflows and projected ending bank balance</p>
            </div>

            {/* Scenario Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setScenario('EXPECTED')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  scenario === 'EXPECTED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expected
              </button>
              <button
                type="button"
                onClick={() => setScenario('OPTIMISTIC')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  scenario === 'OPTIMISTIC' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                +15% Growth
              </button>
              <button
                type="button"
                onClick={() => setScenario('CONSERVATIVE')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  scenario === 'CONSERVATIVE' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                -20% Slow
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="Closing Balance" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Planned Capital Expenditures / Scenario Simulator */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Simulate Planned Outflows</span>
            </div>
            <p className="text-xs text-slate-500">Add upcoming equipment purchases or major bills to model the impact on cash flow:</p>

            {/* Form */}
            <form onSubmit={handleAddPlannedExpense} className="space-y-2">
              <input
                type="text"
                placeholder="Item name (e.g. New Vehicle Lease)"
                value={customExpenseTitle}
                onChange={(e) => setCustomExpenseTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={customExpenseAmount}
                  onChange={(e) => setCustomExpenseAmount(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {plannedExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-800 block">{exp.title}</span>
                    <span className="text-[10px] text-slate-500">Planned Capital Outlay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-600">-${exp.amount.toLocaleString('en-NZ')}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlannedExpense(exp.id)}
                      className="text-slate-400 hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IRD & Compliance Cash Alert Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Upcoming Tax Cash Obligations</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-amber-800 pl-5 list-disc">
              <li>
                <strong>GST 15% Payment Due:</strong> 28th of next month (Estimated ~$3,450.00).
              </li>
              <li>
                <strong>PAYE & Employer Superannuation:</strong> 20th of next month (~$1,220.00).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
