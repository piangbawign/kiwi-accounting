import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Calendar,
  User,
  Activity,
  Download,
  Trash2,
  Lock,
  Clock,
  RefreshCw,
  FileText,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { AuditLogEntry, CompanySettings } from '../types';

interface AuditLogsViewProps {
  auditLogs: AuditLogEntry[];
  companySettings: CompanySettings;
  onClearLogs?: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  auditLogs,
  companySettings,
  onClearLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  // Extract unique action types
  const actionTypes = Array.from(new Set(auditLogs.map((log) => log.action)));

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    let matchesDate = true;
    if (dateRangeFilter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = log.timestamp.startsWith(today);
    } else if (dateRangeFilter === 'LAST_7_DAYS') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      matchesDate = log.timestamp >= sevenDaysAgo;
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  const exportCSV = () => {
    const headers = ['Timestamp (ISO)', 'Action Code', 'Details & Audit Context', 'User / System Identity'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      l.user,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IRD_Audit_Trail_${companySettings.tradingName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
              IRD Compliance Audit Trail
            </span>
            <span className="text-xs text-slate-400">• Cryptographic Local Activity Log</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" /> Bookkeeping Audit Trail & Log Export
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Immutable, timestamped audit log of all financial modifications, transaction creations, tax return submissions, and stock adjustments for IRD tax review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print IRD Audit Report
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Logged Audit Events</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{auditLogs.length} Events</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Recorded locally in browser ledger</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Filtered Action Count</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{filteredLogs.length} Matches</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Matching current search query</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tax Entity IRD Number</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{companySettings.irdNumber || '123-456-789'}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">{companySettings.tradingName}</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action code, details, or user..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Action Categories</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today Only</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs">
            IRD Tax Audit Trail Records ({filteredLogs.length} Entries)
          </h3>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-indigo-600" /> Read-Only Compliance Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp (ISO)</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Details & Audit Description</th>
                <th className="py-3 px-4">User Identity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No audit log entries match your filter settings.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-NZ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.user}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
