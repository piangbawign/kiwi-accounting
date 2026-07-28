import React, { useState } from 'react';
import {
  Scan,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Sparkles,
  Percent,
  Layers,
  HelpCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { AppState, OcrReceiptEntry } from '../types';

interface ReceiptOcrRuleEngineViewProps {
  appState: AppState;
  onUpdateOcrReceipts?: (receipts: OcrReceiptEntry[]) => void;
}

export const ReceiptOcrRuleEngineView: React.FC<ReceiptOcrRuleEngineViewProps> = ({
  appState,
  onUpdateOcrReceipts,
}) => {
  const [isSimulatingOcr, setIsSimulatingOcr] = useState(false);

  // OCR Receipts List
  const [ocrReceipts, setOcrReceipts] = useState<OcrReceiptEntry[]>(
    appState.ocrReceipts || [
      {
        id: 'OCR-001',
        vendorName: 'Soul Bar & Bistro Auckland',
        date: '2026-07-22',
        grossAmount: 345.00,
        gstAmount: 45.00, // 15% GST in NZ
        netAmount: 300.00,
        category: 'CLIENT_ENTERTAINMENT',
        isEntertainment50PercentLimit: true, // 50% non-deductible limit under NZ tax rule
        taxDeductiblePct: 50,
        confidenceScorePct: 98,
        status: 'VERIFIED',
      },
      {
        id: 'OCR-002',
        vendorName: 'PB Tech Commercial Ltd',
        date: '2026-07-24',
        grossAmount: 1150.00,
        gstAmount: 150.00,
        netAmount: 1000.00,
        category: 'COMPUTER_SOFTWARE_HARDWARE',
        isEntertainment50PercentLimit: false,
        taxDeductiblePct: 100,
        confidenceScorePct: 99,
        status: 'VERIFIED',
      },
      {
        id: 'OCR-003',
        vendorName: 'Z Energy Service Station',
        date: '2026-07-25',
        grossAmount: 140.00,
        gstAmount: 18.26,
        netAmount: 121.74,
        category: 'MOTOR_VEHICLE_FUEL',
        isEntertainment50PercentLimit: false,
        taxDeductiblePct: 100,
        confidenceScorePct: 96,
        status: 'VERIFIED',
      },
    ]
  );

  const handleSimulateOcrUpload = () => {
    setIsSimulatingOcr(true);
    setTimeout(() => {
      const mockReceipt: OcrReceiptEntry = {
        id: `OCR-${Date.now()}`,
        vendorName: 'Farrah Commercial Catering',
        date: new Date().toISOString().split('T')[0],
        grossAmount: 230.00,
        gstAmount: 30.00,
        netAmount: 200.00,
        category: 'STAFF_ENTERTAINMENT_EVENT',
        isEntertainment50PercentLimit: true, // Trigger 50% entertainment rule
        taxDeductiblePct: 50,
        confidenceScorePct: 97,
        status: 'PARSED',
      };

      const updated = [mockReceipt, ...ocrReceipts];
      setOcrReceipts(updated);
      if (onUpdateOcrReceipts) onUpdateOcrReceipts(updated);
      setIsSimulatingOcr(false);
    }, 1200);
  };

  const totalOcrGross = ocrReceipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalGstClaimable = ocrReceipts.reduce((sum, r) => sum + r.gstAmount, 0);
  const totalDeductibleNet = ocrReceipts.reduce((sum, r) => sum + (r.netAmount * (r.taxDeductiblePct / 100)), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-purple-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold">
              <Scan className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart Receipt OCR & IRD Tax Categorization Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AI Receipt OCR & IRD Tax Rule Scanner</h1>
            <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
              Auto-extract vendor name, date, total, and 15% NZ GST from invoices/receipts. Automatically flags the 50% IRD entertainment limitation rule and non-deductible items.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              disabled={isSimulatingOcr}
              onClick={handleSimulateOcrUpload}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSimulatingOcr ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Extracting AI OCR...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Scan Receipt / Invoice
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-purple-200">Total Scanned Receipts</span>
            <div className="text-2xl font-black font-mono mt-1">${totalOcrGross.toFixed(2)} NZD</div>
            <span className="text-[10px] text-purple-300">{ocrReceipts.length} Scanned Entries</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-purple-200">Total Claimable 15% GST</span>
            <div className="text-2xl font-black font-mono mt-1 text-purple-300">${totalGstClaimable.toFixed(2)} NZD</div>
            <span className="text-[10px] text-purple-300">GST Input Tax Credit</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-purple-200">Tax Deductible Income Amount</span>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-400">${totalDeductibleNet.toFixed(2)} NZD</div>
            <span className="text-[10px] text-purple-300">Net Expense Claimed</span>
          </div>

          <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
            <span className="text-[11px] font-medium text-purple-300">50% Entertainment Rule</span>
            <div className="mt-2">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Rule Enforced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-900">Parsed Expense Receipts & IRD Rule Status</h3>
          <span className="text-slate-500">AI Confidence Average: <strong className="text-emerald-700 font-mono">98%</strong></span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Vendor & Date</th>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-right">15% GST</th>
                <th className="py-3 px-4 text-right">Net Amount</th>
                <th className="py-3 px-4 text-center">IRD Tax Rule (Deductible %)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {ocrReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 block">{r.vendorName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{r.date}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{r.category}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">${r.grossAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-purple-700">${r.gstAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">${r.netAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    {r.isEntertainment50PercentLimit ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> 50% Rule Limit
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full font-bold text-[10px]">
                        100% Tax Deductible
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                      {r.status} ({r.confidenceScorePct}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
