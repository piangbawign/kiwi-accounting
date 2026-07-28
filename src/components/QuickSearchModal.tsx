import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ReceiptText,
  FileCheck2,
  Landmark,
  Calendar,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Percent,
  Tag,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { Transaction, Invoice, Account, CompanySettings } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  invoices: Invoice[];
  accounts: Account[];
  companySettings: CompanySettings;
  onNavigateTab: (tabId: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  transactions,
  invoices,
  accounts,
  companySettings,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search transactions
  const matchedTransactions = q
    ? transactions
        .filter(
          (t) =>
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.reference && t.reference.toLowerCase().includes(q)) ||
            (t.donorName && t.donorName.toLowerCase().includes(q)) ||
            (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
            t.amount.toString().includes(q)
        )
        .slice(0, 6)
    : transactions.slice(0, 4);

  // Search invoices
  const matchedInvoices = q
    ? invoices
        .filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(q) ||
            i.clientName.toLowerCase().includes(q) ||
            i.total.toString().includes(q)
        )
        .slice(0, 4)
    : invoices.slice(0, 3);

  // Search accounts
  const matchedAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.bankName.toLowerCase().includes(q) ||
      a.accountNumber.includes(q)
  );

  // Navigation shortcuts matches
  const navShortcuts = [
    { id: 'DASHBOARD', label: 'Dashboard & Metrics', category: 'General' },
    { id: 'BOOKKEEPING', label: 'Bookkeeping Ledger', category: 'Ledger' },
    { id: 'GST_RETURN', label: 'GST Returns (GST101)', category: 'IRD Tax' },
    { id: 'CHURCH_CHARITY', label: 'Church & Non-Profit Hub (IR526)', category: 'Charity' },
    { id: 'INVOICES', label: 'NZ GST Invoices', category: 'Sales' },
    { id: 'AUDIT_LOGS', label: 'IRD Audit Trail Export', category: 'Compliance' },
    { id: 'MULTI_CURRENCY', label: 'Multi-Currency & FX Hub', category: 'Financial' },
  ].filter((s) => !q || s.label.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));

  const totalResultsCount =
    matchedTransactions.length +
    matchedInvoices.length +
    matchedAccounts.length +
    navShortcuts.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalResultsCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResultsCount) % Math.max(1, totalResultsCount));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] my-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search ledger, donors, invoices, tax codes, accounts... (Cmd+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
          
          {/* Bank Accounts */}
          {matchedAccounts.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Landmark className="w-3 h-3 text-teal-600" /> Bank Accounts
              </div>
              <div className="space-y-1">
                {matchedAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onNavigateTab('BANK_ACCOUNTS');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-teal-50/80 border border-slate-200/60 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800">{acc.name}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{acc.bankName} • {acc.accountNumber}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-700">
                      ${acc.balance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Views Shortcuts */}
          {navShortcuts.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Quick Navigation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {navShortcuts.map((nav) => (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => {
                      onNavigateTab(nav.id);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/60 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{nav.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{nav.category}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bookkeeping Transactions */}
          {matchedTransactions.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ReceiptText className="w-3 h-3 text-emerald-600" /> Transactions ({matchedTransactions.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab('BOOKKEEPING');
                    onClose();
                  }}
                  className="text-[10px] text-teal-700 font-bold hover:underline"
                >
                  View All in Ledger →
                </button>
              </div>
              <div className="space-y-1">
                {matchedTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      onNavigateTab('BOOKKEEPING');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">{tx.description}</span>
                        {tx.isChurchNonprofit && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded border border-amber-200">
                            Church
                          </span>
                        )}
                        {tx.gstReturnPeriod && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded border border-teal-200">
                            GST
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                        {tx.donorName && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-amber-700">Donor: {tx.donorName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold shrink-0 ${
                        tx.type === 'INCOME' ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchedInvoices.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3 h-3 text-blue-600" /> NZ Invoices ({matchedInvoices.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab('INVOICES');
                    onClose();
                  }}
                  className="text-[10px] text-teal-700 font-bold hover:underline"
                >
                  View Invoices →
                </button>
              </div>
              <div className="space-y-1">
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onNavigateTab('INVOICES');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{inv.invoiceNumber}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{inv.clientName} • Due: {inv.dueDate}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ${inv.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResultsCount === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-xs font-semibold">No records found matching "{query}"</p>
              <p className="text-[11px] text-slate-400 mt-1">Try searching by category, payee name, donor, or invoice #</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑↓</kbd> to navigate
            <kbd className="ml-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">ENTER</kbd> to select
          </span>
          <span className="font-semibold text-slate-600">KiwiLedger Universal Search</span>
        </div>
      </div>
    </div>
  );
};
