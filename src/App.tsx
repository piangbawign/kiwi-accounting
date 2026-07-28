import React, { useState, useEffect } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { AppState, Transaction, TransactionAttachment, Account, Invoice, PayrollEmployee, PayslipRecord, DividendRecord, LoanRecord, Project, RecurringTransaction, InventoryItem, CompanySettings, BankStatementItem, ChurchDonor, ChurchDonationReceipt, PassThroughFund, VolunteerExpenseClaim, RecurringInvoiceSchedule, UserProfile, ScannedQrRecipeReceipt } from './types';
import { loadKiwiLedgerState, saveKiwiLedgerState, logAuditEvent, exportBackupJSON } from './services/storage';

import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { PinLockModal } from './components/PinLockModal';
import { QuickAddModal } from './components/QuickAddModal';

import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BankAccountsView } from './components/BankAccountsView';
import { BankReconciliationView } from './components/BankReconciliationView';
import { InvoicesView } from './components/InvoicesView';
import { RecurringTransactionsView } from './components/RecurringTransactionsView';
import { InventoryView } from './components/InventoryView';
import { GstReturnView } from './components/GstReturnView';
import { PayrollView } from './components/PayrollView';
import { IncomeTaxView } from './components/IncomeTaxView';
import { ReceiptScannerView } from './components/ReceiptScannerView';
import { DividendsLoansView } from './components/DividendsLoansView';
import { ProjectsView } from './components/ProjectsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import { AiAdvisorView } from './components/AiAdvisorView';
import { CashFlowForecastView } from './components/CashFlowForecastView';
import { IrdDocumentCentreView } from './components/IrdDocumentCentreView';
import { FinancialHealthView } from './components/FinancialHealthView';
import { SmartRemindersView } from './components/SmartRemindersView';
import { ChurchCharityView } from './components/ChurchCharityView';
import { TaxCalendarView } from './components/TaxCalendarView';
import { BudgetThresholdsView } from './components/BudgetThresholdsView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { DocumentOcrScannerView } from './components/DocumentOcrScannerView';
import { DataVisualizationView } from './components/DataVisualizationView';
import { SmartScanAlertsView } from './components/SmartScanAlertsView';
import { ClientPortalView } from './components/ClientPortalView';
import { AuditLogsView } from './components/AuditLogsView';
import { TaxMapView } from './components/TaxMapView';
import { MultiCurrencyView } from './components/MultiCurrencyView';
import { DocumentTaggingView } from './components/DocumentTaggingView';
import { RdTaxCreditView } from './components/RdTaxCreditView';
import { ShareholderDashboardView } from './components/ShareholderDashboardView';
import { PeriodicReportingView } from './components/PeriodicReportingView';
import { ProvisionalTaxAimView } from './components/ProvisionalTaxAimView';
import { FbtVehicleLogbookView } from './components/FbtVehicleLogbookView';
import { FixedAssetDepreciationView } from './components/FixedAssetDepreciationView';
import { SubcontractorAccView } from './components/SubcontractorAccView';
import { IrdTaxFormsExporterView } from './components/IrdTaxFormsExporterView';
import { ReceiptOcrRuleEngineView } from './components/ReceiptOcrRuleEngineView';
import { AdvancedIrdTaxHubView } from './components/AdvancedIrdTaxHubView';
import { MyIrOpenBankingGatewayView } from './components/MyIrOpenBankingGatewayView';
import { IndustryTaxProfilesView } from './components/IndustryTaxProfilesView';
import { IrdAuditRiskDefenseView } from './components/IrdAuditRiskDefenseView';
import { EntityStructurePlannerView } from './components/EntityStructurePlannerView';
import { GroupTaxConsolidationView } from './components/GroupTaxConsolidationView';
import { generateFinancialSummaryPDF } from './services/pdfGenerator';
import { QuickSearchModal } from './components/QuickSearchModal';
import { DataExportWizardModal } from './components/DataExportWizardModal';
import { AutomatedTaxBackupModal } from './components/AutomatedTaxBackupModal';
import { AutomatedBankFeedsModal } from './components/AutomatedBankFeedsModal';
import { SmartDataCleaningModal } from './components/SmartDataCleaningModal';
import { BusinessEntity,  BankFeedRule,
  CategoryBudget,
  CustomDashboardMetric, } from './types';

