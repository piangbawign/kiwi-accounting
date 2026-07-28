import React, { useState } from 'react';
import {
  Globe,
  UserCheck,
  Search,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
  Upload,
  Send,
  Printer,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Eye,
  X,
  Plus,
  Edit,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Settings,
  Trash2,
} from 'lucide-react';
import { Invoice, CompanySettings } from '../types';

interface ClientPortalViewProps {
  invoices: Invoice[];
  companySettings: CompanySettings;
  onMarkInvoicePaid: (id: string) => void;
}

export interface CustomClientProfile {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  notes: string;
  portalToken: string;
}

const DEFAULT_CUSTOM_CLIENTS: CustomClientProfile[] = [
  {
    id: 'cli-1',
    name: 'Wellington Regional Enterprise',
    contactName: 'Mark Robertson',
    email: 'accounts@wellingtonenterprise.co.nz',
    phone: '+64 4 499 1234',
    address: '45 Willis Street, Wellington 6011',
    gstNumber: '112-345-678',
    paymentTerms: '20th of Month Following',
    notes: 'Key Enterprise Account • Monthly Retainer',
    portalToken: 'tok_welly_ent_2026',
  },
  {
    id: 'cli-2',
    name: 'Southern Freight Logistics Ltd',
    contactName: 'Emma Watson',
    email: 'billing@southernfreight.co.nz',
    phone: '+64 3 366 7890',
    address: '12 Logistics Way, Christchurch 8024',
    gstNumber: '098-765-432',
    paymentTerms: 'Net 14 Days',
    notes: 'Prefers POLi and Direct Bank Transfer',
    portalToken: 'tok_south_freight_098',
  },
  {
    id: 'cli-3',
    name: 'Auckland Tech Hub Limited',
    contactName: 'David Chen',
    email: 'finance@aucklandtechhub.co.nz',
    phone: '+64 9 300 5555',
    address: '88 Customhouse Quay, Auckland 1010',
    gstNumber: '134-567-890',
    paymentTerms: 'Net 7 Days',
    notes: 'Software & Cloud Consulting Client',
    portalToken: 'tok_akl_tech_777',
  },
];

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  invoices,
  companySettings,
  onMarkInvoicePaid,
}) => {
  const [customClients, setCustomClients] = useState<CustomClientProfile[]>(DEFAULT_CUSTOM_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePortalTab, setActivePortalTab] = useState<'INVOICES' | 'STATEMENT' | 'PAYMENT' | 'CLIENT_PROFILE'>('INVOICES');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPayModal, setShowPayModal] = useState<Invoice | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  
  // Custom Client Modal States
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<CustomClientProfile | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    paymentTerms: 'Net 14 Days',
    notes: '',
  });

  // Local state for dynamically created sample invoices
  const [dynamicInvoices, setDynamicInvoices] = useState<Invoice[]>([]);

  // Combined invoice list
  const allInvoices = [...invoices, ...dynamicInvoices];

  // Extract unique client names from invoices + custom client list
  const invoiceClientNames = Array.from(new Set(allInvoices.map((i) => i.clientName).filter(Boolean)));
  const customClientNames = customClients.map((c) => c.name);
  const allClientNames = Array.from(new Set([...customClientNames, ...invoiceClientNames]));

  // Default to first client if none selected
  const activeClientName = selectedClient || (allClientNames.length > 0 ? allClientNames[0] : 'All Clients');

  // Find profile of active client
  const activeClientProfile = customClients.find(
    (c) => c.name.toLowerCase() === activeClientName.toLowerCase()
  ) || {
    id: 'cli-gen',
    name: activeClientName,
    contactName: 'Primary Contact',
    email: `billing@${activeClientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.nz`,
    phone: '+64 21 000 0000',
    address: 'New Zealand',
    gstNumber: companySettings.gstNumber || '123-456-789',
    paymentTerms: 'Net 14 Days',
    notes: 'Standard NZ Tax Client',
    portalToken: `tok_${Math.floor(100000 + Math.random() * 900000)}`,
  };

  // Payment form states
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'POLI' | 'BANK_TRANSFER'>('BANK_TRANSFER');

  // Filter invoices for active client or query
  const clientInvoices = allInvoices.filter((inv) => {
    const matchesClient = !selectedClient || inv.clientName.toLowerCase() === selectedClient.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClient && matchesSearch;
  });

  const unpaidInvoices = clientInvoices.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE');
  const paidInvoices = clientInvoices.filter((i) => i.status === 'PAID');

  const totalOutstanding = unpaidInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalPaid = paidInvoices.reduce((acc, i) => acc + i.total, 0);

  const portalUrl = `https://kiwiledger.co.nz/portal/client?name=${encodeURIComponent(activeClientName)}&token=${activeClientProfile.portalToken}`;

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenAddClientModal = () => {
    setEditingClient(null);
    setClientForm({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: '',
      paymentTerms: 'Net 14 Days',
      notes: '',
    });
    setShowClientModal(true);
  };

  const handleOpenEditClientModal = (cli: CustomClientProfile) => {
    setEditingClient(cli);
    setClientForm({
      name: cli.name,
      contactName: cli.contactName,
      email: cli.email,
      phone: cli.phone,
      address: cli.address,
      gstNumber: cli.gstNumber,
      paymentTerms: cli.paymentTerms,
      notes: cli.notes,
    });
    setShowClientModal(true);
  };

  const handleSaveCustomClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;

    if (editingClient) {
      setCustomClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                name: clientForm.name.trim(),
                contactName: clientForm.contactName.trim() || 'Primary Contact',
                email: clientForm.email.trim(),
                phone: clientForm.phone.trim(),
                address: clientForm.address.trim(),
                gstNumber: clientForm.gstNumber.trim(),
                paymentTerms: clientForm.paymentTerms,
                notes: clientForm.notes.trim(),
              }
            : c
        )
      );
      setSelectedClient(clientForm.name.trim());
    } else {
      const newCli: CustomClientProfile = {
        id: `cli-${Date.now()}`,
        name: clientForm.name.trim(),
        contactName: clientForm.contactName.trim() || 'Primary Contact',
        email: clientForm.email.trim(),
        phone: clientForm.phone.trim(),
        address: clientForm.address.trim(),
        gstNumber: clientForm.gstNumber.trim(),
        paymentTerms: clientForm.paymentTerms,
        notes: clientForm.notes.trim(),
        portalToken: `tok_${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setCustomClients((prev) => [...prev, newCli]);
      setSelectedClient(newCli.name);
    }

    setShowClientModal(false);
  };

  const handleCreateSampleInvoiceForClient = (clientName: string) => {
    const newInvNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newInv: Invoice = {
      id: `inv-dyn-${Date.now()}`,
      invoiceNumber: newInvNum,
      clientName: clientName,
      clientEmail: activeClientProfile.email,
      clientGstNumber: activeClientProfile.gstNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'SENT',
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: 'Professional Services & Consulting',
          quantity: 1,
          unitPrice: 1500.0,
          gstRate: 0.15,
          amount: 1500.0,
        },
        {
          id: `item-${Date.now()}-2`,
          description: 'Software & Technology Services',
          quantity: 1,
          unitPrice: 500.0,
          gstRate: 0.15,
          amount: 500.0,
        },
      ],
      gstBasis: 'EXCLUSIVE',
      subtotal: 2000.0,
      gstTotal: 300.0,
      total: 2300.0,
      notes: `Custom Tax Invoice for ${clientName}`,
      paymentTerms: activeClientProfile.paymentTerms,
    };

    setDynamicInvoices((prev) => [newInv, ...prev]);
    setPaymentSuccessMsg(`Created sample Tax Invoice ${newInvNum} ($2,300.00 NZD) for ${clientName}!`);
    setTimeout(() => setPaymentSuccessMsg(''), 5000);
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal) return;

    // Check if dynamic
    if (showPayModal.id.startsWith('inv-dyn-')) {
      setDynamicInvoices((prev) =>
        prev.map((i) => (i.id === showPayModal.id ? { ...i, status: 'PAID' } : i))
      );
    } else {
      onMarkInvoicePaid(showPayModal.id);
    }

    setPaymentSuccessMsg(
      `Payment of $${showPayModal.total.toFixed(2)} NZD for ${showPayModal.invoiceNumber} recorded successfully!`
    );
    setShowPayModal(null);
    setTimeout(() => setPaymentSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold border border-teal-500/30">
              Client Self-Service Portal
            </span>
            <span className="text-xs text-slate-400">• NZ Tax Invoice & Payment Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-teal-400" /> Client Portal & Payment Experience
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Provide your clients with a secure portal to view open GST tax invoices, download PDF statements, and process online payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddClientModal}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Add Custom Client
          </button>

          <button
            type="button"
            onClick={handleCopyPortalLink}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Portal Link Copied!' : 'Copy Portal Access Link'}
          </button>
        </div>
      </div>

      {paymentSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentSuccessMsg('')}
            className="text-xs text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Client Selection Bar & Portal Simulation Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block sm:hidden">
                Select Portal Client
              </label>
            </div>

            <div className="w-full sm:w-72">
              <label className="hidden sm:block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Select Portal Client (Custom & Invoice Clients)
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- All Clients Combined Portal --</option>

                  <optgroup label="Custom Configured Portal Clients">
                    {customClients.map((cli) => (
                      <option key={cli.id} value={cli.name}>
                        {cli.name} ({cli.contactName})
                      </option>
                    ))}
                  </optgroup>

                  {allClientNames.filter((n) => !customClients.some((c) => c.name === n)).length > 0 && (
                    <optgroup label="Other Invoice Clients">
                      {allClientNames
                        .filter((n) => !customClients.some((c) => c.name === n))
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddClientModal}
                  title="Add Custom Portal Client"
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 shrink-0 font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Portal Link Box */}
          <div className="flex-1 max-w-md w-full bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
            <div className="truncate">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Client Portal Direct URL</span>
              <span className="font-mono text-teal-700 dark:text-teal-400 font-bold truncate block">{portalUrl}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPortalLink}
              className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
              title="Copy link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Selected Client Card Details */}
        {selectedClient && (
          <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-teal-300 text-sm">{activeClientProfile.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-200 border border-teal-500/30 font-mono">
                  Token: {activeClientProfile.portalToken}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-[11px]">
                <span>Contact: <strong>{activeClientProfile.contactName}</strong></span>
                <span>Email: <strong>{activeClientProfile.email}</strong></span>
                <span>GST #: <strong>{activeClientProfile.gstNumber}</strong></span>
                <span>Terms: <strong>{activeClientProfile.paymentTerms}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCreateSampleInvoiceForClient(activeClientName)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Create Sample Tax Invoice
              </button>

              {customClients.some((c) => c.name.toLowerCase() === selectedClient.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => {
                    const found = customClients.find((c) => c.name.toLowerCase() === selectedClient.toLowerCase());
                    if (found) handleOpenEditClientModal(found);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        )}

        {/* Client KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Outstanding Balance</span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">${totalOutstanding.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">{unpaidInvoices.length} unpaid invoices</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Paid to Date</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${totalPaid.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">{paidInvoices.length} completed transactions</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Merchant Business</span>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{companySettings.tradingName}</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">GST Reg: {companySettings.gstNumber}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActivePortalTab('INVOICES')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activePortalTab === 'INVOICES'
              ? 'bg-slate-900 text-white shadow-md dark:bg-teal-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Invoices & Bills ({clientInvoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActivePortalTab('STATEMENT')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activePortalTab === 'STATEMENT'
              ? 'bg-slate-900 text-white shadow-md dark:bg-teal-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Statement of Account
        </button>
        <button
          type="button"
          onClick={() => setActivePortalTab('PAYMENT')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activePortalTab === 'PAYMENT'
              ? 'bg-slate-900 text-white shadow-md dark:bg-teal-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Bank Remittance & Direct Deposit
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('CLIENT_PROFILE')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ${
            activePortalTab === 'CLIENT_PROFILE'
              ? 'bg-slate-900 text-white shadow-md dark:bg-teal-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Portal Clients Manager ({customClients.length})
        </button>
      </div>

      {/* TAB 1: INVOICES LIST */}
      {activePortalTab === 'INVOICES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              Client Portal Tax Invoices for <span className="text-teal-700 dark:text-teal-400">{activeClientName}</span>
            </h3>
            <div className="w-full sm:w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-slate-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Issue / Due Date</th>
                  <th className="py-3 px-4 text-right">Subtotal (Excl)</th>
                  <th className="py-3 px-4 text-right">GST (15%)</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Portal Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {clientInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="space-y-3">
                        <p className="font-bold">No invoices found for {activeClientName}.</p>
                        <button
                          type="button"
                          onClick={() => handleCreateSampleInvoiceForClient(activeClientName)}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Generate Sample Tax Invoice for {activeClientName}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clientInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{inv.clientName}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div>Issue: {inv.issueDate}</div>
                        <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">${inv.subtotal.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">${inv.gstTotal.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900 dark:text-slate-100">
                        ${inv.total.toFixed(2)} NZD
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {inv.status !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => setShowPayModal(inv)}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <CreditCard className="w-3 h-3" /> Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STATEMENT OF ACCOUNT */}
      {activePortalTab === 'STATEMENT' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
                Official NZ Tax Statement
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">Statement of Account</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Prepared for: <span className="font-bold text-slate-800 dark:text-slate-200">{activeClientName}</span></p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save Statement PDF
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Statement Date</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{new Date().toISOString().split('T')[0]}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">GST Registration</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{companySettings.gstNumber}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Invoiced YTD</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">${(totalOutstanding + totalPaid).toFixed(2)} NZD</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Amount Due Now</span>
              <p className="text-xs font-black text-rose-600 dark:text-rose-400">${totalOutstanding.toFixed(2)} NZD</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Account Activity Log</h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type / Reference</th>
                    <th className="py-2.5 px-3 text-right">Invoiced Amount</th>
                    <th className="py-2.5 px-3 text-right">Paid Amount</th>
                    <th className="py-2.5 px-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {clientInvoices.map((inv) => {
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono">{inv.issueDate}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100">Tax Invoice {inv.invoiceNumber}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">${inv.total.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                          {inv.status === 'PAID' ? `$${inv.total.toFixed(2)}` : '$0.00'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900 dark:text-slate-100">
                          ${inv.status === 'PAID' ? '0.00' : `$${inv.total.toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REMITTANCE & DIRECT DEPOSIT */}
      {activePortalTab === 'PAYMENT' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" /> New Zealand Direct Bank Transfer Instructions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For direct bank payments via ANZ, ASB, BNZ, Westpac, or Kiwibank online banking:
          </p>

          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Account Name:</span>
              <span className="font-bold text-teal-300">{companySettings.tradingName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Bank Details:</span>
              <span className="font-bold text-white">{companySettings.bankAccountDetails || '01-0123-0123456-00'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Payment Particulars:</span>
              <span className="font-bold text-amber-300">{activeClientName.substring(0, 12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Reference:</span>
              <span className="font-bold text-teal-300">INV-2026-REF</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PORTAL CLIENTS MANAGER */}
      {activePortalTab === 'CLIENT_PROFILE' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" /> Custom Portal Clients Directory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage customized portal clients, their direct payment access tokens, contact details, and payment terms.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddClientModal}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Add New Portal Client
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customClients.map((cli) => (
              <div
                key={cli.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                  selectedClient.toLowerCase() === cli.name.toLowerCase()
                    ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 shadow-md ring-2 ring-teal-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">{cli.name}</h4>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">{cli.contactName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditClientModal(cli)}
                    className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
                    title="Edit client profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {cli.email}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {cli.phone}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {cli.address}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500">GST #: {cli.gstNumber || 'N/A'}</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{cli.paymentTerms}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(cli.name);
                      setActivePortalTab('INVOICES');
                    }}
                    className="w-full py-1.5 bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                  >
                    Open Client Portal View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Custom Portal Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                {editingClient ? 'Edit Custom Portal Client' : 'Add Custom Portal Client'}
              </h3>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wellington Tech Hub Limited"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={clientForm.contactName}
                    onChange={(e) => setClientForm({ ...clientForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Client Email</label>
                  <input
                    type="email"
                    placeholder="accounts@client.co.nz"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+64 21 123 4567"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Client GST Number</label>
                  <input
                    type="text"
                    placeholder="123-456-789"
                    value={clientForm.gstNumber}
                    onChange={(e) => setClientForm({ ...clientForm, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
                  <select
                    value={clientForm.paymentTerms}
                    onChange={(e) => setClientForm({ ...clientForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold dark:text-slate-100"
                  >
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 14 Days">Net 14 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="20th of Month Following">20th of Month Following</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Billing Address</label>
                  <input
                    type="text"
                    placeholder="Wellington, NZ"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Portal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special billing instructions or notes for client portal..."
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {editingClient ? 'Save Changes' : 'Create Custom Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base">Tax Invoice {selectedInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tax Invoice Paper Layout */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{companySettings.tradingName}</h2>
                  <p className="text-slate-500">{companySettings.businessAddress}</p>
                  <p className="text-slate-500 font-mono">GST Reg #: {companySettings.gstNumber}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-teal-700 text-white font-mono font-bold text-xs rounded-md uppercase">
                    TAX INVOICE
                  </span>
                  <p className="font-bold text-slate-900 mt-2">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-slate-500">Date: {selectedInvoice.issueDate}</p>
                  <p className="text-slate-500">Due: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Billed To</span>
                <p className="font-bold text-slate-900 text-sm">{selectedInvoice.clientName}</p>
                {selectedInvoice.clientGstNumber && (
                  <p className="text-slate-500">Client GST #: {selectedInvoice.clientGstNumber}</p>
                )}
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500 font-bold">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Amount (Excl)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 font-medium">{item.description}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-bold">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 border-t border-slate-300 flex justify-end">
                <div className="w-64 space-y-1 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal (Excl GST):</span>
                    <span className="font-mono">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (15%):</span>
                    <span className="font-mono">${selectedInvoice.gstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-300">
                    <span>Total Amount Due:</span>
                    <span className="font-mono text-teal-700">${selectedInvoice.total.toFixed(2)} NZD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              {selectedInvoice.status !== 'PAID' && (
                <button
                  type="button"
                  onClick={() => {
                    const inv = selectedInvoice;
                    setSelectedInvoice(null);
                    setShowPayModal(inv);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Pay Invoice Online
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Online Simulator Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                Secure Payment Portal
              </h3>
              <button
                type="button"
                onClick={() => setShowPayModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulatePayment} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Paying Invoice</span>
                  <span className="font-mono font-bold text-teal-700 text-xs">{showPayModal.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Amount</span>
                  <span className="font-mono font-black text-slate-900 text-sm">${showPayModal.total.toFixed(2)} NZD</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === 'CARD'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('POLI')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === 'POLI'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    POLi Internet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Bank Direct
                  </button>
                </div>
              </div>

              {paymentMethod === 'CARD' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">CVC Code</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 font-mono">
                  <p className="text-teal-300 font-bold">Transfer to: {companySettings.tradingName}</p>
                  <p>Bank Acc: {companySettings.bankAccountDetails || '01-0123-0123456-00'}</p>
                  <p>Reference Code: <span className="text-amber-300 font-bold">{showPayModal.invoiceNumber}</span></p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Confirm Payment (${showPayModal.total.toFixed(2)} NZD)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

