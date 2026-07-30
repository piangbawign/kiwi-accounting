import React, { useState } from 'react';
import {
  Tag,
  CheckSquare,
  Percent,
  Calculator,
  HeartHandshake,
  Check,
  X,
  Trash2,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { GSTType } from '../types';

interface BulkTaxClassificationToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkApplyCategory: (category: string) => void;
  onBulkApplyIrdCode: (irdCode: string) => void;
  onBulkApplyGstType: (gstType: GSTType) => void;
  onBulkToggleChurchCharity?: (isChurch: boolean) => void;
  onBulkMarkReconciled: (isReconciled: boolean) => void;
  onBulkDelete: () => void;
  onOpenBulkEditModal?: () => void;
}

export const BulkTaxClassificationToolbar: React.FC<
  BulkTaxClassificationToolbarProps
> = ({
  selectedIds,
  onClearSelection,
  onBulkApplyCategory,
  onBulkApplyIrdCode,
  onBulkApplyGstType,
  onBulkToggleChurchCharity,
  onBulkMarkReconciled,
  onBulkDelete,
  onOpenBulkEditModal,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<
    'CATEGORY' | 'IRD_CODE' | 'GST_TYPE' | null
  >(null);

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 text-xs font-bold max-w-2xl w-full mx-4">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-800 shrink-0">
        <span className="w-6 h-6 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xs">
          {selectedIds.length}
        </span>
        <span className="hidden sm:inline text-slate-300">Items Selected</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5 flex-1">
        {onOpenBulkEditModal && (
          <button
            type="button"
            onClick={onOpenBulkEditModal}
            className="px-2.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl flex items-center gap-1 transition-all shrink-0 font-extrabold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Batch Edit</span>
          </button>
        )}

        {/* Bulk Category Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'CATEGORY' ? null : 'CATEGORY')
            }
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1 transition-all text-teal-300"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Category</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {activeDropdown === 'CATEGORY' && (
            <div className="absolute bottom-full mb-2 left-0 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              {[
                'Hospitality & Catering',
                'Telephone & Internet',
                'Motor Vehicle Expenses',
                'Software & Subscriptions',
                'Office Expenses',
                'Tithes & Offerings',
                'Professional Fees',
                'Repairs & Maintenance',
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onBulkApplyCategory(cat);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-[11px] text-slate-200 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk IRD Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'IRD_CODE' ? null : 'IRD_CODE')
            }
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1 transition-all text-indigo-300"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>IRD Code</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {activeDropdown === 'IRD_CODE' && (
            <div className="absolute bottom-full mb-2 left-0 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              {[
                '100 - Sales & Operating Revenue',
                '300 - Operating Expenses',
                '410 - Motor Vehicle Expenses',
                '200 - Cost of Goods Sold',
                '500 - Depreciation & Assets',
              ].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onBulkApplyIrdCode(code);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-[11px] text-slate-200 transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk GST Type Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === 'GST_TYPE' ? null : 'GST_TYPE')
            }
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1 transition-all text-amber-300"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>GST Rate</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {activeDropdown === 'GST_TYPE' && (
            <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onBulkApplyGstType('STANDARD_15');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-[11px] text-emerald-300 font-bold"
              >
                15% Standard GST
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkApplyGstType('ZERO_RATED');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-[11px] text-slate-300"
              >
                Zero-Rated (0%)
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkApplyGstType('EXEMPT');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-[11px] text-slate-300"
              >
                Exempt (Financial/Interest)
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkApplyGstType('NO_GST');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-[11px] text-slate-300"
              >
                No GST / Wages / Personal
              </button>
            </div>
          )}
        </div>

        {/* Mark Reconciled */}
        <button
          type="button"
          onClick={() => onBulkMarkReconciled(true)}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-300 rounded-xl flex items-center gap-1 transition-all shrink-0"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reconcile</span>
        </button>

        {/* Church/Charity Flag */}
        {onBulkToggleChurchCharity && (
          <button
            type="button"
            onClick={() => onBulkToggleChurchCharity(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-blue-900/50 hover:text-blue-300 rounded-xl flex items-center gap-1 transition-all shrink-0"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Tag Charity</span>
          </button>
        )}

        {/* Bulk Delete */}
        <button
          type="button"
          onClick={onBulkDelete}
          className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl flex items-center gap-1 transition-all shrink-0 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onClearSelection}
        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
        title="Clear Selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
