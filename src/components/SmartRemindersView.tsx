import React, { useState } from 'react';
import {
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Filter,
  Search,
  Tag,
  ShieldAlert,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AppState } from '../types';

interface SmartRemindersViewProps {
  appState: AppState;
}

export interface ReminderItem {
  id: string;
  title: string;
  category: 'IRD_TAX' | 'PAYROLL' | 'BILLING' | 'COMPLIANCE' | 'CUSTOM';
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isCompleted: boolean;
  notes?: string;
  isOfficialIrd?: boolean;
}

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'File 2-Monthly GST Return (GST101B) & Pay IRD',
    category: 'IRD_TAX',
    dueDate: '2026-08-28',
    priority: 'HIGH',
    isCompleted: false,
    notes: 'Period ending July 2026. IRD filing due on 28th.',
    isOfficialIrd: true,
  },
  {
    id: 'rem-2',
    title: 'PAYE Employer Monthly Return & Deductions Payment',
    category: 'PAYROLL',
    dueDate: '2026-08-20',
    priority: 'HIGH',
    isCompleted: false,
    notes: 'Deductions for employee salary & 3.5% KiwiSaver rate.',
    isOfficialIrd: true,
  },
  {
    id: 'rem-3',
    title: 'First Provisional Tax Installment (FY2026/27)',
    category: 'IRD_TAX',
    dueDate: '2026-08-28',
    priority: 'HIGH',
    isCompleted: false,
    notes: 'Standard method calculation based on prior year taxation.',
    isOfficialIrd: true,
  },
  {
    id: 'rem-4',
    title: 'Companies Office NZ Annual Return Filing',
    category: 'COMPLIANCE',
    dueDate: '2026-09-30',
    priority: 'MEDIUM',
    isCompleted: false,
    notes: 'Confirm director details & address for Small Business Company Limited.',
    isOfficialIrd: true,
  },
  {
    id: 'rem-5',
    title: 'Quarterly Commercial Property Insurance Policy Review',
    category: 'CUSTOM',
    dueDate: '2026-08-15',
    priority: 'MEDIUM',
    isCompleted: true,
    notes: 'Review business coverage limits with insurance broker.',
  },
];

export const SmartRemindersView: React.FC<SmartRemindersViewProps> = ({ appState }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Reminder form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderItem['category']>('CUSTOM');
  const [dueDate, setDueDate] = useState('2026-08-28');
  const [priority, setPriority] = useState<ReminderItem['priority']>('MEDIUM');
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamically compute overdue invoice reminder count
  const overdueInvoicesCount = appState.invoices.filter((inv) => inv.status === 'OVERDUE').length;
  const unreconciledStatementsCount = appState.bankStatements.filter((s) => !s.isReconciled).length;

  const handleToggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title,
      category,
      dueDate,
      priority,
      isCompleted: false,
      notes,
    };

    setReminders((prev) => [newRem, ...prev]);
    setShowAddModal(false);
    setTitle('');
    setNotes('');
  };

  const filteredReminders = reminders.filter((rem) => {
    const isOverdue = rem.dueDate < todayStr && !rem.isCompleted;

    if (activeTab === 'UPCOMING' && (rem.isCompleted || isOverdue)) return false;
    if (activeTab === 'OVERDUE' && (!isOverdue || rem.isCompleted)) return false;
    if (activeTab === 'COMPLETED' && !rem.isCompleted) return false;

    if (categoryFilter !== 'ALL' && rem.category !== categoryFilter) return false;

    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Smart Tax & Compliance Reminders</h1>
              <span className="px-2.5 py-0.5 bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[10px] font-extrabold rounded-full uppercase">
                NZ IRD Calendar
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Automated deadline tracking for GST returns, PAYE, Provisional Tax & custom company tasks for {appState.companySettings.legalName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Custom Reminder
        </button>
      </div>

      {/* Operational Smart Alert Cards */}
      {(overdueInvoicesCount > 0 || unreconciledStatementsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {overdueInvoicesCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{overdueInvoicesCount} Customer Invoices are Overdue for Payment</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-200 text-rose-900 rounded-full">
                Action Needed
              </span>
            </div>
          )}

          {unreconciledStatementsCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{unreconciledStatementsCount} Bank Statement Items Need Reconciliation</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                Pending Match
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['ALL', 'UPCOMING', 'OVERDUE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-semibold shrink-0">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="IRD_TAX">IRD Tax & GST</option>
            <option value="PAYROLL">Payroll & PAYE</option>
            <option value="COMPLIANCE">Companies Office</option>
            <option value="CUSTOM">Custom Company Tasks</option>
          </select>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredReminders.map((rem) => {
          const isOverdue = rem.dueDate < todayStr && !rem.isCompleted;

          return (
            <div
              key={rem.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50/80 ${
                rem.isCompleted ? 'opacity-60 bg-slate-50/50' : isOverdue ? 'bg-rose-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(rem.id)}
                  className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                    rem.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-teal-600 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-bold ${
                        rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {rem.title}
                    </h3>

                    {rem.isOfficialIrd && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold rounded-md">
                        Official IRD Deadline
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        rem.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : rem.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rem.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">{rem.notes}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                      isOverdue
                        ? 'text-rose-600'
                        : rem.isCompleted
                        ? 'text-slate-400'
                        : 'text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rem.dueDate}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {rem.isCompleted ? 'Completed' : isOverdue ? 'Overdue!' : 'Due Date'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredReminders.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No reminders match the selected filters.
          </div>
        )}
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Company Reminder</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Motor Vehicle Logbook for FY2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReminderItem['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                  >
                    <option value="CUSTOM font-medium">Custom Task</option>
                    <option value="IRD_TAX">IRD Tax & GST</option>
                    <option value="PAYROLL">Payroll & PAYE</option>
                    <option value="COMPLIANCE">Companies Office</option>
                    <option value="BILLING">Billing / Invoicing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ReminderItem['priority'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
