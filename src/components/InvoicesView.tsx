import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Printer,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Building,
  Mail,
  MapPin,
  DollarSign,
  Send,
  FileText,
  Repeat,
  Play,
  Pause,
  Calendar,
  Zap,
} from 'lucide-react';
import { Invoice, InvoiceItem, CompanySettings, RecurringInvoiceSchedule } from '../types';
import { generateTaxInvoicePDF } from '../services/pdfGenerator';
import { InvoiceQrCode } from './InvoiceQrCode';

interface InvoicesViewProps {
  invoices: Invoice[];
  companySettings: CompanySettings;
  recurringInvoices?: RecurringInvoiceSchedule[];
  onCreateInvoice: (inv: Omit<Invoice, 'id'>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onDeleteInvoice?: (id: string) => void;
  onCreateRecurringInvoice?: (rec: Omit<RecurringInvoiceSchedule, 'id'>) => void;
  onDeleteRecurringInvoice?: (id: string) => void;
  onTogglePauseRecurringInvoice?: (id: string) => void;
  onGenerateRecurringInvoiceNow?: (rec: RecurringInvoiceSchedule) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  companySettings,
  recurringInvoices = [],
  onCreateInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  onCreateRecurringInvoice,
  onDeleteRecurringInvoice,
  onTogglePauseRecurringInvoice,
  onGenerateRecurringInvoiceNow,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECURRING'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRecurringModal, setShowCreateRecurringModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // New Standard Invoice Form State
  const [clientName, setClientName] = useState('');
  const [clientGst, setClientGst] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: 'Consulting & Software Engineering Services', quantity: 1, unitPrice: 1500, gstRate: 0.15, amount: 1500 },
  ]);
  const [notes, setNotes] = useState('Payment due strictly within 14 days to ANZ 01-0123-0456789-00');

  // Recurring Form State
  const [recClientName, setRecClientName] = useState('');
  const [recClientEmail, setRecClientEmail] = useState('');
  const [recClientGst, setRecClientGst] = useState('');
  const [recClientAddress, setRecClientAddress] = useState('');
  const [recFrequency, setRecFrequency] = useState<RecurringInvoiceSchedule['frequency']>('MONTHLY');
  const [recNextDue, setRecNextDue] = useState('2026-08-01');
  const [recAmount, setRecAmount] = useState('1500');
  const [recDescription, setRecDescription] = useState('Monthly Service Retainer');
  const [recNotes, setRecNotes] = useState('Recurring invoice generated automatically by KiwiLedger.');

  // Item helpers
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, gstRate: 0.15, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (parseFloat(item.quantity as any) || 0) * (parseFloat(item.unitPrice as any) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const subtotal = items.reduce((acc, i) => acc + i.amount, 0);
  const gstTotal = subtotal * 0.15;
  const grandTotal = subtotal + gstTotal;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || items.length === 0) return;

    const invoiceNum = `INV-2026-${(invoices.length + 1).toString().padStart(3, '0')}`;

    onCreateInvoice({
      invoiceNumber: invoiceNum,
      issueDate,
      dueDate,
      clientName: clientName.trim(),
      clientGstNumber: clientGst.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      gstBasis: 'EXCLUSIVE',
      subtotal,
      gstTotal,
      total: grandTotal,
      status: 'SENT',
      notes,
      items: items.map((it, idx) => ({ ...it, id: `item-${idx}` })),
    });

    setShowCreateModal(false);
    setClientName('');
    setClientGst('');
    setClientAddress('');
    setClientEmail('');
  };

  const handleSaveRecurringSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recClientName.trim() || parseFloat(recAmount) <= 0) return;

    const sub = parseFloat(recAmount) || 0;
    const gst = sub * 0.15;
    const tot = sub + gst;

    if (onCreateRecurringInvoice) {
      onCreateRecurringInvoice({
        clientName: recClientName.trim(),
        clientEmail: recClientEmail.trim() || undefined,
        clientGstNumber: recClientGst.trim() || undefined,
        clientAddress: recClientAddress.trim() || undefined,
        frequency: recFrequency,
        nextDueDate: recNextDue,
        gstBasis: 'EXCLUSIVE',
        subtotal: sub,
        gstTotal: gst,
        total: tot,
        status: 'ACTIVE',
        notes: recNotes,
        items: [
          {
            id: `rec-item-${Date.now()}`,
            description: recDescription || 'Recurring Service',
            quantity: 1,
            unitPrice: sub,
            gstRate: 0.15,
            amount: sub,
          },
        ],
      });
    }

    setShowCreateRecurringModal(false);
    setRecClientName('');
    setRecClientEmail('');
    setRecClientGst('');
    setRecClientAddress('');
    setRecAmount('1500');
    setRecDescription('Monthly Service Retainer');
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">NZ GST Tax Invoices</h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
              IRD Compliant (15% GST)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue standard GST Tax Invoices and manage automated recurring billing schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateRecurringModal(true)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Repeat className="w-4 h-4 text-amber-400" /> + New Recurring Schedule
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Tax Invoice
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Standard Invoices ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('RECURRING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'RECURRING'
              ? 'bg-slate-900 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Repeat className="w-4 h-4 text-amber-500" />
          Recurring Schedules ({recurringInvoices.length})
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'ALL' ? (
        /* Invoices List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    {inv.invoiceNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {inv.status}
                    </span>

                    {onDeleteInvoice && (
                      <button
                        type="button"
                        onClick={() => onDeleteInvoice(inv.id)}
                        title="Delete invoice"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{inv.clientName}</h3>
                {inv.clientGstNumber && (
                  <p className="text-[10px] font-mono text-slate-400">GST #: {inv.clientGstNumber}</p>
                )}

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Issue Date:</span>
                    <span className="font-mono text-slate-700">{inv.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-mono text-slate-700">{inv.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">Total Incl. GST</span>
                  <span className="text-lg font-black text-slate-900">
                    ${inv.total.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => generateTaxInvoicePDF(inv, companySettings)}
                    className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs rounded-xl border border-teal-200 transition-all flex items-center justify-center gap-1"
                    title="Download Official IRD Tax Invoice PDF"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-700" /> Download PDF
                  </button>

                  <select
                    value={inv.status}
                    onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as Invoice['status'])}
                    className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SENT">SENT</option>
                    <option value="PAID">PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Recurring Invoice Schedules View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringInvoices.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-amber-600" />
                    {rec.frequency}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {rec.status}
                    </span>

                    {onTogglePauseRecurringInvoice && (
                      <button
                        onClick={() => onTogglePauseRecurringInvoice(rec.id)}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-500"
                        title={rec.status === 'ACTIVE' ? 'Pause Schedule' : 'Resume Schedule'}
                      >
                        {rec.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    )}

                    {onDeleteRecurringInvoice && (
                      <button
                        onClick={() => onDeleteRecurringInvoice(rec.id)}
                        className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600"
                        title="Delete Recurring Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{rec.clientName}</h3>
                {rec.clientEmail && <p className="text-xs text-slate-500 font-medium">{rec.clientEmail}</p>}

                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Next Due Date:</span>
                    <span className="font-mono font-bold text-slate-800">{rec.nextDueDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Item Description:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {rec.items[0]?.description || 'Service'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">Amount / Cycle</span>
                  <span className="text-lg font-black text-slate-900">
                    ${rec.total.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (onGenerateRecurringInvoiceNow) {
                      onGenerateRecurringInvoiceNow(rec);
                    } else {
                      // Fallback generate invoice
                      onCreateInvoice({
                        invoiceNumber: `INV-2026-${(invoices.length + 1).toString().padStart(3, '0')}`,
                        issueDate: new Date().toISOString().split('T')[0],
                        dueDate: rec.nextDueDate,
                        clientName: rec.clientName,
                        clientEmail: rec.clientEmail,
                        clientGstNumber: rec.clientGstNumber,
                        clientAddress: rec.clientAddress,
                        gstBasis: rec.gstBasis,
                        subtotal: rec.subtotal,
                        gstTotal: rec.gstTotal,
                        total: rec.total,
                        status: 'SENT',
                        items: rec.items,
                        notes: rec.notes,
                      });
                    }
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Generate Invoice Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Recurring Schedule */}
      {showCreateRecurringModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">New Recurring Invoice Schedule</h3>
              </div>
              <button
                onClick={() => setShowCreateRecurringModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecurringSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Client / Organisation Name
                </label>
                <input
                  type="text"
                  required
                  value={recClientName}
                  onChange={(e) => setRecClientName(e.target.value)}
                  placeholder="e.g. Wellington Tech Hub"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={recClientEmail}
                    onChange={(e) => setRecClientEmail(e.target.value)}
                    placeholder="accounts@client.co.nz"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Client GST #
                  </label>
                  <input
                    type="text"
                    value={recClientGst}
                    onChange={(e) => setRecClientGst(e.target.value)}
                    placeholder="123-456-789"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Billing Cycle Frequency
                  </label>
                  <select
                    value={recFrequency}
                    onChange={(e) => setRecFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="FORTNIGHTLY">Fortnightly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={recNextDue}
                    onChange={(e) => setRecNextDue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Service / Retainer Description
                </label>
                <input
                  type="text"
                  required
                  value={recDescription}
                  onChange={(e) => setRecDescription(e.target.value)}
                  placeholder="e.g. Monthly IT Retainer"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Subtotal Amount ($ Excl. GST)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  + 15% NZ GST (${((parseFloat(recAmount) || 0) * 0.15).toFixed(2)}) = Total Payable ${((parseFloat(recAmount) || 0) * 1.15).toFixed(2)}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateRecurringModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Save Recurring Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Tax Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800">New NZ Tax Invoice</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name / Business</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Wellington City Enterprise"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 098-765-432"
                    value={clientGst}
                    onChange={(e) => setClientGst(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Invoice Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Description of goods or service"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-right font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary Box */}
              <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal (Excl. GST):</span>
                  <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-400">NZ GST (15%):</span>
                  <span className="font-mono font-bold text-teal-300">${gstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="font-bold">Total Payable (Incl. GST):</span>
                  <span className="font-mono font-black text-teal-300">${grandTotal.toFixed(2)} NZD</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-md"
                >
                  Issue Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Printable Tax Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-slate-900 my-8 border border-slate-300 print:shadow-none print:border-none">
            
            {/* Header / IRD Mandatory Title */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div>
                <span className="text-3xl font-black text-slate-900 uppercase tracking-tight">TAX INVOICE</span>
                <p className="text-xs text-slate-500 font-semibold mt-1">New Zealand GST Compliant</p>
              </div>

              <div className="text-right">
                <h3 className="text-base font-extrabold text-slate-900">{companySettings.tradingName}</h3>
                <p className="text-xs text-slate-600">{companySettings.businessAddress}</p>
                <p className="text-xs font-mono font-bold text-teal-800 mt-1">GST #: {companySettings.gstNumber}</p>
              </div>
            </div>

            {/* Bill To & Invoice Info */}
            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Tax Invoice To:</span>
                <p className="text-sm font-extrabold text-slate-900">{previewInvoice.clientName}</p>
                {previewInvoice.clientAddress && <p className="text-slate-600">{previewInvoice.clientAddress}</p>}
                {previewInvoice.clientGstNumber && (
                  <p className="font-mono text-slate-600 mt-1">Client GST #: {previewInvoice.clientGstNumber}</p>
                )}
              </div>

              <div className="text-right space-y-1">
                <div>
                  <span className="text-slate-400">Invoice Number:</span>{' '}
                  <span className="font-mono font-extrabold text-slate-900">{previewInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Issue Date:</span>{' '}
                  <span className="font-mono">{previewInvoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span>{' '}
                  <span className="font-mono text-rose-700 font-bold">{previewInvoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left text-xs mb-6 border-collapse">
              <thead>
                <tr className="border-y-2 border-slate-900 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">GST (15%)</th>
                  <th className="py-2.5 px-2 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {previewInvoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 px-2 font-bold text-slate-800">{item.description}</td>
                    <td className="py-3 px-2 text-center">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-mono">${(item.amount * 0.15).toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Box */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. GST):</span>
                  <span className="font-mono font-bold">${previewInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal-800">
                  <span>NZ GST (15%):</span>
                  <span className="font-mono font-bold">${previewInvoice.gstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Total Payable:</span>
                  <span className="font-mono">${previewInvoice.total.toFixed(2)} NZD</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions & QR Code */}
            <div className="space-y-4 mb-6">
              <InvoiceQrCode
                invoiceNumber={previewInvoice.invoiceNumber}
                amount={previewInvoice.total}
                bankAccountDetails={companySettings.bankAccountDetails || '01-0123-0456789-00'}
                companyName={companySettings.tradingName || companySettings.legalName}
                clientName={previewInvoice.clientName}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
