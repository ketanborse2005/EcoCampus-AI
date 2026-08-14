import {
  EnergyRecord,
  WaterRecord,
  WasteRecord,
  EmissionFactors,
  CarbonMetrics,
  BuildingSummary,
  AnomalyItem,
  ValidationResult,
  ValidationIssue,
  SustainabilityAction
} from '../types';

export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  electricity_factor_kg_per_kwh: 0.70,
  water_pumping_kg_per_1000l: 0.35,
  waste_landfill_kg_per_kg: 0.85,
  waste_recycled_avoided_kg_per_kg: 1.20,
  waste_composted_avoided_kg_per_kg: 0.50,
};

// 1. Data Validation Engine
export function validateDataset(
  records: any[],
  type: 'energy' | 'water' | 'waste' | 'unified'
): ValidationResult {
  const issues: ValidationIssue[] = [];
  let validRows = 0;
  const seenKeys = new Set<string>();

  if (!Array.isArray(records) || records.length === 0) {
    return {
      isValid: false,
      totalRows: 0,
      validRows: 0,
      errorCount: 1,
      warningCount: 0,
      qualityScore: 0,
      issues: [
        {
          row: 0,
          column: 'dataset',
          type: 'error',
          message: 'The uploaded dataset is empty or invalid format.',
          value: null,
        },
      ],
      summary: 'Empty dataset provided.',
    };
  }

  records.forEach((row, idx) => {
    const rowNum = idx + 1;
    let rowHasError = false;

    // Check building
    if (!row.building || typeof row.building !== 'string' || row.building.trim() === '') {
      issues.push({
        row: rowNum,
        column: 'building',
        type: 'error',
        message: 'Missing or blank building name.',
        value: row.building,
      });
      rowHasError = true;
    }

    // Check date
    if (!row.date || isNaN(Date.parse(row.date))) {
      issues.push({
        row: rowNum,
        column: 'date',
        type: 'error',
        message: 'Invalid or missing date (expected YYYY-MM-DD).',
        value: row.date,
      });
      rowHasError = true;
    }

    // Check duplicates
    if (row.building && row.date) {
      const compositeKey = `${row.building.trim().toLowerCase()}_${row.date.trim()}`;
      if (seenKeys.has(compositeKey)) {
        issues.push({
          row: rowNum,
          column: 'building+date',
          type: 'warning',
          message: `Duplicate record for ${row.building} on ${row.date}.`,
          value: compositeKey,
        });
      } else {
        seenKeys.add(compositeKey);
      }
    }

    // Check occupancy
    const occ = Number(row.occupancy ?? row.students);
    if (occ === 0) {
      issues.push({
        row: rowNum,
        column: 'occupancy',
        type: 'warning',
        message: 'Zero occupancy detected (may cause division-by-zero in per-capita metrics).',
        value: occ,
      });
    } else if (isNaN(occ) || occ < 0) {
      issues.push({
        row: rowNum,
        column: 'occupancy',
        type: 'error',
        message: 'Occupancy must be a positive integer.',
        value: row.occupancy ?? row.students,
      });
      rowHasError = true;
    }

    // Type specific checks
    if (type === 'energy' || type === 'unified') {
      const kwh = Number(row.electricity_kwh);
      if (isNaN(kwh) || kwh < 0) {
        issues.push({
          row: rowNum,
          column: 'electricity_kwh',
          type: 'error',
          message: 'Electricity consumption must be a non-negative number.',
          value: row.electricity_kwh,
        });
        rowHasError = true;
      } else if (kwh > 500000) {
        issues.push({
          row: rowNum,
          column: 'electricity_kwh',
          type: 'warning',
          message: 'Extremely high electricity value (>500,000 kWh). Verify meter reading units.',
          value: kwh,
        });
      }
    }

    if (type === 'water' || type === 'unified') {
      const liters = Number(row.water_liters);
      if (isNaN(liters) || liters < 0) {
        issues.push({
          row: rowNum,
          column: 'water_liters',
          type: 'error',
          message: 'Water usage must be a non-negative number.',
          value: row.water_liters,
        });
        rowHasError = true;
      }
    }

    if (type === 'waste' || type === 'unified') {
      const waste = Number(row.total_waste_kg ?? row.waste_kg);
      if (isNaN(waste) || waste < 0) {
        issues.push({
          row: rowNum,
          column: 'waste_kg',
          type: 'error',
          message: 'Waste generated must be a non-negative number.',
          value: row.total_waste_kg ?? row.waste_kg,
        });
        rowHasError = true;
      }
    }

    if (!rowHasError) {
      validRows++;
    }
  });

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;
  const qualityScore = Math.max(
    0,
    Math.round(100 - (errorCount * 15 + warningCount * 5) / Math.max(1, records.length / 5))
  );

  return {
    isValid: errorCount === 0,
    totalRows: records.length,
    validRows,
    errorCount,
    warningCount,
    qualityScore: Math.min(100, qualityScore),
    issues,
    summary:
      errorCount === 0
        ? `Dataset validated successfully (${validRows}/${records.length} clean rows, quality score: ${qualityScore}%).`
        : `Dataset contains ${errorCount} blocking errors and ${warningCount} warnings across ${records.length} rows.`,
  };
}

