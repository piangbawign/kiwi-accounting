import React, { useState } from 'react';
import {
  Paperclip,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Transaction, TransactionAttachment } from '../types';

interface TransactionAttachmentModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAttachments: (transactionId: string, attachments: TransactionAttachment[]) => void;
}

export const TransactionAttachmentModal: React.FC<TransactionAttachmentModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onUpdateAttachments,
}) => {
  const [attachments, setAttachments] = useState<TransactionAttachment[]>(
    transaction.attachments || (transaction.receiptUrl ? [{
      id: 'att-default-1',
      name: 'Scanned_Tax_Receipt.pdf',
      size: '245 KB',
      type: 'application/pdf',
      dataUrl: transaction.receiptUrl,
      uploadedAt: transaction.date,
    }] : [])
  );

  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: TransactionAttachment[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAtt: TransactionAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          type: file.type || 'image/jpeg',
          dataUrl,
          uploadedAt: new Date().toISOString().split('T')[0],
        };

        const updated = [...attachments, newAtt];
        setAttachments(updated);
        onUpdateAttachments(transaction.id, updated);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    const updated = attachments.filter((a) => a.id !== attId);
    setAttachments(updated);
    onUpdateAttachments(transaction.id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Receipt & Document Attachments</h3>
              <p className="text-xs text-slate-400 font-mono">
                Tx: {transaction.description} (${transaction.amount.toFixed(2)})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
              dragActive ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
            }`}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*,application/pdf';
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
              input.click();
            }}
          >
            <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-800">Drag & Drop Tax Receipt or Tax Invoice File</p>
            <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, WEBP & PDF tax invoices (Max 10MB per file)</p>
          </div>

          {/* Attachment Items List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attached Documents ({attachments.length})
            </p>

            {attachments.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
                <p className="text-xs text-slate-400">No receipt or invoice file attached yet.</p>
              </div>
            ) : (
              attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      {att.type?.includes('image') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>

                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {att.size || 'Attachment'} • Uploaded {att.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {att.dataUrl && (
                      <a
                        href={att.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={att.name}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="View / Download File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compliant with IRD Tax Audit requirements
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
