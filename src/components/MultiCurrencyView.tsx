import React, { useState } from 'react';
import {
  Coins,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calculator,
  Plus,
  Pencil,
  DollarSign,
  Globe,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import { CurrencyRate, CompanySettings, Transaction } from '../types';

interface MultiCurrencyViewProps {
  companySettings: CompanySettings;
  transactions: Transaction[];
  onAddTransaction?: (tx: any) => void;
}

const DEFAULT_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', rateToNzd: 1.6393, symbol: '$', lastUpdated: 'Today' },
  { code: 'AUD', name: 'Australian Dollar', rateToNzd: 1.0825, symbol: '$', lastUpdated: 'Today' },
  { code: 'EUR', name: 'Euro', rateToNzd: 1.7820, symbol: '€', lastUpdated: 'Today' },
  { code: 'GBP', name: 'British Pound Sterling', rateToNzd: 2.1240, symbol: '£', lastUpdated: 'Today' },
  { code: 'JPY', name: 'Japanese Yen', rateToNzd: 0.0108, symbol: '¥', lastUpdated: 'Today' },
  { code: 'CAD', name: 'Canadian Dollar', rateToNzd: 1.2150, symbol: '$', lastUpdated: 'Today' },
  { code: 'SGD', name: 'Singapore Dollar', rateToNzd: 1.2380, symbol: '$', lastUpdated: 'Today' },
];

