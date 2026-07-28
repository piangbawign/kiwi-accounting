import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  Zap,
  HelpCircle,
  FileSearch,
  Calculator,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Check,
  ArrowRight,
  Download,
  Percent,
  Filter,
  Tag,
  ExternalLink,
  Award,
  Info,
  Building,
} from 'lucide-react';
import { AppState, Transaction } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  type?: 'general' | 'audit' | 'advice';
}

interface TaxGapItem {
  id: string;
  transactionId?: string;
  date?: string;
  merchant: string;
  amount: number;
  currentCategory: string;
  currentGstType: string;
  issueType: 'MISSED_GST' | 'MISSED_DEDUCTION' | 'ENTERTAINMENT_LIMIT' | 'LOW_VALUE_ASSET' | 'HOME_OFFICE_GAP' | 'VEHICLE_LOGBOOK';
  recommendedCategory: string;
  recommendedGstType: 'STANDARD_15' | 'ZERO_RATED' | 'EXEMPT' | 'NO_GST';
  recommendedIrdCode: string;
  estimatedTaxSavings: number;
  irdGuidelineRef: string;
  explanation: string;
  applied?: boolean;
}

interface AiAdvisorViewProps {
  appState: AppState;
  onUpdateTransactions?: (updated: Transaction[]) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'NZ GST Deduction Rules',
    prompt: 'What business expense categories qualify for 100% GST claim vs 50% entertainment limits under NZ IRD rules?',
    icon: Calculator,
  },
  {
    title: 'Small Business Company Tax Review',
    prompt: 'Analyze our current financial state for Small Business Company Limited and suggest 3 key tax strategies for FY2025/26.',
    icon: FileSearch,
  },
  {
    title: 'KiwiSaver & PAYE Employer Obligations',
    prompt: 'Explain the 3.5% employee KiwiSaver contribution rate and 3% employer contribution rate rules for NZ payroll.',
    icon: Zap,
  },
  {
    title: 'Provisional Tax Options',
    prompt: 'Compare Standard Provisional Tax vs AIM (Accounting Income Method) for our company in New Zealand.',
    icon: HelpCircle,
  },
];

