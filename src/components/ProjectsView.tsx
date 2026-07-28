import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Project, Transaction } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  transactions: Transaction[];
  onAddProject: (proj: Omit<Project, 'id'>) => void;
  onDeleteProject?: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  transactions,
  onAddProject,
  onDeleteProject,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [budget, setBudget] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    onAddProject({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      clientName: client.trim() || undefined,
      budget: parseFloat(budget) || 0,
      status: 'ACTIVE',
    });

    setShowAddModal(false);
    setName('');
    setCode('');
    setClient('');
    setBudget('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">NZ Job Costing & Project Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track income, expenses, profit margins, and budgets for client jobs & engineering projects
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const projTxs = transactions.filter((t) => t.projectId === proj.id);
          const income = projTxs.filter((t) => t.type === 'INCOME').reduce((acc, t) => acc + (t.amount - t.gstAmount), 0);
          const expense = projTxs.filter((t) => t.type === 'EXPENSE').reduce((acc, t) => acc + (t.amount - t.gstAmount), 0);
          const profit = income - expense;
          const margin = income > 0 ? (profit / income) * 100 : 0;

          return (
            <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                    {proj.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {proj.status}
                    </span>
                    {onDeleteProject && (
                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        title="Delete project"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{proj.name}</h3>
                {proj.clientName && <p className="text-xs text-slate-500">Client: {proj.clientName}</p>}

                {/* Financial Progress */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Project Income:</span>
                    <span className="font-mono text-emerald-700">${income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Job Expenses:</span>
                    <span className="font-mono text-rose-600">${expense.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                    <span>Net Margin:</span>
                    <span className={`font-mono ${profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ${profit.toFixed(2)} ({margin.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Budget: ${proj.budget.toLocaleString()}</span>
                <span className="font-mono text-slate-600">{projTxs.length} Ledger Items</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create Job / Project Tag</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Wellington City Cloud Migration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., WLG-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Budget ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Wellington City Enterprise"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
