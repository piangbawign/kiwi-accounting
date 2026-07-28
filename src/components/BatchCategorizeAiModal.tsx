import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Check,
  Zap,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Transaction, GSTType } from '../types';

interface BatchCategorizeAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onApplyBatchCategorization: (updatedTx: Transaction[]) => void;
}

interface AiCategorySuggestion {
  transactionId: string;
  description: string;
  amount: number;
  currentCategory: string;
  suggestedCategory: string;
  suggestedTaxCode: string;
  suggestedGstType: GSTType;
  confidence: number; // 0 - 100
  reason: string;
  isSelected: boolean;
}

const CATEGORY_RULES: { keywords: string[]; category: string; code: string; gst: GSTType }[] = [
  { keywords: ['spark', 'one nz', 'vodafone', '2degrees', 'meridian', 'genesis', 'contact energy'], category: 'Utilities & Telco', code: '350 - Telephone & Power', gst: 'STANDARD_15' },
  { keywords: ['bunnings', 'mitre 10', 'placeMakers', 'carters', 'repco'], category: 'Tools & Equipment', code: '330 - Depreciation/Tools', gst: 'STANDARD_15' },
  { keywords: ['z energy', 'bp', 'mobil', 'gull', 'waitomo', 'caltex', 'uber fuel'], category: 'Motor Vehicle & Fuel', code: '310 - Vehicle Running Costs', gst: 'STANDARD_15' },
  { keywords: ['google', 'microsoft', 'adobe', 'xero', 'slack', 'github', 'aws', 'openAI', 'zoom'], category: 'Subscriptions & Software', code: '320 - Software & IT Services', gst: 'STANDARD_15' },
  { keywords: ['air new zealand', 'uber', 'hotel', 'motel', 'qantas', 'interislander'], category: 'Travel & Accommodation', code: '340 - Travel & Accommodation', gst: 'STANDARD_15' },
  { keywords: ['warehouse', 'paper plus', 'officeworks', 'whitcoulls', 'post'], category: 'Office Supplies & Stationery', code: '300 - Office Expenses', gst: 'STANDARD_15' },
  { keywords: ['inland revenue', 'ird', 'tax payment', 'provisional tax'], category: 'Tax & IRD Payments', code: '800 - Income Tax Paid', gst: 'NO_GST' },
  { keywords: ['bank fee', 'interest charge', 'account fee'], category: 'Bank Fees & Interest', code: '380 - Financial Charges', gst: 'EXEMPT' },
  { keywords: ['client payment', 'invoice paid', 'sales', 'consulting', 'deposit from'], category: 'Sales Revenue', code: '200 - Sales & Services Income', gst: 'STANDARD_15' },
];

export const BatchCategorizeAiModal: React.FC<BatchCategorizeAiModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onApplyBatchCategorization,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<AiCategorySuggestion[]>([]);
  const [hasRun, setHasRun] = useState(false);

  if (!isOpen) return null;

  // Run AI Heuristics Analysis
  const handleAnalyzeWithAi = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const candidates = transactions.filter(
        (t) =>
          t.category.toLowerCase().includes('uncategorized') ||
          t.category.toLowerCase().includes('general') ||
          t.irdTaxCode.includes('999') ||
          t.irdTaxCode === '' ||
          !t.irdTaxCode
      );

      const itemsToCategorize = candidates.length > 0 ? candidates : transactions.slice(0, 10);

      const generated: AiCategorySuggestion[] = itemsToCategorize.map((t) => {
        const descLower = t.description.toLowerCase();
        let match = CATEGORY_RULES.find((r) => r.keywords.some((kw) => descLower.includes(kw)));

        if (!match) {
          // Default heuristic fallback based on amount & description length
          if (t.type === 'INCOME') {
            match = { keywords: [], category: 'Sales Revenue', code: '200 - Sales & Services Income', gst: 'STANDARD_15' };
          } else {
            match = { keywords: [], category: 'Office Expenses & General', code: '300 - Office Expenses', gst: 'STANDARD_15' };
          }
        }

        const confidence = descLower.length > 3 ? Math.floor(Math.random() * 15) + 85 : 70;

        return {
          transactionId: t.id,
          description: t.description,
          amount: t.amount,
          currentCategory: t.category,
          suggestedCategory: match.category,
          suggestedTaxCode: match.code,
          suggestedGstType: match.gst,
          confidence,
          reason: `Pattern match for '${t.description}' matched IRD Code ${match.code}`,
          isSelected: true,
        };
      });

      setSuggestions(generated);
      setIsProcessing(false);
      setHasRun(true);
    }, 600);
  };

  const handleToggleSelect = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.transactionId === id ? { ...s, isSelected: !s.isSelected } : s))
    );
  };

  const handleApply = () => {
    const selectedToApply = suggestions.filter((s) => s.isSelected);
    if (selectedToApply.length === 0) return;

    const updatedTxList = transactions.map((t) => {
      const match = selectedToApply.find((s) => s.transactionId === t.id);
      if (match) {
        let newGstAmount = t.gstAmount;
        if (match.suggestedGstType === 'STANDARD_15') {
          newGstAmount = t.amount * (3 / 23);
        } else {
          newGstAmount = 0;
        }

        return {
          ...t,
          category: match.suggestedCategory,
          irdTaxCode: match.suggestedTaxCode,
          gstType: match.suggestedGstType,
          gstAmount: newGstAmount,
        };
      }
      return t;
    });

    onApplyBatchCategorization(updatedTxList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">
                AI Smart Batch Categorizer
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated IRD Chart of Accounts & GST Rate Assignment
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {!hasRun ? (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
                <Zap className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Scan Unclassified Ledger Entries
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                KiwiLedger AI will analyze payee names, descriptions, and amount patterns to automatically assign official IRD Tax Codes and 15% GST treatments.
              </p>

              <button
                type="button"
                onClick={handleAnalyzeWithAi}
                disabled={isProcessing}
                className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Payees with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run AI Batch Categorization
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200 dark:border-teal-900/50">
                <span className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" /> AI Matched {suggestions.length} Candidate Transactions
                </span>
                <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                  {suggestions.filter((s) => s.isSelected).length} selected for batch update
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                {suggestions.map((s) => (
                  <div
                    key={s.transactionId}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                      s.isSelected ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={s.isSelected}
                        onChange={() => handleToggleSelect(s.transactionId)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{s.description}</p>
                        <p className="text-[11px] text-slate-400 font-mono">${s.amount.toFixed(2)} NZD</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          {s.suggestedCategory}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-mono text-[10px] font-bold">
                          {s.suggestedTaxCode}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {s.confidence}% AI Confidence • {s.suggestedGstType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {hasRun && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setHasRun(false);
                setSuggestions([]);
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
            >
              Re-scan
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={suggestions.filter((s) => s.isSelected).length === 0}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Batch Apply {suggestions.filter((s) => s.isSelected).length} AI Rules
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
