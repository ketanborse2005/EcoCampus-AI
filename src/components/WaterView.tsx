import React, { useState } from 'react';
import {
  Droplets,
  AlertTriangle,
  TrendingUp,
  Activity,
  Sliders,
  DollarSign,
  CheckCircle2,
  Filter,
  Layers
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
import { WaterRecord, BuildingSummary, AnomalyItem, SustainabilityAction } from '../types';

interface WaterViewProps {
  waterData: WaterRecord[];
  buildingSummaries: BuildingSummary[];
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
}

export const WaterView: React.FC<WaterViewProps> = ({
  waterData,
  buildingSummaries,
  anomalies,
  recommendations,
}) => {
  // Simulator state: Low flow aerators & Leak fixing
  const [aeratorCount, setAeratorCount] = useState<number>(150);
  const [leakFixEfficiencyPct, setLeakFixEfficiencyPct] = useState<number>(20);

  const totalWaterLiters = buildingSummaries.reduce((a, b) => a + b.totalWaterLiters, 0);

  // Simulation calculations
  const annualAeratorSavingsLiters = aeratorCount * 6 * 15 * 300; // ~6 L/min saved * 15 mins/day * 300 days = 27k L / aerator
  const annualLeakSavingsLiters = (totalWaterLiters * (leakFixEfficiencyPct / 100)) * 2; // Multiplied for annual projection
  const totalSimulatedWaterSavedLiters = annualAeratorSavingsLiters + annualLeakSavingsLiters;
  const pumpingEnergySavedKwh = (totalSimulatedWaterSavedLiters / 1000) * 0.5; // ~0.5 kWh per 1000L pumping energy
  const avoidedCarbonKg = pumpingEnergySavedKwh * 0.7;

  // Chart data: By building total & per student
  const buildingChartData = buildingSummaries.map((b) => ({
    name: b.building,
    totalLitersK: Math.round(b.totalWaterLiters / 1000),
    perStudentLiters: b.waterPerStudent,
  }));

  // Monthly trends by building
  const dates = Array.from<string>(new Set(waterData.map((w) => w.date))).sort();
  const buildings = Array.from<string>(new Set(waterData.map((w) => w.building)));

  const monthlyTimelineData = dates.map((date) => {
    const row: Record<string, string | number> = { date: date.slice(0, 7) };
    buildings.forEach((b) => {
      const match = waterData.find((w) => w.date === date && w.building === b);
      row[b] = match ? Math.round(match.water_liters / 1000) : 0;
    });
    return row;
  });

  const waterColors = ['#0284c7', '#38bdf8', '#0d9488', '#2563eb', '#6366f1', '#06b6d4', '#0ea5e9'];
  const waterAnomalies = anomalies.filter((a) => a.resource === 'water');
  const waterRecs = recommendations.filter((r) => r.area === 'Water' || r.area === 'Cross-Campus');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Water Conservation Intelligence</h2>
            <p className="text-xs text-slate-500">
              Flow auditing, hidden pipe leak detection, hostel per-capita intensity, and low-flow fixtures simulator.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
          Total Water Monitored: <span className="font-bold">{(totalWaterLiters / 1000000).toFixed(2)} Million Liters</span>
        </div>
      </div>

      {/* Main Charts: Building Consumption & Per-Student Intensity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Water Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Total Water Consumption by Building (kL)</h3>
              <p className="text-xs text-slate-500">Thousand Liters monitored across recorded intervals</p>
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
                  formatter={(val: any) => [`${Number(val).toLocaleString()} kL (${(Number(val) * 1000).toLocaleString()} L)`, 'Water']}
                />
                <Bar dataKey="totalLitersK" name="Water (kL)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water per student bar chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Water Usage Per Student (Liters / Occupant)</h3>
              <p className="text-xs text-slate-500">Per-capita benchmarking highlights residential hostel load</p>
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
                  formatter={(val: any) => [`${val} Liters / occupant`, 'Per Student']}
                />
                <Bar dataKey="perStudentLiters" name="Liters / Student" fill="#0369a1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Water Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Water Consumption Timeline (kL)</h3>
            <p className="text-xs text-slate-500">Sudden upward divergence in single buildings indicates piping ruptures</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
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
                  stroke={waterColors[i % waterColors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Low-Flow & Leak Audit Simulator */}
      <div className="bg-gradient-to-br from-blue-500/10 via-white to-blue-50/40 p-6 rounded-2xl border border-blue-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-blue-200/80">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Water Efficiency & Leak Mitigation Simulator
              </h3>
              <p className="text-xs text-slate-600">
                Calculate the campus water volume and pumping energy conserved through aerator retrofits and leak rectification.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Controls */}
          <div className="space-y-4 md:col-span-1 bg-white p-4 rounded-xl border border-blue-200/60">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Low-Flow Tap Aerators</span>
                <span className="font-bold text-blue-700">{aeratorCount} Units</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={aeratorCount}
                onChange={(e) => setAeratorCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
              />
              <span className="text-[10px] text-slate-400">Restroom, lab, and pantry faucets</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Leak Reduction Target</span>
                <span className="font-bold text-blue-700">{leakFixEfficiencyPct}% Reduction</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={leakFixEfficiencyPct}
                onChange={(e) => setLeakFixEfficiencyPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
              />
              <span className="text-[10px] text-slate-400">Acoustic valve repairs & cistern flushes</span>
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-blue-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Water Saved</span>
              <div className="my-2">
                <div className="text-2xl font-black text-blue-600">
                  {(totalSimulatedWaterSavedLiters / 1000000).toFixed(2)} <span className="text-sm font-semibold text-slate-600">Million L</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ~{Math.round(totalSimulatedWaterSavedLiters / 1000).toLocaleString()} kL conserved
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Preserves local groundwater table</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pumping Power Saved</span>
              <div className="my-2">
                <div className="text-2xl font-black text-emerald-600">
                  {Math.round(pumpingEnergySavedKwh).toLocaleString()} <span className="text-sm font-semibold text-slate-600">kWh/yr</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reduced pump runtime across overhead sumps
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Reduces pump wear and electricity tariff</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pumping Carbon Offset</span>
              <div className="my-2">
                <div className="text-2xl font-black text-teal-700">
                  {Math.round(avoidedCarbonKg).toLocaleString()} <span className="text-sm font-semibold text-slate-600">kg CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Scope 2 pumping indirect emissions eliminated
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Calculated with 0.35 kg/kL factor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Water Anomalies and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span>Water Anomaly & Leak Alarms</span>
            </h3>
            <span className="text-xs text-slate-500">{waterAnomalies.length} Flagged</span>
          </div>

          <div className="space-y-3">
            {waterAnomalies.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">{a.building}</span>
                  <span className="text-blue-700">+{a.percentageChange}% Surge ({a.date})</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{a.possibleCause}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <span className="text-emerald-700">Action:</span> {a.recommendedAction}
                </div>
              </div>
            ))}

            {waterAnomalies.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No sudden water leaks detected in sample window.</p>
            )}
          </div>
        </div>

        {/* Top Water Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Recommended Water Interventions</span>
            </h3>
            <span className="text-xs text-slate-500">{waterRecs.length} Actions</span>
          </div>

          <div className="space-y-3">
            {waterRecs.map((r) => (
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
                  <span>Target: <strong className="text-slate-800">{r.targetBuilding}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
