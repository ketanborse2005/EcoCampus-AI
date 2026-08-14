export interface EnergyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  building: string;
  electricity_kwh: number;
  occupancy: number;
  department?: string;
}

export interface WaterRecord {
  id: string;
  date: string; // YYYY-MM-DD
  building: string;
  water_liters: number;
  occupancy: number;
  department?: string;
}

export interface WasteRecord {
  id: string;
  date: string; // YYYY-MM-DD
  building: string;
  total_waste_kg: number;
  recyclable_kg: number;
  organic_kg: number;
  other_kg: number;
  occupancy?: number;
  department?: string;
}

export interface UnifiedRecord {
  id: string;
  date: string;
  building: string;
  electricity_kwh: number;
  water_liters: number;
  waste_kg: number;
  recyclable_kg?: number;
  organic_kg?: number;
  other_kg?: number;
  occupancy: number;
}

export type ResourceType = 'energy' | 'water' | 'waste' | 'all';

export interface ValidationIssue {
  row: number;
  column: string;
  type: 'error' | 'warning';
  severity?: 'error' | 'warning';
  message: string;
  value: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  qualityScore: number; // 0 - 100
  issues: ValidationIssue[];
  summary: string;
}

export interface AnomalyItem {
  id: string;
  date: string;
  building: string;
  resource: 'energy' | 'water' | 'waste';
  metric: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  perStudentChange?: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
  possibleCause: string;
  recommendedAction: string;
}

export interface EmissionFactors {
  electricity_factor_kg_per_kwh: number; // default 0.70 kg CO2e / kWh
  water_pumping_kg_per_1000l: number; // default 0.35 kg CO2e / 1000L
  waste_landfill_kg_per_kg: number; // default 0.85 kg CO2e / kg general waste
  waste_recycled_avoided_kg_per_kg: number; // default 1.20 kg CO2e avoided / kg
  waste_composted_avoided_kg_per_kg: number; // default 0.50 kg CO2e avoided / kg
  waste_recycling_offset_kg_per_kg?: number;
}

export interface CarbonMetrics {
  totalCarbonKg: number;
  energyCarbonKg: number;
  waterCarbonKg: number;
  wasteCarbonKg: number;
  avoidedCarbonKg: number;
  netCarbonKg: number;
  carbonPerStudentKg: number;
  emissionFactorUsed: number;
}

export interface SustainabilityAction {
  id: string;
  title: string;
  area: 'Energy' | 'Water' | 'Waste' | 'Cross-Campus';
  targetBuilding: string;
  estimatedImpact: 'High' | 'Medium' | 'Low';
  estimatedCost: 'High' | 'Medium' | 'Low';
  difficulty: 'High' | 'Medium' | 'Low';
  paybackTime: string;
  annualSavingsEstimate: string;
  co2ReductionEstimateKg: number;
  usageScore: number; // 0 - 100
  growthScore: number; // 0 - 100
  impactScore: number; // 0 - 100
  feasibilityScore: number; // 0 - 100
  priorityScore: number; // 0.4*usage + 0.3*growth + 0.2*impact + 0.1*feasibility
  reasoning: string;
  implementationSteps: string[];
}

export interface BuildingSummary {
  building: string;
  totalElectricityKwh: number;
  electricityPerStudent: number;
  electricityGrowthPct: number;
  totalWaterLiters: number;
  waterPerStudent: number;
  waterGrowthPct: number;
  totalWasteKg: number;
  wastePerStudent: number;
  wasteGrowthPct: number;
  recyclingRatePct: number;
  estimatedCarbonKg: number;
  occupancyAvg: number;
  priorityScore: number;
  anomalyCount: number;
}

export interface AgentTraceStep {
  agentName: 'Coordinator Agent' | 'Data Validation Agent' | 'Resource Analysis Agent' | 'Anomaly Detection Agent' | 'Carbon Calculation Agent' | 'Sustainability Research Agent' | 'Recommendation Agent' | 'Report Generation Agent';
  action: string;
  toolUsed: string;
  input: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'warning';
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface AgentCoordinationResponse {
  query: string;
  intent: string;
  workflow: string[];
  traces: AgentTraceStep[];
  directAnswer: string;
  keyInsights: string[];
  topRecommendations: SustainabilityAction[];
  anomaliesDetected: AnomalyItem[];
  buildingPrioritization: {
    topPriorityBuilding: string;
    rationale: string;
    scores: { building: string; score: number; rank: number }[];
  };
  carbonSummary: CarbonMetrics;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'agent-coordinator';
  text: string;
  timestamp: string;
  traces?: AgentTraceStep[];
  recommendations?: SustainabilityAction[];
  insights?: string[];
  anomalies?: AnomalyItem[];
}
