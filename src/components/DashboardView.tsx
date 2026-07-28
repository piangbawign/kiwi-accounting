import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  Percent,
  Calculator,
  Plus,
  Scan,
  FileSpreadsheet,
  FilePlus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Boxes,
  Repeat,
  X,
  PieChart,
  Check,
  HeartHandshake,
  Coins,
  ShieldCheck,
  Landmark,
  Users,
  Globe,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Account, Transaction, Invoice, CompanySettings, InventoryItem, RecurringTransaction, CustomDashboardMetric } from '../types';
import { GraphicalTrendLine } from './GraphicalTrendLine';
import { TaxQuickCalcWidget } from './TaxQuickCalcWidget';
import { IrdTooltip, IRD_DICTIONARY } from './IrdTooltip';
import { CustomDashboardMetricsWidget } from './CustomDashboardMetricsWidget';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  invoices: Invoice[];
  companySettings: CompanySettings;
  inventory?: InventoryItem[];
  recurringTransactions?: RecurringTransaction[];
  customMetrics?: CustomDashboardMetric[];
  onUpdateMetrics?: (metrics: CustomDashboardMetric[]) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenQuickAdd: () => void;
  activeEntityId?: string;
}

interface WidgetVisibility {
  kpis: boolean;
  quickActions: boolean;
  taxQuickCalc: boolean;
  inventoryAlerts: boolean;
  recurringPipeline: boolean;
  marginGauge: boolean;
  trendChart: boolean;
  cashflowChart: boolean;
  taxDeadlines: boolean;
  recentActivity: boolean;
}

