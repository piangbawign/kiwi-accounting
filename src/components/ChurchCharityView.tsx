import React, { useState } from 'react';
import {
  ChurchDonor,
  ChurchDonationReceipt,
  PassThroughFund,
  VolunteerExpenseClaim,
  CompanySettings,
  Transaction,
  Account,
} from '../types';
import { generateDonationReceiptPDF } from '../services/pdfGenerator';
import { IrdTooltip, IRD_DICTIONARY } from './IrdTooltip';
import {
  HeartHandshake,
  FileCheck2,
  Users,
  Layers,
  Receipt,
  FileText,
  Plus,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Search,
  BookOpen,
  Moon,
  Sun,
  BarChart3,
  Table,
  Sparkles,
  CheckSquare,
  Square,
  X,
  Tag,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChurchCharityViewProps {
  companySettings: CompanySettings;
  donors: ChurchDonor[];
  donationReceipts: ChurchDonationReceipt[];
  passThroughFunds: PassThroughFund[];
  volunteerExpenses: VolunteerExpenseClaim[];
  transactions: Transaction[];
  accounts: Account[];
  onAddDonor: (donor: Omit<ChurchDonor, 'id'>) => void;
  onDeleteDonor?: (id: string) => void;
  onIssueReceipt: (receipt: Omit<ChurchDonationReceipt, 'id'>) => void;
  onAddPassThroughFund: (fund: Omit<PassThroughFund, 'id'>) => void;
  onUpdatePassThroughFund: (id: string, deltaReceived: number, deltaDisbursed: number) => void;
  onAddVolunteerExpense: (exp: Omit<VolunteerExpenseClaim, 'id'>) => void;
  onApproveVolunteerExpense: (id: string, bankAccountId: string) => void;
  onBulkDeleteDonors?: (ids: string[]) => void;
  onBulkDeleteReceipts?: (ids: string[]) => void;
  onBulkDeleteVolunteerClaims?: (ids: string[]) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

// Category suggestion preset rules for auto-suggestions
const CATEGORY_SUGGESTIONS = [
  {
    keywords: ['tithe', 'offering', 'general gift', 'weekly donation', 'sunday'],
    category: '101 - Tithes & Unconditional Offerings',
    gstType: 'EXEMPT' as const,
    irdCode: '101 - Unconditional Tithes',
    ministry: 'General Operations',
  },
  {
    keywords: ['cyclone', 'relief', 'pass-through', 'vanuatu', 'foodbank', 'mission'],
    category: '102 - Pass-Through Designated Giving',
    gstType: 'EXEMPT' as const,
    irdCode: '102 - Pass-Through Funds',
    ministry: 'Community Relief',
  },
  {
    keywords: ['rockshop', 'sound', 'mic', 'av', 'music', 'instrument', 'speaker'],
    category: '301 - Music, AV & Production',
    gstType: 'STANDARD_15' as const,
    irdCode: '301 - Music & Worship Operations',
    ministry: 'Worship & Production',
  },
  {
    keywords: ['youth', 'camp', 'outreach', 'barbecue', 'community', 'children'],
    category: '302 - Youth & Community Outreach',
    gstType: 'STANDARD_15' as const,
    irdCode: '302 - Community Outreach Expenses',
    ministry: 'Youth Ministry',
  },
  {
    keywords: ['rent', 'power', 'genesis', 'cleaner', 'hall', 'maintenance', 'facility'],
    category: '201 - Facility Rent & Utilities',
    gstType: 'STANDARD_15' as const,
    irdCode: '201 - Property & Utilities',
    ministry: 'Facilities',
  },
  {
    keywords: ['fuel', 'petrol', 'mileage', 'parking', 'volunteer', 'travel', 'reimbursement'],
    category: '300 - Volunteer Expenses',
    gstType: 'STANDARD_15' as const,
    irdCode: '300 - Volunteer Reimbursements',
    ministry: 'Volunteer Support',
  },
  {
    keywords: ['pastor', 'stipend', 'wages', 'paye', 'salary'],
    category: '401 - Pastoral Staff Stipend & PAYE',
    gstType: 'EXEMPT' as const,
    irdCode: '401 - Pastoral Payroll',
    ministry: 'Pastoral Care',
  },
];

export const ChurchCharityView: React.FC<ChurchCharityViewProps> = ({
  companySettings,
  donors,
  donationReceipts,
  passThroughFunds,
  volunteerExpenses,
  transactions,
  accounts,
  onAddDonor,
  onDeleteDonor,
  onIssueReceipt,
  onAddPassThroughFund,
  onUpdatePassThroughFund,
  onAddVolunteerExpense,
  onApproveVolunteerExpense,
  onBulkDeleteDonors,
  onBulkDeleteReceipts,
  onBulkDeleteVolunteerClaims,
  isDarkMode: externalDarkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'DONATIONS' | 'DONORS' | 'PASSTHROUGH' | 'VOLUNTEERS' | 'REPORTS' | 'GUIDE'>('DONATIONS');

  // Feature Toggles (Dark Mode, Chart Toggle, Bulk Delete Mode)
  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const isDarkMode = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode;
  const toggleDarkModeHandler = onToggleDarkMode || (() => setInternalDarkMode(!internalDarkMode));
  const [viewMode, setViewMode] = useState<'TABLE' | 'CHARTS'>('TABLE');

  // Bulk Selection States
  const [selectedDonorIds, setSelectedDonorIds] = useState<string[]>([]);
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>([]);
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>([]);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  // Modals
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [showGenerateReceiptModal, setShowGenerateReceiptModal] = useState(false);
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showReceiptPreviewModal, setShowReceiptPreviewModal] = useState<ChurchDonationReceipt | null>(null);

  // Search & Filters
  const [donorSearch, setDonorSearch] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  // New Donor Form State
  const [donorNumber, setDonorNumber] = useState(`DON-${101 + donors.length}`);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorIrd, setDonorIrd] = useState('');
  const [isTaxReceiptEligible, setIsTaxReceiptEligible] = useState(true);
  const [givingMethod, setGivingMethod] = useState<ChurchDonor['givingMethod']>('AUTOMATIC_PAYMENT');

  // New Receipt Generator Form State
  const [selectedDonorId, setSelectedDonorId] = useState(donors[0]?.id || '');
  const [receiptTaxYear, setReceiptTaxYear] = useState('2025/2026 Tax Year (Ending 31 March 2026)');
  const [receiptDeductibleAmount, setReceiptDeductibleAmount] = useState('2600.00');
  const [receiptNonDeductibleAmount, setReceiptNonDeductibleAmount] = useState('0.00');

  // New Pass-Through Fund Form State
  const [fundName, setFundName] = useState('');
  const [fundCode, setFundCode] = useState('PASS-');
  const [fundTarget, setFundTarget] = useState('5000');
  const [fundDescription, setFundDescription] = useState('');

  // New Volunteer Claim Form State with Auto-Suggest
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volMinistry, setVolMinistry] = useState('Youth Ministry');
  const [volDescription, setVolDescription] = useState('');
  const [volAmount, setVolAmount] = useState('');
  const [volGstType, setVolGstType] = useState<'STANDARD_15' | 'EXEMPT'>('STANDARD_15');
  const [volCategory, setVolCategory] = useState('300 - Volunteer Expenses');

  // Helper calculations for summary metrics
  const totalDeductibleDonations = donationReceipts.reduce((sum, r) => sum + r.totalTaxDeductibleAmount, 0);
  const totalPassThroughReceived = passThroughFunds.reduce((sum, f) => sum + f.currentReceived, 0);
  const pendingVolunteerClaims = volunteerExpenses.filter((v) => v.status === 'PENDING').length;

  // Filtered Donors
  const filteredDonors = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.donorNumber.toLowerCase().includes(donorSearch.toLowerCase()) ||
      (d.email && d.email.toLowerCase().includes(donorSearch.toLowerCase()))
  );

  // Filtered Receipts
  const filteredReceipts = donationReceipts.filter(
    (r) =>
      r.donorName.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      r.taxYear.toLowerCase().includes(receiptSearch.toLowerCase())
  );

  // Auto-suggest category matcher
  const matchedSuggestions = CATEGORY_SUGGESTIONS.filter((s) =>
    s.keywords.some((kw) => volDescription.toLowerCase().includes(kw))
  );

  // 1. CSV EXPORTERS
  const exportDonorsCSV = () => {
    const headers = ['Donor Number', 'Name', 'Email', 'IRD Number', 'Address', 'Tax Eligible', 'Giving Method'];
    const rows = donors.map((d) => [
      `"${d.donorNumber}"`,
      `"${d.name}"`,
      `"${d.email || ''}"`,
      `"${d.irdNumber || ''}"`,
      `"${(d.address || '').replace(/"/g, '""')}"`,
      `"${d.isTaxReceiptEligible ? 'Yes' : 'No'}"`,
      `"${d.givingMethod}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadCSVFile(csvContent, 'nz_church_donors.csv');
  };

  const exportReceiptsCSV = () => {
    const headers = ['Receipt #', 'Donor Name', 'Donor IRD', 'Tax Year', 'Issue Date', 'Tax Deductible ($)', 'Non-Deductible ($)', 'CC Number', 'Status'];
    const rows = donationReceipts.map((r) => [
      `"${r.receiptNumber}"`,
      `"${r.donorName}"`,
      `"${r.donorIrdNumber || ''}"`,
      `"${r.taxYear}"`,
      `"${r.issueDate}"`,
      r.totalTaxDeductibleAmount.toFixed(2),
      r.totalNonDeductibleAmount.toFixed(2),
      `"${r.ccNumber}"`,
      `"${r.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadCSVFile(csvContent, 'ir526_donation_tax_receipts.csv');
  };

  const exportVolunteerExpensesCSV = () => {
    const headers = ['Volunteer Name', 'Ministry', 'Description', 'Amount ($)', 'Date', 'Status', 'Approved By'];
    const rows = volunteerExpenses.map((v) => [
      `"${v.volunteerName}"`,
      `"${v.ministry}"`,
      `"${(v.description || '').replace(/"/g, '""')}"`,
      v.amount.toFixed(2),
      `"${v.expenseDate}"`,
      `"${v.status}"`,
      `"${v.approvedBy || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadCSVFile(csvContent, 'volunteer_expense_claims.csv');
  };

  const exportCharitySummaryCSV = () => {
    const csvRows = [
      ['NZ CHARITY TIER 3/4 FINANCIAL SUMMARY REPORT'],
      [`Organisation: ${companySettings.tradingName}`],
      [`Charities Commission CC#: ${companySettings.ccNumber || 'CC58921'}`],
      [`IRD Number: ${companySettings.irdNumber}`],
      [''],
      ['FINANCIAL METRIC', 'TOTAL AMOUNT (NZD)'],
      ['Total IR526 Tax Deductible Receipts Issued', totalDeductibleDonations.toFixed(2)],
      ['Total Pass-Through Relief Funds Collected', totalPassThroughReceived.toFixed(2)],
      ['Pending Volunteer Reimbursement Claims', pendingVolunteerClaims],
      ['Registered Donors Count', donors.length],
    ];
    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    downloadCSVFile(csvContent, 'charity_financial_summary.csv');
  };

  const downloadCSVFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. PRINT BUTTON TRIGGER
  const handlePrintWindow = () => {
    window.print();
  };

  // 3. BULK SELECTION HANDLERS
  const toggleSelectDonor = (id: string) => {
    setSelectedDonorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllDonors = () => {
    if (selectedDonorIds.length === filteredDonors.length) {
      setSelectedDonorIds([]);
    } else {
      setSelectedDonorIds(filteredDonors.map((d) => d.id));
    }
  };

  const toggleSelectReceipt = (id: string) => {
    setSelectedReceiptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllReceipts = () => {
    if (selectedReceiptIds.length === filteredReceipts.length) {
      setSelectedReceiptIds([]);
    } else {
      setSelectedReceiptIds(filteredReceipts.map((r) => r.id));
    }
  };

  const toggleSelectVolunteer = (id: string) => {
    setSelectedVolunteerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVolunteers = () => {
    if (selectedVolunteerIds.length === volunteerExpenses.length) {
      setSelectedVolunteerIds([]);
    } else {
      setSelectedVolunteerIds(volunteerExpenses.map((v) => v.id));
    }
  };

  const executeBulkDelete = () => {
    if (activeTab === 'DONORS' && onBulkDeleteDonors && selectedDonorIds.length > 0) {
      onBulkDeleteDonors(selectedDonorIds);
      setSelectedDonorIds([]);
    } else if (activeTab === 'DONATIONS' && onBulkDeleteReceipts && selectedReceiptIds.length > 0) {
      onBulkDeleteReceipts(selectedReceiptIds);
      setSelectedReceiptIds([]);
    } else if (activeTab === 'VOLUNTEERS' && onBulkDeleteVolunteerClaims && selectedVolunteerIds.length > 0) {
      onBulkDeleteVolunteerClaims(selectedVolunteerIds);
      setSelectedVolunteerIds([]);
    }
    setShowBulkConfirmModal(false);
  };

  // Save Handlers
  const handleSaveDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName) return;
    onAddDonor({
      donorNumber,
      name: donorName,
      email: donorEmail,
      address: donorAddress,
      irdNumber: donorIrd,
      isTaxReceiptEligible,
      givingMethod,
    });
    setShowAddDonorModal(false);
    setDonorName('');
    setDonorEmail('');
    setDonorAddress('');
    setDonorIrd('');
  };

  const handleGenerateReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donorObj = donors.find((d) => d.id === selectedDonorId);
    if (!donorObj) return;

    const newReceipt: Omit<ChurchDonationReceipt, 'id'> = {
      receiptNumber: `REC-2026-${donorObj.donorNumber.replace('-', '')}`,
      donorId: donorObj.id,
      donorName: donorObj.name,
      donorAddress: donorObj.address || companySettings.businessAddress,
      donorIrdNumber: donorObj.irdNumber,
      taxYear: receiptTaxYear,
      issueDate: new Date().toISOString().split('T')[0],
      totalTaxDeductibleAmount: parseFloat(receiptDeductibleAmount) || 0,
      totalNonDeductibleAmount: parseFloat(receiptNonDeductibleAmount) || 0,
      ccNumber: companySettings.ccNumber || 'CC58921',
      churchName: companySettings.legalName || companySettings.tradingName,
      officialSignatory: companySettings.officialSignatoryName || 'Senior Pastor / Treasurer',
      signatoryTitle: companySettings.officialSignatoryTitle || 'Treasurer & Trustee',
      status: 'ISSUED',
    };

    onIssueReceipt(newReceipt);
    setShowGenerateReceiptModal(false);
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName) return;
    onAddPassThroughFund({
      fundName,
      code: fundCode,
      targetAmount: parseFloat(fundTarget) || 0,
      currentReceived: 0,
      currentDisbursed: 0,
      status: 'ACTIVE',
      description: fundDescription,
    });
    setShowAddFundModal(false);
    setFundName('');
    setFundDescription('');
  };

  const handleSaveVolunteerClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volAmount) return;
    onAddVolunteerExpense({
      volunteerName: volName,
      volunteerEmail: volEmail,
      ministry: volMinistry,
      expenseDate: new Date().toISOString().split('T')[0],
      description: `${volCategory} - ${volDescription}`,
      amount: parseFloat(volAmount) || 0,
      gstType: volGstType,
      receiptAttached: true,
      status: 'PENDING',
    });
    setShowAddExpenseModal(false);
    setVolName('');
    setVolEmail('');
    setVolDescription('');
    setVolAmount('');
  };

  const handleCopyReceiptText = (rec: ChurchDonationReceipt) => {
    const text = `
DONATION TAX RECEIPT - IRD COMPLIANT (IR526)
--------------------------------------------------
Receipt Number: ${rec.receiptNumber}
Date Issued: ${rec.issueDate}
Charities Services Registration No (CC#): ${rec.ccNumber}

ORGANISATION DETAILS:
${rec.churchName}
${companySettings.businessAddress}
IRD Number: ${companySettings.irdNumber}

DONOR DETAILS:
Donor Name: ${rec.donorName}
Address: ${rec.donorAddress || 'N/A'}
Donor IRD Number: ${rec.donorIrdNumber || 'N/A'}

TAX DEDUCTION BREAKDOWN:
Tax Period: ${rec.taxYear}
Unconditional Tax-Deductible Gift Total: $${rec.totalTaxDeductibleAmount.toFixed(2)} NZD
Non-Deductible Payments (Camp/Books): $${rec.totalNonDeductibleAmount.toFixed(2)} NZD

STATUTORY COMPLIANCE DECLARATION:
We certify that no goods, services, or direct personal benefits were provided to the donor in exchange for the unconditional tax-deductible gifts listed above.

OFFICIAL AUTHORISED SIGNATURE:
Signed: ___________________________
${rec.officialSignatory}
${rec.signatoryTitle}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedReceiptId(rec.id);
    setTimeout(() => setCopiedReceiptId(null), 3000);
  };

  // Recharts Chart Data Prep
  const chartMonthlyData = [
    { month: 'Apr', tithes: 18500, passThrough: 2400, volunteerClaims: 650 },
    { month: 'May', tithes: 21200, passThrough: 3100, volunteerClaims: 820 },
    { month: 'Jun', tithes: 19800, passThrough: 1800, volunteerClaims: 450 },
    { month: 'Jul', tithes: 24500, passThrough: 5200, volunteerClaims: 1100 },
    { month: 'Aug', tithes: 22000, passThrough: 4000, volunteerClaims: 900 },
    { month: 'Sep', tithes: 26100, passThrough: 6800, volunteerClaims: 1350 },
  ];

  const passThroughChartData = passThroughFunds.map((f) => ({
    name: f.fundName.length > 18 ? f.fundName.substring(0, 18) + '...' : f.fundName,
    Target: f.targetAmount,
    Collected: f.currentReceived,
    Disbursed: f.currentDisbursed,
  }));

  const pieIncomeRatioData = [
    { name: 'Tax Deductible Tithes', value: totalDeductibleDonations || 38500, color: '#2563eb' },
    { name: 'Pass-Through Relief', value: totalPassThroughReceived || 12400, color: '#10b981' },
    { name: 'Non-Deductible Events', value: 3200, color: '#f59e0b' },
  ];

  const pieExpenseData = [
    { name: 'Pastoral & Staff', value: 42000, color: '#6366f1' },
    { name: 'Facility Rent & Power', value: 18500, color: '#06b6d4' },
    { name: 'Youth & Outreach', value: 9400, color: '#ec4899' },
    { name: 'Volunteer Reimbursements', value: 3100, color: '#84cc16' },
  ];

  // Dynamic Theme Classes based on Dark Mode
  const bgCanvas = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const headerBg = isDarkMode ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-slate-800' : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-blue-800/40';

  return (
    <div className={`space-y-6 transition-colors duration-300 p-1 sm:p-2 rounded-2xl ${bgCanvas}`}>
      {/* Top Banner Header */}
      <div className={`rounded-3xl p-6 text-white shadow-xl border relative overflow-hidden ${headerBg}`}>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <HeartHandshake className="w-80 h-80 text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>NZ Charities Services & IRD IR526 Compliant</span>
              </span>
              {companySettings.ccNumber && (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  {companySettings.ccNumber}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Church & Non-Profit Charity Hub</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Manage tithes & donor ledger, issue official IRD IR526 donation tax receipts, track pass-through mission funds, and reimburse volunteer expense claims.
            </p>
          </div>

          {/* Quick Toolbar: Dark Mode, CSV Export, Print */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkModeHandler}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center gap-1.5 text-xs font-bold"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-200" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrintWindow}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Print Page / Generate PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* CSV Export Dropdown / Button */}
            <button
              type="button"
              onClick={exportCharitySummaryCSV}
              className="p-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl border border-emerald-400/30 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Export Financial Summary CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Primary Action */}
            <button
              type="button"
              onClick={() => setShowGenerateReceiptModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Tax Receipt</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Total Donors</span>
            <span className="text-xl font-black text-white mt-0.5 block">{donors.length} Registered</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-blue-200 font-semibold flex items-center gap-1">
              IR526 Receipts Issued
              <IrdTooltip
                term={IRD_DICTIONARY.IR526_REBATE.title}
                explanation={IRD_DICTIONARY.IR526_REBATE.text}
              />
            </span>
            <span className="text-xl font-black text-blue-300 font-mono mt-0.5 block">
              ${totalDeductibleDonations.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-emerald-200 font-semibold block">Pass-Through Relief</span>
            <span className="text-xl font-black text-emerald-300 font-mono mt-0.5 block">
              ${totalPassThroughReceived.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-amber-200 font-semibold block">Pending Volunteer Claims</span>
            <span className="text-xl font-black text-amber-300 mt-0.5 block">
              {pendingVolunteerClaims} Claims
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Sub Navigation Tabs + Chart View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('DONATIONS')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'DONATIONS'
                ? 'bg-blue-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Donation Receipts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DONORS')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'DONORS'
                ? 'bg-blue-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Donor Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PASSTHROUGH')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'PASSTHROUGH'
                ? 'bg-blue-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pass-Through Funds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VOLUNTEERS')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'VOLUNTEERS'
                ? 'bg-blue-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Volunteer Reimbursements</span>
            {pendingVolunteerClaims > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                {pendingVolunteerClaims}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'REPORTS'
                ? 'bg-blue-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tier 3/4 Statement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GUIDE')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'GUIDE'
                ? 'bg-amber-600 text-white shadow-md'
                : isDarkMode
                ? 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-slate-800'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>IRD IR526 Rules</span>
          </button>
        </div>

        {/* Chart View Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'TABLE'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('CHARTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'CHARTS'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visual Charts</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Selection Action Bar */}
      {((activeTab === 'DONORS' && selectedDonorIds.length > 0) ||
        (activeTab === 'DONATIONS' && selectedReceiptIds.length > 0) ||
        (activeTab === 'VOLUNTEERS' && selectedVolunteerIds.length > 0)) && (
        <div className="sticky top-20 z-20 bg-blue-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-blue-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-xs">
              {activeTab === 'DONORS' && `${selectedDonorIds.length} donor(s) selected`}
              {activeTab === 'DONATIONS' && `${selectedReceiptIds.length} receipt(s) selected`}
              {activeTab === 'VOLUNTEERS' && `${selectedVolunteerIds.length} volunteer claim(s) selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDonorIds([]);
                setSelectedReceiptIds([]);
                setSelectedVolunteerIds([]);
              }}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-medium"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setShowBulkConfirmModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* VISUAL CHARTS ANALYTICS VIEW */}
      {viewMode === 'CHARTS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Monthly Tithes vs Relief vs Volunteer Claims */}
            <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>Monthly Tithes vs Pass-Through vs Claims</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Comparison of unconditional giving against designated funds and volunteer reimbursements.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartMonthlyData}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="tithes" name="Unconditional Tithes ($)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passThrough" name="Pass-Through Relief ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volunteerClaims" name="Volunteer Claims ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Pass-Through Mission Funds Target vs Collection */}
            <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Pass-Through Funds Target vs Collection</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Fundraising goal completion for designated relief & community mission funds.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={passThroughChartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Target" name="Goal Target ($)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Collected" name="Collected ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Tax Deductible Ratio Pie Chart */}
            <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-500" />
                <span>Income Tax Deductibility Breakdown (IR526)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Proportion of tax-deductible gifts vs non-deductible camp fees and pass-through funds.
              </p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieIncomeRatioData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieIncomeRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Expense Distribution */}
            <div className={`p-5 rounded-2xl border shadow-sm ${cardBg}`}>
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-500" />
                <span>Ministry Operating Expense Allocations</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Operating expenses categorized by pastoral payroll, facilities, youth, and volunteers.
              </p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieExpenseData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABULAR CONTENT VIEWS */}
      {viewMode === 'TABLE' && (
        <>
          {/* TAB 1: DONATION TAX RECEIPTS (IR526) */}
          {activeTab === 'DONATIONS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search receipt #, donor name or tax year..."
                    value={receiptSearch}
                    onChange={(e) => setReceiptSearch(e.target.value)}
                    className={`w-full text-xs rounded-xl pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportReceiptsCSV}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Receipts CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateReceiptModal(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Issue IR526 Receipt</span>
                  </button>
                </div>
              </div>

              {/* Receipts Table */}
              <div className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={isDarkMode ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedReceiptIds.length > 0 && selectedReceiptIds.length === filteredReceipts.length}
                            onChange={toggleSelectAllReceipts}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-3 font-semibold">Receipt Number</th>
                        <th className="p-3 font-semibold">Donor Name & IRD</th>
                        <th className="p-3 font-semibold">Tax Period</th>
                        <th className="p-3 font-semibold text-right">Tax Deductible ($)</th>
                        <th className="p-3 font-semibold text-right">Non-Deductible ($)</th>
                        <th className="p-3 font-semibold">Issue Date</th>
                        <th className="p-3 font-semibold text-center">CC# Status</th>
                        <th className="p-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredReceipts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400">
                            No IR526 donation receipts found. Click "Issue IR526 Receipt" to create one.
                          </td>
                        </tr>
                      ) : (
                        filteredReceipts.map((rec) => (
                          <tr key={rec.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedReceiptIds.includes(rec.id)}
                                onChange={() => toggleSelectReceipt(rec.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {rec.receiptNumber}
                            </td>
                            <td className="p-3">
                              <span className="font-bold block text-slate-900 dark:text-slate-100">{rec.donorName}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                IRD: {rec.donorIrdNumber || 'On file'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                              {rec.taxYear}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ${rec.totalTaxDeductibleAmount.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-500 dark:text-slate-400">
                              ${rec.totalNonDeductibleAmount.toFixed(2)}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{rec.issueDate}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
                                CC# {rec.ccNumber}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const donorObj = donors.find((d) => d.id === rec.donorId) || {
                                    id: rec.donorId,
                                    donorNumber: 'DON-UNK',
                                    name: rec.donorName,
                                    email: '',
                                    address: rec.donorAddress || '',
                                    irdNumber: rec.donorIrdNumber || '',
                                    isTaxReceiptEligible: true,
                                    givingMethod: 'BANK_TRANSFER' as const,
                                  };
                                  generateDonationReceiptPDF(rec, donorObj, companySettings);
                                }}
                                className="px-2.5 py-1 bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 rounded-lg text-xs font-bold hover:bg-teal-100 border border-teal-200/50"
                                title="Download Official IR526 Tax Receipt PDF"
                              >
                                PDF Receipt
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowReceiptPreviewModal(rec)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-100"
                              >
                                View / Print
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyReceiptText(rec)}
                                className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200"
                                title="Copy text receipt statement"
                              >
                                {copiedReceiptId === rec.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" /> : <Copy className="w-3.5 h-3.5 inline" />}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DONOR DIRECTORY */}
          {activeTab === 'DONORS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search donor name, donor # or email..."
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    className={`w-full text-xs rounded-xl pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportDonorsCSV}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Donors CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDonorModal(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Donor</span>
                  </button>
                </div>
              </div>

              {/* Donors Table */}
              <div className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={isDarkMode ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedDonorIds.length > 0 && selectedDonorIds.length === filteredDonors.length}
                            onChange={toggleSelectAllDonors}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-3 font-semibold">Donor #</th>
                        <th className="p-3 font-semibold">Name & Address</th>
                        <th className="p-3 font-semibold">Contact Email</th>
                        <th className="p-3 font-semibold">Donor IRD Number</th>
                        <th className="p-3 font-semibold">Giving Method</th>
                        <th className="p-3 font-semibold text-center">Tax Eligible</th>
                        <th className="p-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredDonors.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            No donors found. Click "Add Donor" to register one.
                          </td>
                        </tr>
                      ) : (
                        filteredDonors.map((d) => (
                          <tr key={d.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedDonorIds.includes(d.id)}
                                onChange={() => toggleSelectDonor(d.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{d.donorNumber}</td>
                            <td className="p-3">
                              <span className="font-bold block text-slate-900 dark:text-slate-100">{d.name}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                                {d.address || 'No physical address recorded'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">{d.email || 'N/A'}</td>
                            <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{d.irdNumber || 'N/A'}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                              {d.givingMethod.replace('_', ' ')}
                            </td>
                            <td className="p-3 text-center">
                              {d.isTaxReceiptEligible ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[10px]">
                                  Eligible (IR526)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold text-[10px]">
                                  Ineligible
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {onDeleteDonor && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteDonor(d.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                  title="Remove Donor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASSTHROUGH MISSION FUNDS */}
          {activeTab === 'PASSTHROUGH' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Designated Pass-Through Mission Funds</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gifts collected for external relief or specific designated purposes (held in trust on balance sheet).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddFundModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Pass-Through Fund</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passThroughFunds.map((fund) => {
                  const pct = fund.targetAmount > 0 ? Math.min(100, (fund.currentReceived / fund.targetAmount) * 100) : 0;
                  const balanceInTrust = fund.currentReceived - fund.currentDisbursed;

                  return (
                    <div key={fund.id} className={`p-5 rounded-2xl border shadow-xs space-y-3 ${cardBg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                            {fund.code}
                          </span>
                          <h4 className="font-bold text-sm mt-1">{fund.fundName}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {fund.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{fund.description}</p>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span className="text-slate-500 dark:text-slate-400">Target Progress</span>
                          <span className="font-mono">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Received</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">${fund.currentReceived}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Disbursed</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">${fund.currentDisbursed}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">In Trust</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">${balanceInTrust}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: VOLUNTEER EXPENSE REIMBURSEMENTS */}
          {activeTab === 'VOLUNTEERS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold">Volunteer Expense Reimbursement Ledger</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reimburse volunteer mileage, event food, and ministry supplies with clear receipt audit trails.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportVolunteerExpensesCSV}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Claims CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Volunteer Claim</span>
                  </button>
                </div>
              </div>

              {/* Claims Table */}
              <div className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={isDarkMode ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedVolunteerIds.length > 0 && selectedVolunteerIds.length === volunteerExpenses.length}
                            onChange={toggleSelectAllVolunteers}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-3 font-semibold">Volunteer Name</th>
                        <th className="p-3 font-semibold">Ministry / Purpose</th>
                        <th className="p-3 font-semibold">Expense Description</th>
                        <th className="p-3 font-semibold text-right">Claim Amount ($)</th>
                        <th className="p-3 font-semibold">Date</th>
                        <th className="p-3 font-semibold text-center">Status</th>
                        <th className="p-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {volunteerExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            No volunteer claims submitted.
                          </td>
                        </tr>
                      ) : (
                        volunteerExpenses.map((v) => (
                          <tr key={v.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedVolunteerIds.includes(v.id)}
                                onChange={() => toggleSelectVolunteer(v.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{v.volunteerName}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">{v.ministry}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{v.description}</td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              ${v.amount.toFixed(2)}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{v.expenseDate}</td>
                            <td className="p-3 text-center">
                              {v.status === 'PENDING' ? (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold text-[10px]">
                                  Pending Approval
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[10px]">
                                  Reimbursed
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {v.status === 'PENDING' ? (
                                <button
                                  type="button"
                                  onClick={() => onApproveVolunteerExpense(v.id, accounts[0]?.id || 'acc-anz-cheque')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                >
                                  Reimburse
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono">Approved</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHARITIES TIER 3/4 STATEMENT OF CASH RECEIPTS & PAYMENTS */}
          {activeTab === 'REPORTS' && (
            <div className={`p-6 rounded-2xl border shadow-sm space-y-6 ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Tier 3 / Tier 4 Statement of Cash Receipts & Payments
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compliant with NZ XRB Simple Format Reporting Standard for Registered Charities.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportCharitySummaryCSV}
                    className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintWindow}
                    className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>
                </div>
              </div>

              {/* Printable Statement Container */}
              <div className="space-y-6 text-xs font-mono">
                {/* Operating Receipts */}
                <div>
                  <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 font-sans border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                    1. Operating Receipts (Operating Revenue)
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Unconditional Tithes & Offerings (IR526 Deductible):</span>
                      <span className="font-bold">${totalDeductibleDonations.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Designated Pass-Through Mission Funds Collected:</span>
                      <span className="font-bold">${totalPassThroughReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 font-bold">
                      <span>TOTAL CASH RECEIPTS:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ${(totalDeductibleDonations + totalPassThroughReceived).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Payments */}
                <div>
                  <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 font-sans border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                    2. Operating Payments (Ministry Expenses)
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Pastoral Staff Stipend & Payroll Costs:</span>
                      <span>$42,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Church Facility Rent, Power & Insurance:</span>
                      <span>$18,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volunteer Reimbursements & Ministry Supplies:</span>
                      <span>${volunteerExpenses.reduce((sum, v) => sum + (v.status === 'REIMBURSED' ? v.amount : 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 font-bold">
                      <span>TOTAL CASH PAYMENTS:</span>
                      <span className="text-rose-600 dark:text-rose-400">$63,600.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: IRD IR526 STATUTORY GUIDELINES */}
          {activeTab === 'GUIDE' && (
            <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${cardBg}`}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>IRD IR526 Donation Tax Credit Compliance Guide</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                In New Zealand, donors can claim a <strong>33.33% Tax Credit</strong> on eligible donations to registered charities using IRD Form IR526. Ensure your receipts adhere to mandatory IRD requirements:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200 space-y-2">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400">✅ IRD Mandatory Tax Receipt Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Charities Services Registration Number (CC#) displayed prominently.</li>
                    <li>Official name and address of the registered church or trust.</li>
                    <li>Full legal name of the donor.</li>
                    <li>Sequential unique tax receipt reference number.</li>
                    <li>Explicit statement certifying that no goods or services were provided in exchange.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-800 dark:text-slate-200 space-y-2">
                  <h4 className="font-bold text-blue-700 dark:text-blue-400">❌ Non-Deductible Payments (Ineligible for IR526)</h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Youth camp registration fees or retreat ticket purchases.</li>
                    <li>Payments for books, merchandise, or food items.</li>
                    <li>School or kindergarten tuition fee contributions.</li>
                    <li>Pass-through payments for specific named private individuals.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: ADD DONOR */}
      {showAddDonorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Register New Church Donor</span>
              </h3>
              <button type="button" onClick={() => setShowAddDonorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Donor Number</label>
                <input
                  type="text"
                  value={donorNumber}
                  onChange={(e) => setDonorNumber(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Donor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sione & Aroha Williams"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Donor Email</label>
                  <input
                    type="email"
                    placeholder="sione@example.co.nz"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Donor IRD Number</label>
                  <input
                    type="text"
                    placeholder="123-456-789"
                    value={donorIrd}
                    onChange={(e) => setDonorIrd(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Physical Address (For IRD Tax Receipts)</label>
                <input
                  type="text"
                  placeholder="12 Church Lane, Manukau, Auckland 2022"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="taxEligible"
                  checked={isTaxReceiptEligible}
                  onChange={(e) => setIsTaxReceiptEligible(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="taxEligible" className="font-semibold text-slate-700 dark:text-slate-300">
                  Eligible for Annual IR526 Tax Receipt Claim
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddDonorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE IR526 TAX RECEIPT */}
      {showGenerateReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <span>Issue IR526 Donation Tax Receipt</span>
              </h3>
              <button type="button" onClick={() => setShowGenerateReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReceiptSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Registered Donor *</label>
                <select
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.donorNumber}) - IRD: {d.irdNumber || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tax Year Period</label>
                <input
                  type="text"
                  value={receiptTaxYear}
                  onChange={(e) => setReceiptTaxYear(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Unconditional Gift Total ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={receiptDeductibleAmount}
                    onChange={(e) => setReceiptDeductibleAmount(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold text-emerald-600 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Eligible for 33.33% IRD credit</span>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Non-Deductible Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={receiptNonDeductibleAmount}
                    onChange={(e) => setReceiptNonDeductibleAmount(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Camp fees, merchandise, books</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
                <span className="font-bold block">Statutory Declaration Auto-Included:</span>
                <p>
                  Includes CC# <strong>{companySettings.ccNumber || 'CC58921'}</strong>, official authorized signature line for{' '}
                  <strong>{companySettings.officialSignatoryName || 'Senior Pastor / Treasurer'}</strong>, and statutory non-benefit statement.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateReceiptModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">
                  Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD PASS-THROUGH MISSION FUND */}
      {showAddFundModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Create Pass-Through Designated Fund</span>
              </h3>
              <button type="button" onClick={() => setShowAddFundModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFund} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Fund Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyclone Relief Appeal - Vanuatu"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Fund Code</label>
                  <input
                    type="text"
                    value={fundCode}
                    onChange={(e) => setFundCode(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Target Goal ($)</label>
                  <input
                    type="number"
                    value={fundTarget}
                    onChange={(e) => setFundTarget(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Relief Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Specific purpose for holding funds in trust for designated disbursement..."
                  value={fundDescription}
                  onChange={(e) => setFundDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFundModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">
                  Create Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBMIT VOLUNTEER REIMBURSEMENT CLAIM WITH AUTO-SUGGEST CATEGORIES */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <span>Submit Volunteer Expense Claim</span>
              </h3>
              <button type="button" onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVolunteerClaim} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Volunteer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ministry Department</label>
                  <select
                    value={volMinistry}
                    onChange={(e) => setVolMinistry(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Worship & Production">Worship & Production</option>
                    <option value="Community Outreach">Community Outreach</option>
                    <option value="Pastoral & Care">Pastoral & Care</option>
                    <option value="Facilities & Grounds">Facilities & Grounds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fuel for youth camp bus or Rockshop microphone cable..."
                  value={volDescription}
                  onChange={(e) => setVolDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />

                {/* Auto-Suggest Smart Chips */}
                {matchedSuggestions.length > 0 && (
                  <div className="mt-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Smart Auto-Suggest Categories Found:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setVolCategory(s.category);
                            setVolGstType(s.gstType);
                            setVolMinistry(s.ministry);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-all flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{s.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category Code</label>
                  <input
                    type="text"
                    value={volCategory}
                    onChange={(e) => setVolCategory(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Claim Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={volAmount}
                    onChange={(e) => setVolAmount(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RECEIPT PREVIEW & PRINT DIALOG */}
      {showReceiptPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <span>IR526 Donation Tax Receipt Official Statement</span>
              </h3>
              <button type="button" onClick={() => setShowReceiptPreviewModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Printable Card */}
            <div className="p-6 rounded-2xl border border-slate-300 bg-white text-slate-900 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-blue-900">{showReceiptPreviewModal.churchName}</h2>
                  <p className="text-slate-500 font-medium">{companySettings.businessAddress}</p>
                  <p className="text-slate-500 font-mono">IRD #: {companySettings.irdNumber}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-mono font-bold rounded-md">
                    CC# {showReceiptPreviewModal.ccNumber}
                  </span>
                  <p className="text-xs font-mono font-bold mt-2 text-slate-700">
                    Receipt #: {showReceiptPreviewModal.receiptNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">Issued: {showReceiptPreviewModal.issueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">DONOR NAME</span>
                  <span className="font-bold text-sm block text-slate-900">{showReceiptPreviewModal.donorName}</span>
                  <span className="text-slate-500 text-[11px] block">{showReceiptPreviewModal.donorAddress || 'On file'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">DONOR IRD NUMBER</span>
                  <span className="font-mono font-bold block text-slate-900">
                    {showReceiptPreviewModal.donorIrdNumber || 'Provided upon claim'}
                  </span>
                  <span className="text-slate-500 text-[11px] block">Tax Period: {showReceiptPreviewModal.taxYear}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Unconditional Tax-Deductible Gifts (IR526 Eligible):</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    ${showReceiptPreviewModal.totalTaxDeductibleAmount.toFixed(2)} NZD
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-500">Non-Deductible Payments (Camp/Books):</span>
                  <span className="font-mono font-bold text-slate-600">
                    ${showReceiptPreviewModal.totalNonDeductibleAmount.toFixed(2)} NZD
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <p className="font-bold">IRD Statutory Compliance Declaration:</p>
                <p>
                  We certify that the above amount represents unconditional gifts and that no goods, services, or direct benefits were supplied in return to the donor.
                </p>
              </div>

              <div className="pt-6 flex justify-between items-end border-t border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400">AUTHORISED SIGNATURE</p>
                  <p className="font-mono text-sm font-bold mt-4 text-slate-800">________________________</p>
                  <p className="font-bold text-slate-900 text-xs mt-1">{showReceiptPreviewModal.officialSignatory}</p>
                  <p className="text-slate-500 text-[11px]">{showReceiptPreviewModal.signatoryTitle}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
                    OFFICIAL IRD RECEIPT
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintWindow}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptPreviewModal(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRM BULK DELETE */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 ${cardBg}`}>
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base">Confirm Bulk Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete selected records?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-4 py-2 text-slate-500 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
