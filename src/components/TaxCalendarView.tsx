import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Bell,
  Filter,
  Search,
  Building,
  Calculator,
  Percent,
  Users,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AppState, CompanySettings } from '../types';

interface TaxCalendarViewProps {
  appState: AppState;
  companySettings: CompanySettings;
}

export interface TaxEvent {
  id: string;
  title: string;
  taxType: 'GST' | 'PAYE' | 'PROVISIONAL' | 'INCOME_TAX' | 'CHARITY_IR526' | 'FBT';
  formCode: string; // e.g. GST101, IR345, P1, IR526
  dueDate: string; // YYYY-MM-DD
  periodDescription: string;
  status: 'FILED' | 'DUE_SOON' | 'UPCOMING' | 'OVERDUE';
  irdRuleNote: string;
  estimatedAmount?: number;
}

const DEFAULT_TAX_EVENTS: TaxEvent[] = [
  {
    id: 'tx-ev-1',
    title: 'PAYE & Employer Monthly Deductions (July 2026)',
    taxType: 'PAYE',
    formCode: 'IR345 / Employer Return',
    dueDate: '2026-08-20',
    periodDescription: 'July 2026 Payroll Deductions & KiwiSaver',
    status: 'DUE_SOON',
    irdRuleNote: 'PAYE deductions and ESCT payments are due on the 20th of the following month.',
    estimatedAmount: 538.10,
  },
  {
    id: 'tx-ev-2',
    title: '2-Monthly GST Return & Settlement (Jun/Jul 2026)',
    taxType: 'GST',
    formCode: 'GST101B',
    dueDate: '2026-08-28',
    periodDescription: 'June – July 2026 GST Period',
    status: 'DUE_SOON',
    irdRuleNote: 'GST returns and payments due 28th of month following period end (or Jan 15 for Nov period).',
    estimatedAmount: 1840.00,
  },
  {
    id: 'tx-ev-3',
    title: 'Provisional Tax Installment 1 (P1 - FY2026/27)',
    taxType: 'PROVISIONAL',
    formCode: 'IR3 Provisional P1',
    dueDate: '2026-08-28',
    periodDescription: 'First Provisional Tax Installment for 31 March Balance Date',
    status: 'UPCOMING',
    irdRuleNote: 'P1 due 28 August for taxpayers with a 31 March financial year-end.',
    estimatedAmount: 3200.00,
  },
  {
    id: 'tx-ev-4',
    title: 'Charities Services Annual Return & IR526 Tax Receipts Log',
    taxType: 'CHARITY_IR526',
    formCode: 'Tier 4 / CC Annual Return',
    dueDate: '2026-09-30',
    periodDescription: 'Financial Year Ended 31 March 2026',
    status: 'UPCOMING',
    irdRuleNote: 'Registered charities must file Annual Return within 6 months of financial year end.',
  },
  {
    id: 'tx-ev-5',
    title: 'Fringe Benefit Tax (FBT) Quarterly Return Q2',
    taxType: 'FBT',
    formCode: 'FBT4',
    dueDate: '2026-10-20',
    periodDescription: '1 July – 30 September 2026 FBT Period',
    status: 'UPCOMING',
    irdRuleNote: 'Quarterly FBT returns due 20th of month following quarter end.',
  },
  {
    id: 'tx-ev-6',
    title: 'Provisional Tax Installment 2 (P2 - FY2026/27)',
    taxType: 'PROVISIONAL',
    formCode: 'IR3 Provisional P2',
    dueDate: '2027-01-15',
    periodDescription: 'Second Provisional Tax Installment',
    status: 'UPCOMING',
    irdRuleNote: 'P2 due 15 January (extended from Dec 28 due to Christmas holiday period).',
    estimatedAmount: 3200.00,
  },
  {
    id: 'tx-ev-7',
    title: 'Company / Individual Income Tax Return (IR3 / IR4)',
    taxType: 'INCOME_TAX',
    formCode: 'IR3 / IR4 Annual Return',
    dueDate: '2027-03-31',
    periodDescription: '2025/2026 Income Tax Year (with Tax Agent Extension of Time)',
    status: 'UPCOMING',
    irdRuleNote: 'Standard due date 7 July; extended to 31 March next year for clients linked to a registered Tax Agent.',
  },
];