// 2. Resource & Per-Student Calculations
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function calculatePerStudent(totalValue: number, occupancy: number): number {
  if (!occupancy || occupancy <= 0) return 0;
  return Number((totalValue / occupancy).toFixed(2));
}

// 3. Carbon Estimation Engine
export function calculateCarbonMetrics(
  energyRecords: EnergyRecord[],
  waterRecords: WaterRecord[],
  wasteRecords: WasteRecord[],
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): CarbonMetrics {
  const totalKwh = energyRecords.reduce((acc, r) => acc + (Number(r.electricity_kwh) || 0), 0);
  const totalWaterLiters = waterRecords.reduce((acc, r) => acc + (Number(r.water_liters) || 0), 0);

  const totalOtherWasteKg = wasteRecords.reduce((acc, r) => acc + (Number(r.other_kg ?? r.total_waste_kg) || 0), 0);
  const totalRecyclableKg = wasteRecords.reduce((acc, r) => acc + (Number(r.recyclable_kg) || 0), 0);
  const totalOrganicKg = wasteRecords.reduce((acc, r) => acc + (Number(r.organic_kg) || 0), 0);

  const energyCarbonKg = totalKwh * factors.electricity_factor_kg_per_kwh;
  const waterCarbonKg = (totalWaterLiters / 1000) * factors.water_pumping_kg_per_1000l;
  const wasteCarbonKg = totalOtherWasteKg * factors.waste_landfill_kg_per_kg;

  const avoidedCarbonKg =
    totalRecyclableKg * factors.waste_recycled_avoided_kg_per_kg +
    totalOrganicKg * factors.waste_composted_avoided_kg_per_kg;

  const totalCarbonKg = energyCarbonKg + waterCarbonKg + wasteCarbonKg;
  const netCarbonKg = Math.max(0, totalCarbonKg - avoidedCarbonKg);

  // Total unique campus occupancy estimation
  const latestEnergyOccupancies = getLatestOccupancyMap(energyRecords);
  const totalCampusOccupants = Object.values(latestEnergyOccupancies).reduce((a, b) => a + b, 0) || 1;
  const carbonPerStudentKg = Number((netCarbonKg / totalCampusOccupants).toFixed(2));

  return {
    totalCarbonKg: Math.round(totalCarbonKg),
    energyCarbonKg: Math.round(energyCarbonKg),
    waterCarbonKg: Math.round(waterCarbonKg),
    wasteCarbonKg: Math.round(wasteCarbonKg),
    avoidedCarbonKg: Math.round(avoidedCarbonKg),
    netCarbonKg: Math.round(netCarbonKg),
    carbonPerStudentKg,
    emissionFactorUsed: factors.electricity_factor_kg_per_kwh,
  };
}

function getLatestOccupancyMap(records: { building: string; date: string; occupancy?: number }[]) {
  const map: Record<string, { date: string; occ: number }> = {};
  records.forEach((r) => {
    if (!map[r.building] || r.date > map[r.building].date) {
      map[r.building] = { date: r.date, occ: r.occupancy || 0 };
    }
  });
  const res: Record<string, number> = {};
  Object.keys(map).forEach((k) => (res[k] = map[k].occ));
  return res;
}

