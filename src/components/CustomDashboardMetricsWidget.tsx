import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  PieChart,
  Sparkles,
  Check,
  X,
  Target,
} from 'lucide-react';
import { CustomDashboardMetric, Transaction } from '../types';

interface CustomDashboardMetricsWidgetProps {
  customMetrics: CustomDashboardMetric[];
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  cashBalance: number;
  onUpdateMetrics: (metrics: CustomDashboardMetric[]) => void;
}

export const CustomDashboardMetricsWidget: React.FC<CustomDashboardMetricsWidgetProps> = ({
  customMetrics,
  transactions,
  totalIncome,
  totalExpenses,
  cashBalance,
  onUpdateMetrics,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  // New metric form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formulaType, setFormulaType] = useState<CustomDashboardMetric['formulaType']>('OPERATING_EXPENSE_RATIO');
  const [unit, setUnit] = useState<CustomDashboardMetric['unit']>('PERCENTAGE');
  const [targetValue, setTargetValue] = useState<number>(50);
  const [colorTheme, setColorTheme] = useState<CustomDashboardMetric['colorTheme']>('teal');

  // Compute values for each metric
  const calculateMetricValue = (m: CustomDashboardMetric): number => {
    switch (m.formulaType) {
      case 'OPERATING_EXPENSE_RATIO':
        return totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
      case 'NET_PROFIT':
        return totalIncome - totalExpenses;
      case 'CASH_RUNWAY': {
        const monthlyBurn = totalExpenses > 0 ? totalExpenses / 12 : 5000;
        return monthlyBurn > 0 ? Math.round((cashBalance / monthlyBurn) * 30) : 180;
      }
      case 'REVENUE_PER_PROJECT':
        return totalIncome * 0.15;
      default:
        return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    }
  };

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newM: CustomDashboardMetric = {
      id: `cm-${Date.now()}`,
      title,
      description,
      formulaType,
      unit,
      targetValue,
      colorTheme,
      isVisible: true,
    };

    onUpdateMetrics([...customMetrics, newM]);
    setShowConfigModal(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteMetric = (id: string) => {
    onUpdateMetrics(customMetrics.filter((m) => m.id !== id));
  };

  const visibleMetrics = customMetrics.filter((m) => m.isVisible);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <PieChart className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Custom Formula Metrics & Ratios
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 rounded-xl text-[11px] font-bold border border-slate-200 transition-all flex items-center gap-1"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          Customize Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleMetrics.map((m) => {
          const val = calculateMetricValue(m);
          const isTargetMet = m.targetValue ? val <= m.targetValue : true;

          return (
            <div
              key={m.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all relative group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold text-slate-700">{m.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Target: {m.targetValue}{m.unit === 'PERCENTAGE' ? '%' : m.unit === 'DAYS' ? 'd' : ''}
                </span>
              </div>

              {m.description && (
                <p className="text-[10px] text-slate-400 mb-2">{m.description}</p>
              )}

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-black font-mono text-slate-900">
                  {m.unit === 'CURRENCY' && '$'}
                  {val.toLocaleString('en-NZ', { maximumFractionDigits: 1 })}
                  {m.unit === 'PERCENTAGE' && '%'}
                  {m.unit === 'DAYS' && ' Days'}
                </span>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                    isTargetMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <Target className="w-3 h-3" />
                  {isTargetMet ? 'On Track' : 'Review'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customize Metrics Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Configure Custom Dashboard Metrics
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Existing Metrics */}
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Metrics
              </span>
              {customMetrics.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <div>
                    <span>{m.title}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Formula: {m.formulaType}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMetric(m.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form to Add New Metric */}
            <form onSubmit={handleAddMetric} className="mt-4 space-y-3 text-xs pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Add Custom Metric Formula
              </span>
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Metric Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gross Profit Ratio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Formula Model</label>
                  <select
                    value={formulaType}
                    onChange={(e) => setFormulaType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="OPERATING_EXPENSE_RATIO">Operating Expense Ratio (%)</option>
                    <option value="NET_PROFIT">Net Profit ($)</option>
                    <option value="CASH_RUNWAY">Cash Runway (Days)</option>
                    <option value="REVENUE_PER_PROJECT">Project Revenue Average ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Unit Display</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="CURRENCY">Currency ($ NZD)</option>
                    <option value="DAYS">Days (d)</option>
                    <option value="RATIO">Ratio (x)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Target Benchmark Value</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-extrabold rounded-xl"
                >
                  Add Custom Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
