import React, { useState } from 'react';
import {
  Tractor,
  Hammer,
  Utensils,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Percent,
  Calculator,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { AppState, IndustryTaxProfile } from '../types';

interface IndustryTaxProfilesViewProps {
  appState: AppState;
  onUpdateIndustryProfile?: (profile: IndustryTaxProfile) => void;
}

export const IndustryTaxProfilesView: React.FC<IndustryTaxProfilesViewProps> = ({
  appState,
  onUpdateIndustryProfile,
}) => {
  const [activeIndustry, setActiveIndustry] = useState<
    'FARMING_AGRICULTURE' | 'CONSTRUCTION_TRADES' | 'HOSPITALITY_RETAIL' | 'HEALTHCARE_MEDICAL'
  >('FARMING_AGRICULTURE');

  // Farming state
  const [stockValuationMethod, setStockValuationMethod] = useState<'HERD_SCHEME' | 'NATIONAL_STANDARD_COST'>('HERD_SCHEME');
  const [dairyHeadCount, setDairyHeadCount] = useState('250');
  const [herdSchemeValuePerHead, setHerdSchemeValuePerHead] = useState('1850'); // IRD National Average Market Value
  const [incomeEqualisationDeposit, setIncomeEqualisationDeposit] = useState('25000'); // Income equalisation scheme

  // Construction state
  const [retentionTrustBalance, setRetentionTrustBalance] = useState('45000');
  const [retentionsHeldByClients, setRetentionsHeldByClients] = useState('68000');
  const [retentionsHeldForSubcontractors, setRetentionsHeldForSubcontractors] = useState('32000');

  // Hospitality state
  const [tipsGratuities, setTipsGratuities] = useState('12500');
  const [staffMealsValue, setStaffMealsValue] = useState('4800');

  // Healthcare state
  const [gstExemptConsultations, setGstExemptConsultations] = useState('280000');
  const [gstRatedProducts, setGstRatedProducts] = useState('65000');

  // Calculations
  const farmingStockTotalValue = (parseFloat(dairyHeadCount) || 0) * (parseFloat(herdSchemeValuePerHead) || 0);
  const healthcareTotalRev = (parseFloat(gstExemptConsultations) || 0) + (parseFloat(gstRatedProducts) || 0);
  const healthcareGstClaimablePct = healthcareTotalRev > 0 ? ((parseFloat(gstRatedProducts) || 0) / healthcareTotalRev) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-900/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
            <Tractor className="w-3.5 h-3.5 text-emerald-400" />
            <span>NZ Industry-Specific Tax Profiles & Specialized Valuation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Industry Tax Rules & Valuation Engine</h1>
          <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
            Tailored IRD tax rule engine for Farming Herd Scheme vs NSC stock valuation, Construction Retention Money Act compliance, Hospitality tip tax & entertainment rules, and Medical GST exemptions.
          </p>
        </div>

        {/* Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-900/60">
          <button
            type="button"
            onClick={() => setActiveIndustry('FARMING_AGRICULTURE')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
              activeIndustry === 'FARMING_AGRICULTURE'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Tractor className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-black">Farming & Ag</div>
              <div className="text-[10px] opacity-80">Herd Scheme vs NSC</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveIndustry('CONSTRUCTION_TRADES')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
              activeIndustry === 'CONSTRUCTION_TRADES'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Hammer className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-black">Construction</div>
              <div className="text-[10px] opacity-80">Retention Money Trust</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveIndustry('HOSPITALITY_RETAIL')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
              activeIndustry === 'HOSPITALITY_RETAIL'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Utensils className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-black">Hospitality</div>
              <div className="text-[10px] opacity-80">Tips & 50% Ent.</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveIndustry('HEALTHCARE_MEDICAL')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
              activeIndustry === 'HEALTHCARE_MEDICAL'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg'
                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-black">Healthcare</div>
              <div className="text-[10px] opacity-80">GST Exemptions</div>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      {activeIndustry === 'FARMING_AGRICULTURE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Livestock Valuation & Income Equalisation</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Livestock Valuation Scheme</label>
              <select
                value={stockValuationMethod}
                onChange={(e) => setStockValuationMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="HERD_SCHEME">Herd Scheme (National Average Market Value - Capital Tax Exempt)</option>
                <option value="NATIONAL_STANDARD_COST">National Standard Cost (NSC) (Cost of Production)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dairy Cattle Head Count</label>
                <input
                  type="number"
                  value={dairyHeadCount}
                  onChange={(e) => setDairyHeadCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IRD Market Rate ($ / Head)</label>
                <input
                  type="number"
                  value={herdSchemeValuePerHead}
                  onChange={(e) => setHerdSchemeValuePerHead(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Income Equalisation Scheme Account Deposit ($ NZD)</label>
              <input
                type="number"
                value={incomeEqualisationDeposit}
                onChange={(e) => setIncomeEqualisationDeposit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Deductible in year of deposit, taxable upon withdrawal</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold border-b border-slate-800 pb-3 text-emerald-400">Farming Tax Valuation Summary</h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Total Livestock Herd Valuation:</span>
                <span className="font-bold text-emerald-300">${farmingStockTotalValue.toLocaleString()} NZD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Income Equalisation Tax Deduction:</span>
                <span className="font-bold text-emerald-300">-${parseFloat(incomeEqualisationDeposit || '0').toLocaleString()} NZD</span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-200 mt-2 font-sans">
                <span className="font-bold block text-xs">Herd Scheme Tax Advantage:</span>
                <p className="text-[10px] mt-1 text-slate-300">
                  Under the Herd Scheme, any increase in livestock value is treated as tax-exempt capital gain under Section EC 14 of the NZ Income Tax Act 2007.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeIndustry === 'CONSTRUCTION_TRADES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Retention Money Trust Account (Building Act Compliance)</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Retention Trust Bank Account Balance ($ NZD)</label>
              <input
                type="number"
                value={retentionTrustBalance}
                onChange={(e) => setRetentionTrustBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Retentions Withheld for Subcontractors ($ NZD)</label>
              <input
                type="number"
                value={retentionsHeldForSubcontractors}
                onChange={(e) => setRetentionsHeldForSubcontractors(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold border-b border-slate-800 pb-3 text-sky-400">Retention Money Act Compliance Status</h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Subcontractor Retentions Required:</span>
                <span>${parseFloat(retentionsHeldForSubcontractors || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-400">Trust Bank Account Funded:</span>
                <span>${parseFloat(retentionTrustBalance || '0').toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                {parseFloat(retentionTrustBalance) >= parseFloat(retentionsHeldForSubcontractors) ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Retention Trust Fully Funded & Compliant
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Trust Deficit - Underfunded by ${Math.abs(parseFloat(retentionTrustBalance) - parseFloat(retentionsHeldForSubcontractors)).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeIndustry === 'HOSPITALITY_RETAIL' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Hospitality Tip Tax, Gratuity & Staff Meals</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tips & Gratuities Collected ($ NZD)</label>
              <input
                type="number"
                value={tipsGratuities}
                onChange={(e) => setTipsGratuities(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Taxable income under IRD PAYE schedular rules</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Staff Meals Provided Value ($ NZD)</label>
              <input
                type="number"
                value={staffMealsValue}
                onChange={(e) => setStaffMealsValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Exempt from FBT if provided on premises during shifts</span>
            </div>
          </div>
        </div>
      )}

      {activeIndustry === 'HEALTHCARE_MEDICAL' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Medical Consultation GST Exemptions vs Product Sales</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GST Exempt Consultation Revenue ($ NZD)</label>
              <input
                type="number"
                value={gstExemptConsultations}
                onChange={(e) => setGstExemptConsultations(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Exempt under Section 14 of Goods and Services Tax Act 1985</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">15% GST Rated Product / Cosmetic Sales ($ NZD)</label>
              <input
                type="number"
                value={gstRatedProducts}
                onChange={(e) => setGstRatedProducts(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
            <div>
              <span className="font-bold text-xs text-slate-300 block">Proportionate Apportionment GST Input Credit:</span>
              <span className="text-[10px] text-slate-400">Calculated GST Input Deduction Ratio: {healthcareGstClaimablePct.toFixed(1)}%</span>
            </div>
            <span className="font-black text-lg font-mono text-emerald-400">{healthcareGstClaimablePct.toFixed(1)}% GST Apportioned</span>
          </div>
        </div>
      )}
    </div>
  );
};
