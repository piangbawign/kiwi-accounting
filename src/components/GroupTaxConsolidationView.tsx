import React, { useState } from 'react';
import {
  Layers,
  Building,
  ArrowRightLeft,
  DollarSign,
  CheckCircle2,
  Percent,
  Calculator,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { AppState, GroupTaxConsolidation, GroupEntity } from '../types';

interface GroupTaxConsolidationViewProps {
  appState: AppState;
  onUpdateGroupState?: (group: GroupTaxConsolidation) => void;
}

export const GroupTaxConsolidationView: React.FC<GroupTaxConsolidationViewProps> = ({
  appState,
  onUpdateGroupState,
}) => {
  const [groupData, setGroupData] = useState<GroupTaxConsolidation>(
    appState.groupConsolidationState || {
      parentEntityName: 'Aotearoa Holdings Group Ltd',
      imputationCreditAccountBalance: 38400, // ICA balance in NZD
      groupLossOffsetAvailable: 42000,
      subsidiaryEntities: [
        {
          id: 'SUB-ENT-01',
          entityName: 'Kauri Tech NZ Ltd (Trading Co)',
          irdNumber: '128-409-112',
          ownershipPct: 100,
          netProfitLoss: 120000, // $120k profit
          taxPaid: 33600,
          lossOffsetClaimed: 42000, // Offset $42k loss from Sub 2
        },
        {
          id: 'SUB-ENT-02',
          entityName: 'Kauri Property Holdings Ltd (Asset Co)',
          irdNumber: '128-409-113',
          ownershipPct: 100,
          netProfitLoss: -42000, // $42k tax loss
          taxPaid: 0,
          lossOffsetClaimed: 0,
        },
      ],
    }
  );

  const parentProfit = groupData.subsidiaryEntities.reduce((sum, e) => sum + e.netProfitLoss, 0);
  const totalTaxSavedLossOffset = 42000 * 0.28; // 28% company tax saved on $42k loss offset

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-900/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-bold">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>NZ Group Tax Loss Offsetting & Imputation Credit Account (ICA)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Multi-Entity Group Tax & ICA Loss Offset Hub</h1>
          <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
            Consolidate multi-company groups under Section IC 2 of the NZ Income Tax Act 2007. Offset losses between 66%+ common ownership entities, track Imputation Credit Accounts (ICA), and manage subvention payments.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-sky-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-sky-200">Consolidated Group Net Profit</span>
            <div className="text-2xl font-black font-mono mt-1">${parentProfit.toLocaleString()} NZD</div>
            <span className="text-[10px] text-sky-300">2 Group Subsidiaries (100% Owned)</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-sky-200">Group Loss Offset Claimed</span>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-400">${groupData.groupLossOffsetAvailable.toLocaleString()} NZD</div>
            <span className="text-[10px] text-emerald-300">Saved ${totalTaxSavedLossOffset.toLocaleString()} in 28% Company Tax</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-sky-200">Imputation Credit Account (ICA)</span>
            <div className="text-2xl font-black font-mono mt-1 text-sky-300">${groupData.imputationCreditAccountBalance.toLocaleString()} NZD</div>
            <span className="text-[10px] text-sky-300">Credits Available for Imputed Dividends</span>
          </div>
        </div>
      </div>

      {/* Subsidiaries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-base font-extrabold text-slate-900">Group Entities & Tax Loss Subvention Register</h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Entity Name & IRD Number</th>
                <th className="py-3 px-4 text-center">Common Ownership %</th>
                <th className="py-3 px-4 text-right">Net Profit / (Loss)</th>
                <th className="py-3 px-4 text-right">Tax Loss Offset Action</th>
                <th className="py-3 px-4 text-center">Group Loss Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {groupData.subsidiaryEntities.map((ent) => (
                <tr key={ent.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 block">{ent.entityName}</span>
                    <span className="font-mono text-[10px] text-slate-500">IRD: {ent.irdNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{ent.ownershipPct}%</td>
                  <td className="py-3 px-4 text-right font-mono font-black">
                    {ent.netProfitLoss >= 0 ? (
                      <span className="text-emerald-800">${ent.netProfitLoss.toLocaleString()}</span>
                    ) : (
                      <span className="text-rose-700">(${Math.abs(ent.netProfitLoss).toLocaleString()})</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {ent.netProfitLoss >= 0 ? (
                      <span className="text-sky-700">Absorbed ${ent.lossOffsetClaimed.toLocaleString()} Loss</span>
                    ) : (
                      <span className="text-emerald-700">Surrendered ${Math.abs(ent.netProfitLoss).toLocaleString()} Loss</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Section IC 2 Eligible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