// 4. Anomaly Detection Engine
export function detectAnomalies(
  energyRecords: EnergyRecord[],
  waterRecords: WaterRecord[],
  wasteRecords: WasteRecord[]
): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];

  // Group energy by building sorted by date
  detectResourceAnomalies(
    energyRecords.map((e) => ({
      id: e.id,
      date: e.date,
      building: e.building,
      value: e.electricity_kwh,
      occupancy: e.occupancy,
    })),
    'energy',
    'kWh',
    15, // >15% spike threshold
    anomalies
  );

  // Water
  detectResourceAnomalies(
    waterRecords.map((w) => ({
      id: w.id,
      date: w.date,
      building: w.building,
      value: w.water_liters,
      occupancy: w.occupancy,
    })),
    'water',
    'Liters',
    18, // >18% spike threshold
    anomalies
  );

  // Waste
  detectResourceAnomalies(
    wasteRecords.map((w) => ({
      id: w.id,
      date: w.date,
      building: w.building,
      value: w.total_waste_kg,
      occupancy: w.occupancy || 500,
    })),
    'waste',
    'kg',
    20, // >20% spike threshold
    anomalies
  );

  return anomalies.sort((a, b) => (a.severity === 'high' ? -1 : 1));
}

function detectResourceAnomalies(
  items: { id: string; date: string; building: string; value: number; occupancy: number }[],
  resource: 'energy' | 'water' | 'waste',
  unit: string,
  thresholdPct: number,
  output: AnomalyItem[]
) {
  const grouped: Record<string, typeof items> = {};
  items.forEach((item) => {
    if (!grouped[item.building]) grouped[item.building] = [];
    grouped[item.building].push(item);
  });

  Object.entries(grouped).forEach(([building, list]) => {
    list.sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1];
      const curr = list[i];
      const changePct = calculatePercentageChange(curr.value, prev.value);
      const currPerCapita = calculatePerStudent(curr.value, curr.occupancy);
      const prevPerCapita = calculatePerStudent(prev.value, prev.occupancy);
      const perCapitaChange = calculatePercentageChange(currPerCapita, prevPerCapita);

      if (changePct >= thresholdPct) {
        const isSevere = changePct >= thresholdPct * 1.8;
        let possibleCause = '';
        let recommendedAction = '';

        if (resource === 'energy') {
          possibleCause = isSevere
            ? 'Likely continuous HVAC compressor fault, unmonitored server load, or lighting left on 24/7.'
            : 'Increased equipment usage or sub-optimal scheduling of cooling systems.';
          recommendedAction = 'Schedule building energy audit, inspect AHU timer controls, and review HVAC thermostats.';
        } else if (resource === 'water') {
          possibleCause = isSevere
            ? 'High probability of underground pipe rupture, malfunctioning cistern flushes, or cooling tower overflow.'
            : 'Elevated tap usage or unmonitored garden irrigation schedule.';
          recommendedAction = 'Conduct immediate acoustic acoustic leak inspection and check sub-meter valve registers.';
        } else {
          possibleCause = 'Surge in single-use packaging, move-in/move-out events, or unsegregated canteen food scrap disposal.';
          recommendedAction = 'Deploy dedicated organic composting bins and initiate student zero-waste campaign.';
        }

        output.push({
          id: `anom-${resource}-${building}-${curr.date}`,
          date: curr.date,
          building,
          resource,
          metric: `${resource.toUpperCase()} Consumption (${unit})`,
          currentValue: curr.value,
          previousValue: prev.value,
          percentageChange: changePct,
          perStudentChange: perCapitaChange,
          severity: isSevere ? 'high' : 'medium',
          description: `${building} saw a ${changePct}% increase in ${resource} consumption from ${prev.date} (${prev.value.toLocaleString()} ${unit}) to ${curr.date} (${curr.value.toLocaleString()} ${unit}).`,
          possibleCause,
          recommendedAction,
        });
      }
    }
  });
}

