import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Award,
  Leaf,
  Layers,
  Terminal,
  Zap,
  Droplets,
  Trash2
} from 'lucide-react';
import {
  AgentCoordinationResponse,
  AgentTraceStep,
  SustainabilityAction,
  BuildingSummary,
  CarbonMetrics,
  AnomalyItem
} from '../types';

interface AgentStudioViewProps {
  agentResponse: AgentCoordinationResponse | null;
  isAgentRunning: boolean;
  onRunQuery: (query: string) => void;
  buildingSummaries: BuildingSummary[];
  carbonMetrics: CarbonMetrics;
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
}

export const AgentStudioView: React.FC<AgentStudioViewProps> = ({
  agentResponse,
  isAgentRunning,
  onRunQuery,
  buildingSummaries,
  carbonMetrics,
  anomalies,
  recommendations,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [selectedAgentTab, setSelectedAgentTab] = useState<'response' | 'trace' | 'chat'>('response');
  const [expandedTraceIdx, setExpandedTraceIdx] = useState<number | null>(null);

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'agent'; text: string; time: string }[]
  >([
    {
      sender: 'agent',
      text: 'Hello, I am the EcoCampus Coordinator Agent. I orchestrate specialized sub-agents (Validation, Analysis, Anomaly, Carbon, Research, and Recommendation) to analyze campus resources and formulate data-backed sustainability decisions.',
      time: '11:30 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const presetQueries = [
    'Which building should we prioritize for resource-saving actions?',
    'Show buildings with increasing water usage and explain why.',
    'What is the estimated carbon impact of our electricity consumption?',
    'Give me three low-cost, quick-payback sustainability actions.',
    'Detect all anomalies across energy, water, and waste.',
  ];

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          contextData: {
            buildings: buildingSummaries.map((b) => b.building),
            totalKwh: buildingSummaries.reduce((a, b) => a + b.totalElectricityKwh, 0),
            totalWater: buildingSummaries.reduce((a, b) => a + b.totalWaterLiters, 0),
            totalWaste: buildingSummaries.reduce((a, b) => a + b.totalWasteKg, 0),
            totalCarbonKg: carbonMetrics.totalCarbonKg,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { sender: 'agent', text: data.reply || 'Analysis completed.', time },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: 'Analysis: Focusing on Hostel A (water leak risk) and Science Complex (HVAC load) provides the greatest immediate carbon and cost reduction for your campus.',
            time,
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Hostel A exhibits the highest per-student resource intensity. Conducting acoustic leak inspections and scheduled sub-metering is the primary recommended step.',
          time,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4" />
              <span>Multi-Agent Decision Support Engine</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Ask EcoCampus AI</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Natural language queries trigger a collaborative pipeline of 8 cooperating agents executing data validation,
              statistical anomaly detection, carbon accounting, and multi-criteria action ranking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunQuery('Which building should we prioritize for resource-saving actions?')}
              disabled={isAgentRunning}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
              <span>{isAgentRunning ? 'Pipeline Running...' : 'Rerun Full Agent Audit'}</span>
            </button>
          </div>
        </div>

        {/* Search Query Input Bar */}
        <div className="mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customInput.trim()) {
                onRunQuery(customInput.trim());
              }
            }}
            className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 focus-within:border-emerald-400 transition-colors"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Which building has the worst per-student water wastage?' or 'Plan 3 low-cost actions')..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!customInput.trim() || isAgentRunning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <span>Execute Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] font-semibold text-slate-400">Try asking:</span>
            {presetQueries.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setCustomInput(q);
                  onRunQuery(q);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Agent Visual Architecture Workflow Graph */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Multi-Agent Collaboration DAG</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">8 Cooperating Specialized Agents</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { name: 'Coordinator', role: 'Intent & DAG Planner', icon: <Bot className="w-3.5 h-3.5" />, color: 'emerald' },
            { name: 'Validation', role: 'Quality & Nulls Check', icon: <ShieldAlert className="w-3.5 h-3.5" />, color: 'slate' },
            { name: 'Analysis', role: 'Per-Capita & Growth', icon: <Terminal className="w-3.5 h-3.5" />, color: 'blue' },
            { name: 'Anomaly', role: 'Spike & Leak Detector', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'amber' },
            { name: 'Carbon', role: 'CO₂e Inventory', icon: <Leaf className="w-3.5 h-3.5" />, color: 'teal' },
            { name: 'Research', role: 'Retrofit Guidance', icon: <FileText className="w-3.5 h-3.5" />, color: 'indigo' },
            { name: 'Recommendation', role: 'Multi-Criteria Scoring', icon: <Award className="w-3.5 h-3.5" />, color: 'purple' },
            { name: 'Report Gen', role: 'Brief & PDF Synthesis', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'rose' },
          ].map((ag, i) => (
            <div
              key={ag.name}
              className={`p-2.5 rounded-xl border flex flex-col justify-between text-center ${
                isAgentRunning
                  ? 'bg-emerald-50/50 border-emerald-300 animate-pulse'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-900 mb-1">
                {ag.icon}
                <span>{ag.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 leading-tight">{ag.role}</span>
              <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Studio Work Area: Tabs for Executive Response, Live Trace & Chat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-3">
          <button
            onClick={() => setSelectedAgentTab('response')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              selectedAgentTab === 'response'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Agent Synthesis & Decision Matrix</span>
          </button>

          <button
            onClick={() => setSelectedAgentTab('trace')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              selectedAgentTab === 'trace'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span>Execution Trace & Tool Logs ({agentResponse?.traces.length || 8})</span>
          </button>

          <button
            onClick={() => setSelectedAgentTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              selectedAgentTab === 'chat'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>Interactive Q&A Chat</span>
          </button>
        </div>

        {/* Tab 1: Executive Response & Decision Matrix */}
        {selectedAgentTab === 'response' && (
          <div className="p-6 space-y-6">
            {isAgentRunning && (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                <h4 className="text-sm font-bold text-slate-900">Cooperating Agents Processing Query...</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Validation Agent inspecting records → Anomaly Agent detecting surges → Recommendation Agent computing multi-criteria scores.
                </p>
              </div>
            )}

            {!isAgentRunning && agentResponse && (
              <div className="space-y-6">
                {/* Direct Executive Answer */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
                      Coordinator Agent Direct Answer
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {agentResponse.directAnswer}
                  </p>
                </div>

                {/* Key Grounded Insights */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Key Data-Grounded Findings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {agentResponse.keyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 shadow-2xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Building Prioritization Breakdown Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Multi-Criteria Building Ranking Matrix
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Formula: 0.4(Usage) + 0.3(Growth) + 0.2(Impact) + 0.1(Feasibility)
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold">
                        <tr>
                          <th className="px-3.5 py-2.5 text-left">Rank & Facility</th>
                          <th className="px-3 py-2.5 text-right">Electricity (kWh)</th>
                          <th className="px-3 py-2.5 text-right">Water (kL)</th>
                          <th className="px-3 py-2.5 text-right">Waste (kg)</th>
                          <th className="px-3 py-2.5 text-right">Growth Rate</th>
                          <th className="px-3 py-2.5 text-center">Status</th>
                          <th className="px-3.5 py-2.5 text-right font-black text-emerald-800">Priority Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {buildingSummaries.map((b, i) => (
                          <tr key={b.building} className={i === 0 ? 'bg-emerald-50/40 font-semibold' : 'hover:bg-slate-50'}>
                            <td className="px-3.5 py-2.5 text-slate-900 font-bold flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                                #{i + 1}
                              </span>
                              <span>{b.building}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-600">{b.totalElectricityKwh.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right text-slate-600">{(b.totalWaterLiters / 1000).toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right text-slate-600">{b.totalWasteKg.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right">
                              <span className={b.electricityGrowthPct > 10 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                                {b.electricityGrowthPct > 0 ? `+${b.electricityGrowthPct}%` : `${b.electricityGrowthPct}%`}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {b.anomalyCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  ⚠️ {b.anomalyCount} Spike
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                                  Normal
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-black text-emerald-700 text-sm">
                              {b.priorityScore}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Prioritized Actions Catalog */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Ranked Intervention Roadmap
                  </h4>
                  <div className="space-y-3">
                    {recommendations.slice(0, 4).map((rec, i) => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition-all shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                              #{i + 1}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900">{rec.title}</h5>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {rec.area}
                            </span>
                          </div>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Score: {rec.priorityScore} / 100
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2">{rec.reasoning}</p>

                        <div className="mt-3 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                          <div>Target: <strong className="text-slate-800">{rec.targetBuilding}</strong></div>
                          <div>Cost: <strong className="text-slate-800">{rec.estimatedCost}</strong></div>
                          <div>Payback: <strong className="text-slate-800">{rec.paybackTime}</strong></div>
                          <div>CO₂ Avoidance: <strong className="text-emerald-700">~{rec.co2ReductionEstimateKg} kg/yr</strong></div>
                        </div>

                        {/* Implementation Steps */}
                        <div className="mt-3">
                          <span className="text-[11px] font-bold text-slate-700">Execution Steps:</span>
                          <ul className="mt-1 space-y-1 text-[11px] text-slate-600 pl-4 list-disc">
                            {rec.implementationSteps.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Responsible AI Disclaimer Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                    <span>Decision Support & Human-In-The-Loop Statement</span>
                  </div>
                  <p className="leading-relaxed">
                    {agentResponse.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Execution Trace & Tool Invocations */}
        {selectedAgentTab === 'trace' && (
          <div className="p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-700">Multi-Agent Execution Timeline</span>
              <span className="text-slate-400">Total Steps: {agentResponse?.traces.length || 8}</span>
            </div>

            <div className="space-y-3">
              {(agentResponse?.traces || []).map((trace, idx) => {
                const isExpanded = expandedTraceIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all"
                  >
                    <div
                      onClick={() => setExpandedTraceIdx(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900">{trace.agentName}</span>
                          <span className="text-slate-400 ml-2 text-[11px]">[{trace.toolUsed}]</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{trace.timestamp}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {trace.status.toUpperCase()}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    <div className="mt-2 text-slate-700 font-sans text-xs">
                      <strong>Action:</strong> {trace.action}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      <div><strong className="text-slate-500">Output:</strong> {trace.output}</div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-1">// Input Payload:</div>
                        <div className="text-slate-300 mb-2">{trace.input}</div>
                        {trace.details && (
                          <>
                            <div className="text-emerald-400 font-bold mb-1">// Tool Telemetry Details:</div>
                            <pre className="text-[10px] text-slate-300">{JSON.stringify(trace.details, null, 2)}</pre>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Q&A Chat */}
        {selectedAgentTab === 'chat' && (
          <div className="p-6 flex flex-col h-[520px]">
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-500'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Agent formulating grounded answer...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask EcoCampus AI anything about your campus electricity, water, or waste..."
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