export const MultiCurrencyView: React.FC<MultiCurrencyViewProps> = ({
  companySettings,
  transactions,
  onAddTransaction,
}) => {
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>(() => {
    try {
      const saved = localStorage.getItem('kiwi_currency_rates_v1');
      return saved ? JSON.parse(saved) : DEFAULT_RATES;
    } catch {
      return DEFAULT_RATES;
    }
  });

  // Converter State
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('NZD');

  // Modal Editing Rate
  const [editingRate, setEditingRate] = useState<CurrencyRate | null>(null);
  const [newRateValue, setNewRateValue] = useState<number>(1.6393);

  // FX Gain/Loss calculation states
  const [unrealizedFxAssetVal, setUnrealizedFxAssetVal] = useState<number>(5000); // e.g. $5k USD account balance
  const [bookRate, setBookRate] = useState<number>(1.55); // Original booked rate
  const [currentRate, setCurrentRate] = useState<number>(1.6393); // Current market rate

  const saveRates = (newRates: CurrencyRate[]) => {
    setCurrencyRates(newRates);
    localStorage.setItem('kiwi_currency_rates_v1', JSON.stringify(newRates));
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    const updated = currencyRates.map((r) =>
      r.code === editingRate.code
        ? { ...r, rateToNzd: newRateValue, lastUpdated: new Date().toISOString().split('T')[0] }
        : r
    );
    saveRates(updated);
    setEditingRate(null);
  };

  // Calculations for Converter
  const getRateToNzd = (code: string) => {
    if (code === 'NZD') return 1.0;
    const found = currencyRates.find((c) => c.code === code);
    return found ? found.rateToNzd : 1.0;
  };

  let convertedResult = 0;
  if (fromCurrency === 'NZD' && toCurrency === 'NZD') {
    convertedResult = calcAmount;
  } else if (fromCurrency !== 'NZD' && toCurrency === 'NZD') {
    convertedResult = calcAmount * getRateToNzd(fromCurrency);
  } else if (fromCurrency === 'NZD' && toCurrency !== 'NZD') {
    convertedResult = calcAmount / getRateToNzd(toCurrency);
  } else {
    // Foreign to Foreign via NZD bridge
    const nzdVal = calcAmount * getRateToNzd(fromCurrency);
    convertedResult = nzdVal / getRateToNzd(toCurrency);
  }

  // FX Gain/Loss calculation
  const bookedNzdValue = unrealizedFxAssetVal * bookRate;
  const currentNzdValue = unrealizedFxAssetVal * currentRate;
  const fxGainLoss = currentNzdValue - bookedNzdValue;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/30">
              Foreign Exchange & Multi-Currency Engine
            </span>
            <span className="text-xs text-slate-400">• Base Currency: NZD ($)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-blue-400" /> Multi-Currency Spot Rates & FX Ledger
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Convert foreign invoices and receipts (USD, AUD, EUR, GBP) to NZD, record spot exchange rates, and calculate FX gains/losses for IRD tax filing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => saveRates(DEFAULT_RATES)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Reset FX Rates
          </button>
        </div>
      </div>

      {/* Spot FX Converter & FX Gain/Loss Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spot FX Converter */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" /> Live Currency Spot Rate Converter
            </h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
              NZD Base
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Convert</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-black font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From Currency</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="NZD">NZD - New Zealand Dollar ($)</option>
                  {currencyRates.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">To Currency</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="NZD">NZD - New Zealand Dollar ($)</option>
                  {currencyRates.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl space-y-1">
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Converted Output</span>
              <div className="text-2xl font-black font-mono text-emerald-300">
                {convertedResult.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
              </div>
              <p className="text-[11px] text-slate-300">
                1 {fromCurrency} = {(convertedResult / (calcAmount || 1)).toFixed(4)} {toCurrency}
              </p>
            </div>
          </div>
        </div>

        {/* Foreign Exchange (FX) Gain / Loss Engine */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" /> Foreign Exchange (FX) Gain / Loss Engine
            </h3>
            <span className="text-[10px] font-bold text-slate-500">IRD Financial Arrangement Rules</span>
          </div>

          <p className="text-xs text-slate-500">
            Calculate unrealized / realized exchange gains or losses on foreign currency bank accounts, Stripe funds, or supplier invoices:
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Foreign Balance</label>
                <input
                  type="number"
                  value={unrealizedFxAssetVal}
                  onChange={(e) => setUnrealizedFxAssetVal(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Book Rate (NZD)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={bookRate}
                  onChange={(e) => setBookRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Original Booked NZD Value:</span>
                <span className="font-mono font-bold">${bookedNzdValue.toFixed(2)} NZD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Current Market NZD Value:</span>
                <span className="font-mono font-bold">${currentNzdValue.toFixed(2)} NZD</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200">
                <span>FX Gain / (Loss) Output:</span>
                <span className={`font-mono ${fxGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fxGainLoss >= 0 ? '+' : ''}${fxGainLoss.toFixed(2)} NZD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spot Currency Rates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs">Active Currency Spot Exchange Rates (vs 1 NZD)</h3>
          <span className="text-xs text-slate-400">Values represent NZD per 1 Foreign Unit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Currency Code</th>
                <th className="py-3 px-4">Currency Name</th>
                <th className="py-3 px-4 text-right">Spot Exchange Rate (1 Foreign = X NZD)</th>
                <th className="py-3 px-4 text-right">Inverse Rate (1 NZD = X Foreign)</th>
                <th className="py-3 px-4 text-center">Last Updated</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {currencyRates.map((rate) => {
                const inverseRate = rate.rateToNzd > 0 ? (1 / rate.rateToNzd).toFixed(4) : '0';
                return (
                  <tr key={rate.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold font-mono text-xs border border-blue-200">
                        {rate.code} ({rate.symbol})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{rate.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${rate.rateToNzd.toFixed(4)} NZD
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {inverseRate} {rate.code}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{rate.lastUpdated}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRate(rate);
                          setNewRateValue(rate.rateToNzd);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Rate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit FX Rate Modal */}
      {editingRate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-600" /> Edit FX Spot Rate for {editingRate.code}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRate(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Spot Exchange Rate (1 {editingRate.code} = ? NZD)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-black font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Inverse: 1 NZD = {(newRateValue > 0 ? 1 / newRateValue : 0).toFixed(4)} {editingRate.code}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Exchange Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