// 5. Building Summaries and Recommendation Priority Scoring
// Priority score = 0.4(usage score) + 0.3(growth score) + 0.2(impact score) + 0.1(feasibility score)
export function calculateBuildingSummaries(
  energyRecords: EnergyRecord[],
  waterRecords: WaterRecord[],
  wasteRecords: WasteRecord[],
  anomalies: AnomalyItem[],
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): BuildingSummary[] {
  const buildings = Array.from(
    new Set([
      ...energyRecords.map((r) => r.building),
      ...waterRecords.map((r) => r.building),
      ...wasteRecords.map((r) => r.building),
    ])
  );

  // Maximum metrics across campus for normalized scoring (0 - 100)
  const maxElectricity = Math.max(1, ...buildings.map((b) => sumResource(energyRecords, b, 'electricity_kwh')));
  const maxWater = Math.max(1, ...buildings.map((b) => sumResource(waterRecords, b, 'water_liters')));
  const maxWaste = Math.max(1, ...buildings.map((b) => sumResource(wasteRecords, b, 'total_waste_kg')));

  return buildings.map((building) => {
    const bEnergy = energyRecords.filter((r) => r.building === building).sort((a, b) => a.date.localeCompare(b.date));
    const bWater = waterRecords.filter((r) => r.building === building).sort((a, b) => a.date.localeCompare(b.date));
    const bWaste = wasteRecords.filter((r) => r.building === building).sort((a, b) => a.date.localeCompare(b.date));

    const totalElectricityKwh = bEnergy.reduce((a, b) => a + b.electricity_kwh, 0);
    const totalWaterLiters = bWater.reduce((a, b) => a + b.water_liters, 0);
    const totalWasteKg = bWaste.reduce((a, b) => a + b.total_waste_kg, 0);
    const totalRecyclableKg = bWaste.reduce((a, b) => a + (b.recyclable_kg || 0), 0);

    const latestEnergy = bEnergy[bEnergy.length - 1];
    const prevEnergy = bEnergy[bEnergy.length - 2];
    const latestWater = bWater[bWater.length - 1];
    const prevWater = bWater[bWater.length - 2];
    const latestWaste = bWaste[bWaste.length - 1];
    const prevWaste = bWaste[bWaste.length - 2];

    const occupancyAvg = latestEnergy?.occupancy || latestWater?.occupancy || 500;

    const electricityPerStudent = calculatePerStudent(totalElectricityKwh, occupancyAvg * Math.max(1, bEnergy.length));
    const waterPerStudent = calculatePerStudent(totalWaterLiters, occupancyAvg * Math.max(1, bWater.length));
    const wastePerStudent = calculatePerStudent(totalWasteKg, occupancyAvg * Math.max(1, bWaste.length));

    const electricityGrowthPct = prevEnergy ? calculatePercentageChange(latestEnergy.electricity_kwh, prevEnergy.electricity_kwh) : 0;
    const waterGrowthPct = prevWater ? calculatePercentageChange(latestWater.water_liters, prevWater.water_liters) : 0;
    const wasteGrowthPct = prevWaste ? calculatePercentageChange(latestWaste.total_waste_kg, prevWaste.total_waste_kg) : 0;

    const recyclingRatePct = totalWasteKg > 0 ? Number(((totalRecyclableKg / totalWasteKg) * 100).toFixed(1)) : 0;
    const estimatedCarbonKg = Math.round(
      totalElectricityKwh * factors.electricity_factor_kg_per_kwh +
      (totalWaterLiters / 1000) * factors.water_pumping_kg_per_1000l +
      totalWasteKg * factors.waste_landfill_kg_per_kg
    );

    // Scoring math:
    const usageScore = Math.round(
      ((totalElectricityKwh / maxElectricity) * 0.45 +
        (totalWaterLiters / maxWater) * 0.35 +
        (totalWasteKg / maxWaste) * 0.2) *
        100
    );

    const maxGrowth = Math.max(0, electricityGrowthPct, waterGrowthPct, wasteGrowthPct);
    const growthScore = Math.min(100, Math.max(0, Math.round(maxGrowth * 3)));

    const impactScore = Math.round(Math.min(100, (estimatedCarbonKg / 20000) * 100));
    const feasibilityScore = 75; // Standard high baseline feasibility for student campus retrofits

    const priorityScore = Number(
      (0.4 * usageScore + 0.3 * growthScore + 0.2 * impactScore + 0.1 * feasibilityScore).toFixed(1)
    );

    const bAnomalies = anomalies.filter((a) => a.building === building);

    return {
      building,
      totalElectricityKwh,
      electricityPerStudent,
      electricityGrowthPct,
      totalWaterLiters,
      waterPerStudent,
      waterGrowthPct,
      totalWasteKg,
      wastePerStudent,
      wasteGrowthPct,
      recyclingRatePct,
      estimatedCarbonKg,
      occupancyAvg,
      priorityScore,
      anomalyCount: bAnomalies.length,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

function sumResource(list: any[], building: string, key: string): number {
  return list.filter((r) => r.building === building).reduce((a, b) => a + (Number(b[key]) || 0), 0);
}

// 6. Sustainability Recommendation Catalog & Ranking Engine
export function generateRankedRecommendations(
  buildingSummaries: BuildingSummary[],
  anomalies: AnomalyItem[]
): SustainabilityAction[] {
  const actions: SustainabilityAction[] = [];

  buildingSummaries.forEach((bs) => {
    // 1. Water Leak inspection for high water usage or anomalies
    const hasWaterAnomaly = anomalies.some((a) => a.building === bs.building && a.resource === 'water');
    if (hasWaterAnomaly || bs.waterGrowthPct > 10 || bs.waterPerStudent > 1000) {
      actions.push({
        id: `rec-water-leak-${bs.building}`,
        title: `Comprehensive Water Infrastructure & Leak Audit at ${bs.building}`,
        area: 'Water',
        targetBuilding: bs.building,
        estimatedImpact: hasWaterAnomaly ? 'High' : 'Medium',
        estimatedCost: 'Low',
        difficulty: 'Low',
        paybackTime: 'Immediate (< 1 month)',
        annualSavingsEstimate: '1,200,000 Liters / year',
        co2ReductionEstimateKg: 420,
        usageScore: Math.min(100, Math.round(bs.waterPerStudent / 12)),
        growthScore: Math.min(100, Math.max(20, Math.round(bs.waterGrowthPct * 3.5))),
        impactScore: 88,
        feasibilityScore: 92,
        priorityScore: Number((0.4 * 85 + 0.3 * (bs.waterGrowthPct > 0 ? 80 : 30) + 0.2 * 88 + 0.1 * 92).toFixed(1)),
        reasoning: `${bs.building} exhibits elevated per-capita water usage (${bs.waterPerStudent} L/student) and recent consumption growth (+${bs.waterGrowthPct}%). Targeted pipeline acoustic inspections and float-valve repairs can arrest continuous leakage.`,
        implementationSteps: [
          'Deploy maintenance crew to verify all flush valves and overhead cistern float valves.',
          'Conduct nighttime zero-flow pressure test to confirm hidden pipe fractures.',
          'Install sub-meter digital flow logger to monitor hourly baseline usage.',
        ],
      });
    }

    // 2. LED lighting replacement & Smart scheduling
    if (bs.totalElectricityKwh > 30000 || bs.electricityPerStudent > 25) {
      actions.push({
        id: `rec-energy-led-${bs.building}`,
        title: `LED Retrofit & Automated Classroom Lighting Controls in ${bs.building}`,
        area: 'Energy',
        targetBuilding: bs.building,
        estimatedImpact: 'High',
        estimatedCost: 'Medium',
        difficulty: 'Medium',
        paybackTime: '6 - 9 months',
        annualSavingsEstimate: `${Math.round(bs.totalElectricityKwh * 0.18).toLocaleString()} kWh / year`,
        co2ReductionEstimateKg: Math.round(bs.totalElectricityKwh * 0.18 * 0.7),
        usageScore: Math.min(100, Math.round(bs.electricityPerStudent * 2.8)),
        growthScore: Math.min(100, Math.max(15, Math.round(bs.electricityGrowthPct * 3))),
        impactScore: 85,
        feasibilityScore: 80,
        priorityScore: Number((0.4 * 80 + 0.3 * 65 + 0.2 * 85 + 0.1 * 80).toFixed(1)),
        reasoning: `Electricity consumption in ${bs.building} averages ${bs.electricityPerStudent} kWh/occupant. Replacing fluorescent tubes with PIR motion sensors and high-lumen LED arrays typically cuts lighting load by 40-55%.`,
        implementationSteps: [
          'Audit existing luminaire fixtures and classroom occupancy schedules.',
          'Replace 36W fluorescent tubes with 14W T8 LED tubes.',
          'Install occupancy sensors in restrooms, seminar halls, and study corridors.',
        ],
      });
    }

    // 3. Solar Feasibility Study
    if (bs.totalElectricityKwh > 50000) {
      actions.push({
        id: `rec-solar-${bs.building}`,
        title: `Rooftop Solar PV Feasibility & Microgrid Assessment for ${bs.building}`,
        area: 'Energy',
        targetBuilding: bs.building,
        estimatedImpact: 'High',
        estimatedCost: 'High',
        difficulty: 'Medium',
        paybackTime: '3.5 - 4.5 years',
        annualSavingsEstimate: '45,000 kWh clean generation / year',
        co2ReductionEstimateKg: 31500,
        usageScore: 90,
        growthScore: 50,
        impactScore: 95,
        feasibilityScore: 65,
        priorityScore: Number((0.4 * 90 + 0.3 * 50 + 0.2 * 95 + 0.1 * 65).toFixed(1)),
        reasoning: `${bs.building} has large baseload demands. A 40 kWp rooftop solar installation can offset ~30% of daytime grid electricity with zero emissions.`,
        implementationSteps: [
          'Measure unshaded rooftop area and structural load tolerance.',
          'Perform PVsyst solar irradiance and seasonal shading simulation.',
          'Submit capital expenditure and net-metering proposal to Sustainability Committee.',
        ],
      });
    }

    // 4. Waste Segregation & Composting
    if (bs.totalWasteKg > 3000 || bs.recyclingRatePct < 30) {
      actions.push({
        id: `rec-waste-compost-${bs.building}`,
        title: `4-Bin Source Segregation & Organic Composting Station at ${bs.building}`,
        area: 'Waste',
        targetBuilding: bs.building,
        estimatedImpact: 'Medium',
        estimatedCost: 'Low',
        difficulty: 'Low',
        paybackTime: '2 - 3 months',
        annualSavingsEstimate: `${Math.round(bs.totalWasteKg * 0.45).toLocaleString()} kg diverted from landfill`,
        co2ReductionEstimateKg: Math.round(bs.totalWasteKg * 0.45 * 0.85),
        usageScore: Math.min(100, Math.round(bs.wastePerStudent * 30)),
        growthScore: Math.min(100, Math.max(20, Math.round(bs.wasteGrowthPct * 3))),
        impactScore: 78,
        feasibilityScore: 95,
        priorityScore: Number((0.4 * 75 + 0.3 * 60 + 0.2 * 78 + 0.1 * 95).toFixed(1)),
        reasoning: `Current recycling rate at ${bs.building} is ${bs.recyclingRatePct}%. Organic food scraps and recyclables make up >65% of the waste stream. On-site aerobic compost tumblers convert waste into campus garden fertilizer.`,
        implementationSteps: [
          'Deploy color-coded 4-bin stations (Wet/Organic, Dry Paper/Cardboard, Plastics/Metal, E-Waste/Haz).',
          'Setup twin 200L aerobic composting tumblers near kitchen or maintenance yard.',
          'Enlist student green club volunteers for weekly segregation audits.',
        ],
      });
    }
  });

  // Cross campus baseline recommendation
  actions.push({
    id: 'rec-cross-submeter',
    title: 'Install Smart Digital IoT Sub-Meters on Main Distribution Feeders',
    area: 'Cross-Campus',
    targetBuilding: 'Campus-Wide',
    estimatedImpact: 'High',
    estimatedCost: 'Medium',
    difficulty: 'Low',
    paybackTime: '4 - 6 months',
    annualSavingsEstimate: '8-12% baseline reduction via real-time anomaly alerts',
    co2ReductionEstimateKg: 14500,
    usageScore: 85,
    growthScore: 70,
    impactScore: 90,
    feasibilityScore: 85,
    priorityScore: 83.5,
    reasoning: 'Automated 15-minute resolution sub-metering empowers facility teams to isolate overnight phantom loads, peak tariff spikes, and abnormal water leaks in real-time.',
    implementationSteps: [
      'Identify top 5 high-demand electrical panels and primary water intake manifolds.',
      'Mount non-invasive RS485 Modbus / LoRaWAN power meters and ultrasonic water flow sensors.',
      'Connect telemetry directly to EcoCampus AI decision-support dashboard.',
    ],
  });

  return actions.sort((a, b) => b.priorityScore - a.priorityScore);
}

// CSV Parsers for Data Manager
export function parseEnergyCSV(csvText: string): EnergyRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const dateIdx = headers.indexOf('date');
  const bldgIdx = headers.indexOf('building');
  const kwhIdx = headers.findIndex((h) => h.includes('kwh') || h.includes('electricity'));
  const occIdx = headers.indexOf('occupancy');
  const deptIdx = headers.indexOf('department');

  const records: EnergyRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim());
    const date = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().slice(0, 10);
    const building = bldgIdx >= 0 ? cols[bldgIdx] : `Building ${i}`;
    const electricity_kwh = kwhIdx >= 0 ? parseFloat(cols[kwhIdx]) || 0 : 0;
    const occupancy = occIdx >= 0 ? parseInt(cols[occIdx]) || 1 : 100;
    const department = deptIdx >= 0 ? cols[deptIdx] : undefined;

    records.push({
      id: `energy-csv-${i}-${Date.now()}`,
      date,
      building,
      electricity_kwh,
      occupancy,
      department,
    });
  }
  return records;
}

export function parseWaterCSV(csvText: string): WaterRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const dateIdx = headers.indexOf('date');
  const bldgIdx = headers.indexOf('building');
  const waterIdx = headers.findIndex((h) => h.includes('water') || h.includes('liters') || h.includes('litres'));
  const occIdx = headers.indexOf('occupancy');
  const deptIdx = headers.indexOf('department');

  const records: WaterRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim());
    const date = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().slice(0, 10);
    const building = bldgIdx >= 0 ? cols[bldgIdx] : `Building ${i}`;
    const water_liters = waterIdx >= 0 ? parseFloat(cols[waterIdx]) || 0 : 0;
    const occupancy = occIdx >= 0 ? parseInt(cols[occIdx]) || 1 : 100;
    const department = deptIdx >= 0 ? cols[deptIdx] : undefined;

    records.push({
      id: `water-csv-${i}-${Date.now()}`,
      date,
      building,
      water_liters,
      occupancy,
      department,
    });
  }
  return records;
}

