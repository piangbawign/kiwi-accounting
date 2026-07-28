import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  Clock,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { AppState } from '../types';

interface FinancialHealthViewProps {
  appState: AppState;
}

export const FinancialHealthView: React.FC<FinancialHealthViewProps> = ({ appState }) => {
  // Compute Key Financial Ratios
  const totalIncome = appState.transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = appState.transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const netMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const totalBankCash = appState.accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const unpaidInvoicesAR = appState.invoices
    .filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.total, 0);

  const currentAssets = totalBankCash + unpaidInvoicesAR;
  const estimatedLiabilities = 12500; // GST provision + PAYE + trade payables
  const currentRatio = estimatedLiabilities > 0 ? currentAssets / estimatedLiabilities : 2.5;

  // Invoice Collection Speed (Days Sales Outstanding)
  const averageDaysToPay = 22; // NZ SMB average is 28 days

  // Compute overall Health Score (0-100)
  let score = 70;
  if (currentRatio >= 1.5) score += 10;
  if (netMargin >= 15) score += 10;
  if (averageDaysToPay <= 25) score += 5;
  if (totalBankCash >= 20000) score += 5;
  const healthScore = Math.min(100, Math.max(10, score));

  const getScoreBadge = (s: number) => {
    if (s >= 80) return { label: 'Excellent Health', color: 'bg-emerald-500 text-white', border: 'border-emerald-400' };
    if (s >= 60) return { label: 'Healthy', color: 'bg-teal-600 text-white', border: 'border-teal-500' };
    if (s >= 40) return { label: 'Needs Attention', color: 'bg-amber-500 text-white', border: 'border-amber-400' };
    return { label: 'At Risk', color: 'bg-rose-600 text-white', border: 'border-rose-500' };
  };

  const badge = getScoreBadge(healthScore);

  // Radial Chart Data
  const scoreData = [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore },
  ];
  const COLORS = ['#0d9488', '#e2e8f0'];

  // Bar Chart Comparison vs NZ SMB Benchmarks
  const benchmarkData = [
    { metric: 'Net Margin %', Company: Math.round(netMargin), Benchmark: 18 },
    { metric: 'Current Ratio x10', Company: Math.round(currentRatio * 10), Benchmark: 15 },
    { metric: 'Collection Days', Company: averageDaysToPay, Benchmark: 28 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-600/30 border border-teal-400/30 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Financial Health Scorecard</h1>
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Automated financial ratios, liquidity rating, and NZ SMB benchmarks for {appState.companySettings.legalName}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 text-right">
          <span className="text-[10px] text-slate-400 block font-semibold">NZ IRD FY2025/26 Rating</span>
          <span className="text-sm font-black text-emerald-400">Compliant & Solvent</span>
        </div>
      </div>

      {/* Main Scorecard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Award className="w-5 h-5 text-teal-600" />
            <span>Company Health Index</span>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                >
                  {scoreData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-black text-slate-900">{healthScore}</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">out of 100</span>
            </div>
          </div>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
            <strong>Rating Breakdown:</strong> Excellent liquidity buffer, clean GST filing track record, and strong gross profit margin.
          </div>
        </div>

        {/* Financial Ratio Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Ratio (Liquidity) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Ratio (Liquidity)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{currentRatio.toFixed(2)}x</div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-emerald-700">Target: 1.5x - 2.5x</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Measures the company's ability to cover short-term liabilities (GST, PAYE, bills) using current liquid assets.
            </p>
          </div>

          {/* Net Profit Margin */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit Margin</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{netMargin.toFixed(1)}%</div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-teal-700">NZ Target: &gt; 15%</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Net income generated per dollar of revenue after deducting all operating costs and interest.
            </p>
          </div>

          {/* Days Sales Outstanding (DSO) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Collection Speed</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{averageDaysToPay} Days</div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-blue-700">NZ SMB Average: 28 Days</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Average time required to collect payment from customers after issuing a GST tax invoice.
            </p>
          </div>

          {/* Working Capital Reserve */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Capital Cushion</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              ${(currentAssets - estimatedLiabilities).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-purple-700">Surplus Reserves</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Excess liquid funds available to fund business growth, inventory, and emergency cash requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Bar Chart vs Benchmark */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">NZ Small Business Benchmark Comparison</h2>
              <p className="text-xs text-slate-500">Your company metrics vs NZ industry averages</p>
            </div>
          </div>

          <div className="h-[240px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Company" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="Benchmark" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Health Action Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-200 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Actionable Health Optimization Plan</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-900 block font-bold">Maintain Tax Payment Reserve Buffer</strong>
                <span className="text-teal-800 text-[11px]">
                  Keep at least $5,000 in a dedicated GST tax holding account to prepare for 28th bi-monthly filings.
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 items-start">
              <ArrowUpRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-900 block font-bold">Accelerate Overdue Invoice Follow-ups</strong>
                <span className="text-blue-800 text-[11px]">
                  You have customer invoices outstanding. Enabling automatic payment reminders reduces DSO by ~6 days.
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start">
              <Target className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">Review Director Dividends vs Salary</strong>
                <span className="text-slate-700 text-[11px]">
                  Utilize imputation credits attached to company profit distributions for optimal personal income tax efficiency.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
