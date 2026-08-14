import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Droplets,
  Trash2,
  Bot,
  FileSpreadsheet,
  FileText,
  Sliders,
  ShieldCheck,
  Info
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'energy'
  | 'water'
  | 'waste'
  | 'agent-studio'
  | 'data-upload'
  | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  campusName: string;
  dataQualityScore: number;
  hasGeminiKey: boolean;
  onOpenSettings: () => void;
  onOpenResponsibleAI: () => void;
  onRunAgenticAudit: () => void;
  isAgentRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  campusName,
  dataQualityScore,
  onOpenSettings,
  onOpenResponsibleAI,
  onRunAgenticAudit,
  isAgentRunning,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'energy', label: 'Energy Analysis', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'water', label: 'Water Analysis', icon: <Droplets className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'waste', label: 'Waste Analysis', icon: <Trash2 className="w-3.5 h-3.5 text-emerald-500" /> },
    {
      id: 'agent-studio',
      label: 'Agent Workflow',
      icon: (
        <span className="relative flex items-center">
          <Bot className="w-3.5 h-3.5 text-emerald-600" />
          <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </span>
      ),
    },
    { id: 'data-upload', label: 'Data Manager', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Sustainability Reports', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between flex-shrink-0">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="text-lg font-bold tracking-tight text-slate-800">
              EcoCampus <span className="text-emerald-600">AI</span>
            </span>
          </div>
        </div>

        {/* Center Nav Links with sleek active indicator */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 py-1 transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 font-bold border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools & Admin View Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Campus View</div>
            <div className="text-xs font-semibold text-slate-700 truncate max-w-[150px]" title={campusName}>
              {campusName}
            </div>
          </div>

          {/* Quick Action: Run Audit */}
          <button
            id="btn-run-agent-audit"
            onClick={onRunAgenticAudit}
            disabled={isAgentRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
              isAgentRunning
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
            }`}
            title="Trigger Multi-Agent Diagnostics"
          >
            <Bot className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">
              {isAgentRunning ? 'Auditing...' : 'Run Audit'}
            </span>
          </button>

          {/* Data Quality Pill */}
          <button
            id="btn-nav-quality"
            onClick={() => setActiveTab('data-upload')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            title="Data Quality Index"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${dataQualityScore > 85 ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span className="text-[11px] font-bold text-slate-700">{dataQualityScore}%</span>
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Emission Constants & Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Responsible AI */}
          <button
            id="btn-open-responsible-ai"
            onClick={onOpenResponsibleAI}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Governance & Ethics"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
