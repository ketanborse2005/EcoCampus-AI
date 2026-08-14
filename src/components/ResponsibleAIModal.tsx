import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Eye, Scale } from 'lucide-react';

interface ResponsibleAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsibleAIModal: React.FC<ResponsibleAIModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Responsible AI & System Governance</h3>
              <p className="text-[11px] text-slate-500">Ethics, privacy, transparency, and decision-support limitations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-600">
          {/* Section 1 */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>1. Advisory Role (Human-in-the-Loop)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              EcoCampus AI operates strictly as a <strong>decision-support copilot</strong>. It is not connected to automated actuators, grid breakers, or water shut-off valves. All ranked actions and retrofit plans must be reviewed and confirmed by licensed campus facility managers and engineers.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>2. Privacy & Student Data Protection</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              All occupancy data is strictly aggregated at the building level. No personally identifiable student records, biometric logs, or room-level surveillance telemetry are collected, processed, or transmitted.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Eye className="w-4 h-4 text-slate-700" />
              <span>3. Explainable Mathematical Formulations</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Building priority scores and anomaly flags are computed via transparent formulas:
              <br />
              <code className="block bg-slate-100 p-1.5 rounded-md my-1 font-mono text-[11px] text-slate-800">
                Priority Score = 0.4×(Usage Score) + 0.3×(Growth Score) + 0.2×(Impact Score) + 0.1×(Feasibility Score)
              </code>
              No uninterpretable black-box weights are utilized for capital resource decisions.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>4. Known Limitations & Environmental Assumptions</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Emission factors reflect regional grid averages and can be adjusted in the settings panel.</li>
              <li>Water pumping energy uses an estimated 0.35 - 0.50 kWh/kL benchmark based on overhead sump elevation.</li>
              <li>Seasonal semester breaks and exam weeks may introduce temporary occupancy variations that require manual scheduling context.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
