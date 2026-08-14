import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  EnergyRecord,
  WaterRecord,
  WasteRecord,
  ValidationResult
} from '../types';
import {
  validateDataset,
  parseEnergyCSV,
  parseWaterCSV,
  parseWasteCSV
} from '../utils/calculations';
import {
  SAMPLE_ENERGY_CSV,
  SAMPLE_WATER_CSV,
  SAMPLE_WASTE_CSV,
  DIRTY_ENERGY_CSV
} from '../data/defaultDatasets';

interface DataUploadViewProps {
  energyData: EnergyRecord[];
  waterData: WaterRecord[];
  wasteData: WasteRecord[];
  onUpdateEnergy: (data: EnergyRecord[]) => void;
  onUpdateWater: (data: WaterRecord[]) => void;
  onUpdateWaste: (data: WasteRecord[]) => void;
  onResetToDefault: () => void;
  onLoadAnomalyTest: () => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({
  energyData,
  waterData,
  wasteData,
  onUpdateEnergy,
  onUpdateWater,
  onUpdateWaste,
  onResetToDefault,
  onLoadAnomalyTest,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'energy' | 'water' | 'waste'>('energy');
  const [searchFilter, setSearchFilter] = useState('');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live validation calculations
  const energyValidation = validateDataset(energyData, 'energy');
  const waterValidation = validateDataset(waterData, 'water');
  const wasteValidation = validateDataset(wasteData, 'waste');

  const currentValidation =
    activeSubTab === 'energy'
      ? energyValidation
      : activeSubTab === 'water'
      ? waterValidation
      : wasteValidation;

  const currentData =
    activeSubTab === 'energy'
      ? energyData
      : activeSubTab === 'water'
      ? waterData
      : wasteData;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        if (activeSubTab === 'energy') {
          const parsed = parseEnergyCSV(text);
          if (parsed.length > 0) {
            onUpdateEnergy(parsed);
            setUploadStatusMsg({ type: 'success', text: `Successfully loaded ${parsed.length} energy records.` });
          } else {
            throw new Error('No valid energy rows parsed.');
          }
        } else if (activeSubTab === 'water') {
          const parsed = parseWaterCSV(text);
          if (parsed.length > 0) {
            onUpdateWater(parsed);
            setUploadStatusMsg({ type: 'success', text: `Successfully loaded ${parsed.length} water records.` });
          } else {
            throw new Error('No valid water rows parsed.');
          }
        } else {
          const parsed = parseWasteCSV(text);
          if (parsed.length > 0) {
            onUpdateWaste(parsed);
            setUploadStatusMsg({ type: 'success', text: `Successfully loaded ${parsed.length} waste records.` });
          } else {
            throw new Error('No valid waste rows parsed.');
          }
        }
      } catch (err: any) {
        setUploadStatusMsg({ type: 'error', text: `CSV Parse Error: ${err.message || 'Check header format.'}` });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDirtyData = () => {
    const dirty = parseEnergyCSV(DIRTY_ENERGY_CSV);
    onUpdateEnergy(dirty);
    setActiveSubTab('energy');
    setUploadStatusMsg({
      type: 'success',
      text: 'Loaded dirty test dataset. Inspect the Data Validation Agent report below to view detected flaws.',
    });
  };

  const handleExportCSV = () => {
    let csvContent = '';
    if (activeSubTab === 'energy') {
      csvContent = 'date,building,electricity_kwh,occupancy,department\n' +
        energyData.map((e) => `${e.date},${e.building},${e.electricity_kwh},${e.occupancy},${e.department || ''}`).join('\n');
    } else if (activeSubTab === 'water') {
      csvContent = 'date,building,water_liters,occupancy,department\n' +
        waterData.map((w) => `${w.date},${w.building},${w.water_liters},${w.occupancy},${w.department || ''}`).join('\n');
    } else {
      csvContent = 'date,building,total_waste_kg,recyclable_kg,organic_kg,other_kg,occupancy\n' +
        wasteData.map((ws) => `${ws.date},${ws.building},${ws.total_waste_kg},${ws.recyclable_kg},${ws.organic_kg},${ws.other_kg || 0},${ws.occupancy}`).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocampus_${activeSubTab}_data.csv`;
    a.click();
  };

  // Filtered rows
  const filteredData = currentData.filter((row: any) =>
    (row.building || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (row.date || '').includes(searchFilter) ||
    (row.department || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Campus Data Ingestion & Quality Hub</h2>
              <p className="text-xs text-slate-500">
                Upload CSV datasets for electricity, water, and waste. The Data Validation Agent audits integrity before analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onResetToDefault}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Standard Dataset</span>
          </button>

          <button
            onClick={onLoadAnomalyTest}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Spike Scenario</span>
          </button>

          <button
            onClick={handleLoadDirtyData}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Dirty Data Test</span>
          </button>
        </div>
      </div>

      {/* Upload Notification Alert */}
      {uploadStatusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs ${
            uploadStatusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{uploadStatusMsg.text}</span>
          </div>
          <button onClick={() => setUploadStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* Resource Category Selector Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
        {(['energy', 'water', 'waste'] as const).map((tab) => {
          const val = tab === 'energy' ? energyValidation : tab === 'water' ? waterValidation : wasteValidation;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all capitalize ${
                activeSubTab === tab
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab} Telemetry</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  val.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {val.qualityScore}% Health
              </span>
            </button>
          );
        })}
      </div>

      {/* Validation Health Summary & Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Upload Custom {activeSubTab.toUpperCase()} CSV
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Supported columns: {activeSubTab === 'energy' ? 'date, building, electricity_kwh, occupancy' : activeSubTab === 'water' ? 'date, building, water_liters, occupancy' : 'date, building, total_waste_kg, recyclable_kg, organic_kg, occupancy'}
            </p>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all text-center">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">Click to browse or drag CSV</span>
              <span className="text-[10px] text-slate-400 mt-1">.csv format up to 10MB</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleExportCSV}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Current {activeSubTab.toUpperCase()} CSV</span>
            </button>
          </div>
        </div>

        {/* Validation Agent Scorecard */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Data Validation Agent Audit Report
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  currentValidation.qualityScore >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Score: {currentValidation.qualityScore}% Quality
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Records</span>
                <div className="text-lg font-black text-slate-900">{currentValidation.totalRows}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Clean Rows</span>
                <div className="text-lg font-black text-emerald-800">{currentValidation.validRows}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-[10px] text-rose-700 font-bold uppercase">Errors</span>
                <div className="text-lg font-black text-rose-700">{currentValidation.errorCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="text-[10px] text-amber-700 font-bold uppercase">Warnings</span>
                <div className="text-lg font-black text-amber-700">{currentValidation.warningCount}</div>
              </div>
            </div>

            {/* Validation Issues Table */}
            {currentValidation.issues.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {currentValidation.issues.map((issue, idx) => {
                  const issueType = issue.type || issue.severity || 'warning';
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                        issueType === 'error'
                          ? 'bg-rose-50 text-rose-900 border border-rose-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      <span>
                        <strong>Row {issue.row} ({issue.column}):</strong> {issue.message}
                      </span>
                      <span className="text-[10px] font-bold uppercase">{issueType}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero integrity errors found. Schema matches all mathematical and format requirements.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Data Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active {activeSubTab.toUpperCase()} Data Records ({filteredData.length} rows)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by building or date..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 w-52"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
              <tr>
                <th className="px-3.5 py-2.5 text-left">#</th>
                <th className="px-3.5 py-2.5 text-left">Date</th>
                <th className="px-3.5 py-2.5 text-left">Building</th>
                {activeSubTab === 'energy' && <th className="px-3.5 py-2.5 text-right">Electricity (kWh)</th>}
                {activeSubTab === 'water' && <th className="px-3.5 py-2.5 text-right">Water (Liters)</th>}
                {activeSubTab === 'waste' && (
                  <>
                    <th className="px-3.5 py-2.5 text-right">Total Waste (kg)</th>
                    <th className="px-3.5 py-2.5 text-right">Recyclable (kg)</th>
                    <th className="px-3.5 py-2.5 text-right">Organic (kg)</th>
                  </>
                )}
                <th className="px-3.5 py-2.5 text-right">Occupancy</th>
                <th className="px-3.5 py-2.5 text-left">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((row: any, i) => (
                <tr key={row.id || i} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3.5 py-2 font-mono text-slate-800">{row.date}</td>
                  <td className="px-3.5 py-2 font-bold text-slate-900">{row.building}</td>
                  {activeSubTab === 'energy' && (
                    <td className="px-3.5 py-2 text-right font-semibold text-amber-700">
                      {Number(row.electricity_kwh).toLocaleString()}
                    </td>
                  )}
                  {activeSubTab === 'water' && (
                    <td className="px-3.5 py-2 text-right font-semibold text-blue-700">
                      {Number(row.water_liters).toLocaleString()}
                    </td>
                  )}
                  {activeSubTab === 'waste' && (
                    <>
                      <td className="px-3.5 py-2 text-right font-semibold text-slate-900">
                        {Number(row.total_waste_kg).toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2 text-right text-blue-600 font-medium">
                        {Number(row.recyclable_kg).toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2 text-right text-emerald-600 font-medium">
                        {Number(row.organic_kg).toLocaleString()}
                      </td>
                    </>
                  )}
                  <td className="px-3.5 py-2 text-right text-slate-600">{row.occupancy || '—'}</td>
                  <td className="px-3.5 py-2 text-slate-500">{row.department || 'General'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
