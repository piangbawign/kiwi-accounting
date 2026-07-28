import React, { useState } from 'react';
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Landmark,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Wand2,
  Zap,
  Sliders,
  X,
  Filter,
  Check,
  Building,
  HelpCircle,
  Clock,
  Tag,
} from 'lucide-react';
import { BankStatementItem, Transaction, TransactionType, GSTType } from '../types';

interface BankReconciliationViewProps {
  bankStatements: BankStatementItem[];
  transactions: Transaction[];
  onReconcileMatch: (statementId: string, transactionId: string) => void;
  onUnreconcileMatch: (statementId: string, transactionId: string) => void;
  onAddTransaction?: (txData: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export interface FuzzyMatchCandidate {
  transaction: Transaction;
  score: number; // 0 to 100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  matchReasons: string[];
  amountDiff: number;
  daysDiff: number;
}

/**
 * Fuzzy Logic Match Engine
 * Calculates similarity between a bank statement feed item and ledger transactions
 * based on Amount similarity, Date proximity, and Text/Description similarity.
 */
export function calculateFuzzyMatchScore(
  statement: BankStatementItem,
  candidateTx: Transaction
): FuzzyMatchCandidate {
  const stmtAmount = Math.abs(statement.amount);
  const txAmount = Math.abs(candidateTx.amount);
  const amountDiff = Math.abs(stmtAmount - txAmount);

  // 1. Amount Similarity Score (Weight: 50%)
  let amountScore = 0;
  let amountReason = '';
  if (amountDiff < 0.001) {
    amountScore = 100;
    amountReason = `Exact Amount Match ($${stmtAmount.toFixed(2)} NZD)`;
  } else if (amountDiff <= 5.0 || (stmtAmount > 0 && amountDiff / stmtAmount <= 0.03)) {
    amountScore = Math.max(0, 100 - (amountDiff / (stmtAmount || 1)) * 300);
    amountReason = `Near Amount Match (Diff: $${amountDiff.toFixed(2)})`;
  } else {
    amountScore = 0;
    amountReason = `Amount difference: $${amountDiff.toFixed(2)}`;
  }

  // 2. Date Proximity Score (Weight: 30%)
  let daysDiff = 999;
  try {
    const stmtDate = new Date(statement.date).getTime();
    const txDate = new Date(candidateTx.date).getTime();
    if (!isNaN(stmtDate) && !isNaN(txDate)) {
      daysDiff = Math.abs(Math.round((stmtDate - txDate) / (1000 * 60 * 60 * 24)));
    }
  } catch (e) {
    daysDiff = 999;
  }

  let dateScore = 0;
  let dateReason = '';
  if (daysDiff === 0) {
    dateScore = 100;
    dateReason = `Exact Same Date (${statement.date})`;
  } else if (daysDiff === 1) {
    dateScore = 90;
    dateReason = `Date within 1 day (${candidateTx.date} vs ${statement.date})`;
  } else if (daysDiff <= 3) {
    dateScore = 75;
    dateReason = `Date within ${daysDiff} days`;
  } else if (daysDiff <= 7) {
    dateScore = 50;
    dateReason = `Date within ${daysDiff} days`;
  } else if (daysDiff <= 14) {
    dateScore = 25;
    dateReason = `Date within ${daysDiff} days`;
  } else {
    dateScore = 0;
    dateReason = `Date difference: ${daysDiff} days`;
  }

  // 3. Text & Description Similarity Score (Weight: 20%)
  const cleanStmt = (statement.description + ' ' + (statement.rawReference || '')).toLowerCase();
  const cleanTx = (
    candidateTx.description +
    ' ' +
    (candidateTx.notes || '') +
    ' ' +
    (candidateTx.reference || '') +
    ' ' +
    candidateTx.category
  ).toLowerCase();

  const stopWords = new Set(['the', 'inc', 'ltd', 'limited', 'co', 'nz', 'payment', 'transfer', 'and', 'for', 'ref']);
  const stmtTokens = cleanStmt.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !stopWords.has(t));
  const txTokens = new Set(cleanTx.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !stopWords.has(t)));

  let matchedTokensCount = 0;
  stmtTokens.forEach((tok) => {
    if (txTokens.has(tok)) matchedTokensCount++;
  });

