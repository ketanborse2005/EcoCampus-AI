import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building,
  Sparkles,
  Award,
  Layers,
  Leaf
} from 'lucide-react';
import {
  BuildingSummary,
  CarbonMetrics,
  AnomalyItem,
  SustainabilityAction,
  EmissionFactors
} from '../types';
import { exportSustainabilityReportPDF } from '../utils/pdfExport';

interface ReportsViewProps {
  campusName: string;
  buildingSummaries: BuildingSummary[];
  carbonMetrics: CarbonMetrics;
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
  emissionFactors: EmissionFactors;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  campusName,
  buildingSummaries,
  carbonMetrics,
  anomalies,
  recommendations,
  emissionFactors,
}) => {
  const [reportTitle, setReportTitle] = useState('Campus Resource & Decarbonization Roadmap');
  const [period, setPeriod] = useState('January - April 2026');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);

  const topBuilding = buildingSummaries[0];
  const totalKwh = buildingSummaries.reduce((a, b) => a + b.totalElectricityKwh, 0);
  const totalWater = buildingSummaries.reduce((a, b) => a + b.totalWaterLiters, 0);
  const totalWaste = buildingSummaries.reduce((a, b) => a + b.totalWasteKg, 0);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      exportSustainabilityReportPDF({
        campusName,
        reportingPeriod: period,
        buildingSummaries,
        carbonMetrics,
        anomalies,
        recommendations,
        factors: emissionFactors,
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Executive Sustainability Reports</h2>
              <p className="text-xs text-slate-500">
                Compile institutional sustainability audits, GHG emission disclosures, and ranked facility action briefs.
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-download-pdf-report"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'Synthesizing PDF...' : 'Download Official PDF Report'}</span>
        </button>
      </div>

      {/* Report Customizer Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700">Report Document Title</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700">Reporting Interval</label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700">Target Facility Scope</label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
          >
            <option value="All">All Campus Facilities ({buildingSummaries.length} Buildings)</option>
            {buildingSummaries.map((b) => (
              <option key={b.building} value={b.building}>
                {b.building}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Document Preview Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 max-w-4xl mx-auto space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-700 pb-6 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              EcoCampus AI • Decision Support System
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{reportTitle}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Institution: <strong className="text-slate-700">{campusName}</strong> | Period: {period}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">Date Generated</span>
            <div className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>1. Executive Summary & Top Prioritization</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            During the audit period, the campus consumed a total of{' '}
            <strong>{Math.round(totalKwh).toLocaleString()} kWh</strong> of electricity,{' '}
            <strong>{Math.round(totalWater / 1000).toLocaleString()} kL</strong> of water, and generated{' '}
            <strong>{Math.round(totalWaste / 1000).toLocaleString()} tonnes</strong> of waste. The resulting gross carbon
            footprint is <strong>{(carbonMetrics.totalCarbonKg / 1000).toFixed(1)} MT CO₂e</strong>, with{' '}
            <strong>{(carbonMetrics.avoidedCarbonKg / 1000).toFixed(1)} MT CO₂e</strong> avoided via recycling and composting.
          </p>
          {topBuilding && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800">
              <strong>Top Priority Facility: {topBuilding.building} (Priority Score: {topBuilding.priorityScore}/100)</strong>
              <p className="mt-1 text-slate-600">
                Identified as the highest-priority intervention zone due to elevated per-student water intensity (
                {topBuilding.waterPerStudent} L/student) and active anomaly surges. An immediate acoustic leak audit and
                float valve overhaul is recommended.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Building Resource Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>2. Building Telemetry & Priority Breakdown</span>
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">Building</th>
                  <th className="px-3 py-2 text-right">Electricity (kWh)</th>
                  <th className="px-3 py-2 text-right">Water (Liters)</th>
                  <th className="px-3 py-2 text-right">Waste (kg)</th>
                  <th className="px-3 py-2 text-right">Per-Capita (kWh)</th>
                  <th className="px-3 py-2 text-right font-black text-emerald-800">Priority Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buildingSummaries.map((b) => (
                  <tr key={b.building}>
                    <td className="px-3 py-2 font-bold text-slate-900">{b.building}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{b.totalElectricityKwh.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{b.totalWaterLiters.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{b.totalWasteKg.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{b.electricityPerStudent}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700">{b.priorityScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Prioritized Action Roadmap */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>3. Recommended Sustainability Interventions</span>
          </h2>

          <div className="space-y-2.5">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={rec.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>#{idx + 1} {rec.title} ({rec.area})</span>
                  <span className="text-emerald-700">Score: {rec.priorityScore}/100</span>
                </div>
                <p className="text-slate-600 mt-1">{rec.reasoning}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex gap-4">
                  <span>Target: <strong>{rec.targetBuilding}</strong></span>
                  <span>Cost: <strong>{rec.estimatedCost}</strong></span>
                  <span>Payback: <strong>{rec.paybackTime}</strong></span>
                  <span>Offset: <strong>~{rec.co2ReductionEstimateKg} kg CO₂e/yr</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Responsible AI Statement */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <strong>Decision-Support Notice & Governance:</strong>
          <p>
            EcoCampus AI recommendations are generated through multi-agent heuristics and statistical anomaly models.
            All proposed capital retrofits, solar capacities, and leak repairs must be verified by licensed campus facility
            engineers prior to procurement.
          </p>
        </div>
      </div>
    </div>
  );
};
