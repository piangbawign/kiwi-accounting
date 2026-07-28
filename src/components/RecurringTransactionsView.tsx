import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Play,
  X,
  Building,
} from 'lucide-react';
import { RecurringTransaction, Transaction, Account, GSTType, TransactionType } from '../types';

interface RecurringTransactionsViewProps {
  recurringTransactions: RecurringTransaction[];
  accounts: Account[];
  onAddRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  onUpdateRecurring: (rec: RecurringTransaction) => void;
  onDeleteRecurring: (id: string) => void;
  onPostRecurringTransaction: (rec: RecurringTransaction) => void;
}

export const RecurringTransactionsView: React.FC<RecurringTransactionsViewProps> = ({
  recurringTransactions,
  accounts,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onPostRecurringTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('Subscriptions & Software');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-anz-bus');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'>('MONTHLY');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoPost, setAutoPost] = useState(true);
  const [gstType, setGstType] = useState<GSTType>('STANDARD_15');
  const [irdTaxCode, setIrdTaxCode] = useState('350 - Software & Cloud Services');

  const openAddModal = () => {
    setEditingItem(null);
    setDescription('');
    setAmount(100);
    setType('EXPENSE');
    setCategory('Subscriptions & Software');
    setAccountId(accounts[0]?.id || 'acc-anz-bus');
    setFrequency('MONTHLY');
    setNextDueDate(new Date().toISOString().split('T')[0]);
    setAutoPost(true);
    setGstType('STANDARD_15');
    setIrdTaxCode('350 - Software & Cloud Services');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: RecurringTransaction) => {
    setEditingItem(rec);
    setDescription(rec.description);
    setAmount(rec.amount);
    setType(rec.type);
    setCategory(rec.category);
    setAccountId(rec.accountId);
    setFrequency(rec.frequency);
    setNextDueDate(rec.nextDueDate);
    setAutoPost(rec.autoPost);
    setGstType(rec.gstType);
    setIrdTaxCode(rec.irdTaxCode);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    if (editingItem) {
      onUpdateRecurring({
        ...editingItem,
        description,
        amount,
        type,
        category,
        accountId,
        frequency,
        nextDueDate,
        autoPost,
        gstType,
        irdTaxCode,
      });
    } else {
      onAddRecurring({
        description,
        amount,
        type,
        category,
        accountId,
        frequency,
        nextDueDate,
        autoPost,
        gstType,
        irdTaxCode,
      });
    }
    setIsModalOpen(false);
  };

  // Filter Logic
  const filteredSchedules = recurringTransactions.filter((rec) => {
    const matchesSearch =
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.irdTaxCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFreq = frequencyFilter === 'ALL' || rec.frequency === frequencyFilter;
    const matchesType = typeFilter === 'ALL' || rec.type === typeFilter;
    return matchesSearch && matchesFreq && matchesType;
  });

  // Monthly Outflow Projection
  const monthlyExpenseTotal = recurringTransactions
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => {
      let multiplier = 1;
      if (r.frequency === 'WEEKLY') multiplier = 4.33;
      if (r.frequency === 'FORTNIGHTLY') multiplier = 2.16;
      if (r.frequency === 'QUARTERLY') multiplier = 0.33;
      if (r.frequency === 'ANNUALLY') multiplier = 0.083;
      return sum + r.amount * multiplier;
    }, 0);

  const monthlyIncomeTotal = recurringTransactions
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => {
      let multiplier = 1;
      if (r.frequency === 'WEEKLY') multiplier = 4.33;
      if (r.frequency === 'FORTNIGHTLY') multiplier = 2.16;
      if (r.frequency === 'QUARTERLY') multiplier = 0.33;
      if (r.frequency === 'ANNUALLY') multiplier = 0.083;
      return sum + r.amount * multiplier;
    }, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const dueItems = recurringTransactions.filter((r) => r.nextDueDate <= todayStr);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
              Automated Bookkeeping
            </span>
            <span className="text-xs text-slate-400">• NZ GST Compliant Schedule</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Repeat className="w-6 h-6 text-indigo-400" /> Recurring Schedules & Automated Subscriptions
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Schedule repeating rent, broadband, SaaS subscriptions, wages, and retainer income. Auto-post or trigger manual postings directly to the General Ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dueItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                dueItems.forEach((item) => onPostRecurringTransaction(item));
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Post All Due ({dueItems.length})
            </button>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Schedule
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Active Schedules</span>
          <div className="text-2xl font-black text-slate-900">{recurringTransactions.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Configured recurring templates</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Est. Monthly Recurring Income</span>
          <div className="text-2xl font-black text-emerald-600">${monthlyIncomeTotal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          <span className="text-xs text-slate-500 mt-1 block">Retainers & regular client payments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Est. Monthly Recurring Outflow</span>
          <div className="text-2xl font-black text-slate-900">${monthlyExpenseTotal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}</div>
          <span className="text-xs text-slate-500 mt-1 block">Rent, utilities & subscriptions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Pending Due Now</span>
          <div className={`text-2xl font-black ${dueItems.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {dueItems.length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Ready to post into General Ledger</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schedule description, category or IRD code..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="EXPENSE">Expense Outflows</option>
            <option value="INCOME">Income Inflows</option>
          </select>

          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Frequencies</option>
            <option value="WEEKLY">Weekly</option>
            <option value="FORTNIGHTLY">Fortnightly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="ANNUALLY">Annually</option>
          </select>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Recurring Templates ({filteredSchedules.length})</h3>
          <span className="text-xs text-slate-500">Auto-post creates live entries on due date</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Target Bank Account</th>
                <th className="py-3 px-4">IRD Code & GST</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4 text-right">Amount ($ NZD)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No recurring transaction schedules found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((rec) => {
                  const targetAcc = accounts.find((a) => a.id === rec.accountId);
                  const isDue = rec.nextDueDate <= todayStr;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.description}</div>
                        <div className="text-[11px] text-slate-500">{rec.category}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          {rec.frequency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {targetAcc ? `${targetAcc.name} (${targetAcc.bankName})` : 'Default Account'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 text-[11px]">{rec.irdTaxCode}</div>
                        <div className="text-[10px] text-slate-500">{rec.gstType.replace('_', ' ')}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className={`font-mono text-xs font-bold ${isDue ? 'text-amber-600' : 'text-slate-800'}`}>
                          {rec.nextDueDate}
                        </div>
                        {isDue && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> Due Now
                          </span>
                        )}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-black text-sm ${
                          rec.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {rec.type === 'INCOME' ? '+' : '-'}${rec.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPostRecurringTransaction(rec)}
                            title="Post transaction entry now into General Ledger"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-700" /> Post
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(rec)}
                            title="Edit schedule"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecurring(rec.id)}
                            title="Delete schedule"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-600" />
                {editingItem ? 'Edit Recurring Schedule' : 'Create Recurring Schedule'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Payee Name *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Spark Business Fibre, Office Rent, Xero Subscription"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  >
                    <option value="EXPENSE">Expense Outflow</option>
                    <option value="INCOME">Income Inflow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($ NZD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="FORTNIGHTLY">Fortnightly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.bankName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NZ GST Type</label>
                  <select
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value as GSTType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  >
                    <option value="STANDARD_15">15% Standard GST</option>
                    <option value="ZERO_RATED">0% Zero Rated</option>
                    <option value="EXEMPT">GST Exempt</option>
                    <option value="NO_GST">No GST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IRD Tax Code / Category</label>
                <input
                  type="text"
                  value={irdTaxCode}
                  onChange={(e) => setIrdTaxCode(e.target.value)}
                  placeholder="e.g. 350 - Software Services or 340 - Telephone"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
