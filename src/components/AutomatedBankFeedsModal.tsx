import React, { useState } from 'react';
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Filter,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Transaction, Account, BankFeedRule, BankFeedItem, GSTType } from '../types';

interface AutomatedBankFeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  bankFeedRules: BankFeedRule[];
  onImportTransactions: (newTransactions: Partial<Transaction>[]) => void;
  onSaveBankFeedRules: (rules: BankFeedRule[]) => void;
}

const SAMPLE_LIVE_FEEDS: BankFeedItem[] = [
  {
    id: 'feed-101',
    bankName: 'ANZ',
    accountNumber: '01-0123-0456789-00',
    date: '2026-07-25',
    payee: 'COUNTDOWN PONSONBY AUCKLAND',
    amount: -142.50,
    reference: 'POS CARD 4123',
    particulars: 'GATHERING CATERING',
    suggestedCategory: 'Hospitality & Catering',
    suggestedGstType: 'STANDARD_15',
    suggestedIrdCode: '300 - Operating Expenses',
    status: 'PENDING',
  },
  {
    id: 'feed-102',
    bankName: 'ASB',
    accountNumber: '12-3141-0098765-00',
    date: '2026-07-24',
    payee: 'SPARK NEW ZEALAND FIBRE',
    amount: -189.99,
    reference: 'DIRECT DEBIT 8821',
    suggestedCategory: 'Telephone & Internet',
    suggestedGstType: 'STANDARD_15',
    suggestedIrdCode: '300 - Operating Expenses',
    status: 'PENDING',
  },
  {
    id: 'feed-103',
    bankName: 'BNZ',
    accountNumber: '02-0100-0555444-01',
    date: '2026-07-24',
    payee: 'TITHE - AUTOMATIC PAYMENT J MILLER',
    amount: 250.00,
    reference: 'DONATION AP',
    suggestedCategory: 'Tithes & Offerings',
    suggestedGstType: 'NO_GST',
    suggestedIrdCode: '100 - Tithes & Offerings',
    status: 'PENDING',
  },
  {
    id: 'feed-104',
    bankName: 'Westpac',
    accountNumber: '03-0123-0987654-00',
    date: '2026-07-23',
    payee: 'Z ENERGY MOUNT EDEN',
    amount: -95.00,
    reference: 'FLEET FUEL CARD',
    suggestedCategory: 'Motor Vehicle Expenses',
    suggestedGstType: 'STANDARD_15',
    suggestedIrdCode: '410 - Motor Vehicle',
    status: 'PENDING',
  },
  {
    id: 'feed-105',
    bankName: 'Kiwibank',
    accountNumber: '38-9000-0112233-00',
    date: '2026-07-22',
    payee: 'XERO MONTHLY SUBSCRIPTION',
    amount: -75.00,
    reference: 'VISA CARD',
    suggestedCategory: 'Software & Subscriptions',
    suggestedGstType: 'STANDARD_15',
    suggestedIrdCode: '300 - Operating Expenses',
    status: 'PENDING',
  },
];

