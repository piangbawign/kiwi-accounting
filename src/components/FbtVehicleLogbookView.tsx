import React, { useState } from 'react';
import {
  Car,
  Plus,
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Navigation,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { AppState, VehicleLogbookEntry } from '../types';

interface FbtVehicleLogbookViewProps {
  appState: AppState;
  onUpdateLogbook?: (entries: VehicleLogbookEntry[]) => void;
}

export const FbtVehicleLogbookView: React.FC<FbtVehicleLogbookViewProps> = ({
  appState,
  onUpdateLogbook,
}) => {
  const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'LOGBOOK'>('CALCULATOR');
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // FBT Vehicle Calculator Inputs
  const [vehicleCostPrice, setVehicleCostPrice] = useState('55000'); // GST inclusive cost
  const [fbtValuationMethod, setFbtValuationMethod] = useState<'COST_PRICE' | 'TAX_VALUE'>('COST_PRICE');
  const [daysAvailableForPrivateUse, setDaysAvailableForPrivateUse] = useState('90'); // 90 days in quarter
  const [employeeContributionsQuarter, setEmployeeContributionsQuarter] = useState('0');

  // Digital Logbook Entries
  const [logbookEntries, setLogbookEntries] = useState<VehicleLogbookEntry[]>(
    appState.vehicleLogbookEntries || [
      {
        id: 'LOG-V-01',
        vehicleRegistration: 'K1W1-88',
        vehicleModel: 'Tesla Model Y (Company Fleet)',
        date: '2026-07-20',
        driverName: 'Johnathan Vance',
        startKm: 14200,
        endKm: 14380,
        businessKm: 180,
        personalKm: 0,
        purpose: 'Auckland Client Onsite Audit & Tax Advisory Meeting',
        startLocation: 'CBD HQ',
        destination: 'Albany Business Park',
      },
      {
        id: 'LOG-V-02',
        vehicleRegistration: 'K1W1-88',
        vehicleModel: 'Tesla Model Y (Company Fleet)',
        date: '2026-07-22',
        driverName: 'Sarah Chen-Vance',
        startKm: 14380,
        endKm: 14420,
        businessKm: 25,
        personalKm: 15,
        purpose: 'Bank Document Delivery & Personal Commute',
        startLocation: 'CBD HQ',
        destination: 'Ponsonby Branch',
      },
    ]
  );

  // New Log Form State
  const [reg, setReg] = useState('K1W1-88');
  const [model, setModel] = useState('Tesla Model Y (Company Fleet)');
  const [driver, setDriver] = useState('Johnathan Vance');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startKm, setStartKm] = useState('14420');
  const [endKm, setEndKm] = useState('14550');
  const [businessKmInput, setBusinessKmInput] = useState('130');
  const [purpose, setPurpose] = useState('Hamilton Branch Site Visit');

  // Logbook Totals
  const totalBusinessKm = logbookEntries.reduce((sum, e) => sum + e.businessKm, 0);
  const totalPersonalKm = logbookEntries.reduce((sum, e) => sum + e.personalKm, 0);
  const totalKmDriven = totalBusinessKm + totalPersonalKm;
  const businessUsePercentage = totalKmDriven > 0 ? (totalBusinessKm / totalKmDriven) * 100 : 100;

  // FBT Quarterly Calculation
  // Cost Price Method: 20% of GST inclusive cost price per annum = 5% per quarter (or 20% * days / 365)
  // Tax Value Method: 36% of depreciated tax value per annum = 9% per quarter
  const cost = parseFloat(vehicleCostPrice) || 0;
  const days = parseFloat(daysAvailableForPrivateUse) || 0;
  const employeeContrib = parseFloat(employeeContributionsQuarter) || 0;

  const annualFbtRate = fbtValuationMethod === 'COST_PRICE' ? 0.20 : 0.36;
  const quarterlyFbtRate = annualFbtRate * (days / 365);
  const grossFbtValueQuarter = cost * quarterlyFbtRate;
  const taxableFbtValueQuarter = Math.max(0, grossFbtValueQuarter - employeeContrib);

  // Default NZ FBT single rate is 63.93% (or alternate rate method based on employee salary)
  const fbtTaxPayable6393Pct = taxableFbtValueQuarter * 0.6393;

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(startKm) || 0;
    const end = parseFloat(endKm) || 0;
    const bKm = parseFloat(businessKmInput) || 0;
    const totalDist = Math.max(0, end - start);
    const pKm = Math.max(0, totalDist - bKm);

    const newLog: VehicleLogbookEntry = {
      id: `LOG-V-${Date.now()}`,
      vehicleRegistration: reg,
      vehicleModel: model,
      date: date,
      driverName: driver,
      startKm: start,
      endKm: end,
      businessKm: bKm,
      personalKm: pKm,
      purpose: purpose,
    };

    const updated = [newLog, ...logbookEntries];
    setLogbookEntries(updated);
    if (onUpdateLogbook) onUpdateLogbook(updated);

    setShowAddLogModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
              <Car className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inland Revenue FBT & Motor Vehicle Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">FBT & 90-Day Vehicle Logbook Tracker</h1>
            <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
              Calculate quarterly Fringe Benefit Tax (FBT) for motor vehicles provided to employees/shareholders and maintain a compliant 90-day IRD logbook for work vs personal mileage deduction percentages.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddLogModal(true)}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Log Trip
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/60">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Logbook Business Use</span>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-400">
              {businessUsePercentage.toFixed(1)}%
            </div>
            <span className="text-[10px] text-indigo-300">{totalBusinessKm} km / {totalKmDriven} km total</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">Quarterly Taxable Fringe Benefit</span>
            <div className="text-2xl font-black font-mono mt-1">${taxableFbtValueQuarter.toFixed(2)} NZD</div>
            <span className="text-[10px] text-indigo-300">Based on {days} days private availability</span>
          </div>

          <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
            <span className="text-[11px] font-medium text-indigo-300">Quarterly FBT Tax (63.93% Rate)</span>
            <div className="text-2xl font-black font-mono text-indigo-300 mt-1">${fbtTaxPayable6393Pct.toFixed(2)} NZD</div>
            <span className="text-[10px] text-indigo-300/80">Payable to IRD with FBT Return</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-medium text-indigo-200">IRD 90-Day Rule Status</span>
            <div className="mt-2">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Compliant Logbook
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('CALCULATOR')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'CALCULATOR'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" /> Quarterly FBT Vehicle Calculator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('LOGBOOK')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'LOGBOOK'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4" /> 90-Day Digital Logbook ({logbookEntries.length})
        </button>
      </div>

      {/* Tab 1: FBT Calculator */}
      {activeTab === 'CALCULATOR' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Vehicle FBT Parameters</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Vehicle Cost Price (GST Inclusive) ($ NZD)</label>
              <input
                type="number"
                value={vehicleCostPrice}
                onChange={(e) => setVehicleCostPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valuation Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFbtValuationMethod('COST_PRICE')}
                  className={`p-2.5 rounded-xl border text-center font-bold ${
                    fbtValuationMethod === 'COST_PRICE'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Cost Price (20% p.a.)
                </button>
                <button
                  type="button"
                  onClick={() => setFbtValuationMethod('TAX_VALUE')}
                  className={`p-2.5 rounded-xl border text-center font-bold ${
                    fbtValuationMethod === 'TAX_VALUE'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Tax Value (36% p.a.)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Days Available for Private Use in Quarter</label>
              <input
                type="number"
                min="0"
                max="90"
                value={daysAvailableForPrivateUse}
                onChange={(e) => setDaysAvailableForPrivateUse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Maximum 90 days in standard quarter</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee Contributions in Quarter ($ NZD)</label>
              <input
                type="number"
                value={employeeContributionsQuarter}
                onChange={(e) => setEmployeeContributionsQuarter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Deducted from taxable fringe benefit value</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold border-b border-slate-800 pb-3 text-indigo-300">IRD FBT Quarterly Breakdown</h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Quarterly Rate:</span>
                <span>{(quarterlyFbtRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Gross Fringe Benefit Value:</span>
                <span>${grossFbtValueQuarter.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span className="font-sans">Less Employee Contributions:</span>
                <span>-${employeeContrib.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-800">
                <span className="font-sans text-indigo-200">Taxable Fringe Benefit:</span>
                <span>${taxableFbtValueQuarter.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-indigo-950/80 p-4 rounded-xl border border-indigo-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">Quarterly FBT Liability</span>
              <div className="text-2xl font-black font-mono text-indigo-300">${fbtTaxPayable6393Pct.toFixed(2)} NZD</div>
              <p className="text-[10px] text-indigo-200/80 font-sans mt-1">
                Calculated using IRD standard rate (63.93%). Alternate multi-rate or short-form calculation available on request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 90-Day Digital Logbook */}
      {activeTab === 'LOGBOOK' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Driver & Vehicle</th>
                  <th className="py-3 px-4">Purpose / Journey</th>
                  <th className="py-3 px-4 text-right">Start Odometer</th>
                  <th className="py-3 px-4 text-right">End Odometer</th>
                  <th className="py-3 px-4 text-right">Business km</th>
                  <th className="py-3 px-4 text-right">Personal km</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {logbookEntries.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500">{l.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{l.driverName}</span>
                      <span className="text-[10px] font-mono text-indigo-600">{l.vehicleRegistration}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{l.purpose}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{l.startKm}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{l.endKm}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">+{l.businessKm} km</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-400">+{l.personalKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-indigo-600" /> Log Vehicle Trip
            </h3>

            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  required
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Journey Purpose / Business Reason</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Odometer (km)</label>
                  <input
                    type="number"
                    value={startKm}
                    onChange={(e) => setStartKm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Odometer (km)</label>
                  <input
                    type="number"
                    value={endKm}
                    onChange={(e) => setEndKm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Distance Driven (km)</label>
                <input
                  type="number"
                  value={businessKmInput}
                  onChange={(e) => setBusinessKmInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                  Save Trip Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
