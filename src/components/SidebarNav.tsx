import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Landmark,
  CheckCheck,
  FileCheck2,
  Percent,
  Users,
  Calculator,
  Scan,
  TrendingUp,
  Building,
  FolderGit2,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Sparkles,
  LineChart,
  FolderKanban,
  Activity,
  BellRing,
  HeartHandshake,
  Calendar,
  Target,
  ShieldAlert,
  Repeat,
  Boxes,
  Globe,
  Map,
  Coins,
  Tag,
  FlaskConical,
  UserCheck,
  FileSpreadsheet,
  Zap,
  Car,
  Layers,
  FileText,
  Building2,
  Tractor,
  X,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { BusinessEntity } from '../types';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  category: 'MAIN' | 'IRD' | 'REPORTS';
  badge?: string;
}

export const TABS: TabItem[] = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, category: 'MAIN' },
  { id: 'BOOKKEEPING', label: 'Bookkeeping', icon: ReceiptText, category: 'MAIN' },
  { id: 'BANK_ACCOUNTS', label: 'Bank Accounts & CSV', icon: Landmark, category: 'MAIN', badge: 'CSV' },
  { id: 'RECONCILIATION', label: 'Bank Reconciliation', icon: CheckCheck, category: 'MAIN' },
  { id: 'INVOICES', label: 'NZ GST Invoices', icon: FileCheck2, category: 'MAIN' },
  { id: 'CLIENT_PORTAL', label: 'Client Portal', icon: Globe, category: 'MAIN', badge: 'Portal' },
  { id: 'RECURRING', label: 'Recurring Schedules', icon: Repeat, category: 'MAIN', badge: 'Auto' },
  { id: 'INVENTORY', label: 'Inventory & Stock', icon: Boxes, category: 'MAIN', badge: 'Stock' },
  { id: 'SMART_ALERTS', label: 'Smart Scan Alerts', icon: ShieldAlert, category: 'MAIN', badge: 'Alerts' },
  { id: 'FINANCIAL_HEALTH', label: 'Financial Health', icon: Activity, category: 'MAIN', badge: 'Score' },

  { id: 'ADVANCED_IRD_TAX_HUB', label: 'Advanced IRD Tax Suite', icon: ShieldCheck, category: 'IRD', badge: '5-in-1' },
  { id: 'PROVISIONAL_TAX', label: 'Provisional Tax & AIM', icon: Zap, category: 'IRD', badge: 'AIM' },
  { id: 'FBT_LOGBOOK', label: 'FBT & Vehicle Logbook', icon: Car, category: 'IRD', badge: 'FBT' },
  { id: 'SUB_ACC', label: 'Subcontractors & ACC', icon: Users, category: 'IRD', badge: 'WT-1' },
  { id: 'IRD_TAX_RETURNS', label: 'IRD Tax Returns Exporter', icon: FileText, category: 'IRD', badge: 'IR4/3' },
  { id: 'RECEIPT_OCR', label: 'Receipt OCR & Rule Engine', icon: Scan, category: 'IRD', badge: 'Rules' },
  { id: 'CHURCH_CHARITY', label: 'Church & Non-Profit Hub', icon: HeartHandshake, category: 'IRD', badge: 'IR526' },
  { id: 'RD_TAX_CREDIT', label: 'R&D Tax Credit (RDTI)', icon: FlaskConical, category: 'IRD', badge: '15%' },
  { id: 'AI_ADVISOR', label: 'AI Tax Advisor', icon: Sparkles, category: 'IRD', badge: 'AI' },
  { id: 'TAX_MAP', label: 'Interactive Tax Map', icon: Map, category: 'IRD', badge: 'Map' },
  { id: 'AUDIT_LOGS', label: 'IRD Audit Trail Export', icon: ShieldCheck, category: 'IRD', badge: 'Audit' },
  { id: 'GST_RETURN', label: 'GST Returns (GST101)', icon: Percent, category: 'IRD', badge: '15%' },
  { id: 'PAYROLL', label: 'Payroll & PAYE', icon: Users, category: 'IRD' },
  { id: 'TAX_RETURNS', label: 'Income Tax & IR3', icon: Calculator, category: 'IRD' },
  { id: 'DOCUMENT_OCR', label: 'Document OCR Scanner', icon: Scan, category: 'IRD', badge: 'OCR' },
  { id: 'RECEIPT_SCANNER', label: 'Receipt Scanner', icon: Scan, category: 'IRD', badge: 'AI' },
  { id: 'IRD_DOCUMENTS', label: 'IRD Document Centre', icon: FolderKanban, category: 'IRD' },
  { id: 'SMART_REMINDERS', label: 'Smart Reminders', icon: BellRing, category: 'IRD', badge: 'Due' },
  { id: 'TAX_CALENDAR', label: 'NZ Tax Calendar', icon: Calendar, category: 'IRD', badge: 'NZ IRD' },

  { id: 'FIXED_ASSETS', label: 'Fixed Assets & Deprec.', icon: Layers, category: 'REPORTS', badge: 'Assets' },
  { id: 'MULTI_CURRENCY', label: 'Multi-Currency & FX', icon: Coins, category: 'REPORTS', badge: 'FX' },
  { id: 'DOCUMENT_TAGGING', label: 'Document & Tag Hub', icon: Tag, category: 'REPORTS', badge: 'Tags' },
  { id: 'DATA_VISUALIZATION', label: 'Data Visualizations', icon: BarChart3, category: 'REPORTS', badge: 'Charts' },
  { id: 'BUDGET_THRESHOLDS', label: 'Budget Thresholds', icon: Target, category: 'REPORTS', badge: 'Alerts' },
  { id: 'CASHFLOW', label: 'Cash Flow Forecast', icon: LineChart, category: 'REPORTS' },
  { id: 'DIVIDENDS_LOANS', label: 'Dividends & Loans', icon: TrendingUp, category: 'REPORTS' },
  { id: 'SHAREHOLDERS', label: 'Shareholder Dashboard', icon: UserCheck, category: 'REPORTS', badge: 'SCA' },
  { id: 'PERIODIC_REPORTS', label: 'Periodic Management Packs', icon: FileSpreadsheet, category: 'REPORTS', badge: 'Packs' },
  { id: 'PROJECTS', label: 'Projects & Job Tags', icon: FolderGit2, category: 'REPORTS' },
  { id: 'REPORTS', label: 'Financial Reports', icon: BarChart3, category: 'REPORTS' },
  { id: 'SETTINGS', label: 'Settings & Storage', icon: Settings, category: 'REPORTS' },
];

