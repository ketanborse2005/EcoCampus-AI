import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BuildingSummary,
  CarbonMetrics,
  AnomalyItem,
  SustainabilityAction,
  EmissionFactors
} from '../types';

export function exportSustainabilityReportPDF({
  campusName = 'EcoCampus University',
  reportingPeriod = 'Q1 2026 (Jan - Apr)',
  buildingSummaries,
  carbonMetrics,
  anomalies,
  recommendations,
  factors,
}: {
  campusName?: string;
  reportingPeriod?: string;
  buildingSummaries: BuildingSummary[];
  carbonMetrics: CarbonMetrics;
  anomalies: AnomalyItem[];
  recommendations: SustainabilityAction[];
  factors: EmissionFactors;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [16, 120, 72]; // Forest Green
  const secondaryColor = [30, 41, 59]; // Slate Navy
  const accentColor = [22, 101, 52];

  // PAGE 1: Header & Executive Summary
  doc.setFillColor(16, 120, 72);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EcoCampus AI — Executive Sustainability Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Period: ${reportingPeriod}`, 130, 15);

  // Institution & Context Banner
  let y = 34;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Campus Resource Optimization: ${campusName}`, 14, y);

  y += 6;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This decision-support document summarizes cross-campus electricity, water, and waste consumption, highlights automated agentic anomaly detections, and provides transparent multi-criteria prioritized interventions.',
    14,
    y,
    { maxWidth: 182 }
  );

  // KPI Summary Blocks
  y += 14;
  doc.setFillColor(240, 253, 244); // light green
  doc.roundedRect(14, y, 42, 22, 2, 2, 'F');
  doc.setFillColor(239, 246, 255); // light blue
  doc.roundedRect(59, y, 42, 22, 2, 2, 'F');
  doc.setFillColor(254, 242, 242); // light amber/red
  doc.roundedRect(104, y, 42, 22, 2, 2, 'F');
  doc.setFillColor(245, 243, 255); // light purple
  doc.roundedRect(149, y, 47, 22, 2, 2, 'F');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ELECTRICITY', 17, y + 6);
  doc.text('TOTAL WATER USAGE', 62, y + 6);
  doc.text('TOTAL WASTE GEN', 107, y + 6);
  doc.text('NET CARBON FOOTPRINT', 152, y + 6);

  const totalKwh = buildingSummaries.reduce((a, b) => a + b.totalElectricityKwh, 0);
  const totalWater = buildingSummaries.reduce((a, b) => a + b.totalWaterLiters, 0);
  const totalWaste = buildingSummaries.reduce((a, b) => a + b.totalWasteKg, 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 120, 72);
  doc.text(`${(totalKwh / 1000).toFixed(1)}k kWh`, 17, y + 15);

  doc.setTextColor(30, 64, 175);
  doc.text(`${(totalWater / 1000000).toFixed(2)}M L`, 62, y + 15);

  doc.setTextColor(180, 83, 9);
  doc.text(`${(totalWaste / 1000).toFixed(1)}k kg`, 107, y + 15);

  doc.setTextColor(109, 40, 217);
  doc.text(`${(carbonMetrics.netCarbonKg / 1000).toFixed(1)} MT CO₂e`, 152, y + 15);

  // Section 1: Building Benchmarks Table
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('1. Building Resource Performance & Priority Scoring', 14, y);

  y += 4;
  const buildingTableData = buildingSummaries.map((b, idx) => [
    `#${idx + 1} ${b.building}`,
    `${b.totalElectricityKwh.toLocaleString()} kWh`,
    `${b.electricityPerStudent} kWh/st`,
    `${(b.totalWaterLiters / 1000).toLocaleString()}k L`,
    `${b.waterPerStudent} L/st`,
    `${b.totalWasteKg.toLocaleString()} kg`,
    `${b.recyclingRatePct}%`,
    `${b.anomalyCount > 0 ? `⚠️ ${b.anomalyCount} Alert` : 'Normal'}`,
    `${b.priorityScore} / 100`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [
      [
        'Building',
        'Electricity',
        'kWh/Capita',
        'Water',
        'L/Capita',
        'Waste',
        'Recycle %',
        'Status',
        'Score',
      ],
    ],
    body: buildingTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 120, 72],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      8: { cellWidth: 20, fontStyle: 'bold', textColor: [16, 120, 72] },
    },
  });

  // Section 2: Detected Anomalies
  y = (doc as any).lastAutoTable.finalY + 10;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('2. Anomaly Detection & Risk Diagnostics', 14, y);

  y += 4;
  const anomalyRows = anomalies.slice(0, 5).map((a) => [
    a.date,
    a.building,
    a.resource.toUpperCase(),
    `+${a.percentageChange}%`,
    a.severity.toUpperCase(),
    a.possibleCause,
    a.recommendedAction,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Building', 'Resource', 'Spike %', 'Severity', 'Probable Cause', 'Action']],
    body: anomalyRows.length > 0 ? anomalyRows : [['-', 'No critical anomalies detected in recent window', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      3: { textColor: [220, 38, 38], fontStyle: 'bold' },
      4: { fontStyle: 'bold' },
      5: { cellWidth: 45 },
      6: { cellWidth: 50 },
    },
  });

  // PAGE 2: Prioritized Action Plan & Methodology
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('3. Ranked Sustainability Action Plan (Multi-Agent Recommended)', 14, y);

  y += 5;
  const recRows = recommendations.slice(0, 6).map((r, i) => [
    `#${i + 1} ${r.title}`,
    r.area,
    r.targetBuilding,
    r.estimatedImpact,
    r.estimatedCost,
    r.paybackTime,
    `${r.co2ReductionEstimateKg.toLocaleString()} kg/yr`,
    `${r.priorityScore}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Recommended Intervention', 'Area', 'Target', 'Impact', 'Cost', 'Payback', 'CO₂ Savings', 'Priority']],
    body: recRows,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 120, 72],
      fontSize: 7.5,
    },
    styles: {
      fontSize: 7,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      7: { fontStyle: 'bold', textColor: [16, 120, 72] },
    },
  });

  // Section 4: Calculation Assumptions & Responsible AI Disclaimer
  y = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('4. Methodology, Emission Factors & Responsible AI Statement', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const formulaText = `• Priority Scoring Formula: Priority = 0.4 × (Usage Score) + 0.3 × (Growth Score) + 0.2 × (Impact Score) + 0.1 × (Feasibility Score)\n• Documented Emission Factors: Electricity = ${factors.electricity_factor_kg_per_kwh} kg CO₂e/kWh | Water pumping = ${factors.water_pumping_kg_per_1000l} kg CO₂e/kL | Landfill waste = ${factors.waste_landfill_kg_per_kg} kg CO₂e/kg\n• Avoided Emissions: Recycled materials offset = ${factors.waste_recycled_avoided_kg_per_kg} kg CO₂e/kg | Composted organics = ${factors.waste_composted_avoided_kg_per_kg} kg CO₂e/kg`;

  doc.text(formulaText, 14, y, { maxWidth: 182 });

  y += 18;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 28, 'F');
  doc.rect(14, y, 182, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Responsible AI & Decision-Support Disclaimer:', 17, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const disclaimer = `EcoCampus AI is an advisory decision-support system designed to augment facility managers and sustainability committees. Because prototype data may rely on simulated campus profiles, all recommendations, anomaly alarms, and financial payback estimates must be physically verified by qualified engineering personnel prior to equipment retrofit or capital expenditure. The AI model does not actuate hardware controllers or submit automated work orders without human administrator approval.`;

  doc.text(disclaimer, 17, y + 10, { maxWidth: 176 });

  // Save the PDF
  const filename = `EcoCampus_AI_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