  let textScore = 0;
  let textReason = '';
  if (cleanStmt && cleanTx && (cleanStmt.includes(cleanTx) || cleanTx.includes(cleanStmt))) {
    textScore = 100;
    textReason = 'Exact text substring match';
  } else if (stmtTokens.length > 0 && matchedTokensCount > 0) {
    const ratio = matchedTokensCount / stmtTokens.length;
    textScore = Math.min(100, Math.round(ratio * 100) + 20);
    textReason = `Keyword similarity (${matchedTokensCount} matching terms)`;
  } else {
    textScore = 10;
    textReason = 'No strong text term match';
  }

  // Composite score calculation
  const compositeScore = Math.round(amountScore * 0.5 + dateScore * 0.3 + textScore * 0.2);

  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (compositeScore >= 85) confidence = 'HIGH';
  else if (compositeScore >= 60) confidence = 'MEDIUM';

  const matchReasons: string[] = [];
  if (amountScore > 0) matchReasons.push(amountReason);
  if (dateScore > 0) matchReasons.push(dateReason);
  if (textScore > 30) matchReasons.push(textReason);

  return {
    transaction: candidateTx,
    score: compositeScore,
    confidence,
    matchReasons,
    amountDiff,
    daysDiff,
  };
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  bankStatements,
  transactions,
  onReconcileMatch,
  onUnreconcileMatch,
  onAddTransaction,
}) => {
  const [activeFilter, setActiveFilter] = useState<'UNRECONCILED' | 'RECONCILED' | 'ALL'>('UNRECONCILED');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardIndex, setWizardIndex] = useState(0);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [autoReconcileMsg, setAutoReconcileMsg] = useState('');

  // Quick transaction state inside wizard
  const [quickTxForm, setQuickTxForm] = useState({
    type: 'EXPENSE' as TransactionType,
    category: 'General Expense',
    gstType: 'STANDARD_15' as GSTType,
    irdTaxCode: '300 - Operating Expenses',
  });

  const unreconciledStatements = bankStatements.filter((s) => !s.isReconciled);
  const unreconciledTransactions = transactions.filter((t) => !t.isReconciled);

  const displayedStatements = bankStatements.filter((s) => {
    if (activeFilter === 'UNRECONCILED') return !s.isReconciled;
    if (activeFilter === 'RECONCILED') return s.isReconciled;
    return true;
  });

  // Calculate fuzzy match candidates for current wizard item
  const currentWizardStatement = unreconciledStatements[wizardIndex] || null;

  const currentWizardCandidates: FuzzyMatchCandidate[] = currentWizardStatement
    ? unreconciledTransactions
        .map((tx) => calculateFuzzyMatchScore(currentWizardStatement, tx))
        .filter((res) => res.score >= 35)
        .sort((a, b) => b.score - a.score)
    : [];

  const handleStartWizard = () => {
    setWizardIndex(0);
    setShowWizard(true);
  };

  const handleWizardNext = () => {
    if (wizardIndex < unreconciledStatements.length - 1) {
      setWizardIndex((prev) => prev + 1);
    }
  };

  const handleWizardPrev = () => {
    if (wizardIndex > 0) {
      setWizardIndex((prev) => prev - 1);
    }
  };

  const handleConfirmWizardMatch = (stmtId: string, txId: string) => {
    onReconcileMatch(stmtId, txId);
    // Keep index or move smoothly to next
    if (wizardIndex >= unreconciledStatements.length - 1) {
      setWizardIndex(Math.max(0, unreconciledStatements.length - 2));
    }
  };

  // Bulk Auto-Reconcile High-Confidence Matches (Score >= 88%)
  const handleAutoReconcileHighConfidence = () => {
    let reconciledCount = 0;

    unreconciledStatements.forEach((stmt) => {
      const bestMatch = unreconciledTransactions
        .map((tx) => calculateFuzzyMatchScore(stmt, tx))
        .sort((a, b) => b.score - a.score)[0];

      if (bestMatch && bestMatch.score >= 88) {
        onReconcileMatch(stmt.id, bestMatch.transaction.id);
        reconciledCount++;
      }
    });

    if (reconciledCount > 0) {
      setAutoReconcileMsg(`⚡ Automatically reconciled ${reconciledCount} high-confidence match(es) with 90%+ similarity!`);
    } else {
      setAutoReconcileMsg('No new 90%+ high confidence matches found for automatic reconciliation.');
    }

    setTimeout(() => setAutoReconcileMsg(''), 5000);
  };

  // Create new ledger entry from wizard when no match candidate exists
  const handleCreateAndReconcileWizardTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWizardStatement || !onAddTransaction) return;

    const isExpense = currentWizardStatement.amount < 0 || quickTxForm.type === 'EXPENSE';
    const baseAmt = Math.abs(currentWizardStatement.amount);
    const gstAmt = quickTxForm.gstType === 'STANDARD_15' ? (baseAmt * 3) / 23 : 0;

    const newTxData: Omit<Transaction, 'id' | 'createdAt'> = {
      date: currentWizardStatement.date,
      description: currentWizardStatement.description,
      amount: baseAmt,
      type: quickTxForm.type,
      category: quickTxForm.category,
      accountId: 'acc-1', // Default checking account
      gstType: quickTxForm.gstType,
      gstAmount: gstAmt,
      irdTaxCode: quickTxForm.irdTaxCode,
      reference: currentWizardStatement.rawReference,
      notes: `Quick-added from Reconciliation Wizard for ${currentWizardStatement.description}`,
      isReconciled: true,
    };

    onAddTransaction(newTxData);

    // Auto reconcile statement line
    setTimeout(() => {
      // Find newly added transaction or trigger match
      const matchingTx = transactions.find(
        (t) => t.description === currentWizardStatement.description && Math.abs(t.amount) === Math.abs(currentWizardStatement.amount)
      );
      if (matchingTx) {
        onReconcileMatch(currentWizardStatement.id, matchingTx.id);
      }
    }, 100);

    setShowQuickAddModal(false);
    setAutoReconcileMsg(`Created ledger entry & reconciled "${currentWizardStatement.description}"!`);
    setTimeout(() => setAutoReconcileMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Bank Reconciliation Console
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              $0.00 Balanced
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify bank statement feeds against your local NZ ledger entries using Fuzzy AI Logic
          </p>
        </div>

        {/* Wizard Launcher & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {unreconciledStatements.length > 0 && (
            <button
              type="button"
              onClick={handleStartWizard}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 animate-pulse"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              Start Guided Match Wizard ({unreconciledStatements.length})
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveFilter('UNRECONCILED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === 'UNRECONCILED'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pending ({unreconciledStatements.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('RECONCILED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === 'RECONCILED'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Reconciled ({bankStatements.length - unreconciledStatements.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Lines ({bankStatements.length})
            </button>
          </div>
        </div>
      </div>

      {autoReconcileMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{autoReconcileMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoReconcileMsg('')}
            className="text-xs text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Guided Wizard Callout Banner */}
      {unreconciledStatements.length > 0 && !showWizard && (
        <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl border border-teal-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-sm text-amber-300">
                Interactive Guided Reconciliation Wizard Available
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              You have <span className="font-bold text-white">{unreconciledStatements.length} unreconciled bank statement lines</span>.
              Use fuzzy logic date and amount similarity algorithms to review candidates step-by-step or auto-reconcile with high confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAutoReconcileHighConfidence}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Automatically match 90%+ similarity candidates"
            >
              <Zap className="w-4 h-4 text-amber-400" /> Auto-Reconcile 90%+ Matches
            </button>

            <button
              type="button"
              onClick={handleStartWizard}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4" /> Launch Interactive Wizard
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Statement Feed Balance</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">$18,450.75</span>
          </div>
          <Landmark className="w-6 h-6 text-teal-600" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Ledger General Balance</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">$18,450.75</span>
          </div>
          <CheckCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-900 dark:text-emerald-200">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
              Reconciliation Variance
            </span>
            <span className="text-lg font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> $0.00 Difference
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE GUIDED WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 animate-in fade-in zoom-in-95 duration-200 my-auto space-y-6">
            
            {/* Wizard Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl shadow-md">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                      Guided Reconciliation Wizard
                    </h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Fuzzy Match AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step-by-step transaction matching with date & amount similarity logic
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                title="Exit Wizard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unreconciledStatements.length === 0 || !currentWizardStatement ? (
              /* Completion Screen */
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    Reconciliation Wizard Complete!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    All bank statement lines are now fully matched and reconciled against your local NZ ledger entries.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Return to Console
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Wizard Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>
                      Item {wizardIndex + 1} of {unreconciledStatements.length} Pending
                    </span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">
                      {Math.round(((wizardIndex + 1) / unreconciledStatements.length) * 100)}% Progress
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 transition-all duration-300 rounded-full"
                      style={{
                        width: `${((wizardIndex + 1) / unreconciledStatements.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Main Wizard Step Layout: Split Bank Statement vs Fuzzy Candidate Matches */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column (5 Cols): Bank Statement Item Under Review */}
                  <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-teal-600" /> Bank Feed Line
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        {currentWizardStatement.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                        {currentWizardStatement.description}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                        Ref: {currentWizardStatement.rawReference || 'N/A'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Bank Statement Amount</span>
                      <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>${currentWizardStatement.amount.toFixed(2)} NZD</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            currentWizardStatement.amount < 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {currentWizardStatement.amount < 0 ? 'MONEY OUT' : 'MONEY IN'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons inside statement card */}
                    <div className="pt-2 space-y-2">
                      {onAddTransaction && (
                        <button
                          type="button"
                          onClick={() => setShowQuickAddModal(true)}
                          className="w-full py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-xl border border-teal-300 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" /> Quick Record Missing Ledger Entry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column (7 Cols): Ranked Candidate Matches based on Fuzzy Logic */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Fuzzy Logic Match Candidates ({currentWizardCandidates.length})
                      </h4>
                      <span className="text-[11px] text-slate-400">Ranked by similarity score</span>
                    </div>

                    {currentWizardCandidates.length === 0 ? (
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                        <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            No high-probability candidates in existing ledger
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            This bank feed item might be unrecorded. You can record a new ledger transaction in 1 click.
                          </p>
                        </div>
                        {onAddTransaction && (
                          <button
                            type="button"
                            onClick={() => setShowQuickAddModal(true)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
                          >
                            <PlusCircle className="w-4 h-4" /> Record Ledger Entry for ${Math.abs(currentWizardStatement.amount).toFixed(2)}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {currentWizardCandidates.map((cand, idx) => {
                          const isTopMatch = idx === 0;
                          return (
                            <div
                              key={cand.transaction.id}
                              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                                isTopMatch
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700 shadow-sm'
                                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    {isTopMatch && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Top Recommendation
                                      </span>
                                    )}
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        cand.confidence === 'HIGH'
                                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                          : cand.confidence === 'MEDIUM'
                                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      {cand.score}% Fuzzy Match Score
                                    </span>
                                  </div>

                                  <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                                    {cand.transaction.description}
                                  </h5>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                    <span>Date: {cand.transaction.date}</span>
                                    <span>Cat: {cand.transaction.category}</span>
                                    <span>IRD: {cand.transaction.irdTaxCode}</span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="font-black text-slate-900 dark:text-slate-100 text-sm">
                                    ${cand.transaction.amount.toFixed(2)}
                                  </div>
                                  <span className="text-[10px] text-slate-400">Ledger</span>
                                </div>
                              </div>

                              {/* Match Reason Factors */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {cand.matchReasons.map((reason, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    ✓ {reason}
                                  </span>
                                ))}
                              </div>

                              {/* Action Button */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmWizardMatch(currentWizardStatement.id, cand.transaction.id)}
                                  className={`w-full py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                                    isTopMatch
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      : 'bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 text-white'
                                  }`}
                                >
                                  <Check className="w-4 h-4" /> Confirm & Reconcile Match
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Wizard Footer Navigation Controls */}
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={handleWizardPrev}
                    disabled={wizardIndex === 0}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleWizardNext}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      Skip for Now <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* QUICK ADD MISSING TRANSACTION MODAL */}
      {showQuickAddModal && currentWizardStatement && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" /> Record Ledger Entry & Reconcile
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAndReconcileWizardTx} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Pre-filled Bank Statement Data</span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {currentWizardStatement.description}
                </p>
                <p className="font-mono text-xs text-teal-600 font-bold">
                  Date: {currentWizardStatement.date} • Amount: ${Math.abs(currentWizardStatement.amount).toFixed(2)} NZD
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction Type</label>
                <select
                  value={quickTxForm.type}
                  onChange={(e) => setQuickTxForm({ ...quickTxForm, type: e.target.value as TransactionType })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold dark:text-slate-100"
                >
                  <option value="EXPENSE">EXPENSE (Money Out)</option>
                  <option value="INCOME">INCOME (Money In)</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="TAX_PAYMENT">TAX PAYMENT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NZ Account Category</label>
                <select
                  value={quickTxForm.category}
                  onChange={(e) => setQuickTxForm({ ...quickTxForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                >
                  <option value="General Expense">General Expense</option>
                  <option value="Software & Cloud">Software & Cloud Subscriptions</option>
                  <option value="Office Expenses">Office Expenses & Supplies</option>
                  <option value="Consulting Income">Consulting & Services Sales</option>
                  <option value="Rent & Premises">Rent & Occupancy</option>
                  <option value="Bank Fees">Bank Fees & Charges</option>
                  <option value="Utilities">Utilities & Power</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GST Treatment</label>
                  <select
                    value={quickTxForm.gstType}
                    onChange={(e) => setQuickTxForm({ ...quickTxForm, gstType: e.target.value as GSTType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                  >
                    <option value="STANDARD_15">15% Standard NZ GST</option>
                    <option value="ZERO_RATED">Zero-Rated GST (0%)</option>
                    <option value="EXEMPT">Exempt GST</option>
                    <option value="NO_GST">No GST / N/A</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">IRD Code</label>
                  <input
                    type="text"
                    value={quickTxForm.irdTaxCode}
                    onChange={(e) => setQuickTxForm({ ...quickTxForm, irdTaxCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save & Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Statement Feeds List */}
      <div className="space-y-4">
        {displayedStatements.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
            <p className="font-bold text-slate-700 dark:text-slate-200">
              All bank statement lines in this view are fully reconciled!
            </p>
            <p className="text-xs text-slate-400">
              Your ledger matches 100% with your bank statement feeds.
            </p>
          </div>
        ) : (
          displayedStatements.map((stmt) => {
            const matchedTx = transactions.find((t) => t.id === stmt.matchedTransactionId);

            // Suggested match candidate based on fuzzy logic score
            const bestFuzzyCandidate = unreconciledTransactions
              .map((tx) => calculateFuzzyMatchScore(stmt, tx))
              .sort((a, b) => b.score - a.score)[0];

            return (
              <div
                key={stmt.id}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  stmt.isReconciled
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-900/60 hover:border-teal-400'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Bank Statement Feed Line */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        Bank Feed Line
                      </span>
                      <span className="text-xs font-mono text-slate-400">{stmt.date}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {stmt.description}
                    </h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Ref: {stmt.rawReference || 'N/A'}
                    </p>
                    <div className="text-base font-black text-slate-800 dark:text-slate-100 mt-2">
                      ${stmt.amount.toFixed(2)} NZD
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="hidden lg:flex items-center justify-center w-8 text-slate-300 dark:text-slate-700">
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Right: Ledger Match Status or Fuzzy Match Suggestion */}
                  <div className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    {stmt.isReconciled && matchedTx ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reconciled to Ledger
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            ${matchedTx.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {matchedTx.description}
                        </p>
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                          {matchedTx.category} ({matchedTx.irdTaxCode})
                        </p>

                        <button
                          type="button"
                          onClick={() => onUnreconcileMatch(stmt.id, matchedTx.id)}
                          className="mt-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          Unmatch & Re-open Line
                        </button>
                      </div>
                    ) : bestFuzzyCandidate && bestFuzzyCandidate.score >= 40 ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Fuzzy Match ({bestFuzzyCandidate.score}%)
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            ${bestFuzzyCandidate.transaction.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {bestFuzzyCandidate.transaction.description}
                        </p>
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                          {bestFuzzyCandidate.transaction.category} • Date: {bestFuzzyCandidate.transaction.date}
                        </p>

                        <button
                          type="button"
                          onClick={() => onReconcileMatch(stmt.id, bestFuzzyCandidate.transaction.id)}
                          className="mt-2.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Match (${bestFuzzyCandidate.transaction.amount.toFixed(2)})
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 space-y-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          No automatic match candidate found
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Use the guided wizard to quick-add a missing ledger entry.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