interface SidebarNavProps {
  activeTab: string;
  setActiveTab?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  unreconciledCount?: number;
  activeEntity?: BusinessEntity;
  onCloseMobileMenu?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  unreconciledCount = 0,
  activeEntity,
  onCloseMobileMenu,
}) => {
  const { t, locale } = useI18n();

  const handleSelectTab = (tabId: string) => {
    if (onTabChange) onTabChange(tabId);
    if (setActiveTab) setActiveTab(tabId);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const getTranslatedTabLabel = (tabId: string, defaultLabel: string) => {
    const keyMap: Record<string, keyof ReturnType<typeof useI18n> extends { t: (k: infer K) => any } ? K : any> = {
      DASHBOARD: 'dashboard',
      BOOKKEEPING: 'transactions',
      GST_RETURN: 'gstReturn',
      INVOICES: 'invoices',
      PAYROLL: 'payroll',
      FINANCIAL_HEALTH: 'financialHealth',
      SMART_ALERTS: 'smartAlerts',
      PROVISIONAL_TAX: 'provisionalTax',
      FBT_LOGBOOK: 'fbtLogbook',
      SUB_ACC: 'subcontractors',
      IRD_TAX_RETURNS: 'irdForms',
      RECEIPT_OCR: 'receiptOcr',
      ADVANCED_IRD_TAX_HUB: 'advancedIrdHub',
      CHURCH_CHARITY: 'churchCharity',
      RD_TAX_CREDIT: 'rdTaxCredit',
      AI_ADVISOR: 'aiAdvisor',
      INVENTORY: 'inventory',
      FIXED_ASSETS: 'fixedAssets',
      DIVIDENDS_LOANS: 'dividends',
      SHAREHOLDERS: 'shareholderAccount',
      BUDGET_THRESHOLDS: 'budgets',
      AUDIT_LOGS: 'auditLogs',
    };

    const key = keyMap[tabId];
    if (key) {
      return t(key as any, defaultLabel);
    }
    return defaultLabel;
  };

  const getCategoryTitle = (categoryKey: 'MAIN' | 'IRD' | 'REPORTS', fallback: string) => {
    if (locale === 'mi-NZ') {
      return categoryKey === 'MAIN' ? 'Aukati & Pūtea' : categoryKey === 'IRD' ? 'Ngā Tāke IRD' : 'Ngā Pūrongo';
    }
    if (locale === 'my-MM') {
      return categoryKey === 'MAIN' ? 'ပင်မ အပိုင်း' : categoryKey === 'IRD' ? 'IRD အခွန်စနစ်' : 'အစီရင်ခံစာများ';
    }
    if (locale === 'zom-MM') {
      return categoryKey === 'MAIN' ? 'Maimang Sumlaibu' : categoryKey === 'IRD' ? 'IRD Siah Khempeuh' : 'Pūrongo Teng';
    }
    return fallback;
  };

  const renderTabGroup = (categoryKey: 'MAIN' | 'IRD' | 'REPORTS', title: string) => {
    let visibleTabs = TABS.filter((t) => t.category === categoryKey);

    if (activeEntity) {
      const type = activeEntity.entityType;
      const isCharity = type === 'REGISTERED_CHARITY' || type === 'CHURCH_ORGANISATION' || type === 'TRUST';
      const isCompany = type === 'NZ_COMPANY' || type === 'LOOK_THROUGH_COMPANY' || type === 'SOLE_TRADER' || type === 'PARTNERSHIP';
      
      if (isCharity) {
        visibleTabs = visibleTabs.filter((t) => !['DIVIDENDS_LOANS', 'SHAREHOLDERS', 'RD_TAX_CREDIT', 'PROVISIONAL_TAX'].includes(t.id));
      } else if (isCompany) {
        visibleTabs = visibleTabs.filter((t) => !['CHURCH_CHARITY'].includes(t.id));
      }
    }

    if (visibleTabs.length === 0) return null;

    const translatedTitle = getCategoryTitle(categoryKey, title);

    return (
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          {translatedTitle}
        </div>
        <div className="space-y-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isReconTab = tab.id === 'RECONCILIATION';
            const displayLabel = getTranslatedTabLabel(tab.id, tab.label);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer touch-manipulation ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{displayLabel}</span>
                </div>

                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : tab.badge === 'AI'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {isReconTab && unreconciledCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {unreconciledCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 h-full">
      {/* Sidebar Top Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg text-white shadow-sm">
            K
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight block text-white leading-none">
              KiwiBooks Pro
            </span>
            <span className="text-[10px] text-slate-400 font-medium">NZ IRD Compliant</span>
          </div>
        </div>
        {onCloseMobileMenu && (
          <button
            type="button"
            onClick={onCloseMobileMenu}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="Close navigation menu"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grouped Tab Links */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 custom-scrollbar overscroll-contain pb-24">
        {renderTabGroup('MAIN', 'Main Ledger')}
        {renderTabGroup('IRD', 'IRD & Compliance')}
        {renderTabGroup('REPORTS', 'Reports & Admin')}
      </nav>

      {/* Encrypted Local Storage Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Encrypted</span>
          </span>
          <span className="text-emerald-400 font-medium">● Online</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1">
          <div className="bg-blue-500 w-1/4 h-full"></div>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
          <span>245MB / 1GB Allocated</span>
          <span>100% Offline</span>
        </div>
      </div>
    </aside>
  );
};