export function parseWasteCSV(csvText: string): WasteRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const dateIdx = headers.indexOf('date');
  const bldgIdx = headers.indexOf('building');
  const totalIdx = headers.findIndex((h) => h.includes('total_waste') || h.includes('total'));
  const recIdx = headers.findIndex((h) => h.includes('recyclable') || h.includes('recycled'));
  const orgIdx = headers.findIndex((h) => h.includes('organic') || h.includes('compost'));
  const othIdx = headers.findIndex((h) => h.includes('other') || h.includes('landfill'));
  const occIdx = headers.indexOf('occupancy');

  const records: WasteRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim());
    const date = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().slice(0, 10);
    const building = bldgIdx >= 0 ? cols[bldgIdx] : `Building ${i}`;
    const total_waste_kg = totalIdx >= 0 ? parseFloat(cols[totalIdx]) || 0 : 0;
    const recyclable_kg = recIdx >= 0 ? parseFloat(cols[recIdx]) || 0 : 0;
    const organic_kg = orgIdx >= 0 ? parseFloat(cols[orgIdx]) || 0 : 0;
    const other_kg = othIdx >= 0 ? parseFloat(cols[othIdx]) || 0 : Math.max(0, total_waste_kg - (recyclable_kg + organic_kg));
    const occupancy = occIdx >= 0 ? parseInt(cols[occIdx]) || 1 : 100;

    records.push({
      id: `waste-csv-${i}-${Date.now()}`,
      date,
      building,
      total_waste_kg,
      recyclable_kg,
      organic_kg,
      other_kg,
      occupancy,
    });
  }
  return records;
}

