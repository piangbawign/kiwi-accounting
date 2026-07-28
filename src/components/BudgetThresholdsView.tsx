import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  Bell,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Info,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AppState, CategoryBudget } from '../types';

interface BudgetThresholdsViewProps {
  appState: AppState;
  onUpdateBudgets: (newBudgets: CategoryBudget[]) => void;
}

export const BudgetThresholdsView: React.FC<BudgetThresholdsViewProps> = ({
  appState,
  onUpdateBudgets,
}) => {
  const [budgets, setBudgets] = useState<CategoryBudget[]>(appState.budgets || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryBudget | null>(null);

  // Modal Form State
  const [formCategory, setFormCategory] = useState('');
  const [formLimit, setFormLimit] = useState('500');
  const [formThreshold, setFormThreshold] = useState('80');

  // Compute actual spending per category from current transactions
  const categorySpending: Record<string, number> = {};
  appState.transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const cat = t.category || 'Uncategorized';
      categorySpending[cat] = (categorySpending[cat] || 0) + t.amount;
    });

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + (categorySpending[b.category] || 0), 0);

  // Status counters
  const overBudgetCount = budgets.filter((b) => (categorySpending[b.category] || 0) > b.monthlyLimit).length;
  const nearThresholdCount = budgets.filter((b) => {
    const spent = categorySpending[b.category] || 0;
    const threshold = b.alertThresholdPct || 80;
    const pct = (spent / b.monthlyLimit) * 100;
    return pct >= threshold && pct <= 100;
  }).length;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory.trim() || parseFloat(formLimit) <= 0) return;

    const limitVal = parseFloat(formLimit) || 0;
    const thresholdVal = parseFloat(formThreshold) || 80;

    let updated: CategoryBudget[];
    const existingIndex = budgets.findIndex(
      (b) => b.category.toLowerCase() === formCategory.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      updated = [...budgets];
      updated[existingIndex] = {
        category: formCategory.trim(),
        monthlyLimit: limitVal,
        alertThresholdPct: thresholdVal,
      };
    } else {
      updated = [
        ...budgets,
        {
          category: formCategory.trim(),
          monthlyLimit: limitVal,
          alertThresholdPct: thresholdVal,
        },
      ];
    }

    setBudgets(updated);
    onUpdateBudgets(updated);
    setShowAddModal(false);
    setEditingCategory(null);
    setFormCategory('');
    setFormLimit('500');
    setFormThreshold('80');
  };

  const handleDeleteBudget = (catName: string) => {
    const updated = budgets.filter((b) => b.category !== catName);
    setBudgets(updated);
    onUpdateBudgets(updated);
  };

  const handleOpenEdit = (b: CategoryBudget) => {
    setEditingCategory(b);
    setFormCategory(b.category);
    setFormLimit(b.monthlyLimit.toString());
    setFormThreshold((b.alertThresholdPct || 80).toString());
    setShowAddModal(true);
  };

  // Get list of distinct expense categories present in transactions not yet budgeted
  const existingCategories = new Set(budgets.map((b) => b.category.toLowerCase()));
  const unbudgetedCategories = Object.keys(categorySpending).filter(
    (cat) => !existingCategories.has(cat.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <Sliders className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Category Budget Thresholds & Alerts</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                Live Monitoring
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Set monthly spending thresholds, monitor real-time utilization, and get instant over-budget warning alerts.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setFormCategory('');
            setFormLimit('500');
            setFormThreshold('80');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          Set Budget Threshold
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Budget</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">${totalBudgetLimit.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-500 mt-1">{budgets.length} Category Limits Defined</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <PieChartIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Actual Spent</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">${totalBudgetSpent.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalBudgetLimit > 0 ? `${((totalBudgetSpent / totalBudgetLimit) * 100).toFixed(1)}% of total budget` : '0%'}
            </p>
          </div>
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Near Limit Warning (&gt;80%)</p>
            <p className={`text-2xl font-bold mt-1 ${nearThresholdCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {nearThresholdCount} {nearThresholdCount === 1 ? 'Category' : 'Categories'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Approaching alert threshold</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceeded / Over Budget</p>
            <p className={`text-2xl font-bold mt-1 ${overBudgetCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {overBudgetCount} {overBudgetCount === 1 ? 'Category' : 'Categories'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Requires spending control</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Budget Thresholds List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Category Spending Threshold Progress</h2>
            <p className="text-xs text-slate-500">Live comparison of logged expense transactions against configured budget thresholds.</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{budgets.length} Active Budgets</span>
        </div>

        <div className="divide-y divide-slate-100">
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Sliders className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No budget thresholds configured yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-xs font-semibold text-amber-600 hover:underline"
              >
                + Set up your first category budget
              </button>
            </div>
          ) : (
            budgets.map((b) => {
              const spent = categorySpending[b.category] || 0;
              const thresholdPct = b.alertThresholdPct || 80;
              const usagePct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
              const isOver = spent > b.monthlyLimit;
              const isNear = usagePct >= thresholdPct && !isOver;

              let barColor = 'bg-emerald-500';
              let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              let statusLabel = 'Within Budget';

              if (isOver) {
                barColor = 'bg-rose-500';
                badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
                statusLabel = 'OVER BUDGET ALERT';
              } else if (isNear) {
                barColor = 'bg-amber-500';
                badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
                statusLabel = `Near Limit (>${thresholdPct}%)`;
              }

              return (
                <div key={b.category} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-sm">{b.category}</span>
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${badgeBg}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <div>
                        Spent: <span className="font-bold text-slate-900">${spent.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-slate-300">|</div>
                      <div>
                        Limit: <span className="font-bold text-slate-900">${b.monthlyLimit.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-slate-300">|</div>
                      <div>
                        Threshold Alert: <span className="font-bold text-amber-700">{thresholdPct}%</span>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800"
                          title="Edit Budget Threshold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(b.category)}
                          className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(100, usagePct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                      <span>{usagePct.toFixed(1)}% Used</span>
                      <span>
                        {isOver
                          ? `$${(spent - b.monthlyLimit).toFixed(2)} Exceeded`
                          : `$${(b.monthlyLimit - spent).toFixed(2)} Remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Unbudgeted categories section */}
      {unbudgetedCategories.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Unbudgeted Expense Categories Detected in Bookkeeping
          </div>
          <p className="text-xs text-slate-500">
            The following categories have active expenses but no configured budget threshold yet.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {unbudgetedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setEditingCategory(null);
                  setFormCategory(cat);
                  setFormLimit('500');
                  setFormThreshold('80');
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50 text-slate-700 font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                {cat} (${(categorySpending[cat] || 0).toFixed(0)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Budget Threshold */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingCategory ? 'Edit Budget Threshold' : 'Configure New Budget Threshold'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Expense Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g., Subscriptions, Facilities, Youth Supplies"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Monthly Budget Limit ($ NZD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    required
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Alert Trigger Threshold (% of Budget)
                </label>
                <select
                  value={formThreshold}
                  onChange={(e) => setFormThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium bg-white"
                >
                  <option value="50">50% - Early Warning</option>
                  <option value="75">75% - Moderate Limit</option>
                  <option value="80">80% - Standard IRD & NGO Alert (Recommended)</option>
                  <option value="90">90% - Strict High Threshold</option>
                  <option value="100">100% - Alert Only When Exhausted</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  An alert notification will trigger when category expenses cross {formThreshold}% of the limit.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Save Budget Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
