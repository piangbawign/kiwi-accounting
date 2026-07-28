import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Building,
  Laptop,
  Car,
  CheckCircle2,
  AlertTriangle,
  Download,
  DollarSign,
  TrendingDown,
  Trash2,
  Zap,
} from 'lucide-react';
import { AppState, FixedAsset } from '../types';

interface FixedAssetDepreciationViewProps {
  appState: AppState;
  onUpdateFixedAssets?: (assets: FixedAsset[]) => void;
}

export const FixedAssetDepreciationView: React.FC<FixedAssetDepreciationViewProps> = ({
  appState,
  onUpdateFixedAssets,
}) => {
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  // Default Assets
  const [assets, setAssets] = useState<FixedAsset[]>(
    appState.fixedAssets || [
      {
        id: 'AST-001',
        assetName: 'Apple MacBook Pro M3 Max 16"',
        assetNumber: 'FA-2026-001',
        category: 'COMPUTER_EQUIPMENT',
        purchaseDate: '2026-04-10',
        costPrice: 5200,
        depreciationMethod: 'DV',
        irdDepreciationRatePct: 50, // IRD Diminishing Value rate for laptops is 50%
        accumulatedDepreciation: 1300,
        openingBookValue: 5200,
        currentBookValue: 3900,
        isLowValueWriteOff: false,
        status: 'ACTIVE',
      },
      {
        id: 'AST-002',
        assetName: 'Dell UltraSharp 32" 4K Monitor',
        assetNumber: 'FA-2026-002',
        category: 'COMPUTER_EQUIPMENT',
        purchaseDate: '2026-05-15',
        costPrice: 950,
        depreciationMethod: 'DV',
        irdDepreciationRatePct: 50,
        accumulatedDepreciation: 950,
        openingBookValue: 950,
        currentBookValue: 0,
        isLowValueWriteOff: true, // Under $1,000 threshold for immediate IRD tax write-off
        status: 'ACTIVE',
      },
      {
        id: 'AST-003',
        assetName: 'Tesla Model Y Company Vehicle',
        assetNumber: 'FA-2026-003',
        category: 'VEHICLE',
        purchaseDate: '2026-01-20',
        costPrice: 55000,
        depreciationMethod: 'DV',
        irdDepreciationRatePct: 30, // IRD DV rate for motor vehicles is 30%
        accumulatedDepreciation: 8250,
        openingBookValue: 55000,
        currentBookValue: 46750,
        isLowValueWriteOff: false,
        status: 'ACTIVE',
      },
    ]
  );

  // Form State
  const [name, setName] = useState('');
  const [cat, setCat] = useState<FixedAsset['category']>('COMPUTER_EQUIPMENT');
  const [pDate, setPDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('1200');
  const [method, setMethod] = useState<'DV' | 'SL'>('DV');
  const [rate, setRate] = useState('50');

  // Calculations
  const totalAssetCost = assets.reduce((sum, a) => sum + (typeof a.costPrice === 'number' ? a.costPrice : parseFloat(a.costPrice) || 0), 0);
  const totalAccumDepreciation = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalBookValue = assets.reduce((sum, a) => sum + a.currentBookValue, 0);
  const totalLowValueWriteOffs = assets.filter((a) => a.isLowValueWriteOff).reduce((sum, a) => sum + (typeof a.costPrice === 'number' ? a.costPrice : parseFloat(a.costPrice) || 0), 0);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const costVal = parseFloat(cost) || 0;
    const rateVal = parseFloat(rate) || 50;
    const isLowVal = costVal <= 1000; // IRD low value asset immediate tax deduction limit ($1,000)

    const initialDep = isLowVal ? costVal : costVal * (rateVal / 100) * 0.5; // Half-year or immediate
    const newAsset: FixedAsset = {
      id: `AST-${Date.now()}`,
      assetName: name,
      assetNumber: `FA-${assets.length + 1}`,
      category: cat,
      purchaseDate: pDate,
      costPrice: costVal,
      depreciationMethod: method,
      irdDepreciationRatePct: rateVal,
      accumulatedDepreciation: initialDep,
      openingBookValue: costVal,
      currentBookValue: Math.max(0, costVal - initialDep),
      isLowValueWriteOff: isLowVal,
      status: 'ACTIVE',
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    if (onUpdateFixedAssets) onUpdateFixedAssets(updated);

    setShowAddAssetModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inland Revenue Tax Depreciation & Asset Register</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Fixed Assets & IRD Depreciation Schedule</h1>
            <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
              Maintain your fixed asset register, apply official IRD Diminishing Value (DV) or Straight Line (SL) depreciation rates, and claim immediate 100% tax write-offs for low-value assets under $1,000 NZD.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddAssetModal(true)}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Tax Schedule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Total Asset Cost</span>
            <div className="text-2xl font-black font-mono mt-1">${totalAssetCost.toLocaleString()} NZD</div>
            <span className="text-[10px] text-indigo-300">{assets.length} Registered Assets</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Accumulated Depreciation</span>
            <div className="text-2xl font-black font-mono mt-1 text-indigo-300">${totalAccumDepreciation.toLocaleString()} NZD</div>
            <span className="text-[10px] text-indigo-300">Total tax deduction claimed</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Net Carrying Book Value</span>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-400">${totalBookValue.toLocaleString()} NZD</div>
            <span className="text-[10px] text-indigo-300">Balance Sheet Asset Value</span>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <span className="text-[11px] font-medium text-emerald-300">100% Immediate Write-Offs (&le;$1k)</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">${totalLowValueWriteOffs.toLocaleString()} NZD</div>
            <span className="text-[10px] text-emerald-300/80">Direct tax deduction</span>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-900">Fixed Assets Tax Schedule</h3>
          <span className="text-slate-500">IRD Threshold for Immediate Expense: <strong className="text-slate-900 font-mono">$1,000 NZD</strong></span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Asset Code & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4 text-center">IRD Rate & Method</th>
                <th className="py-3 px-4 text-right">Cost Price ($)</th>
                <th className="py-3 px-4 text-right">Accum Deprec ($)</th>
                <th className="py-3 px-4 text-right">Book Value ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 block">{a.assetName}</span>
                    <span className="font-mono text-[10px] text-indigo-600">{a.assetNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold">
                      {a.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{a.purchaseDate}</td>
                  <td className="py-3 px-4 text-center">
                    {a.isLowValueWriteOff ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                        100% Write-off (&le;$1k)
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-slate-700">
                        {a.irdDepreciationRatePct}% {a.depreciationMethod}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">${typeof a.costPrice === 'number' ? a.costPrice.toLocaleString() : a.costPrice}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">${a.accumulatedDepreciation.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-indigo-900">${a.currentBookValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Register Fixed Asset
            </h3>

            <form onSubmit={handleAddAsset} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Asset Description / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell XPS Laptop or Office Desk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asset Category</label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="COMPUTER_EQUIPMENT">Computer Equipment (50% DV)</option>
                  <option value="VEHICLE">Motor Vehicle (30% DV)</option>
                  <option value="OFFICE_FURNITURE">Office Furniture (16% DV)</option>
                  <option value="PLANT_MACHINERY">Plant & Machinery (20% DV)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price ($ NZD)</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={pDate}
                    onChange={(e) => setPDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Depreciation Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="DV">Diminishing Value (DV)</option>
                    <option value="SL">Straight Line (SL)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IRD Rate (%)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {parseFloat(cost) <= 1000 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Low-value asset (&le;$1,000)! Qualifies for 100% immediate tax deduction.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
