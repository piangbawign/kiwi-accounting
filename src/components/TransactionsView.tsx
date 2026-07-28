import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Repeat,
  Download,
  Calendar,
  Tag,
  DollarSign,
  AlertCircle,
  FolderGit2,
  Sparkles,
  Paperclip,
  LineChart as LineChartIcon,
  Landmark,
  ChevronDown,
  ChevronUp,
  Edit3,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Transaction, Account, Project, RecurringTransaction, TransactionAttachment, GSTType } from '../types';
import { autoCategorizeAllTransactions } from '../services/autoCategorize';
import { GraphicalTrendLine } from './GraphicalTrendLine';
import { TransactionAttachmentModal } from './TransactionAttachmentModal';
import { BulkEditModal } from './BulkEditModal';
import { BatchCategorizeAiModal } from './BatchCategorizeAiModal';
import { BulkTaxClassificationToolbar } from './BulkTaxClassificationToolbar';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  projects: Project[];
  recurringTransactions: RecurringTransaction[];
  onOpenQuickAdd: () => void;
  onDeleteTransaction: (id: string) => void;
  onPostRecurring: (rec: RecurringTransaction) => void;
  onUpdateTransactions?: (txs: Transaction[]) => void;
  onUpdateAttachments?: (txId: string, atts: TransactionAttachment[]) => void;
  initialSearchQuery?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  projects,
  recurringTransactions,
  onOpenQuickAdd,
  onDeleteTransaction,
  onPostRecurring,
  onUpdateTransactions,
  onUpdateAttachments,
  initialSearchQuery = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showRecurringTab, setShowRecurringTab] = useState(false);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [autoCatNotification, setAutoCatNotification] = useState<string | null>(null);

  // Selected Transaction for Attachment Modal
  const [selectedTxForAttachments, setSelectedTxForAttachments] = useState<Transaction | null>(null);

  // Bulk Edit Selection
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [showBatchCategorizeModal, setShowBatchCategorizeModal] = useState(false);

  // Filter Logic
  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.irdTaxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAcc = selectedAccount === 'ALL' || tx.accountId === selectedAccount;
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    const matchesCat = selectedCategory === 'ALL' || tx.category === selectedCategory;

    return matchesSearch && matchesAcc && matchesType && matchesCat;
  });

  const isAllFilteredSelected = filteredTx.length > 0 && filteredTx.every((t) => selectedTxIds.includes(t.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filteredTx.map((t) => t.id));
    }
  };

  const handleToggleSelectTx = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApplyBulkUpdates = (updates: {
    category?: string;
    irdTaxCode?: string;
    gstType?: GSTType;
    accountId?: string;
    isReconciled?: boolean;
  }) => {
    if (!onUpdateTransactions || selectedTxIds.length === 0) return;

    const updatedList = transactions.map((t) => {
      if (selectedTxIds.includes(t.id)) {
        let newGstAmount = t.gstAmount;
        const newGstType = updates.gstType || t.gstType;
        if (newGstType === 'STANDARD_15') {
          newGstAmount = t.amount * (3 / 23);
        } else if (newGstType === 'ZERO_RATED' || newGstType === 'EXEMPT' || newGstType === 'NO_GST') {
          newGstAmount = 0;
        }

        return {
          ...t,
          category: updates.category ?? t.category,
          irdTaxCode: updates.irdTaxCode ?? t.irdTaxCode,
          gstType: newGstType,
          gstAmount: newGstAmount,
          accountId: updates.accountId ?? t.accountId,
          isReconciled: updates.isReconciled ?? t.isReconciled,
        };
      }
      return t;
    });

    onUpdateTransactions(updatedList);
    setAutoCatNotification(`Updated ${selectedTxIds.length} transaction(s) in bulk!`);
    setSelectedTxIds([]);
  };

  const handleBulkDelete = () => {
    selectedTxIds.forEach((id) => onDeleteTransaction(id));
    setSelectedTxIds([]);
    setAutoCatNotification(`Deleted ${selectedTxIds.length} selected transaction(s).`);
  };

  // Auto-Categorize All Unclassified / Generic Transactions
  const handleAutoCategorizeAll = () => {
    const { updatedTransactions, categorizedCount } = autoCategorizeAllTransactions(transactions);
    if (categorizedCount > 0 && onUpdateTransactions) {
      onUpdateTransactions(updatedTransactions);
      setAutoCatNotification(`⚡ Successfully auto-categorized ${categorizedCount} transaction(s) using NZ IRD Rule Engine!`);
    } else {
      setAutoCatNotification(`All transactions are already categorized with IRD tax codes.`);
    }

    setTimeout(() => {
      setAutoCatNotification(null);
    }, 5000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Description', 'Amount', 'GST Type', 'GST Amount', 'Category', 'IRD Code', 'Account', 'Reference', 'Reconciled', 'Attachments'];
    const rows = filteredTx.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.gstType,
      t.gstAmount,
      `"${t.category}"`,
      `"${t.irdTaxCode}"`,
      accounts.find((a) => a.id === t.accountId)?.name || t.accountId,
      t.reference || '',
      t.isReconciled ? 'Yes' : 'No',
      t.attachments ? t.attachments.length : (t.receiptUrl ? 1 : 0),
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KiwiLedger_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categoriesList = Array.from(new Set(transactions.map((t) => t.category)));

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">NZ Bookkeeping Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record, auto-categorize, attach receipts, and tag all income & expense entries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Trend Line */}
          <button
            type="button"
            onClick={() => setShowTrendLine(!showTrendLine)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              showTrendLine
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4 text-teal-400" />
            <span>Trend Line</span>
            {showTrendLine ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Auto-Categorize All */}
          <button
            type="button"
            onClick={handleAutoCategorizeAll}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 shadow-xs"
            title="Auto-scan and assign IRD categories to unclassified entries"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Auto-Categorize</span>
          </button>

          {/* Batch Categorize AI */}
          <button
            type="button"
            onClick={() => setShowBatchCategorizeModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl border border-teal-200 transition-all flex items-center gap-1.5 shadow-xs"
            title="AI Batch Categorization with confidence scores"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>AI Batch Categorize</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRecurringTab(!showRecurringTab)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              showRecurringTab
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Repeat className="w-4 h-4" /> Recurring ({recurringTransactions.length})
          </button>
          
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Entry
          </button>
        </div>
      </div>

      {/* Auto-Categorize Notification Toast */}
      {autoCatNotification && (
        <div className="p-4 bg-indigo-900 text-white rounded-2xl border border-indigo-700 shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <span>{autoCatNotification}</span>
          </div>
          <button onClick={() => setAutoCatNotification(null)} className="text-indigo-300 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Graphical Trend Line Chart */}
      {showTrendLine && (
        <GraphicalTrendLine
          transactions={transactions}
          accounts={accounts}
          title="Ledger Financial Trend Line"
          subtitle="Real-time graphical trajectory based on recorded ledger entries"
        />
      )}

      {/* Quick Account Switcher Chips Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-teal-600" /> Quick Switch Account:
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {selectedAccount === 'ALL' ? 'Showing all bank accounts' : `Filtered by ${accounts.find((a) => a.id === selectedAccount)?.name}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedAccount('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              selectedAccount === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>All Accounts Combined</span>
            <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono">
              ${accounts.reduce((s, a) => s + a.balance, 0).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </span>
          </button>

          {accounts.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setSelectedAccount(acc.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                selectedAccount === acc.id
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{acc.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono opacity-90 bg-black/10">
                ${acc.balance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recurring Transactions Drawer */}
      {showRecurringTab && (
        <div className="p-5 bg-teal-950 text-white rounded-2xl border border-teal-800 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-400" /> Recurring NZ Transactions & Subscriptions
              </h3>
              <p className="text-xs text-slate-300">Auto-generate repeating expenses like Spark Fibre, Xero, or rent</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recurringTransactions.map((rec) => (
              <div key={rec.id} className="p-3.5 bg-slate-900 rounded-xl border border-teal-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 uppercase">
                      {rec.frequency}
                    </span>
                    <span className="text-xs font-bold text-teal-200">${rec.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">{rec.description}</p>
                  <p className="text-[11px] text-slate-400">{rec.category} • Next: {rec.nextDueDate}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onPostRecurring(rec)}
                  className="mt-3 w-full py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-all text-center"
                >
                  Post To Ledger Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payees, reference, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>

        {/* Account Filter */}
        <div>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Bank Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.bankName} - {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
            <option value="TAX_PAYMENT">Tax Payments</option>
            <option value="DIVIDEND">Dividends</option>
            <option value="OWNER_DRAW">Owner Drawings</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-teal-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredTx.length})</span>
            </button>
            {selectedTxIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px]">
                {selectedTxIds.length} Selected
              </span>
            )}
          </div>
          <span>Sorted by Date (Newest first)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payee & Description</th>
                <th className="py-3 px-4">Category & IRD Code</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-center">Receipt File</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4 text-right">GST (15%)</th>
                <th className="py-3 px-4 text-center">Reconciled</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No transactions found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const project = projects.find((p) => p.id === tx.projectId);
                  const attachmentCount = tx.attachments ? tx.attachments.length : (tx.receiptUrl ? 1 : 0);
                  const isSelected = selectedTxIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-teal-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectTx(tx.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{tx.date}</td>
                      
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{tx.description}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {tx.reference && <span className="text-[10px] text-slate-400 font-mono">Ref: {tx.reference}</span>}
                          {project && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                              <FolderGit2 className="w-3 h-3" /> {project.name}
                            </span>
                          )}
                          {tx.isChurchNonprofit && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              ⛪ Church {tx.donorName ? `(${tx.donorName})` : ''}
                            </span>
                          )}
                          {tx.gstReturnPeriod && (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                              📊 GST: {tx.gstReturnPeriod}
                            </span>
                          )}
                          {tx.gstBoxMapping && (
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {tx.gstBoxMapping.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold block">{tx.category}</span>
                        <span className="text-[10px] text-teal-700 font-mono font-bold">{tx.irdTaxCode}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {account ? `${account.bankName} - ${account.name}` : 'Default Bank'}
                        </span>
                      </td>

                      {/* Transaction Attachment Cell */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedTxForAttachments(tx)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                            attachmentCount > 0
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Manage Tax Receipt Attachments"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{attachmentCount > 0 ? `${attachmentCount} Receipt(s)` : '+ Attach'}</span>
                        </button>
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-bold text-sm whitespace-nowrap ${
                          tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                        ${tx.gstAmount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {tx.isReconciled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Unmatched
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachment Modal */}
      {selectedTxForAttachments && (
        <TransactionAttachmentModal
          transaction={selectedTxForAttachments}
          isOpen={!!selectedTxForAttachments}
          onClose={() => setSelectedTxForAttachments(null)}
          onUpdateAttachments={(txId, atts) => {
            if (onUpdateAttachments) {
              onUpdateAttachments(txId, atts);
            }
          }}
        />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedTxIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <CheckSquare className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-extrabold">{selectedTxIds.length} Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" /> Bulk Batch Edit
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${selectedTxIds.length} selected entries permanently?`)) {
                  handleBulkDelete();
                }
              }}
              className="px-3.5 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-bold text-xs rounded-xl border border-rose-500/40 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>

            <button
              type="button"
              onClick={() => setSelectedTxIds([])}
              className="text-xs text-slate-400 hover:text-white ml-2 font-semibold"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      <BulkEditModal
        selectedCount={selectedTxIds.length}
        accounts={accounts}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onApplyBulkEdit={handleApplyBulkUpdates}
        onBulkDelete={handleBulkDelete}
      />

      {/* AI Batch Categorize Modal */}
      <BatchCategorizeAiModal
        isOpen={showBatchCategorizeModal}
        onClose={() => setShowBatchCategorizeModal(false)}
        transactions={transactions}
        onApplyBatchCategorization={(updatedTx) => {
          if (onUpdateTransactions) {
            onUpdateTransactions(updatedTx);
          }
        }}
      />

      {/* Floating Bulk Tax Classification Toolbar */}
      <BulkTaxClassificationToolbar
        selectedIds={selectedTxIds}
        onClearSelection={() => setSelectedTxIds([])}
        onBulkApplyCategory={(cat) => handleApplyBulkUpdates({ category: cat })}
        onBulkApplyIrdCode={(code) => handleApplyBulkUpdates({ irdTaxCode: code })}
        onBulkApplyGstType={(gst) => handleApplyBulkUpdates({ gstType: gst })}
        onBulkMarkReconciled={(rec) => handleApplyBulkUpdates({ isReconciled: rec })}
        onBulkDelete={handleBulkDelete}
      />

    </div>
  );
};
