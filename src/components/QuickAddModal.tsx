import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  DollarSign,
  Calculator,
  Tag,
  Calendar,
  Landmark,
  Check,
  Sparkles,
  Paperclip,
  Church,
  HeartHandshake,
  Receipt,
  FileCheck2,
  ShieldCheck,
  Info,
  Users,
} from 'lucide-react';
import { Account, Project, TransactionType, GSTType, Transaction } from '../types';
import { calculateGST } from '../services/nzTaxEngine';
import { suggestCategoryForDescription } from '../services/autoCategorize';

interface QuickAddModalProps {
  accounts: Account[];
  projects: Project[];
  isOpen?: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

interface CategoryOption {
  name: string;
  irdCode: string;
  defaultGst: GSTType;
  isChurch?: boolean;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { name: 'Sales & Consulting Income', irdCode: '100 - Operating Income', defaultGst: 'STANDARD_15' },
  { name: 'Interest & Investment Income', irdCode: '120 - Interest Received', defaultGst: 'EXEMPT' },
  { name: 'Office Supplies & Stationery', irdCode: '300 - Office Expenses', defaultGst: 'STANDARD_15' },
  { name: 'Tools & Computer Equipment', irdCode: '310 - Hardware & Assets', defaultGst: 'STANDARD_15' },
  { name: 'Motor Vehicle & Fuel', irdCode: '410 - Vehicle Running Costs', defaultGst: 'STANDARD_15' },
  { name: 'Utilities & Telco', irdCode: '340 - Telephone & Internet', defaultGst: 'STANDARD_15' },
  { name: 'Subscriptions & Software', irdCode: '350 - Software Services', defaultGst: 'STANDARD_15' },
  { name: 'Travel & Accommodation', irdCode: '360 - Business Travel', defaultGst: 'STANDARD_15' },
  { name: 'Meals & Entertainment (50% Tax Deductible)', irdCode: '370 - Entertainment', defaultGst: 'STANDARD_15' },
  { name: 'Professional Fees & Legal', irdCode: '380 - Accountancy & Legal', defaultGst: 'STANDARD_15' },
  { name: 'Advertising & Marketing', irdCode: '390 - Marketing Expenses', defaultGst: 'STANDARD_15' },
  { name: 'Bank Fees & Interest', irdCode: '400 - Financial Charges', defaultGst: 'EXEMPT' },
  { name: 'GST Paid / Refunded IRD', irdCode: 'TAX - IRD GST Settlement', defaultGst: 'NO_GST' },
  { name: 'Provisional Tax Paid', irdCode: 'TAX - IRD Provisional Tax', defaultGst: 'NO_GST' },
  { name: 'Owner Draw / Drawings', irdCode: '500 - Shareholder Equity', defaultGst: 'NO_GST' },
  
  // Church & Nonprofit specific categories
  { name: 'Church Tithes & Weekly Offerings (IR526)', irdCode: '105 - Tithes & Offerings', defaultGst: 'EXEMPT', isChurch: true },
  { name: 'Church / Charity Donations & Pledges (IR526)', irdCode: '106 - Charitable Donations', defaultGst: 'EXEMPT', isChurch: true },
  { name: 'Pass-Through / Designated Missions Fund', irdCode: '107 - Pass-Through Funds', defaultGst: 'EXEMPT', isChurch: true },
  { name: 'Charity Grants & Government Subsidies', irdCode: '108 - Non-Profit Grants', defaultGst: 'EXEMPT', isChurch: true },
  { name: 'Church Ministry & Youth/Welfare Expenses', irdCode: '395 - Ministry Expenses', defaultGst: 'STANDARD_15', isChurch: true },
  { name: 'Volunteer Expense Claims & Reimbursements', irdCode: '396 - Volunteer Reimbursements', defaultGst: 'STANDARD_15', isChurch: true },
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  accounts,
  projects,
  isOpen = true,
  onClose,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [projectId, setProjectId] = useState('');
  const [categoryObj, setCategoryObj] = useState<CategoryOption>(CATEGORY_OPTIONS[2]);
  const [gstType, setGstType] = useState<GSTType>('STANDARD_15');
  const [isInclusive, setIsInclusive] = useState(true);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Church & Nonprofit State
  const [isChurchNonprofit, setIsChurchNonprofit] = useState(false);
  const [churchCategory, setChurchCategory] = useState<'TITHES' | 'DONATION' | 'OFFERING' | 'PASS_THROUGH' | 'GRANT' | 'VOLUNTEER_REIMBURSEMENT' | 'MINISTRY_EXPENSE'>('TITHES');
  const [donorName, setDonorName] = useState('');
  const [isTaxDeductibleDonation, setIsTaxDeductibleDonation] = useState(true);

  // GST Returns (GST101) State
  const [gstReturnPeriod, setGstReturnPeriod] = useState('Jul-Aug 2026');
  const [gstBoxMapping, setGstBoxMapping] = useState<'BOX_5_SALES' | 'BOX_6_ZERO_RATED' | 'BOX_8_PURCHASES' | 'BOX_9_EXEMPT'>('BOX_8_PURCHASES');