function AppContent() {
  const [appState, setAppState] = useState<AppState>(loadKiwiLedgerState);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isUnlocked, setIsUnlocked] = useState(!appState.securityPin);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);
  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);
  const [showExportWizardModal, setShowExportWizardModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showBankFeedsModal, setShowBankFeedsModal] = useState(false);
  const [showDataCleanerModal, setShowDataCleanerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kiwi_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Dark Mode Class Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kiwi_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kiwi_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Multi-Entity & Custom Metrics Handlers
  const handleSelectEntity = (entityId: string) => {
    applyStateChange((prev) => ({
      ...prev,
      activeEntityId: entityId,
    }));
  };

  const handleAddEntity = (newEntity: BusinessEntity) => {
    applyStateChange((prev) => ({
      ...prev,
      entities: [...(prev.entities || []), newEntity],
      activeEntityId: newEntity.id,
      auditLogs: [
        logAuditEvent('ADD_ENTITY', 'COMPANY', `Added new business entity: ${newEntity.name}`),
        ...prev.auditLogs,
      ],
    }), `Added business profile: ${newEntity.name}`);
  };

  const handleDeleteEntity = (entityId: string) => {
    const ent = (appState.entities || []).find((e) => e.id === entityId);
    applyStateChange((prev) => {
      const nextActiveEntityId = prev.activeEntityId === entityId ? 'ALL' : prev.activeEntityId;
      return {
        ...prev,
        activeEntityId: nextActiveEntityId,
        entities: (prev.entities || []).filter((e) => e.id !== entityId),
        auditLogs: [
          logAuditEvent('DELETE_ENTITY', 'COMPANY', `Deleted business entity profile: ${ent?.name || entityId}`),
          ...prev.auditLogs,
        ],
      };
    }, `Deleted business profile: ${ent?.name || entityId}`);
  };

  const handleSaveBankFeedRules = (rules: BankFeedRule[]) => {
    applyStateChange((prev) => ({
      ...prev,
      bankFeedRules: rules,
    }), 'Saved bank feed matching rules');
  };

  const handleUpdateCustomMetrics = (metrics: CustomDashboardMetric[]) => {
    applyStateChange((prev) => ({
      ...prev,
      customMetrics: metrics,
    }), 'Updated custom dashboard metrics');
  };

  // Undo / Redo history state
  const [historyPast, setHistoryPast] = useState<AppState[]>([]);
  const [historyFuture, setHistoryFuture] = useState<AppState[]>([]);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'info' | 'delete' | 'undo' } | null>(null);

  const unreconciledCount = appState.bankStatements.filter((s) => !s.isReconciled).length;

  // Sync state changes to localStorage
  useEffect(() => {
    saveKiwiLedgerState(appState);
  }, [appState]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  // Toast Auto-dismiss
  useEffect(() => {
    if (actionToast) {
      const timer = setTimeout(() => setActionToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [actionToast]);

  // Undo & Redo state engine
  const applyStateChange = (
    updater: (prev: AppState) => AppState,
    actionLabel?: string
  ) => {
    setAppState((current) => {
      const next = updater(current);
      if (next !== current) {
        setHistoryPast((past) => [...past.slice(-49), current]);
        setHistoryFuture([]);
        if (actionLabel) {
          setActionToast({ message: actionLabel, type: 'info' });
        }
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const prev = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);
    setHistoryPast(newPast);
    setHistoryFuture((future) => [appState, ...future]);
    setAppState(prev);
    setActionToast({ message: 'Undo applied (Ctrl+Z)', type: 'undo' });
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryFuture(newFuture);
    setHistoryPast((past) => [...past, appState]);
    setAppState(next);
    setActionToast({ message: 'Redo applied (Ctrl+Y)', type: 'undo' });
  };

  // Keyboard Shortcuts for Undo (Ctrl+Z) & Redo (Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (
        el &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowQuickSearchModal((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyPast, historyFuture, appState]);

  // Lock Pin & WebAuthn Biometric Handler
  const handleUnlockPin = (enteredPin?: string): boolean => {
    if (!enteredPin || enteredPin === appState.securityPin) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const handleLockAppNow = () => {
    if (appState.securityPin) {
      setIsUnlocked(false);
    }
  };

  // --- State Mutators ---

  // 1. Add Transaction
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    applyStateChange((prev) => {
      const updatedAccounts = prev.accounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'INCOME' ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        accounts: updatedAccounts,
        auditLogs: [
          logAuditEvent('ADD_TRANSACTION', 'BOOKKEEPING', `Added ${newTx.type} of $${newTx.amount} (${newTx.description})`),
          ...prev.auditLogs,
        ],
      };
    }, `Added transaction: ${newTx.description}`);
  };

  // 2. Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = appState.transactions.find((t) => t.id === id);
    if (!tx) return;

    applyStateChange((prev) => {
      const updatedAccounts = prev.accounts.map((acc) => {
        if (acc.id === tx.accountId) {
          const delta = tx.type === 'INCOME' ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });

      return {
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
        accounts: updatedAccounts,
        auditLogs: [
          logAuditEvent('DELETE_TRANSACTION', 'BOOKKEEPING', `Deleted ${tx.description} ($${tx.amount})`),
          ...prev.auditLogs,
        ],
      };
    }, `Deleted transaction: ${tx.description}`);
  };

  const handleDeleteTransactions = (ids: string[]) => {
    applyStateChange((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => !ids.includes(t.id)),
      auditLogs: [
        logAuditEvent('DELETE_TRANSACTIONS', 'BOOKKEEPING', `Bulk deleted ${ids.length} transaction(s)`),
        ...prev.auditLogs,
      ],
    }), `Deleted ${ids.length} transaction(s)`);
  };

  // 3. Add & Delete Bank Account & User Profiles
  const handleAddAccount = (accData: Omit<Account, 'id'>) => {
    const accId = `acc-${Date.now()}`;
    const newAcc: Account = {
      ...accData,
      id: accId,
    };

    applyStateChange((prev) => {
      let updatedProfiles = prev.userProfiles || [];
      if (newAcc.profileId) {
        updatedProfiles = updatedProfiles.map((prof) => {
          if (prof.id === newAcc.profileId) {
            const currentAccs = prof.associatedAccountIds || [];
            if (!currentAccs.includes(accId)) {
              return { ...prof, associatedAccountIds: [...currentAccs, accId] };
            }
          }
          return prof;
        });
      }

      return {
        ...prev,
        accounts: [...prev.accounts, newAcc],
        userProfiles: updatedProfiles,
        auditLogs: [
          logAuditEvent('ADD_ACCOUNT', 'BANKING', `Added ${newAcc.bankName} account: ${newAcc.name}`),
          ...prev.auditLogs,
        ],
      };
    }, `Added account: ${newAcc.name}`);
  };

  const handleDeleteAccount = (id: string) => {
    const acc = appState.accounts.find((a) => a.id === id);
    if (!acc) return;

    applyStateChange((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
      userProfiles: (prev.userProfiles || []).map((prof) => ({
        ...prof,
        associatedAccountIds: (prof.associatedAccountIds || []).filter((accId) => accId !== id),
      })),
      auditLogs: [
        logAuditEvent('DELETE_ACCOUNT', 'BANKING', `Deleted account: ${acc.name}`),
        ...prev.auditLogs,
      ],
    }), `Deleted account: ${acc.name}`);
  };

  const handleUpdateAccountProfile = (accountId: string, profileId: string | null) => {
    applyStateChange((prev) => {
      const updatedAccounts = prev.accounts.map((acc) => {
        if (acc.id === accountId) {
          return { ...acc, profileId };
        }
        return acc;
      });

      const updatedProfiles = (prev.userProfiles || []).map((prof) => {
        const currentAccs = prof.associatedAccountIds || [];
        if (prof.id === profileId) {
          if (!currentAccs.includes(accountId)) {
            return { ...prof, associatedAccountIds: [...currentAccs, accountId] };
          }
        } else {
          if (currentAccs.includes(accountId)) {
            return { ...prof, associatedAccountIds: currentAccs.filter((id) => id !== accountId) };
          }
        }
        return prof;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        userProfiles: updatedProfiles,
      };
    }, `Updated account profile binding`);
  };

  // User Profiles CRUD Handlers
  const handleAddUserProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const profId = `prof-${Date.now()}`;
    const newProfile: UserProfile = {
      ...profileData,
      id: profId,
      createdAt: new Date().toISOString(),
    };

    applyStateChange((prev) => {
      const boundAccIds = profileData.associatedAccountIds || [];
      const updatedAccounts = prev.accounts.map((acc) => {
        if (boundAccIds.includes(acc.id)) {
          return { ...acc, profileId: profId };
        }
        return acc;
      });

      return {
        ...prev,
        userProfiles: [newProfile, ...(prev.userProfiles || [])],
        accounts: updatedAccounts,
        auditLogs: [
          logAuditEvent('ADD_USER_PROFILE', 'SETTINGS', `Created user profile ${newProfile.name} (${newProfile.role})`),
          ...prev.auditLogs,
        ],
      };
    }, `Created user profile: ${newProfile.name}`);
  };

  const handleUpdateUserProfile = (updatedProfile: UserProfile) => {
    applyStateChange((prev) => {
      const boundAccIds = updatedProfile.associatedAccountIds || [];
      const updatedAccounts = prev.accounts.map((acc) => {
        if (boundAccIds.includes(acc.id)) {
          return { ...acc, profileId: updatedProfile.id };
        }
        if (acc.profileId === updatedProfile.id && !boundAccIds.includes(acc.id)) {
          return { ...acc, profileId: null };
        }
        return acc;
      });

      return {
        ...prev,
        userProfiles: (prev.userProfiles || []).map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
        accounts: updatedAccounts,
        auditLogs: [
          logAuditEvent('UPDATE_USER_PROFILE', 'SETTINGS', `Updated user profile ${updatedProfile.name}`),
          ...prev.auditLogs,
        ],
      };
    }, `Updated user profile: ${updatedProfile.name}`);
  };

  const handleDeleteUserProfile = (profileId: string) => {
    const profile = (appState.userProfiles || []).find((p) => p.id === profileId);
    applyStateChange((prev) => {
      const unboundAccounts = prev.accounts.map((acc) => {
        if (acc.profileId === profileId) {
          return { ...acc, profileId: null };
        }
        return acc;
      });

      const nextActiveEntityId = prev.activeEntityId === profileId ? 'ALL' : prev.activeEntityId;

      return {
        ...prev,
        activeEntityId: nextActiveEntityId,
        userProfiles: (prev.userProfiles || []).filter((p) => p.id !== profileId),
        accounts: unboundAccounts,
        auditLogs: [
          logAuditEvent('DELETE_USER_PROFILE', 'SETTINGS', `Deleted user profile ${profile?.name || profileId} and unbound attached bank accounts`),
          ...prev.auditLogs,
        ],
      };
    }, `Deleted user profile: ${profile?.name || profileId}`);
  };

  // 4. CSV Import
  const handleImportCSVTransactions = (
    newTxsData: Omit<Transaction, 'id' | 'createdAt'>[],
    statementItemsData: Omit<BankStatementItem, 'id'>[]
  ) => {
    const newTxs: Transaction[] = newTxsData.map((t, idx) => ({
      ...t,
      id: `tx-csv-${Date.now()}-${idx}`,
      createdAt: new Date().toISOString(),
    }));

    const newStatements: BankStatementItem[] = statementItemsData.map((s, idx) => ({
      ...s,
      id: `stmt-csv-${Date.now()}-${idx}`,
    }));

    applyStateChange((prev) => ({
      ...prev,
      transactions: [...newTxs, ...prev.transactions],
      bankStatements: [...newStatements, ...prev.bankStatements],
      auditLogs: [
        logAuditEvent('IMPORT_BANK_STATEMENT', 'BANKING', `Imported ${newTxs.length} transactions via CSV parser`),
        ...prev.auditLogs,
      ],
    }), `Imported ${newTxs.length} transactions`);
  };

  // 4b. Bulk Auto-Categorize & Attachments
  const handleUpdateTransactions = (updatedTxs: Transaction[]) => {
    applyStateChange((prev) => ({
      ...prev,
      transactions: updatedTxs,
      auditLogs: [
        logAuditEvent('AUTO_CATEGORIZE', 'BOOKKEEPING', 'Auto-categorized transactions via IRD rules'),
        ...prev.auditLogs,
      ],
    }), 'Auto-categorized transactions');
  };

  const handleUpdateAttachments = (transactionId: string, attachments: TransactionAttachment[]) => {
    applyStateChange((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === transactionId ? { ...t, attachments } : t
      ),
      auditLogs: [
        logAuditEvent('UPDATE_ATTACHMENTS', 'BOOKKEEPING', `Updated attachments for transaction ${transactionId}`),
        ...prev.auditLogs,
      ],
    }), 'Updated transaction receipt attachments');
  };

  const handleUpdateTransactionTags = (txId: string, tags: string[]) => {
    applyStateChange((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === txId ? { ...t, tags } : t
      ),
      auditLogs: [
        logAuditEvent('UPDATE_TRANSACTION_TAGS', 'BOOKKEEPING', `Updated document tags for transaction ${txId}: ${tags.join(', ')}`),
        ...prev.auditLogs,
      ],
    }), `Updated tags for transaction`);
  };

  // 5. Reconcile Matches
  const handleReconcileMatch = (statementId: string, transactionId: string) => {
    applyStateChange((prev) => ({
      ...prev,
      bankStatements: prev.bankStatements.map((s) =>
        s.id === statementId ? { ...s, isReconciled: true, matchedTransactionId: transactionId } : s
      ),
      transactions: prev.transactions.map((t) =>
        t.id === transactionId ? { ...t, isReconciled: true } : t
      ),
      auditLogs: [
        logAuditEvent('RECONCILE_MATCH', 'BANK_RECONCILIATION', `Matched statement line ${statementId} to ledger item ${transactionId}`),
        ...prev.auditLogs,
      ],
    }), 'Matched statement record');
  };

  const handleUnreconcileMatch = (statementId: string, transactionId: string) => {
    applyStateChange((prev) => ({
      ...prev,
      bankStatements: prev.bankStatements.map((s) =>
        s.id === statementId ? { ...s, isReconciled: false, matchedTransactionId: undefined } : s
      ),
      transactions: prev.transactions.map((t) =>
        t.id === transactionId ? { ...t, isReconciled: false } : t
      ),
      auditLogs: [
        logAuditEvent('UNRECONCILE_MATCH', 'BANK_RECONCILIATION', `Unmatched statement line ${statementId}`),
        ...prev.auditLogs,
      ],
    }), 'Unmatched statement record');
  };

  // 6. Invoices
  const handleCreateInvoice = (invData: Omit<Invoice, 'id'>) => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
    };

    applyStateChange((prev) => ({
      ...prev,
      invoices: [newInv, ...prev.invoices],
      auditLogs: [
        logAuditEvent('CREATE_INVOICE', 'INVOICES', `Issued GST Tax Invoice ${newInv.invoiceNumber} for $${newInv.total.toFixed(2)}`),
        ...prev.auditLogs,
      ],
    }), `Issued Invoice ${newInv.invoiceNumber}`);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    applyStateChange((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
      auditLogs: [
        logAuditEvent('UPDATE_INVOICE_STATUS', 'INVOICES', `Updated invoice ${id} status to ${status}`),
        ...prev.auditLogs,
      ],
    }), `Invoice status set to ${status}`);
  };

  const handleDeleteInvoice = (id: string) => {
    const inv = appState.invoices.find((i) => i.id === id);
    if (!inv) return;

    applyStateChange((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((i) => i.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_INVOICE', 'INVOICES', `Deleted invoice ${inv.invoiceNumber}`),
        ...prev.auditLogs,
      ],
    }), `Deleted invoice ${inv.invoiceNumber}`);
  };

  // 6b. Recurring Invoices
  const handleCreateRecurringInvoice = (recData: Omit<RecurringInvoiceSchedule, 'id'>) => {
    const newRec: RecurringInvoiceSchedule = {
      ...recData,
      id: `rec-inv-${Date.now()}`,
    };

    applyStateChange((prev) => ({
      ...prev,
      recurringInvoices: [newRec, ...(prev.recurringInvoices || [])],
      auditLogs: [
        logAuditEvent('CREATE_RECURRING_INVOICE', 'INVOICES', `Created ${newRec.frequency} recurring invoice schedule for ${newRec.clientName}`),
        ...prev.auditLogs,
      ],
    }), `Added recurring schedule for ${newRec.clientName}`);
  };

  const handleDeleteRecurringInvoice = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      recurringInvoices: (prev.recurringInvoices || []).filter((r) => r.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_RECURRING_INVOICE', 'INVOICES', `Deleted recurring invoice schedule ${id}`),
        ...prev.auditLogs,
      ],
    }), `Deleted recurring schedule`);
  };

  const handleTogglePauseRecurringInvoice = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      recurringInvoices: (prev.recurringInvoices || []).map((r) =>
        r.id === id ? { ...r, status: r.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED' } : r
      ),
    }), `Updated recurring schedule status`);
  };

  const handleGenerateRecurringInvoiceNow = (rec: RecurringInvoiceSchedule) => {
    const invoiceNum = `INV-2026-${(appState.invoices.length + 1).toString().padStart(3, '0')}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const itemDesc = rec.items[0]?.description || 'Recurring Invoice Services';
    const subtotal = rec.subtotal || rec.total / 1.15;
    const gstTotal = rec.gstTotal || subtotal * 0.15;
    const total = rec.total;

    handleCreateInvoice({
      invoiceNumber: invoiceNum,
      issueDate,
      dueDate,
      clientName: rec.clientName,
      clientGstNumber: rec.clientGstNumber,
      clientEmail: rec.clientEmail,
      gstBasis: rec.gstBasis || 'EXCLUSIVE',
      subtotal,
      gstTotal,
      total,
      status: 'SENT',
      notes: `Automated invoice generated from ${rec.frequency} recurring schedule (${itemDesc}).`,
      items: rec.items && rec.items.length > 0 ? rec.items : [
        {
          id: `item-rec-${Date.now()}`,
          description: itemDesc,
          quantity: 1,
          unitPrice: subtotal,
          gstRate: 0.15,
          amount: subtotal,
        },
      ],
    });
  };

  // 6c. Budget Thresholds
  const handleUpdateBudgets = (newBudgets: CategoryBudget[]) => {
    applyStateChange((prev) => ({
      ...prev,
      budgets: newBudgets,
      auditLogs: [
        logAuditEvent('UPDATE_BUDGETS', 'BUDGETS', `Updated category budgets`),
        ...prev.auditLogs,
      ],
    }), `Updated category budgets`);
  };

  // 7. Payroll
  const handleAddEmployee = (empData: Omit<PayrollEmployee, 'id'>) => {
    const currentEntityId = appState.activeEntityId || 'ALL';
    const newEmp: PayrollEmployee = {
      ...empData,
      id: `emp-${Date.now()}`,
      entityId: currentEntityId !== 'ALL' ? currentEntityId : undefined,
    };

    applyStateChange((prev) => ({
      ...prev,
      employees: [...prev.employees, newEmp],
      auditLogs: [
        logAuditEvent('ADD_EMPLOYEE', 'PAYROLL', `Added employee ${newEmp.name} (Tax Code ${newEmp.taxCode})`),
        ...prev.auditLogs,
      ],
    }), `Added employee: ${newEmp.name}`);
  };

  const handleUpdateEmployee = (updatedEmp: PayrollEmployee) => {
    applyStateChange((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)),
      auditLogs: [
        logAuditEvent('UPDATE_EMPLOYEE', 'PAYROLL', `Updated employee profile for ${updatedEmp.name}`),
        ...prev.auditLogs,
      ],
    }), `Updated employee profile for ${updatedEmp.name}`);
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = appState.employees.find((e) => e.id === id);
    if (!emp) return;

    applyStateChange((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_EMPLOYEE', 'PAYROLL', `Deleted employee ${emp.name}`),
        ...prev.auditLogs,
      ],
    }), `Deleted employee: ${emp.name}`);
  };

  const handleProcessPayRun = (newPayslips: PayslipRecord[]) => {
    const currentEntityId = appState.activeEntityId || 'ALL';
    const slipsWithEntity = newPayslips.map(slip => ({
      ...slip,
      entityId: currentEntityId !== 'ALL' ? currentEntityId : undefined,
    }));

    applyStateChange((prev) => ({
      ...prev,
      payslips: [...slipsWithEntity, ...prev.payslips],
      auditLogs: [
        logAuditEvent('PROCESS_PAY_RUN', 'PAYROLL', `Processed pay run for ${newPayslips.length} NZ employees`),
        ...prev.auditLogs,
      ],
    }), `Processed pay run for ${newPayslips.length} employees`);
  };

  const handleDeletePayslip = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      payslips: prev.payslips.filter((p) => p.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_PAYSLIP', 'PAYROLL', `Deleted payslip record ${id}`),
        ...prev.auditLogs,
      ],
    }), 'Deleted payslip record');
  };

  // 8. Dividends & Loans
  const handleAddDividend = (divData: Omit<DividendRecord, 'id'>) => {
    const newDiv: DividendRecord = { ...divData, id: `div-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      dividends: [newDiv, ...prev.dividends],
      auditLogs: [
        logAuditEvent('DECLARE_DIVIDEND', 'DIVIDENDS', `Declared dividend of $${newDiv.netDividend} for ${newDiv.shareholderName}`),
        ...prev.auditLogs,
      ],
    }), 'Declared dividend');
  };

  const handleDeleteDividend = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      dividends: prev.dividends.filter((d) => d.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_DIVIDEND', 'DIVIDENDS', `Deleted dividend record ${id}`),
        ...prev.auditLogs,
      ],
    }), 'Deleted dividend record');
  };

  const handleAddLoan = (loanData: Omit<LoanRecord, 'id'>) => {
    const newLoan: LoanRecord = { ...loanData, id: `loan-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      loans: [...prev.loans, newLoan],
      auditLogs: [
        logAuditEvent('ADD_LOAN', 'LOANS', `Added loan account ${newLoan.name} ($${newLoan.totalPrincipal})`),
        ...prev.auditLogs,
      ],
    }), `Added loan account: ${newLoan.name}`);
  };

  const handleDeleteLoan = (id: string) => {
    const loan = appState.loans.find((l) => l.id === id);
    applyStateChange((prev) => ({
      ...prev,
      loans: prev.loans.filter((l) => l.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_LOAN', 'LOANS', `Deleted loan account ${id}`),
        ...prev.auditLogs,
      ],
    }), `Deleted loan: ${loan?.name || id}`);
  };

  // 9. Projects
  const handleAddProject = (projData: Omit<Project, 'id'>) => {
    const newProj: Project = { ...projData, id: `proj-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
      auditLogs: [
        logAuditEvent('ADD_PROJECT', 'PROJECTS', `Created job tag ${newProj.code} (${newProj.name})`),
        ...prev.auditLogs,
      ],
    }), `Created project: ${newProj.name}`);
  };

  const handleDeleteProject = (id: string) => {
    const proj = appState.projects.find((p) => p.id === id);
    applyStateChange((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_PROJECT', 'PROJECTS', `Deleted project tag ${id}`),
        ...prev.auditLogs,
      ],
    }), `Deleted project: ${proj?.name || id}`);
  };

  // 10. Church & Non-Profit Handlers
  const handleAddDonor = (donorData: Omit<ChurchDonor, 'id'>) => {
    const newDonor: ChurchDonor = { ...donorData, id: `don-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      donors: [...(prev.donors || []), newDonor],
      auditLogs: [
        logAuditEvent('ADD_DONOR', 'CHARITY', `Added donor ${newDonor.name} (${newDonor.donorNumber})`),
        ...prev.auditLogs,
      ],
    }), `Added donor: ${newDonor.name}`);
  };

  const handleDeleteDonor = (id: string) => {
    const donor = appState.donors?.find((d) => d.id === id);
    applyStateChange((prev) => ({
      ...prev,
      donors: (prev.donors || []).filter((d) => d.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_DONOR', 'CHARITY', `Removed donor ${donor?.name || id}`),
        ...prev.auditLogs,
      ],
    }), `Removed donor: ${donor?.name || 'Record'}`);
  };

  const handleIssueReceipt = (receiptData: Omit<ChurchDonationReceipt, 'id'>) => {
    const newReceipt: ChurchDonationReceipt = { ...receiptData, id: `rec-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      donationReceipts: [...(prev.donationReceipts || []), newReceipt],
      auditLogs: [
        logAuditEvent('ISSUE_TAX_RECEIPT', 'CHARITY', `Issued IR526 receipt ${newReceipt.receiptNumber} for ${newReceipt.donorName}`),
        ...prev.auditLogs,
      ],
    }), `Issued tax receipt: ${newReceipt.receiptNumber}`);
  };

  const handleAddPassThroughFund = (fundData: Omit<PassThroughFund, 'id'>) => {
    const newFund: PassThroughFund = { ...fundData, id: `pass-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      passThroughFunds: [...(prev.passThroughFunds || []), newFund],
      auditLogs: [
        logAuditEvent('ADD_PASSTHROUGH_FUND', 'CHARITY', `Created pass-through fund ${newFund.fundName}`),
        ...prev.auditLogs,
      ],
    }), `Created fund: ${newFund.fundName}`);
  };

  const handleUpdatePassThroughFund = (id: string, deltaReceived: number, deltaDisbursed: number) => {
    applyStateChange((prev) => ({
      ...prev,
      passThroughFunds: (prev.passThroughFunds || []).map((f) =>
        f.id === id
          ? {
              ...f,
              currentReceived: f.currentReceived + deltaReceived,
              currentDisbursed: f.currentDisbursed + deltaDisbursed,
            }
          : f
      ),
    }), 'Updated pass-through fund totals');
  };

  const handleAddVolunteerExpense = (expData: Omit<VolunteerExpenseClaim, 'id'>) => {
    const newClaim: VolunteerExpenseClaim = { ...expData, id: `vol-exp-${Date.now()}` };
    applyStateChange((prev) => ({
      ...prev,
      volunteerExpenses: [...(prev.volunteerExpenses || []), newClaim],
      auditLogs: [
        logAuditEvent('SUBMIT_VOLUNTEER_CLAIM', 'CHARITY', `Volunteer claim submitted by ${newClaim.volunteerName}`),
        ...prev.auditLogs,
      ],
    }), `Submitted volunteer claim for ${newClaim.volunteerName}`);
  };

  const handleApproveVolunteerExpense = (id: string, bankAccountId: string) => {
    const claim = appState.volunteerExpenses?.find((v) => v.id === id);
    if (!claim) return;

    const reimbTx: Transaction = {
      id: `tx-vol-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Volunteer Reimbursement - ${claim.volunteerName} (${claim.ministry})`,
      amount: claim.amount,
      type: 'EXPENSE',
      category: 'Ministry & Volunteer Expenses',
      accountId: bankAccountId,
      gstType: claim.gstType,
      gstAmount: claim.gstType === 'STANDARD_15' ? (claim.amount * 3) / 23 : 0,
      irdTaxCode: '300 - Volunteer Expenses',
      notes: claim.description,
      isReconciled: true,
      createdAt: new Date().toISOString(),
    };

    applyStateChange((prev) => ({
      ...prev,
      transactions: [reimbTx, ...prev.transactions],
      accounts: prev.accounts.map((a) =>
        a.id === bankAccountId ? { ...a, balance: a.balance - claim.amount } : a
      ),
      volunteerExpenses: (prev.volunteerExpenses || []).map((v) =>
        v.id === id
          ? { ...v, status: 'REIMBURSED', approvedBy: prev.companySettings.officialSignatoryName || 'Treasurer', bankAccountId }
          : v
      ),
      auditLogs: [
        logAuditEvent('REIMBURSE_VOLUNTEER', 'CHARITY', `Reimbursed $${claim.amount} to volunteer ${claim.volunteerName}`),
        ...prev.auditLogs,
      ],
    }), `Reimbursed $${claim.amount} to ${claim.volunteerName}`);
  };

  const handleBulkDeleteDonors = (ids: string[]) => {
    applyStateChange((prev) => ({
      ...prev,
      donors: (prev.donors || []).filter((d) => !ids.includes(d.id)),
      auditLogs: [
        logAuditEvent('BULK_DELETE_DONORS', 'CHARITY', `Bulk deleted ${ids.length} donors`),
        ...prev.auditLogs,
      ],
    }), `Bulk deleted ${ids.length} donors`);
  };

  const handleBulkDeleteReceipts = (ids: string[]) => {
    applyStateChange((prev) => ({
      ...prev,
      donationReceipts: (prev.donationReceipts || []).filter((r) => !ids.includes(r.id)),
      auditLogs: [
        logAuditEvent('BULK_DELETE_RECEIPTS', 'CHARITY', `Bulk deleted ${ids.length} donation receipts`),
        ...prev.auditLogs,
      ],
    }), `Bulk deleted ${ids.length} donation receipts`);
  };

  const handleBulkDeleteVolunteerClaims = (ids: string[]) => {
    applyStateChange((prev) => ({
      ...prev,
      volunteerExpenses: (prev.volunteerExpenses || []).filter((v) => !ids.includes(v.id)),
      auditLogs: [
        logAuditEvent('BULK_DELETE_CLAIMS', 'CHARITY', `Bulk deleted ${ids.length} volunteer expense claims`),
        ...prev.auditLogs,
      ],
    }), `Bulk deleted ${ids.length} volunteer expense claims`);
  };

  const handleSaveScannedItem = (item: ScannedQrRecipeReceipt) => {
    applyStateChange((prev) => {
      const existing = prev.scannedQrItems || [];
      const updated = [item, ...existing.filter((i) => i.id !== item.id)];
      return {
        ...prev,
        scannedQrItems: updated,
        auditLogs: [
          logAuditEvent('SAVE_SCANNED_ITEM', 'OCR', `Saved scanned ${item.type.toLowerCase()}: ${item.title}`),
          ...prev.auditLogs,
        ],
      };
    }, `Saved scanned ${item.type.toLowerCase()}: ${item.title}`);
  };

  const handleDeleteScannedItem = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      scannedQrItems: (prev.scannedQrItems || []).filter((i) => i.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_SCANNED_ITEM', 'OCR', `Deleted scanned QR recipe/receipt item`),
        ...prev.auditLogs,
      ],
    }), `Deleted scanned QR item`);
  };

  // 10. Post Recurring Transaction
  const handlePostRecurring = (rec: RecurringTransaction) => {
    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      description: rec.description,
      amount: rec.amount,
      type: rec.type,
      category: rec.category,
      accountId: appState.accounts[0]?.id || 'acc-anz-cheque',
      gstType: rec.gstType,
      gstAmount: rec.amount * 0.13043478,
      irdTaxCode: rec.type === 'INCOME' ? '100 - Operating Income' : '300 - General Expenses',
      isReconciled: false,
    });
  };

  // 11. Company Settings & Security PIN
  const handleUpdateCompanySettings = (settings: CompanySettings) => {
    setAppState((prev) => ({
      ...prev,
      companySettings: settings,
      auditLogs: [
        logAuditEvent('UPDATE_SETTINGS', 'SETTINGS', `Updated company IRD legal parameters: ${settings.legalName}`),
        ...prev.auditLogs,
      ],
    }));
  };

  const handleSetSecurityPin = (pin: string | null) => {
    setAppState((prev) => ({
      ...prev,
      securityPin: pin,
      auditLogs: [
        logAuditEvent('SECURITY_PIN_CHANGE', 'SETTINGS', pin ? 'Set 4-digit security PIN' : 'Disabled PIN lock'),
        ...prev.auditLogs,
      ],
    }));
    if (!pin) setIsUnlocked(true);
  };

  // Backup & Import
  const handleExportBackup = () => {
    exportBackupJSON();
  };

  const handleImportBackup = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.transactions && parsed.accounts) {
        setAppState(parsed);
      }
    } catch (e) {
      console.error('Import error:', e);
    }
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('kiwiledger_nz_accounting_v1');
    window.location.reload();
  };

  // Recurring Transactions Mutators
  const handleAddRecurring = (recData: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...recData,
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    applyStateChange((prev) => ({
      ...prev,
      recurringTransactions: [...prev.recurringTransactions, newRec],
      auditLogs: [
        logAuditEvent('ADD_RECURRING_SCHEDULE', 'RECURRING', `Created recurring schedule: ${newRec.description}`),
        ...prev.auditLogs,
      ],
    }), `Added recurring schedule ${newRec.description}`);
  };

  const handleUpdateRecurring = (updated: RecurringTransaction) => {
    applyStateChange((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.map((r) => (r.id === updated.id ? updated : r)),
      auditLogs: [
        logAuditEvent('UPDATE_RECURRING_SCHEDULE', 'RECURRING', `Updated recurring schedule: ${updated.description}`),
        ...prev.auditLogs,
      ],
    }), `Updated recurring schedule ${updated.description}`);
  };

  const handleDeleteRecurring = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      recurringTransactions: prev.recurringTransactions.filter((r) => r.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_RECURRING_SCHEDULE', 'RECURRING', `Deleted recurring schedule ID: ${id}`),
        ...prev.auditLogs,
      ],
    }), 'Deleted recurring schedule');
  };

  const handlePostRecurringTransaction = (rec: RecurringTransaction) => {
    const newTx: Transaction = {
      id: `tx-rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: rec.nextDueDate || new Date().toISOString().split('T')[0],
      description: rec.description,
      amount: rec.amount,
      type: rec.type,
      category: rec.category,
      accountId: rec.accountId,
      gstType: rec.gstType,
      gstAmount: rec.gstType === 'STANDARD_15' ? (rec.amount * 3) / 23 : 0,
      irdTaxCode: rec.irdTaxCode,
      reference: `AUTO-${rec.frequency}`,
      notes: `Automated posting from recurring template ${rec.id}`,
      isReconciled: false,
      recurringId: rec.id,
      createdAt: new Date().toISOString(),
    };

    const currentDate = new Date(rec.nextDueDate || new Date());
    if (rec.frequency === 'WEEKLY') currentDate.setDate(currentDate.getDate() + 7);
    else if (rec.frequency === 'FORTNIGHTLY') currentDate.setDate(currentDate.getDate() + 14);
    else if (rec.frequency === 'MONTHLY') currentDate.setMonth(currentDate.getMonth() + 1);
    else if (rec.frequency === 'QUARTERLY') currentDate.setMonth(currentDate.getMonth() + 3);
    else if (rec.frequency === 'ANNUALLY') currentDate.setFullYear(currentDate.getFullYear() + 1);

    const nextDueDateStr = currentDate.toISOString().split('T')[0];

    applyStateChange((prev) => {
      const updatedAccounts = prev.accounts.map((acc) => {
        if (acc.id === rec.accountId) {
          const delta = rec.type === 'INCOME' ? rec.amount : -rec.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });

      const updatedSchedules = prev.recurringTransactions.map((r) =>
        r.id === rec.id ? { ...r, nextDueDate: nextDueDateStr } : r
      );

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: [newTx, ...prev.transactions],
        recurringTransactions: updatedSchedules,
        auditLogs: [
          logAuditEvent('POST_RECURRING_TX', 'BOOKKEEPING', `Posted recurring transaction ${rec.description} ($${rec.amount})`),
          ...prev.auditLogs,
        ],
      };
    }, `Posted ${rec.description} to General Ledger`);
  };

  // Inventory Mutators
  const handleAddInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    applyStateChange((prev) => ({
      ...prev,
      inventory: [...(prev.inventory || []), newItem],
      auditLogs: [
        logAuditEvent('ADD_INVENTORY_ITEM', 'INVENTORY', `Added stock item ${newItem.sku} - ${newItem.name}`),
        ...prev.auditLogs,
      ],
    }), `Added inventory item ${newItem.name}`);
  };

  const handleUpdateInventoryItem = (updated: InventoryItem) => {
    applyStateChange((prev) => ({
      ...prev,
      inventory: (prev.inventory || []).map((i) => (i.id === updated.id ? updated : i)),
      auditLogs: [
        logAuditEvent('UPDATE_INVENTORY_ITEM', 'INVENTORY', `Updated stock item ${updated.sku} - ${updated.name}`),
        ...prev.auditLogs,
      ],
    }), `Updated inventory item ${updated.name}`);
  };

  const handleDeleteInventoryItem = (id: string) => {
    applyStateChange((prev) => ({
      ...prev,
      inventory: (prev.inventory || []).filter((i) => i.id !== id),
      auditLogs: [
        logAuditEvent('DELETE_INVENTORY_ITEM', 'INVENTORY', `Deleted stock item ID: ${id}`),
        ...prev.auditLogs,
      ],
    }), 'Deleted inventory item');
  };

  const handleAdjustStockQuantity = (id: string, delta: number, reason: string) => {
    applyStateChange((prev) => ({
      ...prev,
      inventory: (prev.inventory || []).map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantityOnHand: Math.max(0, item.quantityOnHand + delta),
            lastRestockedDate: delta > 0 ? new Date().toISOString().split('T')[0] : item.lastRestockedDate,
          };
        }
        return item;
      }),
      auditLogs: [
        logAuditEvent('STOCK_ADJUSTMENT', 'INVENTORY', `Adjusted stock Qty (${delta > 0 ? '+' : ''}${delta}) for item ${id}: ${reason}`),
        ...prev.auditLogs,
      ],
    }), `Adjusted stock by ${delta > 0 ? '+' : ''}${delta}`);
  };

  // PIN & Biometric Lock Render Guard
  if (appState.securityPin && !isUnlocked) {
    return <PinLockModal correctPin={appState.securityPin} onUnlock={handleUnlockPin} />;
  }

  // Active Entity & Profile Account Filtering
  const activeEntityId = appState.activeEntityId || 'ALL';
  const activeEntity = (appState.entities || []).find((e) => e.id === activeEntityId);
  const userProfiles = appState.userProfiles || [];
  const activeUserProfile = userProfiles.find((p) => p.id === activeEntityId);

  // Accounts filtered by active selected user profile / entity
  const activeAccounts = appState.accounts.filter((acc) => {
    if (activeEntityId === 'ALL') return true;
    if (activeUserProfile) {
      const boundAccIds = activeUserProfile.associatedAccountIds || [];
      return acc.profileId === activeUserProfile.id || boundAccIds.includes(acc.id);
    }
    // If it's a Business Entity, filter by the account's associated entityId (if any),
    // or we might need to fallback to all if accounts aren't strictly linked to entities yet.
    // Wait, Account doesn't have an entityId field in types.ts! It only has profileId.
    // If Accounts don't have entityId, then how are they linked to BusinessEntities?
    // Let's leave it as returning true for BusinessEntities for now if they aren't linked.
    return true; 
  });

  const activeAccountIds = new Set(activeAccounts.map((a) => a.id));

  // Transactions filtered by active selected user profile / entity accounts
  const activeTransactions = appState.transactions.filter((tx) => {
    if (activeEntityId === 'ALL') return true;
    return activeAccountIds.has(tx.accountId);
  });

  // Employees filtered by active entity
  const activeEmployees = appState.employees.filter((emp) => {
    if (activeEntityId === 'ALL') return true;
    return emp.entityId === activeEntityId;
  });

  // Payslips filtered by active entity
  const activePayslips = appState.payslips.filter((slip) => {
    if (activeEntityId === 'ALL') return true;
    return slip.entityId === activeEntityId;
  });

  // Dynamically override global company settings with the active entity's specifics
  const derivedCompanySettings = {
    ...appState.companySettings,
    tradingName: activeEntity?.tradingName || activeEntity?.name || appState.companySettings.tradingName,
    legalName: activeEntity?.name || appState.companySettings.legalName,
    irdNumber: activeEntity?.irdNumber || appState.companySettings.irdNumber,
    gstNumber: activeEntity?.gstNumber || appState.companySettings.gstNumber,
    entityType: activeEntity?.entityType || appState.companySettings.entityType,
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100/70 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* Top Bar Header */}
      <Header
        companySettings={derivedCompanySettings}
        accounts={activeAccounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={(accId) => {
          setSelectedAccountId(accId);
          if (activeTab !== 'BOOKKEEPING') setActiveTab('BOOKKEEPING');
        }}
        transactions={activeTransactions}
        entities={appState.entities || []}
        userProfiles={userProfiles}
        activeEntityId={activeEntityId}
        onSelectEntity={handleSelectEntity}
        onAddEntity={handleAddEntity}
        onDeleteEntity={handleDeleteEntity}
        onDeleteUserProfile={handleDeleteUserProfile}
        onOpenBankFeeds={() => setShowBankFeedsModal(true)}
        onOpenDataCleaner={() => setShowDataCleanerModal(true)}
        hasSecurityPin={!!appState.securityPin}
        onLockAppNow={handleLockAppNow}
        onOpenQuickAdd={() => setShowQuickAddModal(true)}
        onOpenShortcuts={() => setShowKeyboardShortcutsModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        historyPastCount={historyPast.length}
        historyFutureCount={historyFuture.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onExportExecutivePdf={() => generateFinancialSummaryPDF(appState)}
        onOpenExportWizard={() => setShowExportWizardModal(true)}
        onOpenBackupModal={() => setShowBackupModal(true)}
        onOpenQuickSearch={() => setShowQuickSearchModal(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto relative">
        
        {/* Sidebar Nav is now accessible via the slide-over menu for all screen sizes */}

        {/* Slide-Over Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <div className="relative z-10 w-72 max-w-[85vw] h-full bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
              <SidebarNav
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                unreconciledCount={unreconciledCount}
                activeEntity={activeEntity}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Dynamic Content Main View */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto min-w-0">
          {activeTab === 'DASHBOARD' && (
            <DashboardView
              transactions={activeTransactions}
              accounts={activeAccounts}
              invoices={appState.invoices}
              companySettings={appState.companySettings}
              inventory={appState.inventory || []}
              recurringTransactions={appState.recurringTransactions || []}
              customMetrics={appState.customMetrics || []}
              onUpdateMetrics={handleUpdateCustomMetrics}
              onOpenQuickAdd={() => setShowQuickAddModal(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              activeEntityId={activeEntityId}
            />
          )}

          {activeTab === 'RECURRING' && (
            <RecurringTransactionsView
              recurringTransactions={appState.recurringTransactions || []}
              accounts={activeAccounts}
              onAddRecurring={handleAddRecurring}
              onUpdateRecurring={handleUpdateRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onPostRecurringTransaction={handlePostRecurringTransaction}
            />
          )}

          {activeTab === 'INVENTORY' && (
            <InventoryView
              inventory={appState.inventory || []}
              onAddInventoryItem={handleAddInventoryItem}
              onUpdateInventoryItem={handleUpdateInventoryItem}
              onDeleteInventoryItem={handleDeleteInventoryItem}
              onAdjustStockQuantity={handleAdjustStockQuantity}
            />
          )}

          {activeTab === 'BOOKKEEPING' && (
            <TransactionsView
              transactions={activeTransactions}
              accounts={activeAccounts}
              projects={appState.projects}
              recurringTransactions={appState.recurringTransactions}
              onOpenQuickAdd={() => setShowQuickAddModal(true)}
              onDeleteTransaction={handleDeleteTransaction}
              onPostRecurring={handlePostRecurring}
              onUpdateTransactions={handleUpdateTransactions}
              onUpdateAttachments={handleUpdateAttachments}
              initialSearchQuery={searchQuery}
            />
          )}

          {activeTab === 'BANK_ACCOUNTS' && (
            <BankAccountsView
              accounts={activeAccounts}
              allAccounts={appState.accounts}
              userProfiles={userProfiles}
              activeEntityId={activeEntityId}
              onSelectEntity={handleSelectEntity}
              onAddAccount={handleAddAccount}
              onImportCSVTransactions={handleImportCSVTransactions}
              onDeleteAccount={handleDeleteAccount}
              onAddUserProfile={handleAddUserProfile}
              onDeleteUserProfile={handleDeleteUserProfile}
              onUpdateAccountProfile={handleUpdateAccountProfile}
            />
          )}

          {activeTab === 'RECONCILIATION' && (
            <BankReconciliationView
              bankStatements={appState.bankStatements}
              transactions={activeTransactions}
              onReconcileMatch={handleReconcileMatch}
              onUnreconcileMatch={handleUnreconcileMatch}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'INVOICES' && (
            <InvoicesView
              invoices={appState.invoices}
              companySettings={appState.companySettings}
              recurringInvoices={appState.recurringInvoices}
              onCreateInvoice={handleCreateInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onDeleteInvoice={handleDeleteInvoice}
              onCreateRecurringInvoice={handleCreateRecurringInvoice}
              onDeleteRecurringInvoice={handleDeleteRecurringInvoice}
              onTogglePauseRecurringInvoice={handleTogglePauseRecurringInvoice}
              onGenerateRecurringInvoiceNow={handleGenerateRecurringInvoiceNow}
            />
          )}

          {activeTab === 'TAX_CALENDAR' && (
            <TaxCalendarView
              appState={appState}
              companySettings={appState.companySettings}
            />
          )}

          {activeTab === 'BUDGET_THRESHOLDS' && (
            <BudgetThresholdsView
              appState={appState}
              onUpdateBudgets={handleUpdateBudgets}
            />
          )}

          {activeTab === 'GST_RETURN' && (
            <GstReturnView
              transactions={activeTransactions}
              companySettings={derivedCompanySettings}
            />
          )}

          {activeTab === 'PAYROLL' && (
            <PayrollView
              employees={activeEmployees}
              payslips={activePayslips}
              companySettings={derivedCompanySettings}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onProcessPayRun={handleProcessPayRun}
              onDeleteEmployee={handleDeleteEmployee}
              onDeletePayslip={handleDeletePayslip}
            />
          )}

          {activeTab === 'TAX_RETURNS' && (
            <IncomeTaxView
              transactions={activeTransactions}
              companySettings={appState.companySettings}
            />
          )}

          {activeTab === 'RECEIPT_SCANNER' && (
            <ReceiptScannerView
              accounts={appState.accounts}
              onAddTransaction={handleAddTransaction}
              scannedQrItems={appState.scannedQrItems || []}
              onSaveScannedItem={handleSaveScannedItem}
              onDeleteScannedItem={handleDeleteScannedItem}
            />
          )}

          {activeTab === 'DIVIDENDS_LOANS' && (
            <DividendsLoansView
              dividends={appState.dividends}
              loans={appState.loans}
              accounts={activeAccounts}
              onAddDividend={handleAddDividend}
              onAddLoan={handleAddLoan}
              onDeleteDividend={handleDeleteDividend}
              onDeleteLoan={handleDeleteLoan}
            />
          )}

          {activeTab === 'PROJECTS' && (
            <ProjectsView
              projects={appState.projects}
              transactions={activeTransactions}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === 'REPORTS' && (
            <ReportsView
              transactions={activeTransactions}
              auditLogs={appState.auditLogs}
              companySettings={appState.companySettings}
            />
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsView
              companySettings={appState.companySettings}
              securityPin={appState.securityPin}
              userProfiles={appState.userProfiles || []}
              accounts={appState.accounts || []}
              onUpdateCompanySettings={handleUpdateCompanySettings}
              onSetSecurityPin={handleSetSecurityPin}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetDemoData={handleResetDemoData}
              onAddUserProfile={handleAddUserProfile}
              onUpdateUserProfile={handleUpdateUserProfile}
              onDeleteUserProfile={handleDeleteUserProfile}
            />
          )}

          {activeTab === 'CHURCH_CHARITY' && (
            <ChurchCharityView
              companySettings={appState.companySettings}
              donors={appState.donors || []}
              donationReceipts={appState.donationReceipts || []}
              passThroughFunds={appState.passThroughFunds || []}
              volunteerExpenses={appState.volunteerExpenses || []}
              transactions={appState.transactions}
              accounts={appState.accounts}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              onAddDonor={handleAddDonor}
              onDeleteDonor={handleDeleteDonor}
              onIssueReceipt={handleIssueReceipt}
              onAddPassThroughFund={handleAddPassThroughFund}
              onUpdatePassThroughFund={handleUpdatePassThroughFund}
              onAddVolunteerExpense={handleAddVolunteerExpense}
              onApproveVolunteerExpense={handleApproveVolunteerExpense}
              onBulkDeleteDonors={handleBulkDeleteDonors}
              onBulkDeleteReceipts={handleBulkDeleteReceipts}
              onBulkDeleteVolunteerClaims={handleBulkDeleteVolunteerClaims}
            />
          )}

          {activeTab === 'AI_ADVISOR' && (
            <AiAdvisorView
              appState={appState}
              onUpdateTransactions={handleUpdateTransactions}
            />
          )}

          {activeTab === 'RD_TAX_CREDIT' && (
            <RdTaxCreditView
              appState={appState}
              onUpdateRdProjects={(projects) => {
                applyStateChange((prev) => ({
                  ...prev,
                  rdProjects: projects,
                }), 'Updated R&D Projects');
              }}
              onUpdateRdExpenditures={(logs) => {
                applyStateChange((prev) => ({
                  ...prev,
                  rdExpenditures: logs,
                }), 'Updated R&D Expenditures');
              }}
            />
          )}

          {activeTab === 'SHAREHOLDERS' && (
            <ShareholderDashboardView
              appState={appState}
              onUpdateShareholders={(shs) => {
                applyStateChange((prev) => ({
                  ...prev,
                  shareholders: shs,
                }), 'Updated Shareholders');
              }}
              onUpdateScaEntries={(entries) => {
                applyStateChange((prev) => ({
                  ...prev,
                  shareholderAccountEntries: entries,
                }), 'Updated SCA Entries');
              }}
              onAddDividend={(div) => {
                applyStateChange((prev) => ({
                  ...prev,
                  dividends: [div, ...prev.dividends],
                }), 'Declared Dividend');
              }}
            />
          )}

          {activeTab === 'PERIODIC_REPORTS' && (
            <PeriodicReportingView
              appState={appState}
              onSavePeriodicReport={(config) => {
                applyStateChange((prev) => ({
                  ...prev,
                  periodicReports: [config, ...(prev.periodicReports || [])],
                }), 'Saved Periodic Report Config');
              }}
            />
          )}

          {activeTab === 'PROVISIONAL_TAX' && (
            <ProvisionalTaxAimView
              appState={appState}
              onUpdateAimPeriods={(periods) => {
                applyStateChange((prev) => ({
                  ...prev,
                  aimProvisionalTaxPeriods: periods,
                }), 'Updated AIM Tax Schedule');
              }}
            />
          )}

          {activeTab === 'SUB_ACC' && (
            <SubcontractorAccView
              appState={appState}
              onUpdateSubcontractors={(subs) => {
                applyStateChange((prev) => ({
                  ...prev,
                  subcontractors: subs,
                }), 'Updated Subcontractors');
              }}
            />
          )}

          {activeTab === 'IRD_TAX_RETURNS' && (
            <IrdTaxFormsExporterView
              appState={appState}
              onSaveTaxFormDraft={(draft) => {
                applyStateChange((prev) => ({
                  ...prev,
                  taxFormDrafts: [draft, ...(prev.taxFormDrafts || [])],
                }), 'Saved IRD Tax Form Draft');
              }}
            />
          )}

          {activeTab === 'RECEIPT_OCR' && (
            <ReceiptOcrRuleEngineView
              appState={appState}
              onUpdateOcrReceipts={(receipts) => {
                applyStateChange((prev) => ({
                  ...prev,
                  ocrReceipts: receipts,
                }), 'Updated OCR Receipts');
              }}
            />
          )}

          {activeTab === 'ADVANCED_IRD_TAX_HUB' && (
            <AdvancedIrdTaxHubView
              appState={appState}
              onUpdateGatewayState={(gateway) => {
                applyStateChange((prev) => ({
                  ...prev,
                  myIrGatewayState: gateway,
                }), 'Updated myIR & Open Banking Gateway');
              }}
              onUpdateIndustryProfile={(profile) => {
                applyStateChange((prev) => ({
                  ...prev,
                  industryTaxProfiles: profile,
                }), 'Updated Industry Tax Profile');
              }}
              onUpdateRiskScore={(score) => {
                applyStateChange((prev) => ({
                  ...prev,
                  auditRiskAnalysis: score,
                }), 'Updated IRD Audit Risk Score');
              }}
              onUpdateGroupState={(group) => {
                applyStateChange((prev) => ({
                  ...prev,
                  groupConsolidationState: group,
                }), 'Updated Group Tax Consolidation');
              }}
            />
          )}

          {activeTab === 'MYIR_OPEN_BANKING' && (
            <MyIrOpenBankingGatewayView
              appState={appState}
              onUpdateGatewayState={(gateway) => {
                applyStateChange((prev) => ({
                  ...prev,
                  myIrGatewayState: gateway,
                }), 'Updated myIR & Open Banking Gateway');
              }}
            />
          )}

          {activeTab === 'INDUSTRY_TAX_PROFILES' && (
            <IndustryTaxProfilesView
              appState={appState}
              onUpdateIndustryProfile={(profile) => {
                applyStateChange((prev) => ({
                  ...prev,
                  industryTaxProfiles: profile,
                }), 'Updated Industry Tax Profile');
              }}
            />
          )}

          {activeTab === 'AUDIT_DEFENSE' && (
            <IrdAuditRiskDefenseView
              appState={appState}
              onUpdateRiskScore={(score) => {
                applyStateChange((prev) => ({
                  ...prev,
                  auditRiskAnalysis: score,
                }), 'Updated IRD Audit Risk Score');
              }}
            />
          )}

          {activeTab === 'ENTITY_PLANNER' && (
            <EntityStructurePlannerView appState={appState} />
          )}

          {activeTab === 'GROUP_CONSOLIDATION' && (
            <GroupTaxConsolidationView
              appState={appState}
              onUpdateGroupState={(group) => {
                applyStateChange((prev) => ({
                  ...prev,
                  groupConsolidationState: group,
                }), 'Updated Group Tax Consolidation');
              }}
            />
          )}

          {activeTab === 'FBT_LOGBOOK' && (
            <FbtVehicleLogbookView
              appState={appState}
              onUpdateLogbook={(logs) => {
                applyStateChange((prev) => ({
                  ...prev,
                  vehicleLogbookEntries: logs,
                }), 'Updated Vehicle Logbook');
              }}
            />
          )}

          {activeTab === 'FIXED_ASSETS' && (
            <FixedAssetDepreciationView
              appState={appState}
              onUpdateFixedAssets={(assets) => {
                applyStateChange((prev) => ({
                  ...prev,
                  fixedAssets: assets,
                }), 'Updated Fixed Assets');
              }}
            />
          )}
          {activeTab === 'CASHFLOW' && <CashFlowForecastView appState={appState} />}
          {activeTab === 'IRD_DOCUMENTS' && <IrdDocumentCentreView appState={appState} />}
          {activeTab === 'FINANCIAL_HEALTH' && <FinancialHealthView appState={appState} />}
          {activeTab === 'SMART_REMINDERS' && <SmartRemindersView appState={appState} />}
          {activeTab === 'DOCUMENT_OCR' && (
            <DocumentOcrScannerView
              accounts={appState.accounts}
              onAddTransaction={handleAddTransaction}
            />
          )}
          {activeTab === 'DATA_VISUALIZATION' && (
            <DataVisualizationView
              transactions={appState.transactions}
              accounts={appState.accounts}
              projects={appState.projects}
            />
          )}
          {activeTab === 'CLIENT_PORTAL' && (
            <ClientPortalView
              invoices={appState.invoices}
              companySettings={appState.companySettings}
              onMarkInvoicePaid={(id) => handleUpdateInvoiceStatus(id, 'PAID')}
            />
          )}

          {activeTab === 'AUDIT_LOGS' && (
            <AuditLogsView
              auditLogs={appState.auditLogs}
              companySettings={appState.companySettings}
            />
          )}

          {activeTab === 'TAX_MAP' && (
            <TaxMapView
              companySettings={appState.companySettings}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === 'MULTI_CURRENCY' && (
            <MultiCurrencyView
              companySettings={appState.companySettings}
              transactions={appState.transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'DOCUMENT_TAGGING' && (
            <DocumentTaggingView
              transactions={appState.transactions}
              invoices={appState.invoices}
              companySettings={appState.companySettings}
              onUpdateTransactionTags={handleUpdateTransactionTags}
            />
          )}

          {activeTab === 'SMART_ALERTS' && (
            <SmartScanAlertsView
              transactions={appState.transactions}
              invoices={appState.invoices}
              companySettings={appState.companySettings}
              onUpdateTransactions={handleUpdateTransactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
        </main>

      </div>

      {/* Action Toast Banner */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/60 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>{actionToast.message}</span>
          {historyPast.length > 0 && actionToast.type !== 'undo' && (
            <button
              type="button"
              onClick={handleUndo}
              className="ml-2 px-2 py-1 bg-slate-800 hover:bg-teal-600 text-teal-200 hover:text-white font-bold rounded-lg text-[10px] transition-all"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Quick Add Entry Global Modal */}
      {showQuickAddModal && (
        <QuickAddModal
          isOpen={showQuickAddModal}
          accounts={appState.accounts}
          projects={appState.projects}
          onClose={() => setShowQuickAddModal(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcutsModal}
        onClose={() => setShowKeyboardShortcutsModal(false)}
        onNavigateTab={(tabId) => {
          setActiveTab(tabId);
          setShowKeyboardShortcutsModal(false);
        }}
        onQuickAction={(action) => {
          if (action === 'NEW_TRANSACTION') setShowQuickAddModal(true);
          if (action === 'NEW_INVOICE') {
            setActiveTab('INVOICES');
          }
          if (action === 'NEW_BUDGET') {
            setActiveTab('BUDGET_THRESHOLDS');
          }
          setShowKeyboardShortcutsModal(false);
        }}
      />

      {/* Quick Search Modal (Cmd+K) */}
      <QuickSearchModal
        isOpen={showQuickSearchModal}
        onClose={() => setShowQuickSearchModal(false)}
        transactions={appState.transactions}
        invoices={appState.invoices}
        accounts={appState.accounts}
        companySettings={appState.companySettings}
        onNavigateTab={(tabId) => {
          setActiveTab(tabId);
          setShowQuickSearchModal(false);
        }}
      />

      {/* Data Export Wizard Modal */}
      <DataExportWizardModal
        isOpen={showExportWizardModal}
        onClose={() => setShowExportWizardModal(false)}
        transactions={appState.transactions}
        invoices={appState.invoices}
        accounts={appState.accounts}
        companySettings={appState.companySettings}
        auditLogs={appState.auditLogs || []}
        onExportExecutivePdf={() => generateFinancialSummaryPDF(appState)}
      />

      {/* Automated Tax Backup Modal */}
      <AutomatedTaxBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        appState={appState}
        onRestoreState={(restoredState) => {
          setAppState(restoredState);
          saveKiwiLedgerState(restoredState);
        }}
      />

      {/* Automated Bank Feeds Modal */}
      <AutomatedBankFeedsModal
        isOpen={showBankFeedsModal}
        onClose={() => setShowBankFeedsModal(false)}
        accounts={appState.accounts}
        bankFeedRules={appState.bankFeedRules || []}
        onImportTransactions={(newTxs) => {
          const formatted: Transaction[] = newTxs.map((t) => ({
            id: t.id || `tx-${Date.now()}`,
            date: t.date || new Date().toISOString().split('T')[0],
            description: t.description || 'Bank Feed Entry',
            amount: t.amount || 0,
            type: t.type || 'EXPENSE',
            category: t.category || 'General Expense',
            accountId: t.accountId || appState.accounts[0]?.id || 'acc-1',
            gstType: t.gstType || 'STANDARD_15',
            gstAmount: t.gstAmount || 0,
            irdTaxCode: t.irdTaxCode || '300 - Operating Expenses',
            reference: t.reference || '',
            isReconciled: true,
            createdAt: new Date().toISOString(),
          }));

          applyStateChange((prev) => ({
            ...prev,
            transactions: [...formatted, ...prev.transactions],
            auditLogs: [
              logAuditEvent('IMPORT_BANK_FEEDS', 'BANKING', `Imported ${formatted.length} entries via Bank Feed Sync`),
              ...prev.auditLogs,
            ],
          }), `Imported ${formatted.length} bank feed entry/entries`);
        }}
        onSaveBankFeedRules={handleSaveBankFeedRules}
      />

      {/* Smart Data Cleaning Modal */}
      <SmartDataCleaningModal
        isOpen={showDataCleanerModal}
        onClose={() => setShowDataCleanerModal(false)}
        transactions={appState.transactions}
        onUpdateTransactions={handleUpdateTransactions}
        onDeleteTransactions={handleDeleteTransactions}
      />

    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