export const AutomatedBankFeedsModal: React.FC<AutomatedBankFeedsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  bankFeedRules,
  onImportTransactions,
  onSaveBankFeedRules,
}) => {
  const [activeTab, setActiveTab] = useState<'FEEDS' | 'RULES'>('FEEDS');
  const [isFetching, setIsFetching] = useState(false);
  const [feedItems, setFeedItems] = useState<BankFeedItem[]>(SAMPLE_LIVE_FEEDS);

  // New Rule Modal state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [assignedCategory, setAssignedCategory] = useState('Operating Expenses');
  const [assignedIrdCode, setAssignedIrdCode] = useState('300 - Operating Expenses');
  const [assignedGstType, setAssignedGstType] = useState<GSTType>('STANDARD_15');
  const [autoApprove, setAutoApprove] = useState(true);

  if (!isOpen) return null;

  const handleFetchLatestFeeds = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
      // Add a fresh simulated feed item
      const freshItem: BankFeedItem = {
        id: `feed-${Date.now()}`,
        bankName: 'ANZ',
        accountNumber: accounts[0]?.accountNumber || '01-0123-0456789-00',
        date: new Date().toISOString().split('T')[0],
        payee: 'PB TECH AUCKLAND COMPUTER SUPPLIES',
        amount: -249.00,
        reference: 'EFTPOS COMPUTER PART',
        suggestedCategory: 'Office & IT Equipment',
        suggestedGstType: 'STANDARD_15',
        suggestedIrdCode: '300 - Operating Expenses',
        status: 'PENDING',
      };
      setFeedItems((prev) => [freshItem, ...prev]);
    }, 1200);
  };

  const handleApproveItem = (item: BankFeedItem) => {
    const targetAccountId = accounts.find((a) => a.bankName === item.bankName)?.id || accounts[0]?.id || 'acc-1';
    
    const newTx: Partial<Transaction> = {
      id: `tx-feed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: item.date,
      description: item.payee,
      amount: Math.abs(item.amount),
      type: item.amount > 0 ? 'INCOME' : 'EXPENSE',
      category: item.suggestedCategory || 'General Expense',
      accountId: targetAccountId,
      gstType: item.suggestedGstType || 'STANDARD_15',
      gstAmount: item.suggestedGstType === 'STANDARD_15' ? Math.abs(item.amount) * (0.15 / 1.15) : 0,
      irdTaxCode: item.suggestedIrdCode || '300 - Operating Expenses',
      reference: item.reference,
      isReconciled: true,
      createdAt: new Date().toISOString(),
    };

    onImportTransactions([newTx]);

    setFeedItems((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: 'IMPORTED' } : f))
    );
  };

  const handleApproveAllPending = () => {
    const pending = feedItems.filter((f) => f.status === 'PENDING');
    if (pending.length === 0) return;

    const newTxs: Partial<Transaction>[] = pending.map((item) => {
      const targetAccountId = accounts.find((a) => a.bankName === item.bankName)?.id || accounts[0]?.id || 'acc-1';
      return {
        id: `tx-feed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: item.date,
        description: item.payee,
        amount: Math.abs(item.amount),
        type: item.amount > 0 ? 'INCOME' : 'EXPENSE',
        category: item.suggestedCategory || 'General Expense',
        accountId: targetAccountId,
        gstType: item.suggestedGstType || 'STANDARD_15',
        gstAmount: item.suggestedGstType === 'STANDARD_15' ? Math.abs(item.amount) * (0.15 / 1.15) : 0,
        irdTaxCode: item.suggestedIrdCode || '300 - Operating Expenses',
        reference: item.reference,
        isReconciled: true,
        createdAt: new Date().toISOString(),
      };
    });

    onImportTransactions(newTxs);

    setFeedItems((prev) =>
      prev.map((f) => (f.status === 'PENDING' ? { ...f, status: 'IMPORTED' } : f))
    );
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !keywords.trim()) return;

    const newRule: BankFeedRule = {
      id: `rule-${Date.now()}`,
      ruleName,
      keywords: keywords.split(',').map((k) => k.trim().toUpperCase()),
      matchType: 'CONTAINS',
      assignedCategory,
      assignedIrdTaxCode: assignedIrdCode,
      assignedGstType,
      autoApprove,
    };

    onSaveBankFeedRules([...bankFeedRules, newRule]);
    setShowAddRuleModal(false);
    setRuleName('');
    setKeywords('');
  };

  const handleDeleteRule = (ruleId: string) => {
    onSaveBankFeedRules(bankFeedRules.filter((r) => r.id !== ruleId));
  };

  const pendingCount = feedItems.filter((f) => f.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Automated Bank Feeds & Rules
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Akahu NZ Open Banking Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct live feed synchronization for ANZ, ASB, BNZ, Westpac & Kiwibank
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Controls Bar */}
        <div className="flex items-center justify-between my-4 shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('FEEDS')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'FEEDS'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              Incoming Feed Stream ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RULES')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'RULES'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Auto-Matching Rules ({bankFeedRules.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'FEEDS' ? (
              <>
                <button
                  type="button"
                  onClick={handleFetchLatestFeeds}
                  disabled={isFetching}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Syncing Akahu...' : 'Fetch Live Bank Feeds'}
                </button>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleApproveAllPending}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Auto-Approve All ({pendingCount})
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddRuleModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'FEEDS' ? (
            feedItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No bank feed transactions pending.
              </div>
            ) : (
              feedItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    item.status === 'IMPORTED'
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-600 opacity-75'
                      : 'bg-white border-slate-200 hover:border-teal-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.amount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {item.bankName}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{item.payee}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.date}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>Ref: {item.reference || 'N/A'}</span>
                        <span>•</span>
                        <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                          Matched: {item.suggestedCategory}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">{item.suggestedIrdCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        item.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {item.amount > 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)} NZD
                    </span>

                    {item.status === 'IMPORTED' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Imported
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApproveItem(item)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1"
                      >
                        Approve & Post →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            /* Rules Tab */
            <div className="space-y-3">
              {bankFeedRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900">{rule.ruleName}</h4>
                      {rule.autoApprove && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold">
                          Auto-Approve Enabled
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                      <div>
                        Keywords:{' '}
                        <span className="font-mono font-bold text-slate-700">
                          {rule.keywords.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <span>Assigns Category: <strong>{rule.assignedCategory}</strong></span>
                        <span>•</span>
                        <span>IRD Code: <strong>{rule.assignedIrdTaxCode}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Adding Bank Rule */}
        {showAddRuleModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3">
                Create Bank Auto-Categorization Rule
              </h3>
              <form onSubmit={handleAddRule} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fuel Purchases"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">
                    Match Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z ENERGY, BP, MOBIL"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Target Category</label>
                    <input
                      type="text"
                      value={assignedCategory}
                      onChange={(e) => setAssignedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">IRD Tax Code</label>
                    <input
                      type="text"
                      value={assignedIrdCode}
                      onChange={(e) => setAssignedIrdCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="autoApprove" className="font-bold text-slate-700">
                    Auto-approve matching feed items without manual review
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-teal-600 text-white font-extrabold rounded-xl"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