  // Auto sync GST Box mapping when type or gstType changes
  useEffect(() => {
    if (type === 'INCOME') {
      if (gstType === 'STANDARD_15') setGstBoxMapping('BOX_5_SALES');
      else if (gstType === 'ZERO_RATED') setGstBoxMapping('BOX_6_ZERO_RATED');
      else setGstBoxMapping('BOX_9_EXEMPT');
    } else if (type === 'EXPENSE') {
      if (gstType === 'STANDARD_15') setGstBoxMapping('BOX_8_PURCHASES');
      else setGstBoxMapping('BOX_9_EXEMPT');
    } else {
      setGstBoxMapping('BOX_9_EXEMPT');
    }
  }, [type, gstType]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amountStr) || 0;
  const gstCalc = calculateGST(numAmount, gstType, isInclusive);

  const handleSelectCategory = (catName: string) => {
    const sel = CATEGORY_OPTIONS.find((c) => c.name === catName);
    if (sel) {
      setCategoryObj(sel);
      setGstType(sel.defaultGst);

      // Auto toggle Church / Nonprofit section if church category selected
      if (sel.isChurch) {
        setIsChurchNonprofit(true);
        if (sel.name.includes('Tithes')) setChurchCategory('TITHES');
        else if (sel.name.includes('Donations')) setChurchCategory('DONATION');
        else if (sel.name.includes('Pass-Through')) setChurchCategory('PASS_THROUGH');
        else if (sel.name.includes('Grants')) setChurchCategory('GRANT');
        else if (sel.name.includes('Volunteer')) setChurchCategory('VOLUNTEER_REIMBURSEMENT');
        else if (sel.name.includes('Ministry')) setChurchCategory('MINISTRY_EXPENSE');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAccId = accountId || accounts[0]?.id;
    if (!description.trim() || numAmount <= 0 || !selectedAccId) return;

    // Build tags array
    const autoTags: string[] = [];
    if (isChurchNonprofit) {
      autoTags.push('#ChurchNonprofit', `#${churchCategory}`);
      if (isTaxDeductibleDonation) autoTags.push('#IR526TaxDeductible');
    }
    if (gstReturnPeriod) {
      autoTags.push(`#GST_${gstReturnPeriod.replace(/\s+/g, '_')}`);
    }
    if (gstBoxMapping) {
      autoTags.push(`#${gstBoxMapping}`);
    }

    onAddTransaction({
      date,
      description: description.trim(),
      amount: numAmount,
      type,
      category: categoryObj.name,
      accountId: selectedAccId,
      projectId: projectId || undefined,
      gstType,
      gstAmount: gstCalc.gstAmount,
      irdTaxCode: categoryObj.irdCode,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      isReconciled: false,
      isChurchNonprofit,
      churchCategory: isChurchNonprofit ? churchCategory : undefined,
      donorName: isChurchNonprofit && donorName.trim() ? donorName.trim() : undefined,
      isTaxDeductibleDonation: isChurchNonprofit ? isTaxDeductibleDonation : undefined,
      gstReturnPeriod,
      gstBoxMapping,
      tags: autoTags.length > 0 ? autoTags : undefined,
    });

    // Reset & close
    setDescription('');
    setAmountStr('');
    setReference('');
    setNotes('');
    setDonorName('');
    setIsChurchNonprofit(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150 my-auto max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-sm">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">New Bookkeeping Entry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">With Church/Nonprofit & IRD GST Return Breakdown</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Transaction Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(['EXPENSE', 'INCOME', 'TRANSFER', 'TAX_PAYMENT', 'DIVIDEND', 'OWNER_DRAW'] as TransactionType[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      if (t === 'INCOME') {
                        handleSelectCategory(CATEGORY_OPTIONS[0].name);
                      } else if (t === 'EXPENSE') {
                        handleSelectCategory(CATEGORY_OPTIONS[2].name);
                      } else if (t === 'TAX_PAYMENT') {
                        handleSelectCategory(CATEGORY_OPTIONS[12].name);
                      } else if (t === 'OWNER_DRAW') {
                        handleSelectCategory(CATEGORY_OPTIONS[14].name);
                      }
                    }}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      type === t
                        ? t === 'INCOME'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : t === 'EXPENSE'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Amount & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Amount ($ NZD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Description / Payee / Contributor</label>
              {suggestCategoryForDescription(description) && (
                <button
                  type="button"
                  onClick={() => {
                    const match = suggestCategoryForDescription(description);
                    if (match) {
                      handleSelectCategory(match.category);
                    }
                  }}
                  className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full hover:bg-indigo-100 flex items-center gap-1 animate-pulse"
                  title="Click to apply suggested category"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Auto-detected: {suggestCategoryForDescription(description)?.category}
                </button>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Weekly Tithe Offering, Volunteer Fuel Claim, Spark NZ, Client Payment"
              value={description}
              onChange={(e) => {
                const val = e.target.value;
                setDescription(val);
                const match = suggestCategoryForDescription(val);
                if (match) {
                  handleSelectCategory(match.category);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Bank Account & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankName} - {acc.name} (${acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IRD Category & Tax Code</label>
              <select
                value={categoryObj.name}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-medium"
              >
                <optgroup label="Standard Business Categories">
                  {CATEGORY_OPTIONS.filter((c) => !c.isChurch).map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.irdCode})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⛪ Church & Non-Profit Categories">
                  {CATEGORY_OPTIONS.filter((c) => c.isChurch).map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      ⛪ {cat.name} ({cat.irdCode})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Church & Non-Profit Options Section */}
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Church className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">Church & Non-Profit Transaction</span>
                  <p className="text-[10px] text-slate-500">Enable donor tax receipting (IR526) & charity fund allocation</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChurchNonprofit}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsChurchNonprofit(checked);
                    if (checked && categoryObj.isChurch) {
                      setGstType('EXEMPT');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {isChurchNonprofit && (
              <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Charity / Church Fund Type</label>
                    <select
                      value={churchCategory}
                      onChange={(e) => setChurchCategory(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                    >
                      <option value="TITHES">Tithes & Weekly Offerings</option>
                      <option value="DONATION">General Charitable Donation (IR526)</option>
                      <option value="PASS_THROUGH">Pass-Through Missions Fund</option>
                      <option value="GRANT">Charity Grant / Govt Subsidy</option>
                      <option value="VOLUNTEER_REIMBURSEMENT">Volunteer Expense Claim</option>
                      <option value="MINISTRY_EXPENSE">Church Ministry / Youth Welfare</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Donor / Contributor Name (Optional)</label>
                    <div className="relative">
                      <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        placeholder="e.g., John & Mary Smith or Anonymous"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTaxDeductibleDonation}
                      onChange={(e) => setIsTaxDeductibleDonation(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Issue IR526 Tax Receipt (33.33% Tax Rebate)
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setGstType('EXEMPT');
                      setGstBoxMapping('BOX_9_EXEMPT');
                    }}
                    className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-all self-start sm:self-auto"
                  >
                    Apply NZ Non-Profit GST Exemption (s14)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GST Return (GST101) & Breakdown Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-teal-600" /> NZ GST 15% Calculation & IRD Return Mapping
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsInclusive(true)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    isInclusive ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  GST Incl.
                </button>
                <button
                  type="button"
                  onClick={() => setIsInclusive(false)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    !isInclusive ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  GST Excl.
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">GST Rate</span>
                <select
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value as GSTType)}
                  className="w-full text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none p-0"
                >
                  <option value="STANDARD_15">Standard 15% GST</option>
                  <option value="ZERO_RATED">Zero Rated 0%</option>
                  <option value="EXEMPT">Exempt (Donations/Wages)</option>
                  <option value="NO_GST">No GST</option>
                </select>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">GST Portion ($)</span>
                <span className="font-bold text-teal-700 text-sm">${gstCalc.gstAmount.toFixed(2)}</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Net Excl. GST ($)</span>
                <span className="font-bold text-slate-700 text-sm">${gstCalc.exclusiveAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* GST Return Period & IRD Box Mapping Row */}
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">GST Return Period</label>
                <select
                  value={gstReturnPeriod}
                  onChange={(e) => setGstReturnPeriod(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                >
                  <option value="Jun-Jul 2026">Jun-Jul 2026 Filing Period</option>
                  <option value="Jul-Aug 2026">Jul-Aug 2026 Filing Period</option>
                  <option value="Aug-Sep 2026">Aug-Sep 2026 Filing Period</option>
                  <option value="Oct-Nov 2026">Oct-Nov 2026 Filing Period</option>
                  <option value="Dec 2026-Jan 2027">Dec 2026-Jan 2027 Filing Period</option>
                  <option value="2026 Q3">2026 Q3 (Jul-Sep)</option>
                  <option value="2026 Q4">2026 Q4 (Oct-Dec)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">IRD GST101 Return Box</label>
                <select
                  value={gstBoxMapping}
                  onChange={(e) => setGstBoxMapping(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-bold text-teal-800"
                >
                  <option value="BOX_5_SALES">📦 Box 5: Total Sales & Income (15% GST)</option>
                  <option value="BOX_6_ZERO_RATED">📦 Box 6: Zero-Rated Income (0% GST)</option>
                  <option value="BOX_8_PURCHASES">📦 Box 8: Total Purchases & Expenses (15% GST)</option>
                  <option value="BOX_9_EXEMPT">📦 Box 9: Exempt / Non-GST Supplies</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project & Reference Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Client Tag (Optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="">-- No Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Inv #</label>
              <input
                type="text"
                placeholder="e.g., INV-001, DON-882, POS-09"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="sticky -bottom-5 -mx-5 -mb-5 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Save Entry
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