const DEFAULT_WIDGETS: WidgetVisibility = {
  kpis: true,
  quickActions: true,
  taxQuickCalc: true,
  inventoryAlerts: true,
  recurringPipeline: true,
  marginGauge: true,
  trendChart: true,
  cashflowChart: true,
  taxDeadlines: true,
  recentActivity: true,
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  invoices,
  companySettings,
  inventory = [],
  recurringTransactions = [],
  customMetrics = [],
  onUpdateMetrics,
  onNavigateTab,
  onOpenQuickAdd,
  activeEntityId,
}) => {
  const [widgets, setWidgets] = useState<WidgetVisibility>(() => {
    try {
      const saved = localStorage.getItem('kiwi_dashboard_widgets_v1');
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const [showWidgetModal, setShowWidgetModal] = useState(false);

  const toggleWidget = (key: keyof WidgetVisibility) => {
    setWidgets((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('kiwi_dashboard_widgets_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.setItem('kiwi_dashboard_widgets_v1', JSON.stringify(DEFAULT_WIDGETS));
  };

  // Calculations
  const totalCashBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const profitMarginPct = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  // Total GST Collected vs Paid
  const gstCollected = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.gstAmount, 0);

  const gstPaid = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.gstAmount, 0);

  const netGstLiability = gstCollected - gstPaid;

  // Estimated Tax Reserve
  const taxRate = companySettings.entityType === 'NZ_COMPANY' ? 0.28 : 0.22;
  const estimatedTaxReserve = Math.max(0, netProfit * taxRate);

  // Unpaid Invoices total
  const unpaidInvoicesTotal = invoices
    .filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((acc, i) => acc + i.total, 0);

  // Inventory stats
  const lowStockCount = inventory.filter((i) => i.quantityOnHand <= i.reorderLevel).length;
  const totalStockVal = inventory.reduce((sum, i) => sum + i.quantityOnHand * i.unitCost, 0);

  // Recurring stats
  const todayStr = new Date().toISOString().split('T')[0];
  const dueRecurringCount = recurringTransactions.filter((r) => r.nextDueDate <= todayStr).length;

  // Church & Non-Profit Smart Stats
  const churchTxList = transactions.filter((t) => t.isChurchNonprofit);
  const totalChurchDonations = churchTxList.reduce((sum, t) => sum + t.amount, 0);
  const totalTaxReceiptable = churchTxList
    .filter((t) => t.isTaxDeductibleDonation)
    .reduce((sum, t) => sum + t.amount, 0);
  const uniqueDonorsCount = new Set(churchTxList.map((t) => t.donorName).filter(Boolean)).size;

  // Multi-Currency Stats
  const foreignAccounts = accounts.filter((a) => a.currency && a.currency !== 'NZD');
  const totalForeignValNZD = foreignAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Mock Forecast Data for Recharts
  const forecastData = [
    { name: 'May 26', cash: 14200, forecast: 14200 },
    { name: 'Jun 26', cash: 16800, forecast: 16800 },
    { name: 'Jul 26 (Now)', cash: totalCashBalance, forecast: totalCashBalance },
    { name: 'Aug 26', forecast: totalCashBalance + unpaidInvoicesTotal - 2500 },
    { name: 'Sep 26', forecast: totalCashBalance + unpaidInvoicesTotal + 4200 },
    { name: 'Oct 26', forecast: totalCashBalance + unpaidInvoicesTotal + 8900 },
  ];

  // Upcoming Tax Deadlines
  const taxDeadlines = [
    { title: 'PAYE & Employer Deductions Return', date: '20th Aug 2026', type: 'IRD PAYE', urgency: 'Urgent' },
    { title: 'Provisional Tax 1st Installment', date: '28th Aug 2026', type: 'Provisional Tax', urgency: 'Upcoming' },
    { title: 'GST Return (Jul - Aug Period)', date: '28th Sep 2026', type: 'GST101', urgency: 'Upcoming' },
    { title: 'IR3 / IR4 Income Tax Return Filing', date: '7th Jul 2026', type: 'Annual Tax', urgency: 'Scheduled' },
  ];

  const isConsolidated = activeEntityId === 'ALL';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${isConsolidated ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'}`}>
                {isConsolidated ? 'CONSOLIDATED VIEW' : 'NZ Tax Year FY2026'}
              </span>
              {!isConsolidated && <span className="text-xs text-slate-400">• Registered GST: {companySettings.gstNumber}</span>}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isConsolidated ? 'Global Net Worth Dashboard' : `Welcome back, ${companySettings.tradingName}`}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isConsolidated 
                ? 'Viewing combined assets and liabilities across all your entities and trusts.'
                : 'Your personal local-first NZ accounting console. All data is securely calculated and saved in your browser storage.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowWidgetModal(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="Customize dashboard widgets visibility"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-400" /> Customize Widgets
            </button>

            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Consolidated Global Net Worth */}
      {isConsolidated && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Consolidated Global Net Worth</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Cash Assets</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">${totalCashBalance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Unpaid Invoices</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">${unpaidInvoicesTotal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Combined Est. Net Worth</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${(totalCashBalance + unpaidInvoicesTotal).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      )}

      {/* Widget 1: KPI Cards Grid */}
      {!isConsolidated && widgets.kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cash Balance</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ${totalCashBalance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-teal-700">{accounts.length} NZ Accounts</span>
              <span>• ANZ, ASB, BNZ</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit (YTD)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ${netProfit.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="flex items-center text-emerald-600 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" /> Income ${totalIncome.toFixed(0)}
              </span>
              <span>vs Exps ${totalExpenses.toFixed(0)}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                Net GST Payable (Box 10)
                <IrdTooltip
                  term={IRD_DICTIONARY.BOX_10.title}
                  explanation={IRD_DICTIONARY.BOX_10.text}
                />
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ${netGstLiability.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span>Sales GST ${gstCollected.toFixed(0)}</span>
              <span>- Purchases GST ${gstPaid.toFixed(0)}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                Estimated Tax Reserve
                <IrdTooltip
                  term={IRD_DICTIONARY.PROVISIONAL_TAX.title}
                  explanation={IRD_DICTIONARY.PROVISIONAL_TAX.text}
                />
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ${estimatedTaxReserve.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="text-indigo-600 font-semibold">
                {(taxRate * 100).toFixed(0)}% {companySettings.entityType.replace('_', ' ')}
              </span>
              <span>Tax Provision</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Formula Metrics Widget */}
      {customMetrics && onUpdateMetrics && (
        <CustomDashboardMetricsWidget
          customMetrics={customMetrics}
          transactions={transactions}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          cashBalance={totalCashBalance}
          onUpdateMetrics={onUpdateMetrics}
        />
      )}

      {/* Smart Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Smart Card 1: Real-time GST Position */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-teal-600" /> GST Position (GST101)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                15% NZ Rate
              </span>
            </div>

            <div className="text-xl font-black text-slate-900 tracking-tight mt-1">
              ${netGstLiability.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
              <span className="text-xs font-semibold text-slate-500 ml-1">
                {netGstLiability >= 0 ? 'Payable' : 'Refund'}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Box 5 (Sales GST):</span>
                <span className="font-bold font-mono text-emerald-700">${gstCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Box 8 (Purchases GST):</span>
                <span className="font-bold font-mono text-slate-700">${gstPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('GST_RETURN')}
            className="w-full mt-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs rounded-xl border border-teal-200 transition-all flex items-center justify-center gap-1"
          >
            File GST Return (GST101) →
          </button>
        </div>

        {/* Smart Card 2: Church & Non-Profit Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-600" /> Church & Non-Profit
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                IR526 Hub
              </span>
            </div>

            <div className="text-xl font-black text-slate-900 tracking-tight mt-1">
              ${totalChurchDonations.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>IR526 Tax Receiptable:</span>
                <span className="font-bold font-mono text-amber-700">${totalTaxReceiptable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Donors:</span>
                <span className="font-bold font-mono text-slate-800">{uniqueDonorsCount} Donors</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('CHURCH_CHARITY')}
            className="w-full mt-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-1"
          >
            Manage Church & IR526 Receipts →
          </button>
        </div>

        {/* Smart Card 3: IRD Tax Calendar & Deadlines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" /> IRD Deadlines
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                Upcoming
              </span>
            </div>

            <div className="text-sm font-bold text-slate-800 mt-1">
              PAYE Return: <span className="text-rose-600 font-extrabold">20th Aug 2026</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Provisional Tax 1st Inst: 28th Aug 2026</p>

            <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-medium">
              IRD Tax Code: <strong className="text-slate-800">{companySettings.irdNumber}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('TAX_CALENDAR')}
            className="w-full mt-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1"
          >
            View NZ Tax Calendar →
          </button>
        </div>

        {/* Smart Card 4: Multi-Currency & FX Exposure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" /> Multi-Currency & FX
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {foreignAccounts.length} FX Accts
              </span>
            </div>

            <div className="text-xl font-black text-slate-900 tracking-tight mt-1">
              ${totalForeignValNZD.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Foreign Holdings:</span>
                <span className="font-bold font-mono text-emerald-700">USD, AUD, EUR, GBP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>FX Revaluation:</span>
                <span className="font-bold text-emerald-600">+ $142.50 Gain</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('MULTI_CURRENCY')}
            className="w-full mt-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-1"
          >
            FX Conversion & Hedging →
          </button>
        </div>
      </div>

      {/* Widget 2: Quick Action Bar */}
      {widgets.quickActions && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" /> Quick Access Hub:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('RECURRING')}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-600" /> Recurring Schedules
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('INVENTORY')}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200 transition-all flex items-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5 text-teal-600" /> Inventory & Stock
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('AI_ADVISOR')}
              className="px-3 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Tax Advisor
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('CASHFLOW')}
              className="px-3 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Cash Flow Forecast
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('FINANCIAL_HEALTH')}
              className="px-3 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" /> Financial Health
            </button>
          </div>
        </div>
      )}

      {/* Tax Quick Calc Widget */}
      {widgets.taxQuickCalc && (
        <TaxQuickCalcWidget
          companySettings={companySettings}
          ytdIncome={totalIncome}
          ytdExpenses={totalExpenses}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Widget Grid: Inventory & Recurring Pipeline & Profit Margin Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inventory Stock Widget */}
        {widgets.inventoryAlerts && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-teal-600" /> Stock & Inventory Status
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {inventory.length} SKUs
                </span>
              </div>

              <div className="text-xl font-black text-slate-900">${totalStockVal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD</div>
              <p className="text-xs text-slate-500 mt-1">Total asset valuation at cost</p>

              {lowStockCount > 0 ? (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{lowStockCount} items need reordering!</span>
                </div>
              ) : (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All stock levels healthy</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('INVENTORY')}
              className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
            >
              Manage Inventory & SKUs
            </button>
          </div>
        )}

        {/* Recurring Outflows Pipeline Widget */}
        {widgets.recurringPipeline && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-indigo-600" /> Recurring Bills & Subs
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {recurringTransactions.length} Active
                </span>
              </div>

              <div className="text-xl font-black text-slate-900">{recurringTransactions.length} Schedules</div>
              <p className="text-xs text-slate-500 mt-1">Rent, telco, software, utilities</p>

              {dueRecurringCount > 0 ? (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{dueRecurringCount} schedules due for posting!</span>
                </div>
              ) : (
                <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>No overdue postings</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('RECURRING')}
              className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Open Recurring Schedules
            </button>
          </div>
        )}

        {/* Profit Margin Ratio Gauge */}
        {widgets.marginGauge && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-emerald-600" /> Net Profit Margin Ratio
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  YTD Metric
                </span>
              </div>

              <div className="text-2xl font-black text-emerald-700">{profitMarginPct}%</div>
              <p className="text-xs text-slate-500 mt-1">Net profit as % of total income</p>

              <div className="mt-3 bg-slate-100 rounded-full h-2.5 w-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(profitMarginPct)))}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('REPORTS')}
              className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
            >
              View Profit & Loss Breakdown
            </button>
          </div>
        )}
      </div>

      {/* Widget 3: Graphical Financial Trend Line */}
      {widgets.trendChart && (
        <GraphicalTrendLine
          transactions={transactions}
          accounts={accounts}
          title="NZ Business Financial Trajectory & Trend Analysis"
          subtitle="Multi-metric trajectory tracking (Income vs Expenses, Cash Position, Net Profit Margin)"
        />
      )}

      {/* Widget 4: Main Grid (Cash Flow Forecast & IRD Tax Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {widgets.cashflowChart && (
          <div className={`${widgets.taxDeadlines ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white p-6 rounded-2xl border border-slate-200 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">90-Day Cash Flow Projection ($ NZD)</h3>
                <p className="text-xs text-slate-500">Based on accounts, unpaid invoices (${unpaidInvoicesTotal.toFixed(0)}), and recurring bills</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('REPORTS')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                View Full Report <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toFixed(2)} NZD`, 'Projected Cash']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="forecast" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {widgets.taxDeadlines && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-800">IRD Tax Calendar & Deadlines</h3>
              </div>

              <div className="space-y-3">
                {taxDeadlines.map((dl, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {dl.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {dl.date}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{dl.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('TAX_RETURNS')}
              className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all text-center"
            >
              Review NZ Tax Return Worksheets
            </button>
          </div>
        )}
      </div>

      {/* Widget 5: Recent Transactions Table */}
      {widgets.recentActivity && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Bookkeeping Activity</h3>
              <p className="text-xs text-slate-500">Latest entries across ANZ, ASB & BNZ accounts</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('BOOKKEEPING')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              View All ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category / IRD Code</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">GST (15%)</th>
                  <th className="py-2.5 px-3 text-center">Reconciled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-600">{tx.date}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{tx.description}</span>
                      {tx.reference && <span className="text-[10px] text-slate-400">Ref: {tx.reference}</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span>{tx.category}</span>
                      <span className="block text-[10px] text-teal-700 font-mono">{tx.irdTaxCode}</span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      ${tx.gstAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {tx.isReconciled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customize Widgets Modal */}
      {showWidgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" /> Customize Dashboard Widgets
              </h3>
              <button
                type="button"
                onClick={() => setShowWidgetModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Toggle dashboard widgets on or off to tailor your executive dashboard view:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { key: 'kpis', label: 'Key Financial Metrics (Cash, Profit, GST, Tax Reserve)' },
                { key: 'quickActions', label: 'Quick Access Hub Bar' },
                { key: 'taxQuickCalc', label: 'NZ Tax Quick Estimator (Provisional Tax & GST)' },
                { key: 'inventoryAlerts', label: 'Stock & Inventory Asset Widget' },
                { key: 'recurringPipeline', label: 'Recurring Subscriptions & Bills Widget' },
                { key: 'marginGauge', label: 'Net Profit Margin Gauge Widget' },
                { key: 'trendChart', label: 'Multi-Metric Financial Trajectory Chart' },
                { key: 'cashflowChart', label: '90-Day Cash Flow Projection Chart' },
                { key: 'taxDeadlines', label: 'IRD Tax Calendar & Deadlines Timeline' },
                { key: 'recentActivity', label: 'Recent General Ledger Bookkeeping Log' },
              ].map((w) => {
                const isEnabled = widgets[w.key as keyof WidgetVisibility];
                return (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => toggleWidget(w.key as keyof WidgetVisibility)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isEnabled
                        ? 'bg-teal-50/50 border-teal-200 text-teal-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xs">{w.label}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isEnabled ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={resetWidgets}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={() => setShowWidgetModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
