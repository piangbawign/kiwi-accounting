import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  RefreshCw,
  Landmark,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  AlertCircle,
  Key,
  Globe,
  Database,
  Lock,
} from 'lucide-react';
import { AppState, MyIrGatewayConnection, BankFeedConnection } from '../types';

interface MyIrOpenBankingGatewayViewProps {
  appState: AppState;
  onUpdateGatewayState?: (gateway: MyIrGatewayConnection) => void;
}

export const MyIrOpenBankingGatewayView: React.FC<MyIrOpenBankingGatewayViewProps> = ({
  appState,
  onUpdateGatewayState,
}) => {
  const [gatewayState, setGatewayState] = useState<MyIrGatewayConnection>(
    appState.myIrGatewayState || {
      isMyIrConnected: true,
      myIrAccountId: 'myIR-NZ-8839201',
      lastEfileSync: '2026-07-26 02:45 NZST',
      autoFilingEnabled: true,
      bankFeedSyncs: [
        {
          bankName: 'ANZ Bank New Zealand',
          accountName: 'ANZ Business Current Account',
          accountNumber: '06-0101-0849920-00',
          connectionMethod: 'AKAHU_OPEN_BANKING',
          status: 'ACTIVE',
          lastSyncTime: '10 mins ago',
          unreconciledTxCount: 0,
        },
        {
          bankName: 'ASB Bank',
          accountName: 'ASB Tax Reserve Savings',
          accountNumber: '12-3109-0091823-50',
          connectionMethod: 'AKAHU_OPEN_BANKING',
          status: 'ACTIVE',
          lastSyncTime: '25 mins ago',
          unreconciledTxCount: 2,
        },
        {
          bankName: 'Bank of New Zealand (BNZ)',
          accountName: 'BNZ USD Trade Account',
          accountNumber: '02-0800-0199201-00',
          connectionMethod: 'DIRECT_FEED_API',
          status: 'ACTIVE',
          lastSyncTime: '1 hour ago',
          unreconciledTxCount: 1,
        },
      ],
    }
  );

  const [isSyncingBanks, setIsSyncingBanks] = useState(false);
  const [showConnectBankModal, setShowConnectBankModal] = useState(false);

  const handleTriggerSyncAll = () => {
    setIsSyncingBanks(true);
    setTimeout(() => {
      const updatedBanks = gatewayState.bankFeedSyncs.map((b) => ({
        ...b,
        lastSyncTime: 'Just now',
        unreconciledTxCount: 0,
      }));
      const newState: MyIrGatewayConnection = {
        ...gatewayState,
        lastEfileSync: new Date().toLocaleTimeString() + ' NZST',
        bankFeedSyncs: updatedBanks,
      };
      setGatewayState(newState);
      if (onUpdateGatewayState) onUpdateGatewayState(newState);
      setIsSyncingBanks(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Direct myIR OAuth & Akahu Open Banking Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Direct myIR & Open Banking Feed Hub</h1>
            <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
              Connect your Inland Revenue (myIR) account for automated e-Filing of GST, Payday Filing, and Income Tax. Sync live transactions via Akahu Open Banking for ANZ, ASB, BNZ, Westpac & Kiwibank.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              disabled={isSyncingBanks}
              onClick={handleTriggerSyncAll}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingBanks ? 'animate-spin' : ''}`} />
              {isSyncingBanks ? 'Syncing Feeds...' : 'Sync Bank & myIR Feeds'}
            </button>
          </div>
        </div>

        {/* Quick Connection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-sky-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-sky-300 uppercase tracking-wider font-bold block">Inland Revenue myIR Gateway</span>
              <div className="text-sm font-black text-white mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>myIR OAuth Connected</span>
              </div>
              <span className="text-[10px] text-sky-200/70 block mt-0.5">Last e-File Sync: {gatewayState.lastEfileSync}</span>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-sky-300 uppercase tracking-wider font-bold block">Akahu NZ Open Banking</span>
              <div className="text-sm font-black text-white mt-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>3 Banks Active</span>
              </div>
              <span className="text-[10px] text-sky-200/70 block mt-0.5">ANZ, ASB, BNZ Direct API</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold block">Auto-eFiling Status</span>
              <div className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Auto-Submit Enabled</span>
              </div>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">GST & Payday Auto-Filed on Due Date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Bank Feeds Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Connected NZ Bank Feeds (Akahu Open Banking)</h3>
            <p className="text-slate-500 text-[11px]">Real-time bank feed authorization with bank-grade AES-256 encryption</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Financial Institution</th>
                <th className="py-3 px-4">Account Name & Number</th>
                <th className="py-3 px-4">Connection Method</th>
                <th className="py-3 px-4">Last Sync</th>
                <th className="py-3 px-4 text-center">Unreconciled Txns</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {gatewayState.bankFeedSyncs.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{b.bankName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{b.accountName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{b.accountNumber}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold">
                      {b.connectionMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{b.lastSyncTime}</td>
                  <td className="py-3 px-4 text-center font-mono">
                    {b.unreconciledTxCount === 0 ? (
                      <span className="text-emerald-700 font-bold">0 (Reconciled)</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">
                        {b.unreconciledTxCount} pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
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
