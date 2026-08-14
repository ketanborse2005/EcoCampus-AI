import React, { useState } from 'react';
import {
  Trash2,
  Recycle,
  Sprout,
  AlertTriangle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Leaf,
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { WasteRecord, BuildingSummary, AnomalyItem, SustainabilityAction } from '../types';

interface WasteViewProps {
  wasteData: WasteRecord[];
  buildingSummaries: BuildingSummary[];
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
}

export const WasteView: React.FC<WasteViewProps> = ({
  wasteData,
  buildingSummaries,
  anomalies,
  recommendations,
}) => {
  // Simulator State: Composting & Source Segregation
  const [compostEfficiencyPct, setCompostEfficiencyPct] = useState<number>(75);
  const [sourceSegregationUpliftPct, setSourceSegregationUpliftPct] = useState<number>(30);

  const totalWasteKg = wasteData.reduce((a, b) => a + (Number(b.total_waste_kg) || 0), 0);
  const totalRecyclableKg = wasteData.reduce((a, b) => a + (Number(b.recyclable_kg) || 0), 0);
  const totalOrganicKg = wasteData.reduce((a, b) => a + (Number(b.organic_kg) || 0), 0);
  const totalOtherKg = wasteData.reduce((a, b) => a + (Number(b.other_kg) || 0), 0);

  const currentRecyclingRate = totalWasteKg > 0 ? ((totalRecyclableKg / totalWasteKg) * 100).toFixed(1) : '0';
  const currentOrganicShare = totalWasteKg > 0 ? ((totalOrganicKg / totalWasteKg) * 100).toFixed(1) : '0';

  // Simulator math
  const simulatedCompostedKg = totalOrganicKg * (compostEfficiencyPct / 100);
  const simulatedRecycledUpliftKg = (totalWasteKg - totalRecyclableKg) * (sourceSegregationUpliftPct / 100) * 0.4;
  const totalDivertedFromLandfillKg = simulatedCompostedKg + totalRecyclableKg + simulatedRecycledUpliftKg;
  const avoidedCarbonKg =
    simulatedCompostedKg * 0.50 + (totalRecyclableKg + simulatedRecycledUpliftKg) * 1.20;
  const compostProducedKg = simulatedCompostedKg * 0.35; // 35% compost mass conversion

  // Chart data: Stacked streams by building
  const streamChartData = buildingSummaries.map((b) => {
    const bWaste = wasteData.filter((w) => w.building === b.building);
    const rec = bWaste.reduce((acc, curr) => acc + (curr.recyclable_kg || 0), 0);
    const org = bWaste.reduce((acc, curr) => acc + (curr.organic_kg || 0), 0);
    const oth = bWaste.reduce((acc, curr) => acc + (curr.other_kg || (curr.total_waste_kg - (rec + org))), 0);

    return {
      name: b.building,
      Recyclable: rec,
      Organic: org,
      Landfill: Math.max(0, oth),
      total: b.totalWasteKg,
      perStudent: b.wastePerStudent,
    };
  });

  const wastePieData = [
    { name: 'Organic (Food & Greens)', value: totalOrganicKg, color: '#10b981' },
    { name: 'Recyclables (Paper, Plastic, Metal)', value: totalRecyclableKg, color: '#3b82f6' },
    { name: 'Landfill / Mixed Other', value: totalOtherKg, color: '#64748b' },
  ];

  const wasteAnomalies = anomalies.filter((a) => a.resource === 'waste');
  const wasteRecs = recommendations.filter((r) => r.area === 'Waste' || r.area === 'Cross-Campus');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Waste Streams & Circular Economy</h2>
            <p className="text-xs text-slate-500">
              Source segregation audits, per-capita waste generation, and organic composting simulator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            Segregation Rate: <span className="font-bold">{currentRecyclingRate}% Recyclable</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Organic Food Waste</span>
            <div className="text-lg font-bold text-slate-900">
              {(totalOrganicKg / 1000).toFixed(1)} <span className="text-xs text-slate-500 font-normal">Tonnes ({currentOrganicShare}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Dry Recyclables</span>
            <div className="text-lg font-bold text-slate-900">
              {(totalRecyclableKg / 1000).toFixed(1)} <span className="text-xs text-slate-500 font-normal">Tonnes ({currentRecyclingRate}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Landfill / Unsegregated</span>
            <div className="text-lg font-bold text-slate-900">
              {(totalOtherKg / 1000).toFixed(1)} <span className="text-xs text-slate-500 font-normal">Tonnes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: Stacked Waste Streams & Stream Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Streams by Building */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Waste Generation by Facility & Stream (kg)</h3>
              <p className="text-xs text-slate-500">Stacked by Organic vs Recyclable vs Landfill</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Organic" name="Organic (kg)" stackId="a" fill="#10b981" />
                <Bar dataKey="Recyclable" name="Recyclable (kg)" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Landfill" name="Landfill (kg)" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Stream Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Campus Waste Composition</h3>
            <p className="text-xs text-slate-500 mb-4">Categorized material stream breakdown</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wastePieData}
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {wastePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} kg`, 'Total']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {wastePieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{((item.value / (totalWasteKg || 1)) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Composting & Zero-Waste Circularity Simulator */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-white to-emerald-50/40 p-6 rounded-2xl border border-emerald-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-200/80">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Organic Composting & Landfill Diversion Simulator
              </h3>
              <p className="text-xs text-slate-600">
                Model on-site aerobic composting of canteen food scraps, organic fertilizer yields, and avoided methane.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Sliders */}
          <div className="space-y-4 md:col-span-1 bg-white p-4 rounded-xl border border-emerald-200/60">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Canteen Organic Composting Rate</span>
                <span className="font-bold text-emerald-700">{compostEfficiencyPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={compostEfficiencyPct}
                onChange={(e) => setCompostEfficiencyPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
              <span className="text-[10px] text-slate-400">Diverts kitchen and food prep waste</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Source Segregation Uplift</span>
                <span className="font-bold text-emerald-700">+{sourceSegregationUpliftPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={sourceSegregationUpliftPct}
                onChange={(e) => setSourceSegregationUpliftPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
              <span className="text-[10px] text-slate-400">Through 4-stream color-coded bins</span>
            </div>
          </div>

          {/* Projection Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Landfill Diversion</span>
              <div className="my-2">
                <div className="text-2xl font-black text-emerald-600">
                  {(totalDivertedFromLandfillKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-600">Tonnes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {Math.round((totalDivertedFromLandfillKg / (totalWasteKg || 1)) * 100)}% total campus diversion
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Directly slashes tipping fees</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Compost Fertilizer Yield</span>
              <div className="my-2">
                <div className="text-2xl font-black text-amber-700">
                  {Math.round(compostProducedKg).toLocaleString()} <span className="text-sm font-semibold text-slate-600">kg/yr</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  100% organic nutrient for campus landscaping
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Replaces synthetic chemical fertilizer</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Emissions Abated</span>
              <div className="my-2">
                <div className="text-2xl font-black text-teal-700">
                  {(avoidedCarbonKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-600">MT CO₂e</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Avoids anaerobic methane decay in landfills
                </p>
              </div>
              <div className="text-[10px] text-slate-400">Documented carbon avoidance factors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Waste Actions & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-600" />
              <span>Waste Surge Anomalies</span>
            </h3>
            <span className="text-xs text-slate-500">{wasteAnomalies.length} Flagged</span>
          </div>

          <div className="space-y-3">
            {wasteAnomalies.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">{a.building}</span>
                  <span className="text-emerald-800">+{a.percentageChange}% Surge ({a.date})</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{a.possibleCause}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <span className="text-emerald-700">Action:</span> {a.recommendedAction}
                </div>
              </div>
            ))}

            {wasteAnomalies.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No waste volume surges detected in sample window.</p>
            )}
          </div>
        </div>

        {/* Top Waste Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Circular Campus Interventions</span>
            </h3>
            <span className="text-xs text-slate-500">{wasteRecs.length} Actions</span>
          </div>

          <div className="space-y-3">
            {wasteRecs.map((r) => (
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
