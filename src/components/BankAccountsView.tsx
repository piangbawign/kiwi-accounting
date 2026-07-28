import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  CreditCard,
  Trash2,
  User,
  UserPlus,
  ArrowRight,
  Edit2,
  Check,
  X,
  Download,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Account, Transaction, BankStatementItem, UserProfile } from '../types';

interface BankAccountsViewProps {
  accounts: Account[];
  allAccounts?: Account[];
  userProfiles?: UserProfile[];
  activeEntityId?: string;
  onSelectEntity?: (entityId: string) => void;
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onImportCSVTransactions: (newTxs: Omit<Transaction, 'id' | 'createdAt'>[], statementItems: Omit<BankStatementItem, 'id'>[]) => void;
  onDeleteAccount?: (id: string) => void;
  onAddUserProfile?: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onDeleteUserProfile?: (profileId: string) => void;
  onUpdateAccountProfile?: (accountId: string, profileId: string | null) => void;
}

export const BankAccountsView: React.FC<BankAccountsViewProps> = ({
  accounts,
  allAccounts = accounts,
  userProfiles = [],
  activeEntityId = 'ALL',
  onSelectEntity,
  onAddAccount,
  onImportCSVTransactions,
  onDeleteAccount,
  onAddUserProfile,
  onDeleteUserProfile,
  onUpdateAccountProfile,
}) => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBank, setNewAccBank] = useState<'ANZ' | 'ASB' | 'BNZ' | 'Westpac' | 'Kiwibank' | 'Other'>('ANZ');
  const [customBankNameInput, setCustomBankNameInput] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('BUSINESS_CHEQUE');
  const [newAccNum, setNewAccNum] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Profile Binding State
  const [profileBindingMode, setProfileBindingMode] = useState<'NONE' | 'EXISTING' | 'CUSTOM'>('CUSTOM');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [customProfName, setCustomProfName] = useState('');
  const [customProfRole, setCustomProfRole] = useState('Account Manager');
  const [customProfEmail, setCustomProfEmail] = useState('');

  // Quick Bind on Account Card State
  const [editingCardAccId, setEditingCardAccId] = useState<string | null>(null);
  const [cardProfileSelect, setCardProfileSelect] = useState<string>('');

  // CSV Import State
  const [selectedTargetAccId, setSelectedTargetAccId] = useState(accounts[0]?.id || '');
  const [confirmDeleteProfId, setConfirmDeleteProfId] = useState<string | null>(null);
  const [bankFormat, setBankFormat] = useState<'AUTO' | 'ANZ' | 'ASB' | 'BNZ' | 'WESTPAC' | 'KIWIBANK' | 'CUSTOM'>('AUTO');
  const [, setCsvFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<
    { date: string; description: string; amount: number; rawRef: string; category: string; gstAmount: number }[]
  >([]);
  const [, setIsParsing] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Download Sample NZ Bank Statement CSV Template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Date,Description,Amount,Reference\n' +
      '2026-07-20,Z Energy Auckland, -85.50,FUEL-9021\n' +
      '2026-07-21,Spark New Zealand Ltd, -149.99,TELCO-SPK\n' +
      '2026-07-22,Client Deposit - Acme Corp NZ, 3450.00,INV-1082\n' +
      '2026-07-23,Bunnings Warehouse Mt Wellington, -230.40,MAT-SUPPLY\n' +
      '2026-07-24,Inland Revenue GST Payment, -1250.00,TAX-IRD\n' +
      '2026-07-25,Xero Subscription NZ, -65.00,ACC-XERO\n' +
      '2026-07-26,Woolworths / Countdown Supermarket, -112.30,OFFICE-AMEN\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'nz_bank_statement_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Add Account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccNum.trim()) return;

    let finalProfileId: string | null = null;

    if (profileBindingMode === 'EXISTING' && selectedProfileId) {
      finalProfileId = selectedProfileId;
    } else if (profileBindingMode === 'CUSTOM' && customProfName.trim()) {
      const generatedId = `prof-${Date.now()}`;
      finalProfileId = generatedId;

      if (onAddUserProfile) {
        onAddUserProfile({
          name: customProfName.trim(),
          email: customProfEmail.trim() || `${customProfName.trim().toLowerCase().replace(/\s+/g, '.')}@company.co.nz`,
          role: customProfRole.trim() || 'Account Manager',
          associatedAccountIds: [],
        });
      }
    }

    const effectiveBankName =
      newAccBank === 'Other' && customBankNameInput.trim()
        ? (customBankNameInput.trim() as any)
        : newAccBank;

    onAddAccount({
      name: newAccName.trim(),
      bankName: effectiveBankName,
      type: newAccType,
      accountNumber: newAccNum.trim(),
      balance: parseFloat(newAccBalance) || 0,
      currency: 'NZD',
      profileId: finalProfileId,
    });

    // Reset Form
    setNewAccName('');
    setNewAccNum('');
    setNewAccBalance('');
    setCustomBankNameInput('');
    setSelectedProfileId('');
    setCustomProfName('');
    setCustomProfEmail('');
    setCustomProfRole('Account Manager');
    setProfileBindingMode('CUSTOM');
    setShowAddAccountModal(false);
  };

  // Quick Change Profile on Card
  const handleSaveCardProfile = (accId: string) => {
    if (onUpdateAccountProfile) {
      onUpdateAccountProfile(accId, cardProfileSelect || null);
    }
    setEditingCardAccId(null);
  };

  // CSV File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setIsParsing(false);
        return;
      }

      // Parse CSV lines
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setIsParsing(false);
        return;
      }

      const headerCols = lines[0].split(',').map((c) => c.replace(/^"|"$/g, '').trim().toLowerCase());

      // Auto-detect index of date, description/payee, amount, debit, credit, reference
      let dateIdx = headerCols.findIndex((h) => h.includes('date') || h.includes('time'));
      let descIdx = headerCols.findIndex((h) => h.includes('desc') || h.includes('payee') || h.includes('particulars') || h.includes('details') || h.includes('party') || h.includes('name'));
      let amountIdx = headerCols.findIndex((h) => h.includes('amount') || h.includes('total') || h.includes('sum'));
      let debitIdx = headerCols.findIndex((h) => h.includes('debit') || h.includes('withdrawal') || h.includes('out'));
      let creditIdx = headerCols.findIndex((h) => h.includes('credit') || h.includes('deposit') || h.includes('in'));
      let refIdx = headerCols.findIndex((h) => h.includes('ref') || h.includes('code') || h.includes('type') || h.includes('num'));

      if (dateIdx === -1) dateIdx = 0;
      if (descIdx === -1) descIdx = 1;
      if (amountIdx === -1 && debitIdx === -1 && creditIdx === -1) amountIdx = 2;
      if (refIdx === -1) refIdx = headerCols.length > 3 ? 3 : 1;

      const rows: typeof parsedPreview = [];
      const today = new Date().toISOString().split('T')[0];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 2) continue;

        const rawDate = cols[dateIdx] || today;
        const date = rawDate.length >= 8 ? rawDate : today;
        const description = cols[descIdx] || cols[1] || 'Bank Statement Entry';

        let amount = 0;
        if (amountIdx !== -1 && cols[amountIdx] !== undefined && cols[amountIdx] !== '') {
          const clean = cols[amountIdx].replace(/\$|,/g, '').trim();
          amount = parseFloat(clean) || 0;
        } else {
          const debitVal = debitIdx !== -1 && cols[debitIdx] ? parseFloat(cols[debitIdx].replace(/\$|,/g, '')) || 0 : 0;
          const creditVal = creditIdx !== -1 && cols[creditIdx] ? parseFloat(cols[creditIdx].replace(/\$|,/g, '')) || 0 : 0;
          if (creditVal > 0) amount = creditVal;
          else if (debitVal > 0) amount = -debitVal;
        }

        if (amount === 0) {
          // Fallback parsing if line contains numeric
          for (let c = 0; c < cols.length; c++) {
            const parsed = parseFloat(cols[c].replace(/\$|,/g, ''));
            if (!isNaN(parsed) && parsed !== 0 && c !== dateIdx) {
              amount = parsed;
              break;
            }
          }
        }

        const rawRef = cols[refIdx] || 'CSV-IMPORT';

        let category = 'General Expense';
        const dLower = description.toLowerCase();

        if (dLower.includes('fuel') || dLower.includes('z energy') || dLower.includes('bp') || dLower.includes('mobil') || dLower.includes('gull')) {
          category = 'Motor Vehicle & Fuel';
        } else if (dLower.includes('spark') || dLower.includes('telecom') || dLower.includes('vodafone') || dLower.includes('one nz') || dLower.includes('2degrees')) {
          category = 'Utilities & Telco';
        } else if (dLower.includes('deposit') || dLower.includes('client') || dLower.includes('invoice') || dLower.includes('sales')) {
          category = 'Sales & Consulting Income';
        } else if (dLower.includes('xero') || dLower.includes('software') || dLower.includes('microsoft') || dLower.includes('google')) {
          category = 'Software & Subscriptions';
        } else if (dLower.includes('ird') || dLower.includes('inland revenue') || dLower.includes('tax') || dLower.includes('gst')) {
          category = 'GST & Tax Payments';
        } else if (dLower.includes('woolworths') || dLower.includes('countdown') || dLower.includes('paknsave') || dLower.includes('new world')) {
          category = 'Office Supplies & Amenities';
        } else if (dLower.includes('bunnings') || dLower.includes('mitre 10')) {
          category = 'Repairs & Maintenance';
        }

        const gstAmount = Math.abs(amount) * 0.13043478;

        rows.push({
          date,
          description,
          amount,
          rawRef,
          category,
          gstAmount: Math.round(gstAmount * 100) / 100,
        });
      }

      setParsedPreview(rows);
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    const targetAccId = selectedTargetAccId || accounts[0]?.id;
    if (parsedPreview.length === 0 || !targetAccId) return;

    const newTxs: Omit<Transaction, 'id' | 'createdAt'>[] = [];
    const newStatements: Omit<BankStatementItem, 'id'>[] = [];

    parsedPreview.forEach((item) => {
      const isIncome = item.amount > 0;
      const type = isIncome ? 'INCOME' : 'EXPENSE';

      newTxs.push({
        date: item.date,
        description: item.description,
        amount: Math.abs(item.amount),
        type,
        category: item.category,
        accountId: targetAccId,
        gstType: 'STANDARD_15',
        gstAmount: item.gstAmount,
        irdTaxCode: isIncome ? '100 - Operating Income' : '300 - General Expenses',
        reference: item.rawRef,
        isReconciled: false,
      });

      newStatements.push({
        date: item.date,
        description: item.description,
        amount: item.amount,
        rawReference: item.rawRef,
        isReconciled: false,
      });
    });

    onImportCSVTransactions(newTxs, newStatements);

    setImportSuccessMsg(`Successfully imported ${parsedPreview.length} bank transactions into local ledger.`);
    setParsedPreview([]);
    setCsvFile(null);
    setTimeout(() => setImportSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">NZ Bank Accounts & User Profile Binding</h2>
            {activeEntityId !== 'ALL' && (
              <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold rounded-md">
                Filtered Profile View ({accounts.length} of {allAccounts.length})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage ANZ, ASB, BNZ, Westpac accounts, bind custom user profiles & import statements
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeEntityId !== 'ALL' && onSelectEntity && (
            <button
              type="button"
              onClick={() => onSelectEntity('ALL')}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              View ALL Accounts ({allAccounts.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddAccountModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0 hover:brightness-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Custom Bank Account
          </button>
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {importSuccessMsg}
        </div>
      )}

      {/* User Profile Entry Filter Pills */}
      {onSelectEntity && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-600" /> Filter Account View:
            </span>
            <button
              type="button"
              onClick={() => onSelectEntity('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeEntityId === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm ring-2 ring-slate-400/40'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>ALL Accounts ({allAccounts.length})</span>
            </button>

            {userProfiles.map((prof) => {
              const isActive = activeEntityId === prof.id;
              const boundCount = allAccounts.filter(
                (a) => a.profileId === prof.id || prof.associatedAccountIds?.includes(a.id)
              ).length;

              return (
                <div
                  key={prof.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-md ring-2 ring-teal-400/40'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectEntity(prof.id)}
                    className="flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{prof.name} ({boundCount})</span>
                  </button>
                  {onDeleteUserProfile && (
                    confirmDeleteProfId === prof.id ? (
                      <div className="flex items-center gap-1 ml-1 animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteUserProfile(prof.id);
                            setConfirmDeleteProfId(null);
                          }}
                          className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded shadow-xs transition-all"
                        >
                          Delete?
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteProfId(null);
                          }}
                          className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteProfId(prof.id);
                        }}
                        className="p-0.5 ml-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                        title="Remove profile"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {activeEntityId !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectEntity('ALL')}
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline shrink-0"
            >
              Reset to View ALL Accounts
            </button>
          )}
        </div>
      )}

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
              No Bank Accounts Found for Selected Profile
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              There are no bank accounts bound to this user profile yet. You can view all unassigned accounts across the business or bind an account to this profile.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {onSelectEntity && (
              <button
                type="button"
                onClick={() => onSelectEntity('ALL')}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow transition-all hover:opacity-90"
              >
                View ALL Accounts ({allAccounts.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (activeEntityId !== 'ALL') {
                  setSelectedProfileId(activeEntityId);
                  setProfileBindingMode('EXISTING');
                }
                setShowAddAccountModal(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add & Bind Account Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => {
          const ownerProfile = userProfiles.find((p) => p.id === acc.profileId || p.associatedAccountIds?.includes(acc.id));

          return (
            <div key={acc.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {acc.bankName}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                      {acc.type === 'CREDIT_CARD' ? <CreditCard className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                    </div>
                    {onDeleteAccount && (
                      <button
                        type="button"
                        onClick={() => onDeleteAccount(acc.id)}
                        title="Delete bank account"
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{acc.name}</h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{acc.accountNumber}</p>

                {/* Profile Badge or Binding Controls */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {editingCardAccId === acc.id ? (
                    <div className="space-y-1.5">
                      <select
                        value={cardProfileSelect}
                        onChange={(e) => setCardProfileSelect(e.target.value)}
                        className="w-full text-[11px] p-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="">-- None (Unbind) --</option>
                        {userProfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.role})
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCardAccId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveCardProfile(acc.id)}
                          className="p-1 bg-teal-500 text-slate-950 rounded hover:bg-teal-400 font-bold"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : ownerProfile ? (
                    <div className="flex items-center justify-between gap-1 group">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[10px] font-bold rounded-lg truncate max-w-full">
                        <User className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{ownerProfile.name}</span>
                      </div>
                      {onUpdateAccountProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            setCardProfileSelect(ownerProfile.id);
                            setEditingCardAccId(acc.id);
                          }}
                          className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-0.5"
                          title="Change bound profile"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-slate-400 italic">Unbound Account</span>
                      {onUpdateAccountProfile && userProfiles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCardProfileSelect(userProfiles[0]?.id || '');
                            setEditingCardAccId(acc.id);
                          }}
                          className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                        >
                          <UserPlus className="w-3 h-3" /> Bind Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Balance</span>
                <span className={`text-lg font-black tracking-tight ${acc.balance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
                  ${acc.balance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* CSV / XLSX Bank Statement Import Box */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Import ANZ / ASB / BNZ / Westpac / Kiwibank & Custom NZ Bank CSV Statements
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> NZ Auto-Parser
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload CSV bank statement files from any New Zealand bank or custom financial institution to parse and import into local bookkeeping
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Download Sample CSV Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Bank Account</label>
            <select
              value={selectedTargetAccId}
              onChange={(e) => setSelectedTargetAccId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-teal-600 dark:text-slate-100 font-semibold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bankName} - {a.name} ({a.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Statement Format</label>
            <select
              value={bankFormat}
              onChange={(e) => setBankFormat(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
            >
              <option value="AUTO">Auto-Detect NZ Bank Format</option>
              <option value="ANZ">ANZ Bank NZ CSV</option>
              <option value="ASB">ASB Bank CSV</option>
              <option value="BNZ">BNZ CSV</option>
              <option value="WESTPAC">Westpac NZ CSV</option>
              <option value="KIWIBANK">Kiwibank CSV</option>
              <option value="CUSTOM">Custom NZ Bank Standard CSV</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Statement File (.csv)</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 dark:file:bg-teal-950 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Dry Run Preview Table */}
        {parsedPreview.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Parsed {parsedPreview.length} Statement Lines for Import (Dry Run Preview)
              </span>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 hover:brightness-105"
              >
                Confirm & Import All ({parsedPreview.length}) <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-64 border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700 font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Statement Description</th>
                    <th className="py-2.5 px-3">Assigned Category</th>
                    <th className="py-2.5 px-3 text-right">Amount ($)</th>
                    <th className="py-2.5 px-3 text-right">GST Portion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {parsedPreview.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{row.date}</td>
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{row.description}</td>
                      <td className="py-2 px-3 text-teal-700 dark:text-teal-400 font-semibold">{row.category}</td>
                      <td className={`py-2 px-3 text-right font-bold ${row.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        ${row.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400 font-mono">${row.gstAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Bank Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Custom NZ Bank Account</h3>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ANZ Business Reserve Account"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Institution</label>
                  <select
                    value={newAccBank}
                    onChange={(e) => setNewAccBank(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-semibold"
                  >
                    <option value="ANZ">ANZ NZ</option>
                    <option value="ASB">ASB Bank</option>
                    <option value="BNZ">BNZ</option>
                    <option value="Westpac">Westpac NZ</option>
                    <option value="Kiwibank">Kiwibank</option>
                    <option value="Other">Other Custom Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100"
                  >
                    <option value="BUSINESS_CHEQUE">Business Cheque</option>
                    <option value="SAVINGS">Tax Savings Reserve</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="PETTY_CASH">Petty Cash Float</option>
                  </select>
                </div>
              </div>

              {newAccBank === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Bank / Financial Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSB Bank NZ, Heartland Bank, Co-operative Bank"
                    value={customBankNameInput}
                    onChange={(e) => setCustomBankNameInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NZ Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 01-0123-0456789-00"
                  value={newAccNum}
                  onChange={(e) => setNewAccNum(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Opening Balance ($ NZD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-bold"
                />
              </div>

              {/* Bind User Profile option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Bind to User Profile Name (Optional)
                </label>

                <div className="flex gap-2 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setProfileBindingMode('CUSTOM')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${profileBindingMode === 'CUSTOM' ? 'bg-teal-500 text-slate-950 font-bold shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                  >
                    + Enter Custom Name
                  </button>
                  {userProfiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setProfileBindingMode('EXISTING')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${profileBindingMode === 'EXISTING' ? 'bg-teal-500 text-slate-950 font-bold shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                      Select Existing ({userProfiles.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setProfileBindingMode('NONE')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${profileBindingMode === 'NONE' ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                  >
                    None
                  </button>
                </div>

                {profileBindingMode === 'CUSTOM' && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <input
                        type="text"
                        placeholder="e.g. Aroha Taylor (or custom profile name)"
                        value={customProfName}
                        onChange={(e) => setCustomProfName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Role / Position"
                        value={customProfRole}
                        onChange={(e) => setCustomProfRole(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-teal-600 dark:text-slate-100"
                      />
                      <input
                        type="email"
                        placeholder="Email (Optional)"
                        value={customProfEmail}
                        onChange={(e) => setCustomProfEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-teal-600 dark:text-slate-100"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      This custom name will be automatically saved as a bound user profile in local storage.
                    </p>
                  </div>
                )}

                {profileBindingMode === 'EXISTING' && (
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-semibold"
                  >
                    <option value="">-- Choose Existing User Profile --</option>
                    {userProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow"
                >
                  Save Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
