import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EnergyView } from './components/EnergyView';
import { WaterView } from './components/WaterView';
import { WasteView } from './components/WasteView';
import { AgentStudioView } from './components/AgentStudioView';
import { DataUploadView } from './components/DataUploadView';
import { ReportsView } from './components/ReportsView';
import { SettingsModal } from './components/SettingsModal';
import { ResponsibleAIModal } from './components/ResponsibleAIModal';

import {
  EnergyRecord,
  WaterRecord,
  WasteRecord,
  EmissionFactors,
  AgentCoordinationResponse
} from './types';
import {
  DEFAULT_ENERGY_RECORDS,
  DEFAULT_WATER_RECORDS,
  DEFAULT_WASTE_RECORDS,
  ANOMALY_ENERGY_RECORDS,
  ANOMALY_WATER_RECORDS
} from './data/defaultDatasets';
import {
  DEFAULT_EMISSION_FACTORS,
  calculateBuildingSummaries,
  calculateCarbonMetrics,
  detectAnomalies,
  generateRankedRecommendations,
  validateDataset
} from './utils/calculations';
import { runAgenticWorkflow } from './services/agentEngine';
import { Sparkles, ShieldCheck, Heart, Globe, Cpu } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [campusName, setCampusName] = useState<string>('National Green Institute of Technology');

  // Datasets State
  const [energyData, setEnergyData] = useState<EnergyRecord[]>(DEFAULT_ENERGY_RECORDS);
  const [waterData, setWaterData] = useState<WaterRecord[]>(DEFAULT_WATER_RECORDS);
  const [wasteData, setWasteData] = useState<WasteRecord[]>(DEFAULT_WASTE_RECORDS);

  // Settings & Emission Constants
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactors>(DEFAULT_EMISSION_FACTORS);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResponsibleAIOpen, setIsResponsibleAIOpen] = useState(false);

  // Agent State
  const [agentResponse, setAgentResponse] = useState<AgentCoordinationResponse | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Derived Analytics State (memoized for performance)
  const anomalies = useMemo(() => {
    return detectAnomalies(energyData, waterData, wasteData);
  }, [energyData, waterData, wasteData]);

  const buildingSummaries = useMemo(() => {
    return calculateBuildingSummaries(energyData, waterData, wasteData, anomalies, emissionFactors);
  }, [energyData, waterData, wasteData, anomalies, emissionFactors]);

  const carbonMetrics = useMemo(() => {
    return calculateCarbonMetrics(energyData, waterData, wasteData, emissionFactors);
  }, [energyData, waterData, wasteData, emissionFactors]);

  const recommendations = useMemo(() => {
    return generateRankedRecommendations(buildingSummaries, anomalies);
  }, [buildingSummaries, anomalies]);

  const dataQualityScore = useMemo(() => {
    const eVal = validateDataset(energyData, 'energy');
    const wVal = validateDataset(waterData, 'water');
    const wsVal = validateDataset(wasteData, 'waste');
    return Math.round((eVal.qualityScore + wVal.qualityScore + wsVal.qualityScore) / 3);
  }, [energyData, waterData, wasteData]);

  // Run Agentic Workflow
  const handleRunAgentWorkflow = async (query?: string) => {
    setIsAgentRunning(true);
    try {
      const response = await runAgenticWorkflow({
        query: query || 'Which building should we prioritize for resource-saving actions?',
        energyRecords: energyData,
        waterRecords: waterData,
        wasteRecords: wasteData,
        factors: emissionFactors,
      });
      setAgentResponse(response);
    } catch (err) {
      console.error('Agent workflow failed:', err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Initial run on mount
  useEffect(() => {
    handleRunAgentWorkflow();
  }, []);

  const handleAskQuestionFromDashboard = (query: string) => {
    setActiveTab('agent-studio');
    handleRunAgentWorkflow(query);
  };

  const handleLoadAnomalyTest = () => {
    setEnergyData(ANOMALY_ENERGY_RECORDS);
    setWaterData(ANOMALY_WATER_RECORDS);
    setActiveTab('dashboard');
  };

  const handleResetToDefault = () => {
    setEnergyData(DEFAULT_ENERGY_RECORDS);
    setWaterData(DEFAULT_WATER_RECORDS);
    setWasteData(DEFAULT_WASTE_RECORDS);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        campusName={campusName}
        dataQualityScore={dataQualityScore}
        hasGeminiKey={true}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenResponsibleAI={() => setIsResponsibleAIOpen(true)}
        onRunAgenticAudit={() => {
          setActiveTab('agent-studio');
          handleRunAgentWorkflow();
        }}
        isAgentRunning={isAgentRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            buildingSummaries={buildingSummaries}
            carbonMetrics={carbonMetrics}
            anomalies={anomalies}
            recommendations={recommendations}
            energyData={energyData}
            waterData={waterData}
            wasteData={wasteData}
            onNavigateTab={setActiveTab}
            onAskQuestion={handleAskQuestionFromDashboard}
          />
        )}

        {activeTab === 'energy' && (
          <EnergyView
            energyData={energyData}
            buildingSummaries={buildingSummaries}
            anomalies={anomalies}
            recommendations={recommendations}
            emissionFactor={emissionFactors.electricity_factor_kg_per_kwh}
          />
        )}

        {activeTab === 'water' && (
          <WaterView
            waterData={waterData}
            buildingSummaries={buildingSummaries}
            anomalies={anomalies}
            recommendations={recommendations}
          />
        )}

        {activeTab === 'waste' && (
          <WasteView
            wasteData={wasteData}
            buildingSummaries={buildingSummaries}
            anomalies={anomalies}
            recommendations={recommendations}
          />
        )}

        {activeTab === 'agent-studio' && (
          <AgentStudioView
            agentResponse={agentResponse}
            isAgentRunning={isAgentRunning}
            onRunQuery={(q) => handleRunAgentWorkflow(q)}
            buildingSummaries={buildingSummaries}
            carbonMetrics={carbonMetrics}
            anomalies={anomalies}
            recommendations={recommendations}
          />
        )}

        {activeTab === 'data-upload' && (
          <DataUploadView
            energyData={energyData}
            waterData={waterData}
            wasteData={wasteData}
            onUpdateEnergy={setEnergyData}
            onUpdateWater={setWaterData}
            onUpdateWaste={setWasteData}
            onResetToDefault={handleResetToDefault}
            onLoadAnomalyTest={handleLoadAnomalyTest}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            campusName={campusName}
            buildingSummaries={buildingSummaries}
            carbonMetrics={carbonMetrics}
            anomalies={anomalies}
            recommendations={recommendations}
            emissionFactors={emissionFactors}
          />
        )}
      </main>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        factors={emissionFactors}
        onUpdateFactors={setEmissionFactors}
        campusName={campusName}
        onUpdateCampusName={setCampusName}
      />

      <ResponsibleAIModal
        isOpen={isResponsibleAIOpen}
        onClose={() => setIsResponsibleAIOpen(false)}
      />

      {/* Sleek Platform Footer */}
      <footer className="h-10 bg-slate-50 border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-widest shrink-0 mt-8">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-semibold">System Status: All Agents Online</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsResponsibleAIOpen(true)}
            className="hover:text-emerald-700 transition-colors uppercase tracking-widest"
          >
            Governance & Ethics
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-emerald-700 transition-colors uppercase tracking-widest"
          >
            Constants
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Decision-Support v1.0</span>
        </div>
      </footer>
    </div>
  );
}