// Common NZ GST-charging vendors for automated rule matching
const KNOWN_NZ_GST_VENDORS = [
  'spark', 'vodafone', 'one nz', 'bunnings', 'mitre 10', 'z energy', 'bp', 'mobil', 'gull',
  'microsoft', 'adobe', 'uber', 'pb tech', 'countdown', 'woolworths', 'paknsave', 'new world',
  'noel leeming', 'harvey norman', 'officemax', 'staples', 'google', 'aws', 'xero', 'myob'
];

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ appState, onUpdateTransactions }) => {
  const [activeTab, setActiveTab] = useState<'TAX_GAP' | 'CHAT' | 'AUDIT'>('TAX_GAP');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Kia ora! I am your **NZ Tax & Accounting AI Advisor** for **${appState.companySettings.legalName}** (NZBN: ${appState.companySettings.nzbn || '9429041234567'}).

How can I help you today? You can run an **IRD Tax Gap Analysis**, ask me about **GST claims**, **IRD tax compliance**, or request a full **AI Audit** of your ledger!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Audit State
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);

  // Tax Gap Analysis State
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [appliedItemIds, setAppliedItemIds] = useState<Set<string>>(new Set());
  const [gapFilter, setGapFilter] = useState<'ALL' | 'MISSED_GST' | 'MISSED_DEDUCTION' | 'ENTERTAINMENT_LIMIT' | 'LOW_VALUE_ASSET'>('ALL');
  const [aiGapSummary, setAiGapSummary] = useState<{
    executiveSummary?: string;
    overallHealthScore?: number;
  } | null>(null);
  const [customAiGaps, setCustomAiGaps] = useState<TaxGapItem[] | null>(null);

  // Instant Deterministic Rule Engine for Tax Gap Analysis
  const clientTaxGaps = useMemo<TaxGapItem[]>(() => {
    const gaps: TaxGapItem[] = [];

    appState.transactions.forEach((tx) => {
      if (tx.type !== 'EXPENSE') return;

      const descLower = tx.description.toLowerCase();
      const amount = Math.abs(tx.amount);

      // 1. Check for Missed GST on Known NZ Standard GST Vendors
      const isKnownGstVendor = KNOWN_NZ_GST_VENDORS.some((v) => descLower.includes(v));
      if (isKnownGstVendor && (tx.gstType === 'NO_GST' || tx.gstType === 'EXEMPT')) {
        const missedGstAmount = +(amount * 3 / 23).toFixed(2);
        gaps.push({
          id: `gap-gst-${tx.id}`,
          transactionId: tx.id,
          date: tx.date,
          merchant: tx.description,
          amount,
          currentCategory: tx.category,
          currentGstType: tx.gstType,
          issueType: 'MISSED_GST',
          recommendedCategory: tx.category || 'Operating Expense',
          recommendedGstType: 'STANDARD_15',
          recommendedIrdCode: '300 - Operating Expenses',
          estimatedTaxSavings: missedGstAmount,
          irdGuidelineRef: 'IRD Goods & Services Tax Act 1985 Section 8',
          explanation: `Vendor "${tx.description}" is an established NZ registered vendor. Setting GST to 15% Standard allows claiming $${missedGstAmount.toFixed(2)} in GST input credits on your GST return.`,
        });
      }

      // 2. Low-Value Asset Instant Write-off ($1,000 IRD threshold)
      if (amount <= 1000 && amount >= 150 && (descLower.includes('laptop') || descLower.includes('phone') || descLower.includes('tool') || descLower.includes('monitor') || descLower.includes('printer') || descLower.includes('equipment'))) {
        if (tx.category?.toLowerCase().includes('asset') || tx.category?.toLowerCase().includes('capital')) {
          const estimatedIncomeTaxSavings = +(amount * 0.28).toFixed(2);
          gaps.push({
            id: `gap-asset-${tx.id}`,
            transactionId: tx.id,
            date: tx.date,
            merchant: tx.description,
            amount,
            currentCategory: tx.category,
            currentGstType: tx.gstType || 'STANDARD_15',
            issueType: 'LOW_VALUE_ASSET',
            recommendedCategory: 'Tools & Equipment (<$1,000)',
            recommendedGstType: tx.gstType === 'NO_GST' ? 'STANDARD_15' : tx.gstType,
            recommendedIrdCode: '310 - Low Value Asset Write-off',
            estimatedTaxSavings: estimatedIncomeTaxSavings,
            irdGuidelineRef: 'IRD Section EE 38 Income Tax Act 2007 ($1,000 Instant Deprec. Threshold)',
            explanation: `Assets purchased for under $1,000 excl. GST qualify for an immediate 100% tax deduction in the year of purchase rather than multi-year depreciation schedules.`,
          });
        }
      }

      // 3. Entertainment Expense 50% vs 100% Rules
      if (descLower.includes('cafe') || descLower.includes('restaurant') || descLower.includes('catering') || descLower.includes('coffee') || descLower.includes('bar ') || descLower.includes('dining')) {
        if (tx.irdTaxCode !== '320 - Entertainment Expenses (50% Claimable)') {
          gaps.push({
            id: `gap-ent-${tx.id}`,
            transactionId: tx.id,
            date: tx.date,
            merchant: tx.description,
            amount,
            currentCategory: tx.category,
            currentGstType: tx.gstType,
            issueType: 'ENTERTAINMENT_LIMIT',
            recommendedCategory: 'Entertainment & Hospitality',
            recommendedGstType: 'STANDARD_15',
            recommendedIrdCode: '320 - Entertainment Expenses (50% Claimable)',
            estimatedTaxSavings: +(amount * 0.14).toFixed(2),
            irdGuidelineRef: 'IRD Guide IR264 (50% Meal & Entertainment Limit Rules)',
            explanation: `Under IRD Guide IR264, meals and drinks with clients or staff are 50% deductible. Correctly classifying prevents IRD audit penalties while optimizing legitimate expense claims.`,
          });
        }
      }

      // 4. Home Office & Utilities Deduction Opportunities
      if (descLower.includes('power') || descLower.includes('electricity') || descLower.includes('mercury') || descLower.includes('contact energy') || descLower.includes('internet') || descLower.includes('broadband')) {
        if (!tx.category?.toLowerCase().includes('home office')) {
          const estimatedSavings = +(amount * 0.25 * 0.28).toFixed(2);
          gaps.push({
            id: `gap-home-${tx.id}`,
            transactionId: tx.id,
            date: tx.date,
            merchant: tx.description,
            amount,
            currentCategory: tx.category,
            currentGstType: tx.gstType,
            issueType: 'HOME_OFFICE_GAP',
            recommendedCategory: 'Home Office Utilities',
            recommendedGstType: 'STANDARD_15',
            recommendedIrdCode: '330 - Home Office Expenses',
            estimatedTaxSavings: estimatedSavings,
            irdGuidelineRef: 'IRD Guide IR1036 (Home Office & Utility Proportionate Claim Rules)',
            explanation: `If operating a business from home, you can claim a percentage (typically 15%-30%) of power, internet, and home office costs as a legitimate business deduction.`,
          });
        }
      }
    });

    return gaps;
  }, [appState.transactions]);

  // Combined Gap Items (AI server or deterministic fallback)
  const activeGaps = customAiGaps || clientTaxGaps;

  // Filtered Gaps
  const filteredGaps = useMemo(() => {
    return activeGaps.filter((g) => {
      if (gapFilter === 'ALL') return true;
      return g.issueType === gapFilter;
    });
  }, [activeGaps, gapFilter]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const unapplied = activeGaps.filter((g) => !appliedItemIds.has(g.id));
    const totalSavings = unapplied.reduce((sum, g) => sum + g.estimatedTaxSavings, 0);
    const missedGstCount = unapplied.filter((g) => g.issueType === 'MISSED_GST').length;
    const missedGstSum = unapplied.filter((g) => g.issueType === 'MISSED_GST').reduce((sum, g) => sum + g.estimatedTaxSavings, 0);
    const deductionGapSum = unapplied.filter((g) => g.issueType !== 'MISSED_GST').reduce((sum, g) => sum + g.estimatedTaxSavings, 0);
    const totalGapsCount = unapplied.length;

    return {
      totalSavings,
      missedGstCount,
      missedGstSum,
      deductionGapSum,
      totalGapsCount,
      healthScore: Math.max(60, 100 - totalGapsCount * 4),
    };
  }, [activeGaps, appliedItemIds]);

  // Trigger Gemini AI Gap Analysis
  const handleRunAiTaxGapAnalysis = async () => {
    setAnalyzingGap(true);
    try {
      const res = await fetch('/api/tax-gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: appState.transactions,
          companySettings: appState.companySettings,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.summary) {
          setAiGapSummary(data.result.summary);
        }
        if (Array.isArray(data.result.gaps) && data.result.gaps.length > 0) {
          const mappedGaps: TaxGapItem[] = data.result.gaps.map((g: any, index: number) => ({
            id: g.transactionId || `ai-gap-${index}-${Date.now()}`,
            transactionId: g.transactionId,
            merchant: g.description || 'Ledger Transaction',
            amount: Math.abs(g.amount || 0),
            currentCategory: g.currentCategory || 'General',
            currentGstType: g.currentGstType || 'NO_GST',
            issueType: g.issueType || 'MISSED_DEDUCTION',
            recommendedCategory: g.recommendedCategory || 'Operating Expense',
            recommendedGstType: g.recommendedGstType || 'STANDARD_15',
            recommendedIrdCode: g.recommendedIrdCode || '300 - Operating Expenses',
            estimatedTaxSavings: g.estimatedTaxSavings || 15,
            irdGuidelineRef: g.irdGuidelineRef || 'NZ IRD Tax Regulations',
            explanation: g.explanation || 'Optimizing transaction categorization for IRD tax compliance.',
          }));
          setCustomAiGaps(mappedGaps);
        }
      }
    } catch (err) {
      console.error('Failed to run AI tax gap analysis:', err);
    } finally {
      setAnalyzingGap(false);
    }
  };

  // Apply single IRD Recommendation
  const handleApplyGapFix = (gap: TaxGapItem) => {
    if (!onUpdateTransactions || !gap.transactionId) return;

    const targetTx = appState.transactions.find((t) => t.id === gap.transactionId);
    if (!targetTx) return;

    const newGstType = gap.recommendedGstType;
    const newGstAmount = newGstType === 'STANDARD_15' ? +(Math.abs(targetTx.amount) * 3 / 23).toFixed(2) : 0;

    const updatedTx: Transaction = {
      ...targetTx,
      category: gap.recommendedCategory,
      gstType: newGstType,
      gstAmount: newGstAmount,
      irdTaxCode: gap.recommendedIrdCode,
    };

    onUpdateTransactions([updatedTx]);
    setAppliedItemIds((prev) => new Set(prev).add(gap.id));
  };

  // Apply All High-Savings Recommendations
  const handleApplyAllFixes = () => {
    if (!onUpdateTransactions) return;

    const updatedTxs: Transaction[] = [];
    const newApplied = new Set(appliedItemIds);

    activeGaps.forEach((gap) => {
      if (newApplied.has(gap.id) || !gap.transactionId) return;
      const targetTx = appState.transactions.find((t) => t.id === gap.transactionId);
      if (targetTx) {
        const newGstType = gap.recommendedGstType;
        const newGstAmount = newGstType === 'STANDARD_15' ? +(Math.abs(targetTx.amount) * 3 / 23).toFixed(2) : 0;

        updatedTxs.push({
          ...targetTx,
          category: gap.recommendedCategory,
          gstType: newGstType,
          gstAmount: newGstAmount,
          irdTaxCode: gap.recommendedIrdCode,
        });
        newApplied.add(gap.id);
      }
    });

    if (updatedTxs.length > 0) {
      onUpdateTransactions(updatedTxs);
      setAppliedItemIds(newApplied);
    }
  };

  // Chat Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const summaryContext = {
        company: appState.companySettings,
        transactionsCount: appState.transactions.length,
        invoicesCount: appState.invoices.length,
        bankAccounts: appState.accounts.map((a) => ({ name: a.name, type: a.type, balance: a.balance })),
        recentTransactionsSample: appState.transactions.slice(0, 8),
      };

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          context: summaryContext,
        }),
      });

      const data = await res.json();

      if (data.success && data.answer) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to receive AI response');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ Error connecting to AI Tax Advisor: ${err?.message || 'Server error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // AI Audit Handler
  const handleRunAiAudit = async () => {
    setAuditing(true);
    setAuditResult(null);

    const auditPrompt = `Perform a comprehensive NZ IRD Tax & GST Audit on the provided company financial ledger.
Highlight:
1. Potential missed GST claimable expenses or misclassifications.
2. Compliance flags regarding entertainment, motor vehicle logbook, or home office expenses.
3. 3 specific actionable recommendations to optimize company tax efficiency for FY2025/26.`;

    try {
      const auditContext = {
        company: appState.companySettings,
        transactions: appState.transactions,
        invoices: appState.invoices,
        employees: appState.employees,
      };

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: auditPrompt,
          context: auditContext,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setAuditResult(data.answer);
      } else {
        setAuditResult(`Error running audit: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setAuditResult(`Failed to run AI audit: ${err?.message || 'Connection error'}`);
    } finally {
      setAuditing(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 mt-3 mb-1 text-sm">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-slate-900 text-base mt-4 mb-1 border-b border-slate-200 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={`${line.trim().startsWith('-') || line.trim().startsWith('1.') ? 'ml-3' : ''} text-xs leading-relaxed text-slate-700 my-0.5`}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-lg border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/30 border border-indigo-400/40 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">AI Tax Advisor & Gap Analysis</h1>
              <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Gemini 2.0 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Compares transactions against NZ IRD guidelines to identify missed deductions, unclaimed GST, and tax savings for {appState.companySettings.legalName}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 self-start lg:self-auto bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab('TAX_GAP')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'TAX_GAP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" /> Tax Gap Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'CHAT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" /> AI Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileSearch className="w-4 h-4" /> IRD Audit
          </button>
        </div>
      </div>

      {/* TAB 1: TAX GAP & SAVINGS ANALYSIS */}
      {activeTab === 'TAX_GAP' && (
        <div className="space-y-6">
          {/* Executive Overview & Run Engine Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">IRD Tax Gap & Deductions Engine</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full">
                  NZ IRD Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">
                Automatically matches expense records against standard NZ IRD tax rules (GST 15%, IR264 Entertainment, IR1036 Home Office, $1,000 Low Value Assets).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRunAiTaxGapAnalysis}
                disabled={analyzingGap}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {analyzingGap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {analyzingGap ? 'Analyzing IRD Rules...' : 'Run Gemini AI Gap Deep Scan'}
              </button>

              {activeGaps.length > 0 && onUpdateTransactions && (
                <button
                  type="button"
                  onClick={handleApplyAllFixes}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Apply All IRD Recommendations
                </button>
              )}
            </div>
          </div>

          {/* Key KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-5 rounded-2xl text-white shadow-sm border border-emerald-800/80">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-2">
                <span>Potential Tax Savings</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                ${metrics.totalSavings.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1">Identified across {metrics.totalGapsCount} ledger opportunities</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>Unclaimed GST Input Credits</span>
                <Percent className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                ${metrics.missedGstSum.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">{metrics.missedGstCount} transactions tagged as NO_GST for GST vendors</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>Income Deductions Gap</span>
                <Calculator className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                ${metrics.deductionGapSum.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Low-value assets, home office & travel expense claims</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>IRD Ledger Compliance Score</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{aiGapSummary?.overallHealthScore || metrics.healthScore}%</div>
                <span className="text-xs font-bold text-emerald-600">Optimal Range</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Based on IRD documentation requirements</p>
            </div>
          </div>

          {/* AI Executive Summary if available */}
          {aiGapSummary?.executiveSummary && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">Gemini AI Executive Summary</h4>
                <p className="text-xs text-indigo-900 mt-1 leading-relaxed">{aiGapSummary.executiveSummary}</p>
              </div>
            </div>
          )}

          {/* Filter Toolbar & Gap Findings List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Identified Tax Savings & Classification Gaps</h3>
                <p className="text-xs text-slate-500">Click "Apply IRD Recommendation" to instantly update ledger records</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-bold mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {[
                  { id: 'ALL', label: `All Opportunities (${activeGaps.length})` },
                  { id: 'MISSED_GST', label: 'Missed GST' },
                  { id: 'LOW_VALUE_ASSET', label: 'Asset Write-Off' },
                  { id: 'ENTERTAINMENT_LIMIT', label: 'Entertainment' },
                  { id: 'HOME_OFFICE_GAP', label: 'Home Office' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGapFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      gapFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gap List Items */}
            {filteredGaps.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No Unaddressed Tax Gaps Found</h4>
                <p className="text-xs text-slate-500">Your transactions in this category are fully optimized according to standard IRD rules.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGaps.map((gap) => {
                  const isApplied = appliedItemIds.has(gap.id);

                  return (
                    <div
                      key={gap.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isApplied
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-75'
                          : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-sm">{gap.merchant}</span>
                            <span className="text-xs font-mono font-bold text-slate-600">${gap.amount.toFixed(2)}</span>
                            {gap.date && <span className="text-[11px] text-slate-400">({gap.date})</span>}

                            {/* Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                gap.issueType === 'MISSED_GST'
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                  : gap.issueType === 'LOW_VALUE_ASSET'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {gap.issueType.replace('_', ' ')}
                            </span>

                            {isApplied && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Fix Applied
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{gap.explanation}</p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap pt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Tag className="w-3 h-3 text-indigo-500" /> Current: {gap.currentCategory} ({gap.currentGstType})
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="flex items-center gap-1 font-extrabold text-emerald-700">
                              Target: {gap.recommendedCategory} ({gap.recommendedGstType})
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 w-fit">
                            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>IRD Ref: {gap.irdGuidelineRef}</span>
                          </div>
                        </div>

                        {/* Right Action Side */}
                        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 self-stretch md:self-auto justify-between">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Est. Tax Savings</span>
                            <span className="text-base font-black text-emerald-600">+${gap.estimatedTaxSavings.toFixed(2)} NZD</span>
                          </div>

                          {!isApplied && onUpdateTransactions && gap.transactionId && (
                            <button
                              type="button"
                              onClick={() => handleApplyGapFix(gap)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Apply IRD Recommendation
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Official IRD Guidelines Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>IR1036 Home Office Claiming</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apportion household expenses (power, internet, rates, insurance) using total floor area percentage dedicated to business.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <UtensilsIcon className="w-4 h-4 text-amber-600" />
                <span>IR264 Entertainment 50% Rule</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client lunches, office party catering, and executive meals are capped at 50% deductibility for GST and Income Tax.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Section EE 38 $1,000 Threshold</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Items purchased under $1,000 excl. GST qualify for an instant 100% expense deduction in the year of purchase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CHAT */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[620px] overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-slate-100 pb-1 text-[10px] opacity-75">
                      <span className="font-bold">{msg.sender === 'user' ? 'You' : 'AI Tax Advisor'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-slate-500 text-xs py-2 px-3 bg-white rounded-xl border border-slate-200 w-fit">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing NZ IRD regulations & company context...</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask any NZ tax, GST, PAYE, or accounting question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Suggested Tax Queries</span>
              </div>
              <p className="text-xs text-slate-500">Click any preset to query the AI Tax Advisor instantly:</p>

              <div className="space-y-2">
                {PRESET_PROMPTS.map((preset, idx) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(preset.prompt)}
                      className="w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 group-hover:text-indigo-700">
                        <Icon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{preset.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{preset.prompt}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Active Ledger Context</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Legal Name:</span>
                  <span className="font-semibold text-white">{appState.companySettings.legalName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">NZBN:</span>
                  <span className="font-mono text-white">{appState.companySettings.nzbn || '9429041234567'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">GST Registration:</span>
                  <span className="font-semibold text-emerald-400">15% Payments Basis</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Ledger Items:</span>
                  <span className="font-bold text-white">{appState.transactions.length} Transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI TAX AUDIT */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">1-Click AI Company Tax Audit</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates all transactions, invoices, and payroll entries for NZ IRD compliance & tax efficiency.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunAiAudit}
              disabled={auditing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {auditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {auditing ? 'Running AI Audit...' : 'Run Company Audit'}
            </button>
          </div>

          {!auditResult && !auditing && (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Ready to Audit {appState.companySettings.legalName}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Run Company Audit" above to analyze your transactions against NZ GST regulations, entertainment expense limits, and provisional tax thresholds.
              </p>
            </div>
          )}

          {auditing && (
            <div className="py-12 text-center space-y-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 p-8">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Auditing Ledger Records...</h3>
              <p className="text-xs text-slate-500">Checking GST 15% claims, IRD deduction rules, and employee KiwiSaver entries.</p>
            </div>
          )}

          {auditResult && !auditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>AI Audit Complete for {appState.companySettings.legalName}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Model: Gemini 2.0 Flash</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-800 space-y-2 leading-relaxed font-sans">
                {renderFormattedText(auditResult)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function UtensilsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 2v16" />
      <path d="M2 13h12" />
      <path d="M5 2v18" />
    </svg>
  );
}
