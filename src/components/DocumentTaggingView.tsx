import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  Check,
  X,
  Filter,
  PieChart,
  Layers,
  FileText,
  DollarSign,
  Pencil,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, Invoice, DocumentTag, CompanySettings } from '../types';

interface DocumentTaggingViewProps {
  transactions: Transaction[];
  invoices: Invoice[];
  companySettings: CompanySettings;
  onUpdateTransactionTags?: (txId: string, tags: string[]) => void;
}

const DEFAULT_TAGS: DocumentTag[] = [
  {
    id: 'tag-1',
    name: '#TaxDeductible',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'TAX',
    description: '100% tax deductible expense item under NZ IRD guidelines.',
  },
  {
    id: 'tag-2',
    name: '#HomeOffice',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    category: 'EXPENSE_TYPE',
    description: 'Apportioned home office expense (power, internet, rates, rent).',
  },
  {
    id: 'tag-3',
    name: '#Vehicle100%',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    category: 'EXPENSE_TYPE',
    description: 'Motor vehicle expense backed by logbook or km rate calculation.',
  },
  {
    id: 'tag-4',
    name: '#Entertainment50%',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'TAX',
    description: '50% non-deductible entertainment expense under NZ IRD rules.',
  },
  {
    id: 'tag-5',
    name: '#AssetOver$1000',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'ASSET',
    description: 'Capital expenditure asset requiring depreciation schedule.',
  },
  {
    id: 'tag-6',
    name: '#ReviewedByAccountant',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'AUDIT',
    description: 'Audited and verified by Chartered Accountant (CA).',
  },
  {
    id: 'tag-7',
    name: '#IRD_Audit_Flag',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    category: 'AUDIT',
    description: 'Flagged for special IRD GST / Income Tax review.',
  },
];

export const DocumentTaggingView: React.FC<DocumentTaggingViewProps> = ({
  transactions,
  invoices,
  companySettings,
  onUpdateTransactionTags,
}) => {
  const [tags, setTags] = useState<DocumentTag[]>(() => {
    try {
      const saved = localStorage.getItem('kiwi_document_tags_v1');
      return saved ? JSON.parse(saved) : DEFAULT_TAGS;
    } catch {
      return DEFAULT_TAGS;
    }
  });

  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tag Creation Modal States
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagCategory, setTagCategory] = useState<DocumentTag['category']>('TAX');
  const [tagDescription, setTagDescription] = useState('');
  const [tagColor, setTagColor] = useState('bg-teal-100 text-teal-800 border-teal-300');

  // Tag Assignment Modal
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTxTags, setSelectedTxTags] = useState<string[]>([]);

  const saveTagsToStorage = (updated: DocumentTag[]) => {
    setTags(updated);
    localStorage.setItem('kiwi_document_tags_v1', JSON.stringify(updated));
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const formattedName = tagName.startsWith('#') ? tagName.trim() : `#${tagName.trim()}`;
    const newTag: DocumentTag = {
      id: `tag-${Date.now()}`,
      name: formattedName,
      category: tagCategory,
      description: tagDescription,
      color: tagColor,
    };

    const updated = [...tags, newTag];
    saveTagsToStorage(updated);
    setTagName('');
    setTagDescription('');
    setShowTagModal(false);
  };

  const handleDeleteTag = (id: string) => {
    const updated = tags.filter((t) => t.id !== id);
    saveTagsToStorage(updated);
  };

  const openTxTagModal = (tx: Transaction) => {
    setEditingTx(tx);
    setSelectedTxTags(tx.tags || []);
  };

  const toggleTxTag = (tagNameStr: string) => {
    setSelectedTxTags((prev) =>
      prev.includes(tagNameStr) ? prev.filter((t) => t !== tagNameStr) : [...prev, tagNameStr]
    );
  };

  const handleSaveTxTags = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !onUpdateTransactionTags) return;
    onUpdateTransactionTags(editingTx.id, selectedTxTags);
    setEditingTx(null);
  };

  // Filter Transactions by tag or search
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTagFilter === 'ALL' || (tx.tags && tx.tags.includes(selectedTagFilter));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30">
              Tax & Ledger Document Tagging
            </span>
            <span className="text-xs text-slate-400">• Intelligent Tax Categorization</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-400" /> Document Tagging & Smart Tax Labels
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Label bookkeeping entries, receipts, and invoices with custom tags like #TaxDeductible, #HomeOffice, and #AssetOver$1000 for effortless accountant review.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowTagModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Custom Tag
          </button>
        </div>
      </div>

      {/* Available Tags Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" /> Tag Library ({tags.length} Active Tags)
          </h3>
          <span className="text-[10px] text-slate-400">Click a tag to filter ledger transactions below</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTagFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedTagFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            All Transactions
          </button>

          {tags.map((tag) => (
            <div key={tag.id} className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedTagFilter(tag.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  tag.color
                } ${selectedTagFilter === tag.name ? 'ring-2 ring-purple-600 font-black' : ''}`}
              >
                {tag.name}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTag(tag.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Delete tag"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filtered Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-800 text-xs">
            Tagged General Ledger Transactions ({filteredTransactions.length} Items)
          </h3>
          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description or category..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category / IRD Code</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Applied Tags</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the selected tag filter or search term.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{tx.description}</span>
                      {tx.reference && <span className="text-[10px] text-slate-400">Ref: {tx.reference}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{tx.category}</div>
                      <div className="text-[10px] text-teal-700 font-mono">{tx.irdTaxCode}</div>
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold font-mono whitespace-nowrap ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.tags && tx.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tx.tags.map((tName) => {
                            const found = tags.find((t) => t.name === tName);
                            return (
                              <span
                                key={tName}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {tName}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No tags attached</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => openTxTagModal(tx)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] rounded-lg transition-colors border border-purple-200 inline-flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" /> Edit Tags
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" /> Create Custom Document Tag
              </h3>
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTag} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tag Name (e.g. #ProjectAlpha)</label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="e.g. #AssetOver$1000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tag Category</label>
                <select
                  value={tagCategory}
                  onChange={(e) => setTagCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="TAX">Tax Deduction</option>
                  <option value="EXPENSE_TYPE">Expense Category</option>
                  <option value="AUDIT">Audit Flag</option>
                  <option value="ASSET">Fixed Asset</option>
                  <option value="PROJECT">Project / Client</option>
                  <option value="CUSTOM">Custom Tag</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Emerald Green', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    { label: 'Indigo Blue', class: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                    { label: 'Purple Violet', class: 'bg-purple-100 text-purple-800 border-purple-300' },
                    { label: 'Amber Orange', class: 'bg-amber-100 text-amber-800 border-amber-300' },
                    { label: 'Rose Red', class: 'bg-rose-100 text-rose-800 border-rose-300' },
                    { label: 'Slate Gray', class: 'bg-slate-100 text-slate-800 border-slate-300' },
                  ].map((c) => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setTagColor(c.class)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        c.class
                      } ${tagColor === c.class ? 'ring-2 ring-purple-600' : ''}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Note</label>
                <input
                  type="text"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  placeholder="e.g. 100% deductible business expense"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Tags Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" /> Apply Tags to Transaction
              </h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTxTags} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-xs">{editingTx.description}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">${editingTx.amount.toFixed(2)} NZD • {editingTx.date}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Tags to Toggle</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {tags.map((tag) => {
                    const isSelected = selectedTxTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTxTag(tag.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          tag.color
                        } ${isSelected ? 'ring-2 ring-purple-600 shadow-xs' : 'opacity-60'}`}
                      >
                        {tag.name}
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Tags
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
