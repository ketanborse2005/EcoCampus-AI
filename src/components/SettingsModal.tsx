import React from 'react';
import { X, Sliders, RotateCcw, Check, Sparkles } from 'lucide-react';
import { EmissionFactors } from '../types';
import { DEFAULT_EMISSION_FACTORS } from '../utils/calculations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  factors: EmissionFactors;
  onUpdateFactors: (factors: EmissionFactors) => void;
  campusName: string;
  onUpdateCampusName: (name: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  factors,
  onUpdateFactors,
  campusName,
  onUpdateCampusName,
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof EmissionFactors, val: number) => {
    onUpdateFactors({ ...factors, [key]: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Platform Settings & Emission Constants</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Campus / University Name</label>
            <input
              type="text"
              value={campusName}
              onChange={(e) => onUpdateCampusName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 mb-2">GHG Emission Factors (CO₂e Inventory)</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Standard default factors based on CEA & EPA regional grid intensity guidelines.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Electricity Factor</span>
                  <span className="font-bold text-emerald-700">{factors.electricity_factor_kg_per_kwh} kg CO₂e / kWh</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={factors.electricity_factor_kg_per_kwh}
                  onChange={(e) => handleChange('electricity_factor_kg_per_kwh', parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Water Pumping Indirect Factor</span>
                  <span className="font-bold text-blue-700">{factors.water_pumping_kg_per_1000l} kg CO₂e / 1000L</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={factors.water_pumping_kg_per_1000l}
                  onChange={(e) => handleChange('water_pumping_kg_per_1000l', parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Landfill Waste Emission Factor</span>
                  <span className="font-bold text-rose-700">{factors.waste_landfill_kg_per_kg} kg CO₂e / kg</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={factors.waste_landfill_kg_per_kg}
                  onChange={(e) => handleChange('waste_landfill_kg_per_kg', parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Recycling Offset Avoidance Factor</span>
                  <span className="font-bold text-teal-700">-{factors.waste_recycled_avoided_kg_per_kg} kg CO₂e / kg</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={factors.waste_recycled_avoided_kg_per_kg}
                  onChange={(e) => handleChange('waste_recycled_avoided_kg_per_kg', parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => onUpdateFactors(DEFAULT_EMISSION_FACTORS)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
