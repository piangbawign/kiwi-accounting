import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  FileCheck2,
  Copy,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Trash2,
  Zap,
} from 'lucide-react';
import { Transaction, CompanySettings, Invoice } from '../types';

interface SmartScanAlertsViewProps {
  transactions: Transaction[];
  invoices?: Invoice[];
  companySettings: CompanySettings;
  onUpdateTransactions?: (updatedTx: Transaction[]) => void;
  onDeleteTransaction?: (id: string) => void;
}

export interface SmartAlert {
  id: string;
  type: 'DUPLICATE' | 'MISSING_RECEIPT' | 'HIGH_EXPENSE_ANOMALY' | 'UNCLASSIFIED' | 'IRD_DEADLINE';
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description: string;
  transactionId?: string;
  amount?: number;
  date?: string;
  actionText: string;
}

export const SmartScanAlertsView: React.FC<SmartScanAlertsViewProps> = ({
  transactions,
  invoices = [],
  companySettings,
  onUpdateTransactions,
  onDeleteTransaction,
}) => {
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'INFO'>('ALL');

  // Generate Real-time Smart Scan Alerts
  const rawAlerts: SmartAlert[] = [];

  // 1. Check for Potential Duplicates (Same amount, same date, same payee)
  const txSeenMap: { [key: string]: Transaction } = {};
  transactions.forEach((tx) => {
    const key = `${tx.date}_${tx.amount.toFixed(2)}_${tx.description.toLowerCase().trim()}`;
    if (txSeenMap[key]) {
      rawAlerts.push({
        id: `dup_${tx.id}`,
        type: 'DUPLICATE',
        severity: 'HIGH',
        title: 'Potential Duplicate Entry Detected',
        description: `Found two identical $${tx.amount.toFixed(2)} transactions for '${tx.description}' on ${tx.date}.`,
        transactionId: tx.id,
        amount: tx.amount,
        date: tx.date,
        actionText: 'Delete Duplicate',
      });
    } else {
      txSeenMap[key] = tx;
    }
  });

  // 2. Check for Missing Receipts (> $50 NZD expense without attachments)
  transactions.forEach((tx) => {
    if (tx.type === 'EXPENSE' && tx.amount > 50) {
      const hasAttachment = (tx.attachments && tx.attachments.length > 0) || tx.receiptUrl;
      if (!hasAttachment) {
        rawAlerts.push({
          id: `rec_${tx.id}`,
          type: 'MISSING_RECEIPT',
          severity: 'MEDIUM',
          title: 'Missing GST Tax Invoice Receipt (> $50 NZD)',
          description: `IRD Section 24 requires a tax invoice for '${tx.description}' ($${tx.amount.toFixed(2)} NZD) to claim GST input credits.`,
          transactionId: tx.id,
          amount: tx.amount,
          date: tx.date,
          actionText: 'Attach Receipt',
        });
      }
    }
  });

  // 3. High Expense Anomaly Detection (> $1,000 NZD)
  transactions.forEach((tx) => {
    if (tx.type === 'EXPENSE' && tx.amount >= 1000) {
      rawAlerts.push({
        id: `high_${tx.id}`,
        type: 'HIGH_EXPENSE_ANOMALY',
        severity: 'MEDIUM',
        title: 'Large Business Expense Spike (> $1,000 NZD)',
        description: `'${tx.description}' of $${tx.amount.toFixed(2)} NZD may require capital depreciation or IRD asset schedule logging.`,
        transactionId: tx.id,
        amount: tx.amount,
        date: tx.date,
        actionText: 'Review Expense',
      });
    }
  });

  // 4. Unclassified Items
  transactions.forEach((tx) => {
    if (
      tx.category.toLowerCase().includes('uncategorized') ||
      tx.irdTaxCode.includes('999') ||
      !tx.irdTaxCode
    ) {
      rawAlerts.push({
        id: `uncat_${tx.id}`,
        type: 'UNCLASSIFIED',
        severity: 'HIGH',
        title: 'Missing IRD Tax Chart Code',
        description: `'${tx.description}' lacks an assigned IRD chart of accounts classification.`,
        transactionId: tx.id,
        amount: tx.amount,
        date: tx.date,
        actionText: 'Auto-Classify',
      });
    }
  });

  // 5. IRD Tax Deadlines
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysToGstDue = 28 - today.getDate();

  rawAlerts.push({
    id: 'ird_gst_deadline',
    type: 'IRD_DEADLINE',
    severity: daysToGstDue <= 7 && daysToGstDue >= 0 ? 'HIGH' : 'INFO',
    title: 'Upcoming IRD GST101 Filing Deadline',
    description: `GST Returns for ${companySettings.gstFilingFrequency} frequency are due on the 28th of this month (${daysToGstDue > 0 ? `${daysToGstDue} days remaining` : 'Due now'}).`,
    actionText: 'View GST Return',
  });

  // Filter out dismissed
  const activeAlerts = rawAlerts
    .filter((a) => !dismissedAlertIds.includes(a.id))
    .filter((a) => (selectedSeverity === 'ALL' ? true : a.severity === selectedSeverity));

  const handleDismiss = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  const handleFixAction = (alert: SmartAlert) => {
    if (alert.type === 'DUPLICATE' && alert.transactionId && onDeleteTransaction) {
      onDeleteTransaction(alert.transactionId);
      handleDismiss(alert.id);
    } else if (alert.type === 'UNCLASSIFIED' && alert.transactionId && onUpdateTransactions) {
      const updated = transactions.map((t) => {
        if (t.id === alert.transactionId) {
          return {
            ...t,
            category: 'Office Expenses & General',
            irdTaxCode: '300 - Office Expenses',
          };
        }
        return t;
      });
      onUpdateTransactions(updated);
      handleDismiss(alert.id);
    } else {
      handleDismiss(alert.id);
    }
  };

  const highCount = rawAlerts.filter((a) => a.severity === 'HIGH' && !dismissedAlertIds.includes(a.id)).length;
  const mediumCount = rawAlerts.filter((a) => a.severity === 'MEDIUM' && !dismissedAlertIds.includes(a.id)).length;

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Smart Scan Audit & Anomaly Alerts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated compliance monitoring for duplicates, missing IRD receipts, and filing deadlines
              </p>
            </div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setSelectedSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeverity === 'ALL' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
          >
            All Alerts ({rawAlerts.filter((a) => !dismissedAlertIds.includes(a.id)).length})
          </button>
          <button
            onClick={() => setSelectedSeverity('HIGH')}
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeverity === 'HIGH' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-600 dark:text-rose-400'}`}
          >
            Critical ({highCount})
          </button>
          <button
            onClick={() => setSelectedSeverity('MEDIUM')}
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeverity === 'MEDIUM' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-600 dark:text-amber-400'}`}
          >
            Warnings ({mediumCount})
          </button>
        </div>
      </div>

      {/* Alerts Stream Grid */}
      <div className="space-y-3">
        {activeAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">All Ledger Audit Checks Passed Clean</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No duplicate entries, missing tax invoices, or unclassified items detected. Your IRD compliance score is 100%.
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.severity === 'HIGH'
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                  : alert.severity === 'MEDIUM'
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                    alert.severity === 'HIGH'
                      ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {alert.type === 'DUPLICATE' && <Copy className="w-4 h-4" />}
                  {alert.type === 'MISSING_RECEIPT' && <Receipt className="w-4 h-4" />}
                  {alert.type === 'HIGH_EXPENSE_ANOMALY' && <Zap className="w-4 h-4" />}
                  {alert.type === 'UNCLASSIFIED' && <AlertTriangle className="w-4 h-4" />}
                  {alert.type === 'IRD_DEADLINE' && <Clock className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        alert.severity === 'HIGH'
                          ? 'bg-rose-600 text-white'
                          : alert.severity === 'MEDIUM'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {alert.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDismiss(alert.id)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => handleFixAction(alert)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-600 dark:hover:bg-teal-700 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                >
                  {alert.actionText} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
