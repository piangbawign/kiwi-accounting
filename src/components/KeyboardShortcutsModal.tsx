import React, { useEffect } from 'react';
import { Keyboard, X, Command, Sparkles, Navigation, Plus, Search } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onQuickAction?: (action: 'NEW_TRANSACTION' | 'NEW_INVOICE' | 'NEW_BUDGET') => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onQuickAction,
}) => {
  // Global key listener
  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    let nPressed = false;
    let nTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea/select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      // Esc closes modal
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // '?' opens shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // modal toggle handled in parent or via function
        return;
      }

      // Sequential 'g' shortcuts: g then d, b, i, c, t, h, r
      if (e.key.toLowerCase() === 'g' && !gPressed) {
        gPressed = true;
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(gTimeout);
        const k = e.key.toLowerCase();
        if (k === 'd') { onNavigateTab('DASHBOARD'); return; }
        if (k === 'b') { onNavigateTab('BOOKKEEPING'); return; }
        if (k === 'i') { onNavigateTab('INVOICES'); return; }
        if (k === 'c') { onNavigateTab('CHURCH_CHARITY'); return; }
        if (k === 't') { onNavigateTab('TAX_CALENDAR'); return; }
        if (k === 'h') { onNavigateTab('FINANCIAL_HEALTH'); return; }
        if (k === 'r') { onNavigateTab('REPORTS'); return; }
      }

      // Sequential 'n' shortcuts: n then t, i, b
      if (e.key.toLowerCase() === 'n' && !nPressed) {
        nPressed = true;
        clearTimeout(nTimeout);
        nTimeout = setTimeout(() => {
          nPressed = false;
        }, 1000);
        return;
      }

      if (nPressed) {
        nPressed = false;
        clearTimeout(nTimeout);
        const k = e.key.toLowerCase();
        if (k === 't' && onQuickAction) { onQuickAction('NEW_TRANSACTION'); return; }
        if (k === 'i' && onQuickAction) { onQuickAction('NEW_INVOICE'); return; }
        if (k === 'b' && onQuickAction) { onQuickAction('NEW_BUDGET'); return; }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimeout);
      clearTimeout(nTimeout);
    };
  }, [isOpen, onClose, onNavigateTab, onQuickAction]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Global Navigation',
      icon: Navigation,
      shortcuts: [
        { keys: ['G', 'D'], description: 'Go to Main Dashboard' },
        { keys: ['G', 'B'], description: 'Go to Bookkeeping' },
        { keys: ['G', 'I'], description: 'Go to NZ GST Tax Invoices' },
        { keys: ['G', 'C'], description: 'Go to Church & Non-Profit Hub' },
        { keys: ['G', 'T'], description: 'Go to NZ Tax Calendar' },
        { keys: ['G', 'H'], description: 'Go to Financial Health Scorecard' },
        { keys: ['G', 'R'], description: 'Go to Financial Reports' },
      ],
    },
    {
      title: 'Quick Creation Actions',
      icon: Plus,
      shortcuts: [
        { keys: ['N', 'T'], description: 'New Expense / Income Transaction' },
        { keys: ['N', 'I'], description: 'New NZ Tax Invoice' },
        { keys: ['N', 'B'], description: 'New Budget Threshold' },
      ],
    },
    {
      title: 'System & Controls',
      icon: Command,
      shortcuts: [
        { keys: ['?'], description: 'Toggle Keyboard Shortcuts Modal' },
        { keys: ['Esc'], description: 'Close active modal / clear focus' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Keyboard Shortcuts Cheat Sheet</h3>
              <p className="text-xs text-slate-400">Power-user key bindings for speed navigation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {shortcutGroups.map((group) => {
            const IconComp = group.icon;
            return (
              <div key={group.title} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <IconComp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  {group.title}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.shortcuts.map((sc) => (
                    <div
                      key={sc.description}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{sc.description}</span>

                      <div className="flex items-center gap-1">
                        {sc.keys.map((k, idx) => (
                          <React.Fragment key={idx}>
                            <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 shadow-xs">
                              {k}
                            </kbd>
                            {idx < sc.keys.length - 1 && <span className="text-xs text-slate-400">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Press <kbd className="font-mono font-bold text-slate-800 dark:text-slate-200">?</kbd> anytime to open this guide.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold rounded-xl transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
