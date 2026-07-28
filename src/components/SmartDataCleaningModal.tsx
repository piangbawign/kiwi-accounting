import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Tag,
  Percent,
  FileCheck2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Wand2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Transaction, GSTType } from '../types';

interface SmartDataCleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onUpdateTransactions: (updated: Transaction[]) => void;
  onDeleteTransactions: (idsToDelete: string[]) => void;
}

export const SmartDataCleaningModal: React.FC<SmartDataCleaningModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onUpdateTransactions,
  onDeleteTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<
    'DUPLICATES' | 'PAYEES' | 'MISSING_CODES' | 'GST_AUDIT' | 'RECEIPTS'
  >('DUPLICATES');

  if (!isOpen) return null;

  // 1. Find Duplicate Transactions (Same Date, Same Amount, Similar Payee)
  const duplicates = useMemo(() => {
    const dupMap = new Map<string, Transaction[]>();
    transactions.forEach((tx) => {
      const key = `${tx.date}_${tx.amount.toFixed(2)}`;
      if (!dupMap.has(key)) {
        dupMap.set(key, []);
      }
      dupMap.get(key)!.push(tx);
    });

    const dupPairs: { key: string; items: Transaction[] }[] = [];
    dupMap.forEach((items, key) => {
      if (items.length > 1) {
        dupPairs.push({ key, items });
      }
    });

    return dupPairs;
  }, [transactions]);

  // 2. Inconsistent Payees (e.g. Countdown variations)
  const messyPayees = useMemo(() => {
    const rawPayees = transactions.map((t) => t.description);
    const issues: { original: string; suggested: string; count: number }[] = [];

    const countdowns = rawPayees.filter((p) => p.toUpperCase().includes('COUNTDOWN'));
    if (countdowns.length > 1 && new Set(countdowns).size > 1) {
      issues.push({
        original: 'Countdown Store Variations',
        suggested: 'Countdown Supermarket',
        count: countdowns.length,
      });
    }

    const sparks = rawPayees.filter((p) => p.toUpperCase().includes('SPARK'));
    if (sparks.length > 1 && new Set(sparks).size > 1) {
      issues.push({
        original: 'Spark Telecom Variations',
        suggested: 'Spark New Zealand',
        count: sparks.length,
      });
    }

    const zs = rawPayees.filter((p) => p.toUpperCase().includes('Z ENERGY'));
    if (zs.length > 1 && new Set(zs).size > 1) {
      issues.push({
        original: 'Z Energy Service Stations',
        suggested: 'Z Energy NZ',
        count: zs.length,
      });
    }

    return issues;
  }, [transactions]);

  // 3. Uncategorized or Missing IRD Codes
  const uncategorizedItems = useMemo(() => {
    return transactions.filter(
      (t) =>
        !t.category ||
        t.category === 'Uncategorized' ||
        !t.irdTaxCode ||
        t.irdTaxCode === 'Unmapped'
    );
  }, [transactions]);

  // 4. Potential GST Misclassifications
  const gstAuditItems = useMemo(() => {
    return transactions.filter((t) => {
      const desc = t.description.toLowerCase();
      // Bank interest or fees should generally be EXEMPT
      if ((desc.includes('interest') || desc.includes('bank fee') || desc.includes('monthly fee')) && t.gstType === 'STANDARD_15') {
        return true;
      }
      // Wage or personal transfer should be NO_GST
      if ((desc.includes('wage') || desc.includes('drawing') || desc.includes('salary')) && t.gstType === 'STANDARD_15') {
        return true;
      }
      return false;
    });
  }, [transactions]);

  // 5. Missing Receipts over $1,000 NZD
  const missingReceipts = useMemo(() => {
    return transactions.filter(
      (t) => t.amount >= 1000 && t.type === 'EXPENSE' && !t.receiptUrl && (!t.attachments || t.attachments.length === 0)
    );
  }, [transactions]);

  // Auto Fix Handlers
  const handleRemoveDuplicate = (duplicateId: string) => {
    onDeleteTransactions([duplicateId]);
  };

  const handleFixPayeeNormalization = (suggested: string) => {
    const keyword = suggested.split(' ')[0].toUpperCase();
    const updated = transactions.map((t) => {
      if (t.description.toUpperCase().includes(keyword)) {
        return { ...t, description: suggested };
      }
      return t;
    });
    onUpdateTransactions(updated);
  };

  const handleAutoAssignCategories = () => {
    const updated = transactions.map((t) => {
      if (!t.category || t.category === 'Uncategorized') {
        const desc = t.description.toUpperCase();
        let cat = 'Operating Expenses';
        let code = '300 - Operating Expenses';

        if (desc.includes('COUNTDOWN') || desc.includes('FOOD')) {
          cat = 'Hospitality & Catering';
          code = '300 - Operating Expenses';
        } else if (desc.includes('SPARK') || desc.includes('VODAFONE')) {
          cat = 'Telephone & Internet';
          code = '300 - Operating Expenses';
        } else if (desc.includes('FUEL') || desc.includes('Z ENERGY')) {
          cat = 'Motor Vehicle Expenses';
          code = '410 - Motor Vehicle';
        } else if (desc.includes('TITHE') || desc.includes('GIVING')) {
          cat = 'Tithes & Offerings';
          code = '100 - Tithes & Offerings';
        }

        return { ...t, category: cat, irdTaxCode: code };
      }
      return t;
    });

    onUpdateTransactions(updated);
  };

  const handleFixGstMisclassifications = () => {
    const updated = transactions.map((t) => {
      const desc = t.description.toLowerCase();
      if ((desc.includes('interest') || desc.includes('bank fee')) && t.gstType === 'STANDARD_15') {
        return { ...t, gstType: 'EXEMPT' as GSTType, gstAmount: 0 };
      }
      if ((desc.includes('wage') || desc.includes('drawing')) && t.gstType === 'STANDARD_15') {
        return { ...t, gstType: 'NO_GST' as GSTType, gstAmount: 0 };
      }
      return t;
    });

    onUpdateTransactions(updated);
  };

  const totalIssuesCount =
    duplicates.length +
    messyPayees.length +
    uncategorizedItems.length +
    gstAuditItems.length +
    missingReceipts.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Smart Data Cleaning & Ledger Auditor
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  {totalIssuesCount} Potential Items Flagged
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1-Click resolution for duplicate entries, inconsistent payees, missing IRD codes & GST errors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl my-4 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('DUPLICATES')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DUPLICATES'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Copy className="w-3.5 h-3.5 text-rose-500" />
            Duplicates ({duplicates.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PAYEES')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'PAYEES'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            Payee Normalization ({messyPayees.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MISSING_CODES')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'MISSING_CODES'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Uncategorized ({uncategorizedItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GST_AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'GST_AUDIT'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-500" />
            GST Audit ({gstAuditItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECEIPTS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'RECEIPTS'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-sky-500" />
            Missing Receipts &gt; $1k ({missingReceipts.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'DUPLICATES' && (
            duplicates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No duplicate transactions found in the ledger. Excellent!
              </div>
            ) : (
              duplicates.map((dup) => (
                <div key={dup.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 text-rose-600">
                      <AlertTriangle className="w-4 h-4" /> Potential Duplicate Group ({dup.items.length} items)
                    </span>
                    <span className="font-mono">${dup.items[0].amount.toFixed(2)} on {dup.items[0].date}</span>
                  </div>

                  <div className="space-y-1.5">
                    {dup.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{item.description}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Ref: {item.reference || 'N/A'} • ID: {item.id}
                          </span>
                        </div>

                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDuplicate(item.id)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] rounded-lg border border-rose-200 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove Duplicate
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'PAYEES' && (
            messyPayees.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All vendor payee names are clean and normalized!
              </div>
            ) : (
              messyPayees.map((issue) => (
                <div
                  key={issue.original}
                  className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900">{issue.original} ({issue.count} transactions)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Suggest normalizing all variations to: <strong className="text-teal-700">{issue.suggested}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFixPayeeNormalization(issue.suggested)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Normalize All
                  </button>
                </div>
              ))
            )
          )}

          {activeTab === 'MISSING_CODES' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <span>{uncategorizedItems.length} transactions missing categories or IRD codes.</span>
                <button
                  type="button"
                  onClick={handleAutoAssignCategories}
                  className="px-3 py-1 bg-amber-600 text-white font-extrabold rounded-lg hover:bg-amber-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Categorize All
                </button>
              </div>

              {uncategorizedItems.map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.description}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">${item.amount.toFixed(2)} on {item.date}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">Unmapped</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'GST_AUDIT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <span>{gstAuditItems.length} potential GST classification warnings (Bank interest, wages, etc.)</span>
                <button
                  type="button"
                  onClick={handleFixGstMisclassifications}
                  className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Fix GST Rates
                </button>
              </div>

              {gstAuditItems.map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.description}</span>
                    <span className="text-[10px] text-slate-400 block">Currently: 15% GST → Should be Exempt / No GST</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'RECEIPTS' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2">
                IRD requires tax invoices/receipts for all expense claims exceeding $1,000 NZD.
              </p>
              {missingReceipts.map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.description}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">${item.amount.toFixed(2)} on {item.date}</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                    Receipt Needed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
