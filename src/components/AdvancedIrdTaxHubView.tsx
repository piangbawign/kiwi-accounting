import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe,
  Tractor,
  Building2,
  Layers,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { AppState, MyIrGatewayConnection, IndustryTaxProfile, IrdAuditRiskScore, GroupTaxConsolidation } from '../types';
import { MyIrOpenBankingGatewayView } from './MyIrOpenBankingGatewayView';
import { IndustryTaxProfilesView } from './IndustryTaxProfilesView';
import { IrdAuditRiskDefenseView } from './IrdAuditRiskDefenseView';
import { EntityStructurePlannerView } from './EntityStructurePlannerView';
import { GroupTaxConsolidationView } from './GroupTaxConsolidationView';

interface AdvancedIrdTaxHubViewProps {
  appState: AppState;
  onUpdateGatewayState?: (gateway: MyIrGatewayConnection) => void;
  onUpdateIndustryProfile?: (profile: IndustryTaxProfile) => void;
  onUpdateRiskScore?: (score: IrdAuditRiskScore) => void;
  onUpdateGroupState?: (group: GroupTaxConsolidation) => void;
}

export type TaxHubTab = 'MYIR_OPEN_BANKING' | 'INDUSTRY_PROFILES' | 'AUDIT_DEFENSE' | 'ENTITY_PLANNER' | 'GROUP_CONSOLIDATION';

export const AdvancedIrdTaxHubView: React.FC<AdvancedIrdTaxHubViewProps> = ({
  appState,
  onUpdateGatewayState,
  onUpdateIndustryProfile,
  onUpdateRiskScore,
  onUpdateGroupState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TaxHubTab>('MYIR_OPEN_BANKING');

  const subTabs = [
    {
      id: 'MYIR_OPEN_BANKING' as TaxHubTab,
      label: 'myIR & Open Banking',
      badge: 'Akahu / IRD',
      icon: Globe,
      description: 'Real-time IRD myIR tax account sync & NZ Open Banking feeds',
    },
    {
      id: 'INDUSTRY_PROFILES' as TaxHubTab,
      label: 'Industry Tax Profiles',
      badge: 'Farming / Tech',
      icon: Tractor,
      description: 'Specialized IRD tax rules for Agriculture, Tech, Trades & Hospitality',
    },
    {
      id: 'AUDIT_DEFENSE' as TaxHubTab,
      label: 'IRD Audit Risk Defense',
      badge: 'Risk Engine',
      icon: ShieldAlert,
      description: 'AI audit risk scoring, benchmark comparisons & discrepancy alerts',
    },
    {
      id: 'ENTITY_PLANNER' as TaxHubTab,
      label: 'Entity Structure Planner',
      badge: '28% vs 39%',
      icon: Building2,
      description: 'Sole Trader vs Company vs Trust tax optimizer & shareholder salary mix',
    },
    {
      id: 'GROUP_CONSOLIDATION' as TaxHubTab,
      label: 'Group Tax Consolidation',
      badge: 'Sec IC 2',
      icon: Layers,
      description: 'Multi-entity loss offsetting, subvention payments & ICA credit tracking',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Consolidated Hub Navigation Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-xs shrink-0">
              <FileCheck2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Advanced IRD Tax & Intelligence Suite
                <span className="px-2 py-0.5 bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 rounded-full text-[10px] font-bold">
                  Unified Box
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All-in-one NZ IRD compliance, banking gateway, industry profiles, audit risk defense & group tax planning
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tab Buttons Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-full ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-600 dark:border-teal-500 shadow-md scale-[1.01]'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs leading-tight">{tab.label}</div>
                </div>
                <p
                  className={`text-[10px] mt-2 line-clamp-2 ${
                    isActive ? 'text-slate-300 dark:text-teal-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module View */}
      <div className="transition-all duration-200">
        {activeSubTab === 'MYIR_OPEN_BANKING' && (
          <MyIrOpenBankingGatewayView
            appState={appState}
            onUpdateGatewayState={onUpdateGatewayState}
          />
        )}

        {activeSubTab === 'INDUSTRY_PROFILES' && (
          <IndustryTaxProfilesView
            appState={appState}
            onUpdateIndustryProfile={onUpdateIndustryProfile}
          />
        )}

        {activeSubTab === 'AUDIT_DEFENSE' && (
          <IrdAuditRiskDefenseView
            appState={appState}
            onUpdateRiskScore={onUpdateRiskScore}
          />
        )}

        {activeSubTab === 'ENTITY_PLANNER' && (
          <EntityStructurePlannerView appState={appState} />
        )}

        {activeSubTab === 'GROUP_CONSOLIDATION' && (
          <GroupTaxConsolidationView
            appState={appState}
            onUpdateGroupState={onUpdateGroupState}
          />
        )}
      </div>
    </div>
  );
};
