import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Percent,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Filter,
  Check,
  FileText,
  Table,
  Layers,
} from 'lucide-react';
import { Transaction, Invoice, Account, CompanySettings, AuditLog } from '../types';

interface DataExportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  invoices: Invoice[];
  accounts: Account[];
  companySettings: CompanySettings;
  auditLogs?: AuditLog[];
  onExportExecutivePdf?: () => void;
}

export const DataExportWizardModal: React.FC<DataExportWizardModalProps> = ({
  isOpen,
  onClose,
  transactions,
  invoices,
  accounts,
  companySettings,
  auditLogs = [],
  onExportExecutivePdf,
}) => {
  const [exportType, setExportType] = useState<'LEDGER' | 'GST' | 'CHURCH' | 'AUDIT' | 'ALL_BACKUP'>('LEDGER');
  const [format, setFormat] = useState<'CSV' | 'JSON' | 'IRD_TXT'>('CSV');
  const [dateRange, setDateRange] = useState<'ALL' | 'FY2025' | 'FY2026' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('ALL');
  const [includeChurchOnly, setIncludeChurchOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter transactions based on wizard options
  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      if (selectedAccountId !== 'ALL' && t.accountId !== selectedAccountId) return false;
      if (includeChurchOnly && !t.isChurchNonprofit) return false;
      if (dateRange === 'CUSTOM') {
        if (t.date < startDate || t.date > endDate) return false;
      } else if (dateRange === 'FY2026') {
        if (t.date < '2025-04-01' || t.date > '2026-03-31') return false;
      }
      return true;
    });
  };

  const handleRunExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      const filteredTx = getFilteredTransactions();

      let filename = `kiwiledger_export_${exportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}`;
      let content = '';
      let mimeType = 'text/csv';

      if (exportType === 'ALL_BACKUP') {
        filename += '.json';
        mimeType = 'application/json';
        content = JSON.stringify(
          {
            version: '2.5',
            exportTimestamp: new Date().toISOString(),
            companySettings,
            accounts,
            transactions: filteredTx,
            invoices,
            auditLogs,
          },
          null,
          2
        );
      } else if (format === 'JSON') {
        filename += '.json';
        mimeType = 'application/json';
        content = JSON.stringify(
          exportType === 'LEDGER'
            ? filteredTx
            : exportType === 'GST'
            ? filteredTx.map((t) => ({
                id: t.id,
                date: t.date,
                description: t.description,
                type: t.type,
                amount: t.amount,
                gstType: t.gstType,
                gstAmount: t.gstAmount,
                gstReturnPeriod: t.gstReturnPeriod,
                gstBoxMapping: t.gstBoxMapping,
              }))
            : exportType === 'CHURCH'
            ? filteredTx.filter((t) => t.isChurchNonprofit)
            : auditLogs,
          null,
          2
        );
      } else if (format === 'IRD_TXT') {
        filename += '.txt';
        mimeType = 'text/plain';
        content = `IRD-GST101-SPEC-EXPORT\nIRD Number: ${companySettings.irdNumber}\nTrading Name: ${companySettings.tradingName}\nExport Date: ${new Date().toISOString()}\nTotal Records: ${filteredTx.length}\n----------------------------------------\n`;
        filteredTx.forEach((t) => {
          content += `${t.date} | ${t.description.padEnd(30)} | ${t.type} | Amount: $${t.amount.toFixed(2)} | GST: $${t.gstAmount.toFixed(2)} | Box: ${t.gstBoxMapping || 'N/A'}\n`;
        });
      } else {
        // CSV Export
        filename += '.csv';
        mimeType = 'text/csv';

        if (exportType === 'LEDGER') {
          const headers = ['ID', 'Date', 'Type', 'Description', 'Amount', 'GST Type', 'GST Amount', 'Category', 'IRD Code', 'Donor Name', 'Church/Nonprofit', 'GST Return Period', 'GST Box Mapping'];
          const rows = filteredTx.map((t) => [
            t.id,
            t.date,
            t.type,
            `"${t.description.replace(/"/g, '""')}"`,
            t.amount.toFixed(2),
            t.gstType,
            t.gstAmount.toFixed(2),
            `"${t.category}"`,
            t.irdTaxCode || '',
            `"${t.donorName || ''}"`,
            t.isChurchNonprofit ? 'YES' : 'NO',
            t.gstReturnPeriod || '',
            t.gstBoxMapping || '',
          ]);
          content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        } else if (exportType === 'CHURCH') {
          const headers = ['ID', 'Date', 'Donor Name', 'Fund / Category', 'Amount ($)', 'IR526 Eligible', 'Reference'];
          const churchTx = filteredTx.filter((t) => t.isChurchNonprofit);
          const rows = churchTx.map((t) => [
            t.id,
            t.date,
            `"${t.donorName || 'Anonymous'}"`,
            t.churchCategory || t.category,
            t.amount.toFixed(2),
            t.isTaxDeductibleDonation ? 'YES (33.33% Rebate)' : 'NO',
            `"${t.reference || ''}"`,
          ]);
          content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        } else if (exportType === 'GST') {
          const headers = ['Date', 'Description', 'Type', 'Amount Incl GST', 'GST Amount', 'GST Return Period', 'IRD Box Mapping'];
          const rows = filteredTx.map((t) => [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.type,
            t.amount.toFixed(2),
            t.gstAmount.toFixed(2),
            t.gstReturnPeriod || '',
            t.gstBoxMapping || '',
          ]);
          content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        } else {
          const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details'];
          const rows = auditLogs.map((l) => [
            l.timestamp,
            l.user,
            l.action,
            l.action,
            `"${l.details.replace(/"/g, '""')}"`,
          ]);
          content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        }
      }

      // Trigger browser file download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
    }, 400);
  };

  const filteredCount = getFilteredTransactions().length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150 my-auto max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-sm">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">KiwiLedger Export Wizard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Export Ledger, GST Returns & Church Records for IRD / Accountant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          
          {/* Step 1: Select Export Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">1. Select Export Dataset</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'LEDGER', label: 'Full Ledger', icon: Table, desc: 'All transactions' },
                { id: 'GST', label: 'GST Returns', icon: Percent, desc: 'GST101 box maps' },
                { id: 'CHURCH', label: 'Church & Donors', icon: HeartHandshake, desc: 'IR526 tax receipts' },
                { id: 'AUDIT', label: 'Audit Trail Logs', icon: ShieldCheck, desc: 'Security log history' },
                { id: 'ALL_BACKUP', label: 'Full App Backup', icon: Layers, desc: 'Complete JSON state' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = exportType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExportType(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose File Format */}
          {exportType !== 'ALL_BACKUP' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">2. File Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('CSV')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    format === 'CSV' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> CSV / Excel
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('JSON')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    format === 'JSON' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileCode className="w-4 h-4" /> JSON Object
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('IRD_TXT')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    format === 'IRD_TXT' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" /> IRD Spec Text
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Filtering Options */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-teal-600" /> Export Filters & Range
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                >
                  <option value="ALL">All Recorded Dates</option>
                  <option value="FY2026">Financial Year 2025/26 (Apr 2025 - Mar 2026)</option>
                  <option value="CUSTOM">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bank Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                >
                  <option value="ALL">All Bank Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                  ))}
                </select>
              </div>
            </div>

            {dateRange === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span>Matching Records: <strong className="text-teal-800 font-mono">{filteredCount} items</strong></span>
              <span className="text-[10px] text-slate-400">IRD Number: {companySettings.irdNumber}</span>
            </div>
          </div>

          {/* Executive PDF Quick Link */}
          {onExportExecutivePdf && (
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-teal-900">Need an Executive PDF Financial Report?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onExportExecutivePdf();
                  onClose();
                }}
                className="px-3 py-1 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors"
              >
                Generate PDF Report
              </button>
            </div>
          )}

          {exportSuccess && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> File exported successfully to your downloads folder!
            </div>
          )}

          {/* Sticky Actions Footer */}
          <div className="sticky -bottom-5 -mx-5 -mb-5 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleRunExport}
              disabled={isExporting}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              {isExporting ? 'Generating Download...' : 'Download Export'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