export const TaxCalendarView: React.FC<TaxCalendarViewProps> = ({
  appState,
  companySettings,
}) => {
  const [taxEvents, setTaxEvents] = useState<TaxEvent[]>(DEFAULT_TAX_EVENTS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleComplete = (id: string) => {
    setTaxEvents(
      taxEvents.map((e) => {
        if (e.id === id) {
          const newStatus = e.status === 'FILED' ? 'DUE_SOON' : 'FILED';
          return { ...e, status: newStatus };
        }
        return e;
      })
    );
  };

  const generateIcsFile = (event: TaxEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KiwiLedger NZ IRD Tax Calendar//EN
BEGIN:VEVENT
SUMMARY:IRD Compliance Due: ${event.title}
DESCRIPTION:${event.irdRuleNote} (Form: ${event.formCode})
DTSTART;VALUE=DATE:${event.dueDate.replace(/-/g, '')}
DTEND;VALUE=DATE:${event.dueDate.replace(/-/g, '')}
LOCATION:Inland Revenue Department New Zealand
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.formCode.replace(/[^a-z0-9]/gi, '_')}_due_${event.dueDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = taxEvents.filter((e) => {
    const matchesType = selectedType === 'ALL' || e.taxType === selectedType;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.formCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.periodDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filedCount = taxEvents.filter((e) => e.status === 'FILED').length;
  const dueSoonCount = taxEvents.filter((e) => e.status === 'DUE_SOON').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">NZ IRD Tax Compliance Calendar</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                2026/2027 Tax Year
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Official Inland Revenue New Zealand key statutory filing dates for GST, PAYE, Provisional Tax & Charity IR526.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
          <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300">
            IRD #: <span className="font-mono font-bold text-teal-300">{companySettings.irdNumber}</span>
          </div>
          <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300">
            GST Frequency: <span className="font-bold text-amber-300">{companySettings.gstFilingFrequency}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scheduled Compliance</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{taxEvents.length} Key IRD Dates</p>
            <p className="text-xs text-slate-500 mt-1">GST, PAYE, Income Tax & Charity</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Soon / Immediate Action</p>
            <p className={`text-2xl font-bold mt-1 ${dueSoonCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {dueSoonCount} Returns Pending
            </p>
            <p className="text-xs text-slate-500 mt-1">Action required before deadline</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed / Filed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{filedCount} Filed On Time</p>
            <p className="text-xs text-slate-500 mt-1">Full IRD audit trail maintained</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Dates' },
            { id: 'GST', label: 'GST (GST101)' },
            { id: 'PAYE', label: 'PAYE Payroll' },
            { id: 'PROVISIONAL', label: 'Provisional Tax' },
            { id: 'INCOME_TAX', label: 'Income Tax (IR3/IR4)' },
            { id: 'CHARITY_IR526', label: 'Charity & IR526' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IRD forms, dates..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Tax Events List */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => {
          const isFiled = evt.status === 'FILED';
          const isDueSoon = evt.status === 'DUE_SOON';

          return (
            <div
              key={evt.id}
              className={`p-5 rounded-2xl border transition-all bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isFiled
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isDueSoon
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-slate-900 text-teal-300">
                    {evt.formCode}
                  </span>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isFiled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isDueSoon
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {isFiled ? '✓ FILED & COMPLETED' : isDueSoon ? '⚠️ DUE SOON' : 'UPCOMING'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                <p className="text-xs text-slate-600 font-medium">{evt.periodDescription}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{evt.irdRuleNote}</span>
                </div>
              </div>

              {/* Due Date & Action Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 shrink-0">
                <div className="text-left sm:text-right space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IRD Statutory Due Date</p>
                  <p className="text-base font-mono font-black text-slate-900">{evt.dueDate}</p>
                  {evt.estimatedAmount && (
                    <p className="text-xs font-mono font-bold text-teal-700">
                      Est. ${evt.estimatedAmount.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleComplete(evt.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      isFiled
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isFiled ? 'Mark Unfiled' : 'Mark Filed'}
                  </button>

                  <button
                    onClick={() => generateIcsFile(evt)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Export to Calendar (.ics)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* IRD Statutory Rules Cheat Sheet */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-base">Inland Revenue NZ Statutory Due Date Rules Reference</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <p className="font-bold text-teal-300 text-sm">GST Returns (GST101)</p>
            <p>Due on the **28th of the month** following the end of your GST taxable period.</p>
            <p className="text-[11px] text-amber-300 pt-1">
              * Exception: Dec/Jan period GST returns are extended to **15 January**.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <p className="font-bold text-teal-300 text-sm">PAYE Employer Deductions</p>
            <p>Due on the **20th of the month** following the salary payment period.</p>
            <p className="text-[11px] text-slate-400 pt-1">
              Covers PAYE tax, ACC earner levies, student loan deductions, and KiwiSaver.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <p className="font-bold text-teal-300 text-sm">Provisional Tax Dates</p>
            <p>Standard 3-installment dates (March 31 year end):</p>
            <p className="font-mono text-slate-200">• P1: 28 August | • P2: 15 January | • P3: 7 May</p>
          </div>
        </div>
      </div>
    </div>
  );
};
