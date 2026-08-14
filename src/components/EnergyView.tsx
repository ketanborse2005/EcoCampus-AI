import React, { useState } from 'react';
import {
  Zap,
  Sun,
  Lightbulb,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Leaf,
  CheckCircle2
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
  Line
} from 'recharts';
import { EnergyRecord, BuildingSummary, AnomalyItem, SustainabilityAction } from '../types';

interface EnergyViewProps {
  energyData: EnergyRecord[];
  buildingSummaries: BuildingSummary[];
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
  emissionFactor: number;
}

export const EnergyView: React.FC<EnergyViewProps> = ({
  energyData,
  buildingSummaries,
  anomalies,
  recommendations,
  emissionFactor = 0.7,
}) => {
  // Solar & LED Retrofit Simulator State
  const [solarKwP, setSolarKwP] = useState<number>(50);
  const [ledCount, setLedCount] = useState<number>(400);
  const [electricityTariff, setElectricityTariff] = useState<number>(0.14); // $/kWh

  // Simulator math
  const estimatedSolarGenerationAnnualKwh = solarKwP * 1450; // ~1450 kWh / kWp / yr typical solar yield
  const estimatedLedSavingsAnnualKwh = ledCount * (36 - 14) * 10 * 300 * 0.001; // 22W savings * 10hrs/day * 300 days
  const totalSimulatedSavingsKwh = estimatedSolarGenerationAnnualKwh + estimatedLedSavingsAnnualKwh;
  const totalCostSavingsAnnual = totalSimulatedSavingsKwh * electricityTariff;
  const totalCarbonAvoidedKg = totalSimulatedSavingsKwh * emissionFactor;

  // Chart data: By building total & per student
  const buildingChartData = buildingSummaries.map((b) => ({
    name: b.building,
    totalKwh: b.totalElectricityKwh,
    perStudentKwh: b.electricityPerStudent,
  }));

  // Chart data: Monthly line chart per building
  const dates = Array.from<string>(new Set(energyData.map((e) => e.date))).sort();
  const buildings = Array.from<string>(new Set(energyData.map((e) => e.building)));

  const monthlyTimelineData = dates.map((date) => {
    const row: Record<string, string | number> = { date: date.slice(0, 7) };
    buildings.forEach((b) => {
      const match = energyData.find((e) => e.date === date && e.building === b);
      row[b] = match ? match.electricity_kwh : 0;
    });
    return row;
  });

  const energyColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

  const energyAnomalies = anomalies.filter((a) => a.resource === 'energy');
  const energyRecs = recommendations.filter((r) => r.area === 'Energy' || r.area === 'Cross-Campus');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Energy & Electricity Intelligence</h2>
              <p className="text-xs text-slate-500">
                Building load profiling, per-student intensity benchmarks, and rooftop solar/LED feasibility simulator.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            Emission Factor: <span className="font-bold">{emissionFactor} kg CO₂e / kWh</span>
          </div>
        </div>
      </div>

      {/* Main Visualizations: Building Total & Per Student */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Electricity Consumption Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Electricity Consumption by Building (kWh)</h3>
              <p className="text-xs text-slate-500">Cumulative kilowatt-hours monitored across recording cycles</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} kWh`, 'Electricity']}
                />
                <Bar dataKey="totalKwh" name="Total Electricity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Electricity per student bar chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Electricity Per Student (kWh / Occupant)</h3>
              <p className="text-xs text-slate-500">Normalized intensity accounting for building student occupancy</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} kWh / occupant`, 'Per Student']}
                />
                <Bar dataKey="perStudentKwh" name="kWh / Student" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Consumption Trend Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Electricity Consumption Trends by Facility</h3>
            <p className="text-xs text-slate-500">Comparing month-over-month trajectories to isolate persistent vs transient spikes</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span>Monthly Timeseries</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTimelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {buildings.map((b, i) => (
                <Line
                  key={b}
                  type="monotone"
                  dataKey={b}
                  name={b}
                  stroke={energyColors[i % energyColors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Rooftop Solar & LED Retrofit Simulator */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50/40 p-6 rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-amber-200/80">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Solar PV & LED Retrofit Feasibility Simulator
              </h3>
              <p className="text-xs text-slate-600">
                Model capital ROI, electricity offset, and carbon reduction scenarios in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Sliders Control Panel */}
          <div className="space-y-4 md:col-span-1 bg-white p-4 rounded-xl border border-amber-200/60">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Rooftop Solar Capacity</span>
                <span className="font-bold text-amber-700">{solarKwP} kWp</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="10"
                value={solarKwP}
                onChange={(e) => setSolarKwP(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
              <span className="text-[10px] text-slate-400">~{solarKwP * 6.5} m² unshaded roof required</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Fluorescent → LED Retrofits</span>
                <span className="font-bold text-amber-700">{ledCount} Fixtures</span>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="50"
                value={ledCount}
                onChange={(e) => setLedCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
              <span className="text-[10px] text-slate-400">Classroom & corridor lighting tubes</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Grid Tariff ($/kWh)</span>
                <span className="font-bold text-amber-700">${electricityTariff.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.30"
                step="0.01"
                value={electricityTariff}
                onChange={(e) => setElectricityTariff(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
            </div>
          </div>

          {/* Outcome Projection Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Energy Saved</span>
              <div className="my-2">
                <div className="text-2xl font-black text-amber-600">
                  {(totalSimulatedSavingsKwh / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-600">MWh/yr</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Solar: {(estimatedSolarGenerationAnnualKwh / 1000).toFixed(1)} MWh • LED: {(estimatedLedSavingsAnnualKwh / 1000).toFixed(1)} MWh
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Offsets grid dependency</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Savings</span>
              <div className="my-2">
                <div className="text-2xl font-black text-emerald-600">
                  ${Math.round(totalCostSavingsAnnual).toLocaleString()} <span className="text-sm font-semibold text-slate-600">/ yr</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Estimated payback: {solarKwP > 0 ? '3.2 - 4.1 years' : '< 8 months'}
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Recurring budget relief</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Carbon Abatement</span>
              <div className="my-2">
                <div className="text-2xl font-black text-teal-700">
                  {(totalCarbonAvoidedKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-600">MT CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Equivalent to planting {Math.round(totalCarbonAvoidedKg / 22)} mature trees
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Direct Scope 2 reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Anomalies and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Electricity Anomaly Detections</span>
            </h3>
            <span className="text-xs text-slate-500">{energyAnomalies.length} Flagged</span>
          </div>

          <div className="space-y-3">
            {energyAnomalies.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">{a.building}</span>
                  <span className="text-amber-700">+{a.percentageChange}% Spike ({a.date})</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{a.possibleCause}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <span className="text-emerald-700">Action:</span> {a.recommendedAction}
                </div>
              </div>
            ))}

            {energyAnomalies.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No energy spikes detected in sample window.</p>
            )}
          </div>
        </div>

        {/* Top Energy Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Recommended Energy Retrofits</span>
            </h3>
            <span className="text-xs text-slate-500">{energyRecs.length} Actions</span>
          </div>

          <div className="space-y-3">
            {energyRecs.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">{r.title}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Score: {r.priorityScore}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{r.reasoning}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Payback: <strong className="text-slate-700">{r.paybackTime}</strong></span>
                  <span>CO₂ offset: <strong className="text-emerald-600">~{r.co2ReductionEstimateKg} kg/yr</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
