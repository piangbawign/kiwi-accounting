import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Lock,
  Search,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Keyboard,
  Landmark,
  ChevronDown,
  Check,
  Sun,
  Moon,
  FileText,
  Download,
  Save,
  Wand2,
  MoreHorizontal,
  SlidersHorizontal,
  Languages,
  Menu,
  X,
} from 'lucide-react';
import { CompanySettings, Transaction, Account, BusinessEntity, UserProfile } from '../types';
import { MultiEntitySelector } from './MultiEntitySelector';
import { useI18n } from '../i18n/I18nContext';

interface HeaderProps {
  companySettings: CompanySettings;
  accounts?: Account[];
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
  transactions?: Transaction[];
  entities?: BusinessEntity[];
  userProfiles?: UserProfile[];
  activeEntityId?: string;
  onSelectEntity?: (entityId: string) => void;
  onAddEntity?: (newEntity: BusinessEntity) => void;
  onDeleteEntity?: (entityId: string) => void;
  onDeleteUserProfile?: (profileId: string) => void;
  onOpenBankFeeds?: () => void;
  onOpenDataCleaner?: () => void;
  hasSecurityPin?: boolean;
  onLockAppNow?: () => void;
  onLockApp?: () => void;
  onOpenQuickAdd: () => void;
  onOpenShortcuts?: () => void;
  storageUsage?: string;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  activeTab?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  historyPastCount?: number;
  historyFutureCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onExportExecutivePdf?: () => void;
  onOpenExportWizard?: () => void;
  onOpenBackupModal?: () => void;
  onOpenQuickSearch?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  companySettings,
  accounts = [],
  selectedAccountId = 'ALL',
  onSelectAccount,
  hasSecurityPin,
  onLockAppNow,
  onLockApp,
  onOpenQuickAdd,
  onOpenShortcuts,
  storageUsage = '4.2 MB / Local Storage',
  searchQuery = '',
  setSearchQuery,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  historyPastCount = 0,
  historyFutureCount = 0,
  isDarkMode = false,
  onToggleDarkMode,
  entities = [],
  userProfiles = [],
  activeEntityId = 'ALL',
  onSelectEntity,
  onAddEntity,
  onDeleteEntity,
  onDeleteUserProfile,
  onOpenBankFeeds,
  onOpenDataCleaner,
  onExportExecutivePdf,
  onOpenExportWizard,
  onOpenBackupModal,
  onOpenQuickSearch,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const { t, locale, setLocale, formatCurrency, isMaori } = useI18n();

  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showMobileToolsModal, setShowMobileToolsModal] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const handleLock = onLockAppNow || onLockApp;

  const activeAccount = accounts.find((a) => a.id === selectedAccountId);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <header className="min-h-[56px] sm:min-h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2.5 sm:px-6 shadow-xs sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Button & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shrink-0 touch-manipulation"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-800 dark:text-slate-200" /> : <Menu className="w-5 h-5 text-slate-800 dark:text-slate-200" />}
          </button>
        )}

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-xs shrink-0">
          🇳🇿
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[110px] sm:max-w-none">
              KiwiLedger<span className="hidden sm:inline"> Pro</span>
            </span>
            <span className="hidden sm:inline px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] sm:text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700">
              FY 2025/26
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px] md:max-w-[220px]">
            {companySettings.tradingName} • IRD: {companySettings.irdNumber}
          </p>
        </div>
      </div>

      {/* Center Desktop: Quick Bank Switcher, Undo/Redo & Search Bar */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4 justify-start">
        {/* Account Quick Switcher Dropdown */}
        {accounts.length > 0 && (
          <div className="relative shrink-0" ref={accountDropdownRef}>
            <button
              type="button"
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all touch-manipulation"
              title="Quickly Switch Bank Account"
            >
              <Landmark className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-left hidden lg:block">
                <p className="text-[11px] font-extrabold leading-tight text-slate-900 dark:text-slate-100 truncate max-w-[110px]">
                  {selectedAccountId === 'ALL' || !activeAccount
                    ? 'All Accounts'
                    : activeAccount.name}
                </p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                  ${selectedAccountId === 'ALL' || !activeAccount
                    ? totalBalance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })
                    : activeAccount.balance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showAccountDropdown && (
              <div className="absolute top-11 left-0 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  Quick Switch Account
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAccount) onSelectAccount('ALL');
                    setShowAccountDropdown(false);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                    selectedAccountId === 'ALL'
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <p className="font-bold">All Accounts Combined</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Total: ${totalBalance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {selectedAccountId === 'ALL' && <Check className="w-4 h-4 text-teal-700 dark:text-teal-400" />}
                </button>

                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      if (onSelectAccount) onSelectAccount(acc.id);
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                      selectedAccountId === acc.id
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold truncate max-w-[140px]">{acc.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {acc.bankName} • {acc.accountNumber}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      ${acc.balance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Undo / Redo Toolbar */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title={canUndo ? `Undo (Ctrl+Z) - ${historyPastCount} step(s)` : 'Nothing to undo'}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
              canUndo
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95'
                : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title={canRedo ? `Redo (Ctrl+Y) - ${historyFutureCount} step(s)` : 'Nothing to redo'}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
              canRedo
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95'
                : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar with Cmd+K trigger */}
        <div
          onClick={() => onOpenQuickSearch && onOpenQuickSearch()}
          className="flex items-center flex-1 relative cursor-pointer group min-w-[120px]"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 absolute left-3 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search (⌘K)..."
            value={searchQuery}
            onClick={() => onOpenQuickSearch && onOpenQuickSearch()}
            className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-xl pl-8 pr-10 py-1.5 border border-slate-200 dark:border-slate-700 group-hover:border-teal-500 dark:group-hover:border-teal-400 cursor-pointer transition-all"
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono text-slate-400 dark:text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Desktop: Consolidated Action Controls */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Multi Entity Selector */}
        {(entities.length > 0 || userProfiles.length > 0) && onSelectEntity && onAddEntity && (
          <div className="shrink-0">
            <MultiEntitySelector
              entities={entities}
              userProfiles={userProfiles}
              activeEntityId={activeEntityId}
              onSelectEntity={onSelectEntity}
              onAddEntity={onAddEntity}
              onDeleteEntity={onDeleteEntity}
              onDeleteUserProfile={onDeleteUserProfile}
            />
          </div>
        )}

        {/* Export PDF Button (Quick Access) */}
        {onExportExecutivePdf && (
          <button
            type="button"
            onClick={onExportExecutivePdf}
            title="Export Official Executive Financial PDF Report"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-900 dark:text-teal-300 font-extrabold text-xs border border-teal-200 dark:border-teal-800/60 transition-all shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Export PDF</span>
          </button>
        )}

        {/* Unified Tools & Export Dropdown Menu */}
        <div className="relative shrink-0" ref={toolsDropdownRef}>
          <button
            type="button"
            onClick={() => setShowToolsDropdown(!showToolsDropdown)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
              showToolsDropdown
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-600 dark:border-teal-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="More Tools, Exports & Shortcuts"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Tools & Export Menu Popup */}
          {showToolsDropdown && (
            <div className="absolute top-11 right-0 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 space-y-1">
              <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                <span>Tools & Export Hub</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono">NZ IRD Ready</span>
              </div>

              {/* Export PDF Report */}
              {onExportExecutivePdf && (
                <button
                  type="button"
                  onClick={() => {
                    onExportExecutivePdf();
                    setShowToolsDropdown(false);
                  }}
                  className="w-full p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold">Export Executive PDF</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Download formatted financial statement</p>
                  </div>
                </button>
              )}

              {/* Data Export Wizard */}
              {onOpenExportWizard && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenExportWizard();
                    setShowToolsDropdown(false);
                  }}
                  className="w-full p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold">Data Export Wizard</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">CSV, JSON, IRD format exports</p>
                  </div>
                </button>
              )}

              {/* Keyboard Shortcuts */}
              {onOpenShortcuts && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenShortcuts();
                    setShowToolsDropdown(false);
                  }}
                  className="w-full p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Keyboard className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold">Keyboard Shortcuts</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">View all shortcut triggers</p>
                    </div>
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300">
                      ?
                    </kbd>
                  </div>
                </button>
              )}

              {/* Automated Bank Feeds */}
              {onOpenBankFeeds && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenBankFeeds();
                    setShowToolsDropdown(false);
                  }}
                  className="w-full p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold">Bank Feeds & Matcher</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Automated feed importer</p>
                  </div>
                </button>
              )}

              {/* Data Cleaner */}
              {onOpenDataCleaner && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDataCleaner();
                    setShowToolsDropdown(false);
                  }}
                  className="w-full p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Wand2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold">Smart Data Cleaner</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Auto-fix duplicate transactions</p>
                  </div>
                </button>
              )}

              {/* Tax Backups */}
              {onOpenBackupModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenBackupModal();
                    setShowToolsDropdown(false);
                  }}
                  className="w-full p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Save className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold">Automated Backups</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Create local ledger snapshot</p>
                  </div>
                </button>
              )}

              {/* Storage Info */}
              <div className="p-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold">
                  <HardDrive className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {storageUsage}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Encrypted</span>
              </div>
            </div>
          )}
        </div>

        {/* Multi-language Selector (EN, Māori, Myanmar, Zomi) */}
        <div className="relative" ref={langDropdownRef}>
          <button
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            title="Select System Language"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold border border-slate-200 dark:border-slate-700 transition-all shrink-0"
          >
            <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-mono text-[11px] font-bold">
              {locale === 'en-NZ' && 'EN'}
              {locale === 'mi-NZ' && 'Māori'}
              {locale === 'my-MM' && 'မြန်မာ'}
              {locale === 'zom-MM' && 'Zomi'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                System Language
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setLocale('en-NZ');
                  setShowLangDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                  locale === 'en-NZ'
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇳🇿</span>
                  <div>
                    <div className="font-bold">English (NZ)</div>
                    <div className="text-[10px] opacity-70">Standard NZ Business</div>
                  </div>
                </div>
                {locale === 'en-NZ' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocale('mi-NZ');
                  setShowLangDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                  locale === 'mi-NZ'
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇳🇿</span>
                  <div>
                    <div className="font-bold">Te Reo Māori</div>
                    <div className="text-[10px] opacity-70">Aotearoa Native</div>
                  </div>
                </div>
                {locale === 'mi-NZ' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocale('my-MM');
                  setShowLangDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                  locale === 'my-MM'
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇲🇲</span>
                  <div>
                    <div className="font-bold">မြန်မာဘာသာ</div>
                    <div className="text-[10px] opacity-70">Myanmar (Burmese)</div>
                  </div>
                </div>
                {locale === 'my-MM' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocale('zom-MM');
                  setShowLangDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                  locale === 'zom-MM'
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇲🇲</span>
                  <div>
                    <div className="font-bold">Zomi (Tedim)</div>
                    <div className="text-[10px] opacity-70">Tedim Chin Pau</div>
                  </div>
                </div>
                {locale === 'zom-MM' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode Theme Toggler Button */}
        {onToggleDarkMode && (
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-all shrink-0"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        )}

        {/* Primary Add Transaction Button */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('addTransaction')}</span>
        </button>

        {/* Security Lock Button */}
        {hasSecurityPin && handleLock && (
          <button
            type="button"
            onClick={handleLock}
            title="Lock Application with PIN"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 border border-slate-200 dark:border-slate-700 transition-all shrink-0"
          >
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        )}
      </div>

      {/* --- MOBILE COMPACT ACTION BAR (Only visible on screens < md) --- */}
      <div className="flex md:hidden items-center gap-1.5 shrink-0">
        {/* Quick Search Icon Button */}
        {onOpenQuickSearch && (
          <button
            type="button"
            onClick={onOpenQuickSearch}
            title="Search Transactions & Documents (⌘K)"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shrink-0 touch-manipulation"
          >
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>
        )}

        {/* Quick Bank Switcher Icon Button */}
        {accounts.length > 0 && (
          <div className="relative shrink-0" ref={accountDropdownRef}>
            <button
              type="button"
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 touch-manipulation"
              title="Quick Bank Switcher"
            >
              <Landmark className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 max-w-[60px] truncate">
                ${(selectedAccountId === 'ALL' || !activeAccount ? totalBalance : activeAccount.balance).toFixed(0)}
              </span>
            </button>

            {showAccountDropdown && (
              <div className="absolute top-11 right-0 w-64 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
                  Switch Bank Account
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAccount) onSelectAccount('ALL');
                    setShowAccountDropdown(false);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-left ${
                    selectedAccountId === 'ALL' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold">All Accounts Combined</p>
                    <p className="text-[10px] text-slate-400 font-mono">${totalBalance.toFixed(2)}</p>
                  </div>
                  {selectedAccountId === 'ALL' && <Check className="w-4 h-4 text-teal-600" />}
                </button>
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      if (onSelectAccount) onSelectAccount(acc.id);
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-left ${
                      selectedAccountId === acc.id ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-bold truncate max-w-[120px]">{acc.name}</p>
                    <span className="font-mono text-teal-600 font-bold">${acc.balance.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Primary Add Transaction Button */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all shrink-0 flex items-center gap-1 touch-manipulation"
          title="Add New Transaction"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="text-xs font-extrabold pr-0.5">Add</span>
        </button>

        {/* Mobile Tools Drawer Trigger */}
        <button
          type="button"
          onClick={() => setShowMobileToolsModal(true)}
          className="p-2 rounded-xl bg-slate-900 text-white dark:bg-teal-600 dark:text-white border border-slate-800 dark:border-teal-500 shadow-xs transition-all shrink-0 touch-manipulation flex items-center gap-1"
          title="Open Header Tools & Entity Switcher"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* --- MOBILE TOOLS MODAL DRAWER --- */}
      {showMobileToolsModal && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setShowMobileToolsModal(false)}
          />

          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-250">
            
            {/* Modal Drag Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Header Tools & Controls
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Entities, language, tools & system settings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileToolsModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Business Entity / Profile Switcher */}
            {(entities.length > 0 || userProfiles.length > 0) && onSelectEntity && onAddEntity && (
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Active Entity / Profile Switcher
                </label>
                <div className="p-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <MultiEntitySelector
                    entities={entities}
                    userProfiles={userProfiles}
                    activeEntityId={activeEntityId}
                    onSelectEntity={(id) => {
                      onSelectEntity(id);
                      setShowMobileToolsModal(false);
                    }}
                    onAddEntity={onAddEntity}
                    onDeleteEntity={onDeleteEntity}
                    onDeleteUserProfile={onDeleteUserProfile}
                  />
                </div>
              </div>
            )}

            {/* Section 2: Undo / Redo & Quick Actions */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                History & Quick Actions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={() => {
                    if (onUndo) onUndo();
                  }}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    canUndo
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 active:scale-95'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-teal-600" /> Undo Step
                </button>

                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={() => {
                    if (onRedo) onRedo();
                  }}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    canRedo
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 active:scale-95'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <RotateCw className="w-4 h-4 text-teal-600" /> Redo Step
                </button>
              </div>
            </div>

            {/* Section 3: System Language Switcher */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                System Language
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocale('en-NZ')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 ${
                    locale === 'en-NZ'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🇳🇿</span> English (NZ)
                </button>

                <button
                  type="button"
                  onClick={() => setLocale('mi-NZ')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 ${
                    locale === 'mi-NZ'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🇳🇿</span> Te Reo Māori
                </button>

                <button
                  type="button"
                  onClick={() => setLocale('my-MM')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 ${
                    locale === 'my-MM'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🇲🇲</span> မြန်မာဘာသာ
                </button>

                <button
                  type="button"
                  onClick={() => setLocale('zom-MM')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 ${
                    locale === 'zom-MM'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🇲🇲</span> Zomi (Tedim)
                </button>
              </div>
            </div>

            {/* Section 4: Display & Security Toggles */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Display & Security
              </label>
              <div className="grid grid-cols-2 gap-2">
                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold flex items-center justify-between text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>
                )}

                {hasSecurityPin && handleLock && (
                  <button
                    type="button"
                    onClick={() => {
                      handleLock();
                      setShowMobileToolsModal(false);
                    }}
                    className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Lock PIN
                  </button>
                )}
              </div>
            </div>

            {/* Section 5: Tools & Financial Exports */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Financial Tools & Exports
              </label>

              <div className="space-y-1.5 text-xs">
                {onExportExecutivePdf && (
                  <button
                    type="button"
                    onClick={() => {
                      onExportExecutivePdf();
                      setShowMobileToolsModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center gap-2.5 text-teal-900 dark:text-teal-200 font-bold"
                  >
                    <FileText className="w-4 h-4 text-teal-600" /> Export Executive PDF
                  </button>
                )}

                {onOpenExportWizard && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenExportWizard();
                      setShowMobileToolsModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Download className="w-4 h-4 text-teal-600" /> Data Export Wizard (CSV/JSON)
                  </button>
                )}

                {onOpenBankFeeds && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBankFeeds();
                      setShowMobileToolsModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Landmark className="w-4 h-4 text-teal-600" /> Bank Feeds & Matcher
                  </button>
                )}

                {onOpenDataCleaner && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDataCleaner();
                      setShowMobileToolsModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Wand2 className="w-4 h-4 text-indigo-600" /> Smart Data Cleaner
                  </button>
                )}

                {onOpenBackupModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBackupModal();
                      setShowMobileToolsModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Save className="w-4 h-4 text-emerald-600" /> Automated Backups
                  </button>
                )}

                {onOpenShortcuts && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenShortcuts();
                      setShowMobileToolsModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Keyboard className="w-4 h-4 text-slate-500" /> Keyboard Shortcuts
                    </div>
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">?</kbd>
                  </button>
                )}
              </div>
            </div>

            {/* Storage Usage Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" /> {storageUsage}
              </span>
              <span className="text-emerald-600 font-extrabold">Encrypted</span>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};


