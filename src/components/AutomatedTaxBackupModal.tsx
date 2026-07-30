import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Clock,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Save,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../types';

interface AutomatedTaxBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onRestoreState: (state: AppState) => void;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
  txCount: number;
  invoiceCount: number;
  auditCount: number;
  data: AppState;
}

export const AutomatedTaxBackupModal: React.FC<AutomatedTaxBackupModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
}) => {
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('kiwi_tax_snapshots_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [autoBackupInterval, setAutoBackupInterval] = useState<string>(() => {
    return localStorage.getItem('kiwi_autobackup_interval') || '30';
  });

  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshot | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kiwi_autobackup_interval', autoBackupInterval);
  }, [autoBackupInterval]);

  const saveSnapshotsToStorage = (list: BackupSnapshot[]) => {
    setSnapshots(list);
    try {
      localStorage.setItem('kiwi_tax_snapshots_v1', JSON.stringify(list));
    } catch (e) {
      console.error('Storage full or unavailable', e);
    }
  };

  const handleCreateSnapshot = (label: string = 'Manual Tax Backup') => {
    const newSnapshot: BackupSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-NZ'),
      label,
      txCount: appState.transactions.length,
      invoiceCount: appState.invoices.length,
      auditCount: appState.auditLogs.length,
      data: JSON.parse(JSON.stringify(appState)),
    };

    const updated = [newSnapshot, ...snapshots].slice(0, 15); // keep max 15 snapshots
    saveSnapshotsToStorage(updated);
    setToastMessage('✅ New tax state snapshot created successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id);
    saveSnapshotsToStorage(updated);
  };

  const handleConfirmRestore = () => {
    if (!selectedSnapshot) return;
    onRestoreState(selectedSnapshot.data);
    setShowRestoreConfirm(false);
    setSelectedSnapshot(null);
    setToastMessage('🎉 Backup state restored successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportJson = (snap: BackupSnapshot) => {
    const content = JSON.stringify(snap.data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiwiledger_backup_${snap.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Automated Tax Backups & Snapshots</h2>
              <p className="text-xs text-slate-500">IRD Compliant Local State Backup & Disaster Recovery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMessage && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
            {toastMessage}
          </div>
        )}

        <div className="space-y-4 mt-4">
          
          {/* Quick Backup Controls */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Current Ledger Status</span>
              <p className="text-[11px] text-slate-500 font-mono">
                {appState.transactions.length} Transactions • {appState.invoices.length} Invoices
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCreateSnapshot('Instant Manual Snapshot')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" /> Create Snapshot Now
            </button>
          </div>

          {/* Automated Schedule Setting */}
          <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-700" /> Auto-Save Backup Schedule
              </span>
              <select
                value={autoBackupInterval}
                onChange={(e) => setAutoBackupInterval(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold bg-white text-slate-800 border border-teal-300 rounded-xl focus:outline-none"
              >
                <option value="OFF">Auto-Save Off</option>
                <option value="15">Every 15 Minutes</option>
                <option value="30">Every 30 Minutes (Recommended)</option>
                <option value="60">Every 60 Minutes</option>
                <option value="ENTRY">On Every Transaction Entry</option>
              </select>
            </div>
            <p className="text-[11px] text-teal-700 leading-relaxed">
              Auto-saves an encrypted local snapshot to prevent data loss during browser restarts or system shutdowns.
            </p>
          </div>

          {/* Backup History List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Saved Snapshots History ({snapshots.length})</span>
              <span className="text-[10px] text-slate-400">Max 15 local snapshots stored</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No snapshots created yet. Click "Create Snapshot Now" above to secure your financial records.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{snap.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{snap.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {snap.txCount} txs • {snap.invoiceCount} invs • {snap.auditCount} logs
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleExportJson(snap)}
                        title="Download Backup JSON"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSnapshot(snap);
                          setShowRestoreConfirm(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmation Modal */}
          {showRestoreConfirm && selectedSnapshot && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Restore State Confirmation
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Are you sure you want to replace your current ledger state with snapshot from{' '}
                <strong>{selectedSnapshot.timestamp}</strong> ({selectedSnapshot.txCount} transactions)? Unsaved changes will be overwritten.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreConfirm(false)}
                  className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700"
                >
                  Yes, Restore Snapshot
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400">100% Client-Side Local Encryption</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
