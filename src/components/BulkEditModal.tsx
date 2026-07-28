import React, { useState } from 'react';
import { X, Check, Edit3, Tag, Landmark, Percent, CheckCircle2, Trash2 } from 'lucide-react';
import { Account, GSTType, Transaction } from '../types';

interface BulkEditModalProps {
  selectedCount: number;
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onApplyBulkEdit: (updates: {
    category?: string;
    irdTaxCode?: string;
    gstType?: GSTType;
    accountId?: string;
    isReconciled?: boolean;
  }) => void;
  onBulkDelete: () => void;
}

const CATEGORY_PRESETS = [
  { name: 'Office Supplies & Stationery', code: '300 - Office Expenses' },
  { name: 'Motor Vehicle & Fuel', code: '310 - Vehicle Running Costs' },
  { name: 'Subscriptions & Software', code: '320 - Software & IT Services' },
  { name: 'Tools & Equipment', code: '330 - Depreciation/Tools' },
  { name: 'Travel & Meals', code: '340 - Travel & Accommodation' },
  { name: 'Utilities & Telco', code: '350 - Telephone & Power' },
  { name: 'Professional & Legal Fees', code: '360 - Accountancy & Legal' },
  { name: 'Advertising & Marketing', code: '370 - Marketing & Promo' },
  { name: 'Sales Revenue', code: '200 - Sales & Services Income' },
];

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  selectedCount,
  accounts,
  isOpen,
  onClose,
  onApplyBulkEdit,
  onBulkDelete,
}) => {
  const [fieldToEdit, setFieldToEdit] = useState<'CATEGORY' | 'GST' | 'ACCOUNT' | 'RECONCILE' | null>('CATEGORY');
  const [selectedCategoryPreset, setSelectedCategoryPreset] = useState(CATEGORY_PRESETS[0]);
  const [selectedGstType, setSelectedGstType] = useState<GSTType>('STANDARD_15');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedReconciledState, setSelectedReconciledState] = useState(true);

  if (!isOpen) return null;

  const handleApply = () => {
    if (fieldToEdit === 'CATEGORY') {
      onApplyBulkEdit({
        category: selectedCategoryPreset.name,
        irdTaxCode: selectedCategoryPreset.code,
      });
    } else if (fieldToEdit === 'GST') {
      onApplyBulkEdit({
        gstType: selectedGstType,
      });
    } else if (fieldToEdit === 'ACCOUNT') {
      onApplyBulkEdit({
        accountId: selectedAccountId,
      });
    } else if (fieldToEdit === 'RECONCILE') {
      onApplyBulkEdit({
        isReconciled: selectedReconciledState,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-sm tracking-tight">
              Bulk Batch Edit ({selectedCount} Selected Entries)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Action Choice Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFieldToEdit('CATEGORY')}
              className={`py-2 px-1 rounded-lg transition-all ${
                fieldToEdit === 'CATEGORY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => setFieldToEdit('GST')}
              className={`py-2 px-1 rounded-lg transition-all ${
                fieldToEdit === 'GST' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              GST Type
            </button>
            <button
              type="button"
              onClick={() => setFieldToEdit('ACCOUNT')}
              className={`py-2 px-1 rounded-lg transition-all ${
                fieldToEdit === 'ACCOUNT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bank Acc
            </button>
            <button
              type="button"
              onClick={() => setFieldToEdit('RECONCILE')}
              className={`py-2 px-1 rounded-lg transition-all ${
                fieldToEdit === 'RECONCILE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Reconcile
            </button>
          </div>

          {/* Tab 1: Category Selection */}
          {fieldToEdit === 'CATEGORY' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Set Category & IRD Tax Code for all selected:</label>
              <select
                value={selectedCategoryPreset.name}
                onChange={(e) => {
                  const match = CATEGORY_PRESETS.find((c) => c.name === e.target.value);
                  if (match) setSelectedCategoryPreset(match);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-teal-600"
              >
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab 2: GST Type Selection */}
          {fieldToEdit === 'GST' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Apply GST Rate Treatment:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'STANDARD_15', label: '15% Standard GST' },
                  { id: 'ZERO_RATED', label: '0% Zero-Rated' },
                  { id: 'EXEMPT', label: 'Exempt' },
                  { id: 'NO_GST', label: 'No GST (N-A)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGstType(g.id as GSTType)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      selectedGstType === g.id
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Account Selection */}
          {fieldToEdit === 'ACCOUNT' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Reassign Bank Account:</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-teal-600"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.bankName} - {a.name} (${a.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab 4: Reconciled Status Selection */}
          {fieldToEdit === 'RECONCILE' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Set Reconciliation Status:</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedReconciledState(true)}
                  className={`p-3 rounded-xl border font-bold transition-all ${
                    selectedReconciledState
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  ✓ Mark as Reconciled
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReconciledState(false)}
                  className={`p-3 rounded-xl border font-bold transition-all ${
                    !selectedReconciledState
                      ? 'bg-amber-50 border-amber-600 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  ! Mark as Unmatched
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete all ${selectedCount} selected transactions?`)) {
                onBulkDelete();
                onClose();
              }
            }}
            className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete Selected ({selectedCount})
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Apply Changes to {selectedCount} Entries
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
