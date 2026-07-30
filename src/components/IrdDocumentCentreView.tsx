import React, { useState } from 'react';
import {
  FolderKanban,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Building,
  Plus,
  FileCode,
  X,
} from 'lucide-react';
import { AppState } from '../types';

interface IrdDocumentCentreViewProps {
  appState: AppState;
}

interface DocumentItem {
  id: string;
  name: string;
  category: 'GST' | 'INCOME_TAX' | 'PAYROLL' | 'CORRESPONDENCE' | 'RECEIPTS';
  taxYear: string;
  uploadDate: string;
  fileSize: string;
  status: 'VERIFIED' | 'PENDING' | 'ARCHIVED';
  notes?: string;
  fileType: 'PDF' | 'CSV' | 'PNG';
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'IRD_GST101B_Return_Period_Ending_May2026.pdf',
    category: 'GST',
    taxYear: '2025/26',
    uploadDate: '2026-06-15',
    fileSize: '420 KB',
    status: 'VERIFIED',
    notes: 'Filed electronically via myIR. Confirmation #GST-882190-NZ',
    fileType: 'PDF',
  },
  {
    id: 'doc-2',
    name: 'IR4_Company_Tax_Return_Worksheet_SmallBusinessCo.pdf',
    category: 'INCOME_TAX',
    taxYear: '2024/25',
    uploadDate: '2025-07-02',
    fileSize: '1.2 MB',
    status: 'VERIFIED',
    notes: 'Approved by Registered Tax Agent. Imputation credit balance carried forward.',
    fileType: 'PDF',
  },
  {
    id: 'doc-3',
    name: 'PAYE_Employer_Monthly_Filing_Summary_June2026.csv',
    category: 'PAYROLL',
    taxYear: '2025/26',
    uploadDate: '2026-07-01',
    fileSize: '85 KB',
    status: 'VERIFIED',
    notes: 'Includes 3.5% KiwiSaver employee deduction and 3% employer contribution.',
    fileType: 'CSV',
  },
  {
    id: 'doc-4',
    name: 'IRD_Notice_Provisional_Tax_Assessment_Installment1.pdf',
    category: 'CORRESPONDENCE',
    taxYear: '2025/26',
    uploadDate: '2026-05-10',
    fileSize: '310 KB',
    status: 'PENDING',
    notes: 'Standard method provisional tax due 28 August 2026.',
    fileType: 'PDF',
  },
  {
    id: 'doc-5',
    name: 'NZBN_Registration_Certificate_SmallBusinessCoLtd.pdf',
    category: 'CORRESPONDENCE',
    taxYear: 'Permanent',
    uploadDate: '2024-01-15',
    fileSize: '540 KB',
    status: 'VERIFIED',
    notes: 'NZBN 9429041234567 Company Incorporation Certificate',
    fileType: 'PDF',
  },
];

export const IrdDocumentCentreView: React.FC<IrdDocumentCentreViewProps> = ({ appState }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Upload Form state
  const [newDocName, setNewDocName] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentItem['category']>('GST');
  const [newTaxYear, setNewTaxYear] = useState('2025/26');
  const [newNotes, setNewNotes] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith('.pdf') || newDocName.endsWith('.csv') ? newDocName : `${newDocName}.pdf`,
      category: newCategory,
      taxYear: newTaxYear,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '240 KB',
      status: 'VERIFIED',
      notes: newNotes || 'Uploaded via Company Document Vault',
      fileType: newDocName.endsWith('.csv') ? 'CSV' : 'PDF',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowUploadModal(false);
    setNewDocName('');
    setNewNotes('');
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDownloadSimulated = (doc: DocumentItem) => {
    const blob = new Blob([`Simulated document content for ${doc.name}\nCompany: ${appState.companySettings.legalName}\nTax Year: ${doc.taxYear}\nNotes: ${doc.notes}`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-600/30 border border-teal-400/30 rounded-2xl flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">IRD Document Centre</h1>
            <p className="text-xs text-slate-300 mt-1">
              Central compliance vault for IRD notices, GST returns, IR4 worksheets & official receipts for {appState.companySettings.legalName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents or IRD notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-semibold shrink-0">Category:</span>
          {['ALL', 'GST', 'INCOME_TAX', 'PAYROLL', 'CORRESPONDENCE'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Docs' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Document Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Tax Year</th>
                <th className="py-3.5 px-4">Upload Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block truncate max-w-xs">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{doc.fileSize} • {doc.notes}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-[10px] font-bold">
                      {doc.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{doc.taxYear}</td>
                  <td className="py-3.5 px-4 text-slate-500">{doc.uploadDate}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        doc.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {doc.status === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {doc.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                        title="View Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSimulated(doc)}
                        className="p-1.5 hover:bg-slate-200 text-teal-700 rounded-lg transition-all"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching compliance documents found in the vault.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Upload Compliance Document</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title / File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST_Return_May2026.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentItem['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                  >
                    <option value="GST">GST Return</option>
                    <option value="INCOME_TAX">Income Tax / IR4</option>
                    <option value="PAYROLL">Payroll / PAYE</option>
                    <option value="CORRESPONDENCE">IRD Notice</option>
                    <option value="RECEIPTS">Tax Receipts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax Year</label>
                  <input
                    type="text"
                    value={newTaxYear}
                    onChange={(e) => setNewTaxYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / myIR Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Filed electronically on 2026-06-15"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">{selectedDocForPreview.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedDocForPreview(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company:</span>
                <span className="font-bold text-slate-900">{appState.companySettings.legalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IRD Number:</span>
                <span className="font-mono font-bold text-slate-800">{appState.companySettings.irdNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-teal-700">{selectedDocForPreview.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Period:</span>
                <span className="font-mono">{selectedDocForPreview.taxYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">{selectedDocForPreview.status}</span>
              </div>
              <p className="pt-2 text-slate-600 border-t border-slate-200 font-normal">
                {selectedDocForPreview.notes}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSimulated(selectedDocForPreview)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
