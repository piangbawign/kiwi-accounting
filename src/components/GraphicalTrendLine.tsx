import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  LineChart as LineChartIcon,
  Calendar,
  DollarSign,
  Info,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Transaction, Account } from '../types';

interface GraphicalTrendLineProps {
  transactions: Transaction[];
  accounts: Account[];
  title?: string;
  subtitle?: string;
}

export type TrendMetric = 'CASH_FLOW' | 'INCOME_VS_EXPENSE' | 'NET_PROFIT_CUMULATIVE' | 'GST_LIABILITY';
export type TimeFrame = '3_MONTHS' | '6_MONTHS' | 'FY2026_YTD' | '12_MONTHS';

export const GraphicalTrendLine: React.FC<GraphicalTrendLineProps> = ({
  transactions,
  accounts,
  title = 'Graphical Financial Trend Line',
  subtitle = 'Interactive visual trajectory of revenue, expenses, and cash position',
}) => {
  const [activeMetric, setActiveMetric] = useState<TrendMetric>('INCOME_VS_EXPENSE');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('6_MONTHS');
  const [showGradient, setShowGradient] = useState(true);

  // Calculate base total starting cash balance
  const currentTotalCash = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Group transactions by month
  const chartData = useMemo(() => {
    // Generate past 6 or 12 months buckets
    const monthsCount = timeFrame === '3_MONTHS' ? 3 : timeFrame === '6_MONTHS' ? 6 : 12;
    const now = new Date('2026-07-26'); // Current baseline date
    const monthlyBuckets: {
      [key: string]: {
        monthKey: string;
        label: string;
        income: number;
        expense: number;
        netProfit: number;
        gstCollected: number;
        gstPaid: number;
        cumulativeCash: number;
        cumulativeProfit: number;
      };
    } = {};

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearStr = d.getFullYear();
      const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const key = `${yearStr}-${monthStr}`;
      const label = d.toLocaleDateString('en-NZ', { month: 'short', year: '2-digit' });

      monthlyBuckets[key] = {
        monthKey: key,
        label,
        income: 0,
        expense: 0,
        netProfit: 0,
        gstCollected: 0,
        gstPaid: 0,
        cumulativeCash: 0,
        cumulativeProfit: 0,
      };
    }

    // Populate actual transaction values
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const monthKey = tx.date.substring(0, 7);
      if (monthlyBuckets[monthKey]) {
        if (tx.type === 'INCOME') {
          monthlyBuckets[monthKey].income += tx.amount;
          monthlyBuckets[monthKey].gstCollected += tx.gstAmount;
        } else if (tx.type === 'EXPENSE') {
          monthlyBuckets[monthKey].expense += tx.amount;
          monthlyBuckets[monthKey].gstPaid += tx.gstAmount;
        }
      }
    });

    // Calculate net profit & rolling cumulative values
    const bucketKeys = Object.keys(monthlyBuckets).sort();
    let runningNetProfit = 0;
    
    // Reverse estimate starting cash
    const totalPeriodNet = bucketKeys.reduce(
      (sum, k) => sum + (monthlyBuckets[k].income - monthlyBuckets[k].expense),
      0
    );
    let runningCash = currentTotalCash - totalPeriodNet;

    return bucketKeys.map((key) => {
      const b = monthlyBuckets[key];
      b.netProfit = b.income - b.expense;
      runningNetProfit += b.netProfit;
      runningCash += b.netProfit;
      b.cumulativeProfit = runningNetProfit;
      b.cumulativeCash = runningCash;
      return b;
    });
  }, [transactions, accounts, timeFrame, currentTotalCash]);

  // Highs & Lows summary
  const totalIncomePeriod = chartData.reduce((acc, d) => acc + d.income, 0);
  const totalExpensePeriod = chartData.reduce((acc, d) => acc + d.expense, 0);
  const netPeriodMargin = totalIncomePeriod - totalExpensePeriod;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center">
              <LineChartIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setTimeFrame('3_MONTHS')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeFrame === '3_MONTHS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeFrame('6_MONTHS')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeFrame === '6_MONTHS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeFrame('12_MONTHS')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeFrame === '12_MONTHS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              12M
            </button>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveMetric('INCOME_VS_EXPENSE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'INCOME_VS_EXPENSE' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income vs Expenses
            </button>
            <button
              onClick={() => setActiveMetric('CASH_FLOW')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'CASH_FLOW' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cash Position
            </button>
            <button
              onClick={() => setActiveMetric('NET_PROFIT_CUMULATIVE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'NET_PROFIT_CUMULATIVE' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Net Margin
            </button>
          </div>
        </div>
      </div>

      {/* Graphical Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[180px]">
                    <p className="font-bold text-teal-300 border-b border-slate-800 pb-1">{label}</p>
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4">
                        <span style={{ color: entry.color }} className="font-semibold">
                          {entry.name}:
                        </span>
                        <span className="font-mono font-bold">
                          ${Number(entry.value).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />

            {/* Render chart based on active metric */}
            {activeMetric === 'INCOME_VS_EXPENSE' && (
              <>
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Monthly Revenue ($)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={showGradient ? 1 : 0}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Operating Expense ($)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={showGradient ? 1 : 0}
                  fill="url(#expenseGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Period Profit ($)"
                  stroke="#0f172a"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#0f172a' }}
                />
              </>
            )}

            {activeMetric === 'CASH_FLOW' && (
              <Area
                type="monotone"
                dataKey="cumulativeCash"
                name="Total Bank Cash Balance ($)"
                stroke="#0d9488"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cashGrad)"
                dot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {activeMetric === 'NET_PROFIT_CUMULATIVE' && (
              <>
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Cumulative Net Profit YTD ($)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1' }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Micro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Revenue in Period</p>
            <p className="text-base font-black text-emerald-950">${totalIncomePeriod.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Total Expenses in Period</p>
            <p className="text-base font-black text-rose-950">${totalExpensePeriod.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
          </div>
          <TrendingDown className="w-5 h-5 text-rose-600" />
        </div>

        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Net Trend Margin</p>
            <p className={`text-base font-black ${netPeriodMargin >= 0 ? 'text-teal-800' : 'text-rose-700'}`}>
              ${netPeriodMargin.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-teal-600" />
        </div>
      </div>
    </div>
  );
};
