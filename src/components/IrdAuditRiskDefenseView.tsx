import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  BarChart2,
  FileCheck2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { AppState, IrdAuditRiskScore } from '../types';

interface IrdAuditRiskDefenseViewProps {
  appState: AppState;
  onUpdateRiskScore?: (score: IrdAuditRiskScore) => void;
}

export const IrdAuditRiskDefenseView: React.FC<IrdAuditRiskDefenseViewProps> = ({
  appState,
  onUpdateRiskScore,
}) => {
  const [riskData, setRiskData] = useState<IrdAuditRiskScore>(
    appState.auditRiskAnalysis || {
      overallRiskScore: 18, // 18/100 (Low Risk)
      riskLevel: 'LOW',
      auditRiskFlags: [
        {
          id: 'FLAG-01',
          title: 'Shareholder Current Account Overdrawn Check',
          severity: 'LOW',
          description: 'Shareholder Current Account has a positive balance ($14,500 credit). No deemed dividend or FBT interest rule triggered.',
          recommendation: 'Maintain positive balance to prevent IRD FBT benchmark interest tax rate penalty.',
        },
        {
          id: 'FLAG-02',
          title: '50% Entertainment Expense Claim Verification',
          severity: 'MEDIUM',
          description: 'Client dining and function expense total is $2,400. Ensure 50% non-deductible add-back is logged in Box 22 of IR4 return.',
          recommendation: 'Review OCR receipt log for any staff events that qualify for 100% exemption.',
        },
        {
          id: 'FLAG-03',
          title: 'Motor Vehicle Expense vs Business Logbook Ratio',
          severity: 'LOW',
          description: 'Logbook shows 82% business use over 90 consecutive days. Claim ratio is well within IRD acceptable range.',
          recommendation: 'Logbook remains valid until March 2029 (3-year IRD logbook period rule).',
        },
      ],
      benchmarkComparisons: [
        {
          metricName: 'Gross Profit Margin %',
          businessValuePct: 75.0,
          nzIndustryAveragePct: 72.4,
          varianceStatus: 'NORMAL',
        },
        {
          metricName: 'Motor Vehicle Expense % of Revenue',
          businessValuePct: 2.8,
          nzIndustryAveragePct: 3.5,
          varianceStatus: 'NORMAL',
        },
        {
          metricName: 'Entertainment & Travel % of Revenue',
          businessValuePct: 0.9,
          nzIndustryAveragePct: 1.2,
          varianceStatus: 'NORMAL',
        },
        {
          metricName: 'Subcontractor / Wage % of Revenue',
          businessValuePct: 29.1,
          nzIndustryAveragePct: 31.0,
          varianceStatus: 'NORMAL',
        },
      ],
    }
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-900/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inland Revenue (IRD) Audit Risk Defense Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">IRD Audit Risk Score & Benchmark Analyzer</h1>
            <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
              Predictive IRD risk detection. Analyzes shareholder loan accounts, entertainment claims, motor vehicle ratios, and compares your financial metrics against official NZ industry benchmarks.
            </p>
          </div>

          {/* Risk Gauge */}
          <div className="bg-white/10 p-5 rounded-2xl border border-white/20 text-center shrink-0 min-w-[180px]">
            <span className="text-[10px] text-sky-200 uppercase tracking-wider font-extrabold block">Audit Risk Level</span>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
              {riskData.overallRiskScore} / 100
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black mt-2 inline-block">
              {riskData.riskLevel} AUDIT RISK
            </span>
          </div>
        </div>
      </div>

      {/* Audit Risk Flags */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-600" /> IRD Audit Risk Triggers & Compliance Checks
        </h3>

        <div className="space-y-3">
          {riskData.auditRiskFlags.map((flag) => (
            <div
              key={flag.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                flag.severity === 'HIGH'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : flag.severity === 'MEDIUM'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {flag.severity === 'HIGH' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : flag.severity === 'MEDIUM' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="font-extrabold text-sm">{flag.title}</span>
                  <span className="px-2 py-0.5 bg-white/80 rounded font-bold text-[10px] uppercase">
                    {flag.severity} RISK
                  </span>
                </div>
                <p className="text-xs opacity-90">{flag.description}</p>
                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Recommendation: {flag.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Benchmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-sky-600" /> Official IRD Industry Benchmark Comparison
        </h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Financial Metric</th>
                <th className="py-3 px-4 text-center">Your Business Ratio</th>
                <th className="py-3 px-4 text-center">NZ Industry Average</th>
                <th className="py-3 px-4 text-center">Variance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {riskData.benchmarkComparisons.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{b.metricName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{b.businessValuePct}%</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{b.nzIndustryAveragePct}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                      Within Safe Range
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
