import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  LineChart as LineIcon,
  Filter,
  Download,
  Calendar,
  FolderGit2,
  DollarSign,
  Percent,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Transaction, Account, Project } from '../types';

interface DataVisualizationViewProps {
  transactions: Transaction[];
  accounts: Account[];
  projects: Project[];
}

const COLOR_PALETTE = [
  '#0f766e', // Teal
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#ea580c', // Orange
  '#16a34a', // Green
  '#0284c7', // Sky
  '#4f46e5', // Indigo
  '#d97706', // Amber
  '#e11d48', // Rose
];

export const DataVisualizationView: React.FC<DataVisualizationViewProps> = ({
  transactions,
  accounts,
  projects,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'YTD' | 'LAST_6_MOS'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [activeChartTab, setActiveChartTab] = useState<'OVERVIEW' | 'EXPENSES' | 'PROJECTS' | 'CASHFLOW'>('OVERVIEW');

  // Filter transactions based on selection
  const filteredTx = transactions.filter((t) => {
    if (selectedProjectId !== 'ALL' && t.projectId !== selectedProjectId) return false;
    return true;
  });

  // Calculate High Level Metrics
  const incomeTx = filteredTx.filter((t) => t.type === 'INCOME');
  const expenseTx = filteredTx.filter((t) => t.type === 'EXPENSE');

  const totalIncome = incomeTx.reduce((sum, t) => sum + (t.amount - t.gstAmount), 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + (t.amount - t.gstAmount), 0);
  const netProfit = totalIncome - totalExpense;
  const netMarginPct = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // 1. Expense Breakdown by Category Data
  const expenseCategoryMap: { [cat: string]: number } = {};
  expenseTx.forEach((t) => {
    const amountExGst = t.amount - t.gstAmount;
    expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + amountExGst;
  });

  const expensePieData = Object.entries(expenseCategoryMap).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  // 2. Monthly Trend Data
  const monthMap: { [month: string]: { month: string; Income: number; Expense: number; NetProfit: number } } = {};

  filteredTx.forEach((t) => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { month: monthKey, Income: 0, Expense: 0, NetProfit: 0 };
    }
    const valExGst = t.amount - t.gstAmount;
    if (t.type === 'INCOME') {
      monthMap[monthKey].Income += valExGst;
    } else if (t.type === 'EXPENSE') {
      monthMap[monthKey].Expense += valExGst;
    }
    monthMap[monthKey].NetProfit = monthMap[monthKey].Income - monthMap[monthKey].Expense;
  });

  const monthlyBarData = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

  // 3. Project Profitability Data
  const projectChartData = projects.map((p) => {
    const pTx = transactions.filter((t) => t.projectId === p.id);
    const pInc = pTx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + (t.amount - t.gstAmount), 0);
    const pExp = pTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + (t.amount - t.gstAmount), 0);
    return {
      name: p.name,
      Revenue: Number(pInc.toFixed(2)),
      Expense: Number(pExp.toFixed(2)),
      Profit: Number((pInc - pExp).toFixed(2)),
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Interactive Financial Data Visualization</h2>
              <p className="text-xs text-slate-500">
                Visual analytics, category breakdown donut charts, project margins, and cash flow trajectory
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Projects Combined</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveChartTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeChartTab === 'OVERVIEW' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveChartTab('EXPENSES')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeChartTab === 'EXPENSES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Expense Pie
            </button>
            <button
              onClick={() => setActiveChartTab('PROJECTS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeChartTab === 'PROJECTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Projects
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">${totalIncome.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Excl. GST (Output Tax)</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">${totalExpense.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Excl. GST (Input Tax Credit)</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Operating Profit</p>
            <p className={`text-xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              ${netProfit.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Taxable Base Earnings</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit Margin</p>
            <p className="text-xl font-extrabold text-indigo-700 mt-1">{netMarginPct.toFixed(1)}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Business Efficiency Score</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Percent className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Main Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Monthly Revenue vs Expense Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" /> Monthly Financial Performance
              </h3>
              <p className="text-xs text-slate-400">Comparison of Revenue vs Expense vs Net Profit by Month</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)} NZD`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Income" name="Revenue ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" name="Expenses ($)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="NetProfit" name="Net Profit ($)" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Interactive Expense Breakdown Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" /> Expense Category Slices
              </h3>
              <p className="text-xs text-slate-400">Breakdown of operating costs by IRD category</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {expensePieData.length === 0 ? (
              <p className="text-xs text-slate-400">No expense entries available for pie visualization.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Category Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Project Profitability Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-teal-600" /> Project Job Profitability Analysis
            </h3>
            <p className="text-xs text-slate-400">Compare earnings, costs, and profit margins across client tags</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toFixed(2)} NZD`, '']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
