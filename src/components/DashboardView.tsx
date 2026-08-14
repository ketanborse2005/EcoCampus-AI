import React from 'react';
import {
  Zap,
  Droplets,
  Trash2,
  Leaf,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Award,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Bot,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  BuildingSummary,
  CarbonMetrics,
  AnomalyItem,
  SustainabilityAction,
  EnergyRecord,
  WaterRecord,
  WasteRecord
} from '../types';
import { ActiveTab } from './Navbar';

interface DashboardViewProps {
  buildingSummaries: BuildingSummary[];
  carbonMetrics: CarbonMetrics;
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
  energyData: EnergyRecord[];
  waterData: WaterRecord[];
  wasteData: WasteRecord[];
  onNavigateTab: (tab: ActiveTab) => void;
  onAskQuestion: (query: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  buildingSummaries,
  carbonMetrics,
  anomalies,
  recommendations,
  energyData,
  waterData,
  wasteData,
  onNavigateTab,
  onAskQuestion,
}) => {
  const topBuilding = buildingSummaries[0];
  const topAction = recommendations[0];

  const totalKwh = buildingSummaries.reduce((a, b) => a + b.totalElectricityKwh, 0);
  const totalWaterLiters = buildingSummaries.reduce((a, b) => a + b.totalWaterLiters, 0);
  const totalWasteKg = buildingSummaries.reduce((a, b) => a + b.totalWasteKg, 0);

  // Chart data: Building comparative
  const comparativeChartData = buildingSummaries.map((b) => ({
    name: b.building,
    electricity: Math.round(b.totalElectricityKwh / 1000), // in MWh or k-kWh
    water: Math.round(b.totalWaterLiters / 10000), // in 10k Liters
    waste: Math.round(b.totalWasteKg / 100), // in 100 kg
    score: b.priorityScore,
    kwhPerStudent: b.electricityPerStudent,
    litersPerStudent: b.waterPerStudent,
  }));

  // Chart data: Monthly aggregated trend
  const dates = Array.from<string>(new Set(energyData.map((d) => d.date))).sort();
  const monthlyTrendsData = dates.map((date) => {
    const kwh = energyData.filter((e) => e.date === date).reduce((a, b) => a + b.electricity_kwh, 0);
    const water = waterData.filter((w) => w.date === date).reduce((a, b) => a + b.water_liters, 0);
    const waste = wasteData.filter((wRec) => wRec.date === date).reduce((a, b) => a + b.total_waste_kg, 0);

    return {
      date: date.slice(0, 7),
      Electricity: Math.round(kwh / 1000),
      Water: Math.round(water / 10000),
      Waste: Math.round(waste / 10),
    };
  });

  // Carbon breakdown
  const carbonPieData = [
    { name: 'Electricity (Grid)', value: carbonMetrics.energyCarbonKg, color: '#f59e0b' },
    { name: 'Water Pumping', value: carbonMetrics.waterCarbonKg, color: '#3b82f6' },
    { name: 'Landfill Waste', value: carbonMetrics.wasteCarbonKg, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Sleek KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Energy */}
        <div
          id="kpi-card-electricity"
          onClick={() => onNavigateTab('energy')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Energy</span>
            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">-4.2%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {(totalKwh).toLocaleString()} <span className="text-sm font-normal text-slate-400">kWh</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
              <span>Per Student:</span>
              <span className="font-semibold text-slate-600">
                {(totalKwh / (buildingSummaries.reduce((a, b) => a + b.occupancyAvg, 0) || 1)).toFixed(1)} kWh
              </span>
            </div>
          </div>
        </div>

        {/* Water Usage */}
        <div
          id="kpi-card-water"
          onClick={() => onNavigateTab('water')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Water Usage</span>
            <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">+1.8%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {(totalWaterLiters / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-slate-400">k-Liters</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
              <span>Per Student:</span>
              <span className="font-semibold text-slate-600">
                {(totalWaterLiters / (buildingSummaries.reduce((a, b) => a + b.occupancyAvg, 0) || 1)).toFixed(0)} L
              </span>
            </div>
          </div>
        </div>

        {/* Waste Generated */}
        <div
          id="kpi-card-waste"
          onClick={() => onNavigateTab('waste')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waste Generated</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">Stable</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {(totalWasteKg / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">Tons</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
              <span>Per Student:</span>
              <span className="font-semibold text-slate-600">
                {(totalWasteKg / (buildingSummaries.reduce((a, b) => a + b.occupancyAvg, 0) || 1)).toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Carbon Estimate */}
        <div
          id="kpi-card-carbon"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carbon Estimate</span>
            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">-3.1%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {(carbonMetrics.netCarbonKg / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">tCO2e</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
              <span>Recycled Offset:</span>
              <span className="font-semibold text-emerald-600">
                -{(carbonMetrics.avoidedCarbonKg / 1000).toFixed(1)} MT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Benchmarking & Prompts), Right Column (Agent Pipeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Campus Resource Benchmarking Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Campus Resource Benchmarking</h3>
                <p className="text-xs text-slate-500">Comparative electricity and water telemetry by building zone</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  Energy (MWh)
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                  Water (10k L)
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/50"></span>
                  Waste (100 kg)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="electricity" name="Energy (MWh)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="water" name="Water (10k L)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="waste" name="Waste (100 kg)" fill="#a7f3d0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleek AI Prompt Interactive Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
            <div className="flex items-center gap-3.5 flex-1 w-full">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/50">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div className="text-xs sm:text-sm italic text-slate-300 truncate">
                “Which building should we prioritize for resource conservation?”
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn-dash-ask-building"
                onClick={() => onAskQuestion('Which building should we prioritize for resource-saving actions?')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-white whitespace-nowrap cursor-pointer"
              >
                Ask AI Agent
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Agent Reasoning Pipeline Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Agent Reasoning Pipeline
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Live Audit</span>
              </div>

              {/* Vertical Pipeline Trace */}
              <div className="flex flex-col gap-3.5 relative mb-4">
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-100"></div>

                {/* Step 1 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">Coordinator Agent</div>
                    <div className="text-[11px] text-slate-500">Scanning monthly consumption deltas across 4 zones...</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">Anomaly Detection</div>
                    <div className="text-[11px] text-slate-500">
                      {anomalies.length > 0
                        ? `Flagged ${anomalies[0].percentageChange}% ${anomalies[0].resource} spike in ${anomalies[0].building}`
                        : 'No critical sensor anomalies detected'}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">Carbon Accounting</div>
                    <div className="text-[11px] text-slate-500">
                      Net footprint evaluated at {(carbonMetrics.netCarbonKg / 1000).toFixed(1)} MT CO₂e
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight text-slate-600">
                      Recommendation Agent
                    </div>
                    <div className="text-[11px] text-slate-500">Multi-criteria feasibility & payback scoring complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Priority Action Card */}
            <div className="pt-4 border-t border-slate-100 mt-2">
              {topAction ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1 tracking-wider">
                    Priority Action #01 • {topAction.targetBuilding}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 leading-tight mb-2">
                    {topAction.title}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-600 font-medium italic">
                      Payback: {topAction.paybackTime}
                    </span>
                    <button
                      onClick={() => onNavigateTab('agent-studio')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center py-2">
                  No active actions. Run diagnostic audit.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Timeline & Zone Ranking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Timeline */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Consumption Trajectory</h3>
              <p className="text-xs text-slate-500">Aggregate consumption trends across all monitored periods</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Month</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Electricity" name="Electricity (MWh)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Water" name="Water (10k L)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Waste" name="Waste (10 kg)" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly & Risk Alarms */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">Active Diagnostic Alarms</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                {anomalies.length} Flagged
              </span>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-amber-50/30 transition-colors flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {anom.building} • <span className="text-rose-600 font-bold">+{anom.percentageChange}% {anom.resource}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{anom.possibleCause}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
                    {anom.date}
                  </span>
                </div>
              ))}

              {anomalies.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  All telemetry values within normal baseline limits.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Ranked priority calculated via weighted matrix</span>
            <button
              onClick={() => onNavigateTab('agent-studio')}
              className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
            >
              <span>Investigate</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Criteria Prioritized Recommendations Feed */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Ranked Sustainability Interventions</h3>
            <p className="text-xs text-slate-400">
              Formula: 0.4(Usage) + 0.3(Growth) + 0.2(Impact) + 0.1(Feasibility)
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('agent-studio')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Agent Studio</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Priority #{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Score: {rec.priorityScore}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{rec.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {rec.reasoning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Target:</span>
                  <span className="font-semibold text-slate-800">{rec.targetBuilding}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Payback:</span>
                  <span className="font-semibold text-slate-800">{rec.paybackTime}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CO₂ Avoidance:</span>
                  <span className="font-semibold text-emerald-600">~{rec.co2ReductionEstimateKg} kg/yr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
