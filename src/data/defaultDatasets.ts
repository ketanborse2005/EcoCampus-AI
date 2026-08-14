import { EnergyRecord, WaterRecord, WasteRecord, UnifiedRecord } from '../types';

export const DEFAULT_ENERGY_DATA: EnergyRecord[] = [
  { id: 'e-1', date: '2026-01-01', building: 'Engineering', electricity_kwh: 18400, occupancy: 850 },
  { id: 'e-2', date: '2026-01-01', building: 'Library', electricity_kwh: 9600, occupancy: 430 },
  { id: 'e-3', date: '2026-01-01', building: 'Hostel A', electricity_kwh: 22600, occupancy: 620 },
  { id: 'e-4', date: '2026-01-01', building: 'Hostel B', electricity_kwh: 19800, occupancy: 580 },
  { id: 'e-5', date: '2026-01-01', building: 'Science Complex', electricity_kwh: 24500, occupancy: 700 },
  { id: 'e-6', date: '2026-01-01', building: 'Admin Block', electricity_kwh: 7200, occupancy: 180 },
  { id: 'e-7', date: '2026-01-01', building: 'Student Canteen', electricity_kwh: 12400, occupancy: 1200 },

  { id: 'e-8', date: '2026-02-01', building: 'Engineering', electricity_kwh: 20100, occupancy: 850 },
  { id: 'e-9', date: '2026-02-01', building: 'Library', electricity_kwh: 10100, occupancy: 430 },
  { id: 'e-10', date: '2026-02-01', building: 'Hostel A', electricity_kwh: 23900, occupancy: 620 },
  { id: 'e-11', date: '2026-02-01', building: 'Hostel B', electricity_kwh: 20400, occupancy: 580 },
  { id: 'e-12', date: '2026-02-01', building: 'Science Complex', electricity_kwh: 25100, occupancy: 700 },
  { id: 'e-13', date: '2026-02-01', building: 'Admin Block', electricity_kwh: 7300, occupancy: 180 },
  { id: 'e-14', date: '2026-02-01', building: 'Student Canteen', electricity_kwh: 12900, occupancy: 1200 },

  { id: 'e-15', date: '2026-03-01', building: 'Engineering', electricity_kwh: 21800, occupancy: 850 },
  { id: 'e-16', date: '2026-03-01', building: 'Library', electricity_kwh: 9800, occupancy: 430 },
  { id: 'e-17', date: '2026-03-01', building: 'Hostel A', electricity_kwh: 26200, occupancy: 620 }, // Anomaly spike
  { id: 'e-18', date: '2026-03-01', building: 'Hostel B', electricity_kwh: 20900, occupancy: 580 },
  { id: 'e-19', date: '2026-03-01', building: 'Science Complex', electricity_kwh: 26400, occupancy: 700 },
  { id: 'e-20', date: '2026-03-01', building: 'Admin Block', electricity_kwh: 7100, occupancy: 180 },
  { id: 'e-21', date: '2026-03-01', building: 'Student Canteen', electricity_kwh: 13200, occupancy: 1200 },

  { id: 'e-22', date: '2026-04-01', building: 'Engineering', electricity_kwh: 21200, occupancy: 850 },
  { id: 'e-23', date: '2026-04-01', building: 'Library', electricity_kwh: 9400, occupancy: 430 },
  { id: 'e-24', date: '2026-04-01', building: 'Hostel A', electricity_kwh: 25400, occupancy: 620 },
  { id: 'e-25', date: '2026-04-01', building: 'Hostel B', electricity_kwh: 20100, occupancy: 580 },
  { id: 'e-26', date: '2026-04-01', building: 'Science Complex', electricity_kwh: 25800, occupancy: 700 },
  { id: 'e-27', date: '2026-04-01', building: 'Admin Block', electricity_kwh: 6900, occupancy: 180 },
  { id: 'e-28', date: '2026-04-01', building: 'Student Canteen', electricity_kwh: 12800, occupancy: 1200 },
];

export const DEFAULT_WATER_DATA: WaterRecord[] = [
  { id: 'w-1', date: '2026-01-01', building: 'Engineering', water_liters: 520000, occupancy: 850 },
  { id: 'w-2', date: '2026-01-01', building: 'Library', water_liters: 210000, occupancy: 430 },
  { id: 'w-3', date: '2026-01-01', building: 'Hostel A', water_liters: 780000, occupancy: 620 },
  { id: 'w-4', date: '2026-01-01', building: 'Hostel B', water_liters: 740000, occupancy: 580 },
  { id: 'w-5', date: '2026-01-01', building: 'Science Complex', water_liters: 610000, occupancy: 700 },
  { id: 'w-6', date: '2026-01-01', building: 'Admin Block', water_liters: 140000, occupancy: 180 },
  { id: 'w-7', date: '2026-01-01', building: 'Student Canteen', water_liters: 690000, occupancy: 1200 },

  { id: 'w-8', date: '2026-02-01', building: 'Engineering', water_liters: 535000, occupancy: 850 },
  { id: 'w-9', date: '2026-02-01', building: 'Library', water_liters: 218000, occupancy: 430 },
  { id: 'w-10', date: '2026-02-01', building: 'Hostel A', water_liters: 805000, occupancy: 620 },
  { id: 'w-11', date: '2026-02-01', building: 'Hostel B', water_liters: 760000, occupancy: 580 },
  { id: 'w-12', date: '2026-02-01', building: 'Science Complex', water_liters: 625000, occupancy: 700 },
  { id: 'w-13', date: '2026-02-01', building: 'Admin Block', water_liters: 142000, occupancy: 180 },
  { id: 'w-14', date: '2026-02-01', building: 'Student Canteen', water_liters: 710000, occupancy: 1200 },

  { id: 'w-15', date: '2026-03-01', building: 'Engineering', water_liters: 545000, occupancy: 850 },
  { id: 'w-16', date: '2026-03-01', building: 'Library', water_liters: 215000, occupancy: 430 },
  { id: 'w-17', date: '2026-03-01', building: 'Hostel A', water_liters: 940000, occupancy: 620 }, // Severe water leak anomaly
  { id: 'w-18', date: '2026-03-01', building: 'Hostel B', water_liters: 775000, occupancy: 580 },
  { id: 'w-19', date: '2026-03-01', building: 'Science Complex', water_liters: 630000, occupancy: 700 },
  { id: 'w-20', date: '2026-03-01', building: 'Admin Block', water_liters: 139000, occupancy: 180 },
  { id: 'w-21', date: '2026-03-01', building: 'Student Canteen', water_liters: 725000, occupancy: 1200 },

  { id: 'w-22', date: '2026-04-01', building: 'Engineering', water_liters: 530000, occupancy: 850 },
  { id: 'w-23', date: '2026-04-01', building: 'Library', water_liters: 212000, occupancy: 430 },
  { id: 'w-24', date: '2026-04-01', building: 'Hostel A', water_liters: 860000, occupancy: 620 },
  { id: 'w-25', date: '2026-04-01', building: 'Hostel B', water_liters: 755000, occupancy: 580 },
  { id: 'w-26', date: '2026-04-01', building: 'Science Complex', water_liters: 620000, occupancy: 700 },
  { id: 'w-27', date: '2026-04-01', building: 'Admin Block', water_liters: 138000, occupancy: 180 },
  { id: 'w-28', date: '2026-04-01', building: 'Student Canteen', water_liters: 705000, occupancy: 1200 },
];

export const DEFAULT_WASTE_DATA: WasteRecord[] = [
  { id: 'ws-1', date: '2026-01-01', building: 'Engineering', total_waste_kg: 920, recyclable_kg: 310, organic_kg: 420, other_kg: 190, occupancy: 850 },
  { id: 'ws-2', date: '2026-01-01', building: 'Library', total_waste_kg: 410, recyclable_kg: 180, organic_kg: 120, other_kg: 110, occupancy: 430 },
  { id: 'ws-3', date: '2026-01-01', building: 'Hostel A', total_waste_kg: 1350, recyclable_kg: 300, organic_kg: 720, other_kg: 330, occupancy: 620 },
  { id: 'ws-4', date: '2026-01-01', building: 'Hostel B', total_waste_kg: 1220, recyclable_kg: 280, organic_kg: 660, other_kg: 280, occupancy: 580 },
  { id: 'ws-5', date: '2026-01-01', building: 'Science Complex', total_waste_kg: 890, recyclable_kg: 260, organic_kg: 390, other_kg: 240, occupancy: 700 },
  { id: 'ws-6', date: '2026-01-01', building: 'Admin Block', total_waste_kg: 310, recyclable_kg: 160, organic_kg: 70, other_kg: 80, occupancy: 180 },
  { id: 'ws-7', date: '2026-01-01', building: 'Student Canteen', total_waste_kg: 2400, recyclable_kg: 420, organic_kg: 1680, other_kg: 300, occupancy: 1200 },

  { id: 'ws-8', date: '2026-02-01', building: 'Engineering', total_waste_kg: 950, recyclable_kg: 325, organic_kg: 430, other_kg: 195, occupancy: 850 },
  { id: 'ws-9', date: '2026-02-01', building: 'Library', total_waste_kg: 420, recyclable_kg: 185, organic_kg: 125, other_kg: 110, occupancy: 430 },
  { id: 'ws-10', date: '2026-02-01', building: 'Hostel A', total_waste_kg: 1410, recyclable_kg: 315, organic_kg: 745, air_kg: undefined, other_kg: 350, occupancy: 620 } as any,
  { id: 'ws-11', date: '2026-02-01', building: 'Hostel B', total_waste_kg: 1260, recyclable_kg: 290, organic_kg: 680, other_kg: 290, occupancy: 580 },
  { id: 'ws-12', date: '2026-02-01', building: 'Science Complex', total_waste_kg: 910, recyclable_kg: 270, organic_kg: 400, other_kg: 240, occupancy: 700 },
  { id: 'ws-13', date: '2026-02-01', building: 'Admin Block', total_waste_kg: 320, recyclable_kg: 165, organic_kg: 75, other_kg: 80, occupancy: 180 },
  { id: 'ws-14', date: '2026-02-01', building: 'Student Canteen', total_waste_kg: 2520, recyclable_kg: 440, organic_kg: 1760, other_kg: 320, occupancy: 1200 },

  { id: 'ws-15', date: '2026-03-01', building: 'Engineering', total_waste_kg: 980, recyclable_kg: 340, organic_kg: 440, other_kg: 200, occupancy: 850 },
  { id: 'ws-16', date: '2026-03-01', building: 'Library', total_waste_kg: 415, recyclable_kg: 190, organic_kg: 120, other_kg: 105, occupancy: 430 },
  { id: 'ws-17', date: '2026-03-01', building: 'Hostel A', total_waste_kg: 1650, recyclable_kg: 320, organic_kg: 910, other_kg: 420, occupancy: 620 }, // High organic waste surge
  { id: 'ws-18', date: '2026-03-01', building: 'Hostel B', total_waste_kg: 1290, recyclable_kg: 300, organic_kg: 690, other_kg: 300, occupancy: 580 },
  { id: 'ws-19', date: '2026-03-01', building: 'Science Complex', total_waste_kg: 930, recyclable_kg: 280, organic_kg: 405, other_kg: 245, occupancy: 700 },
  { id: 'ws-20', date: '2026-03-01', building: 'Admin Block', total_waste_kg: 305, recyclable_kg: 160, organic_kg: 70, other_kg: 75, occupancy: 180 },
  { id: 'ws-21', date: '2026-03-01', building: 'Student Canteen', total_waste_kg: 2680, recyclable_kg: 460, organic_kg: 1880, other_kg: 340, occupancy: 1200 },

  { id: 'ws-22', date: '2026-04-01', building: 'Engineering', total_waste_kg: 960, recyclable_kg: 330, organic_kg: 435, other_kg: 195, occupancy: 850 },
  { id: 'ws-23', date: '2026-04-01', building: 'Library', total_waste_kg: 410, recyclable_kg: 185, organic_kg: 120, other_kg: 105, occupancy: 430 },
  { id: 'ws-24', date: '2026-04-01', building: 'Hostel A', total_waste_kg: 1510, recyclable_kg: 330, organic_kg: 810, other_kg: 370, occupancy: 620 },
  { id: 'ws-25', date: '2026-04-01', building: 'Hostel B', total_waste_kg: 1240, recyclable_kg: 295, organic_kg: 670, other_kg: 275, occupancy: 580 },
  { id: 'ws-26', date: '2026-04-01', building: 'Science Complex', total_waste_kg: 900, recyclable_kg: 275, organic_kg: 395, other_kg: 230, occupancy: 700 },
  { id: 'ws-27', date: '2026-04-01', building: 'Admin Block', total_waste_kg: 300, recyclable_kg: 155, organic_kg: 70, other_kg: 75, occupancy: 180 },
  { id: 'ws-28', date: '2026-04-01', building: 'Student Canteen', total_waste_kg: 2590, recyclable_kg: 450, organic_kg: 1800, other_kg: 340, occupancy: 1200 },
];

export const SAMPLE_CSV_STRINGS = {
  energy: `date,building,electricity_kwh,occupancy
2026-01-01,Engineering,18400,850
2026-01-01,Library,9600,430
2026-01-01,Hostel A,22600,620
2026-01-01,Hostel B,19800,580
2026-01-01,Science Complex,24500,700
2026-02-01,Engineering,20100,850
2026-02-01,Library,10100,430
2026-02-01,Hostel A,23900,620
2026-02-01,Hostel B,20400,580
2026-02-01,Science Complex,25100,700`,

  water: `date,building,water_liters,occupancy
2026-01-01,Engineering,520000,850
2026-01-01,Library,210000,430
2026-01-01,Hostel A,780000,620
2026-01-01,Hostel B,740000,580
2026-01-01,Science Complex,610000,700
2026-02-01,Engineering,535000,850
2026-02-01,Library,218000,430
2026-02-01,Hostel A,805000,620
2026-02-01,Hostel B,760000,580
2026-02-01,Science Complex,625000,700`,

  waste: `date,building,total_waste_kg,recyclable_kg,organic_kg,other_kg,occupancy
2026-01-01,Engineering,920,310,420,190,850
2026-01-01,Library,410,180,120,110,430
2026-01-01,Hostel A,1350,300,720,330,620
2026-01-01,Hostel B,1220,280,660,280,580
2026-01-01,Student Canteen,2400,420,1680,300,1200
2026-02-01,Engineering,950,325,430,195,850
2026-02-01,Library,420,185,125,110,430
2026-02-01,Hostel A,1410,315,745,350,620
2026-02-01,Hostel B,1260,290,680,290,580
2026-02-01,Student Canteen,2520,440,1760,320,1200`,

  unified: `date,building,electricity_kwh,water_liters,waste_kg,students
2026-01-01,Engineering,18400,520000,920,850
2026-01-01,Library,9600,210000,410,430
2026-01-01,Hostel A,22600,780000,1350,620
2026-01-01,Hostel B,19800,740000,1220,580
2026-01-01,Science Complex,24500,610000,890,700
2026-01-01,Admin Block,7200,140000,310,180
2026-01-01,Student Canteen,12400,690000,2400,1200
2026-02-01,Engineering,20100,535000,950,850
2026-02-01,Library,10100,218000,420,430
2026-02-01,Hostel A,23900,805000,1410,620
2026-02-01,Hostel B,20400,760000,1260,580
2026-02-01,Science Complex,25100,625000,910,700
2026-02-01,Admin Block,7300,142000,320,180
2026-02-01,Student Canteen,12900,710000,2520,1200`,

  anomalySpike: `date,building,electricity_kwh,water_liters,waste_kg,students
2026-03-01,Engineering,21800,545000,980,850
2026-03-01,Library,9800,215000,415,430
2026-03-01,Hostel A,34500,1180000,2100,620
2026-03-01,Hostel B,20900,775000,1290,580
2026-03-01,Science Complex,26400,630000,930,700`,

  dirtyTest: `date,building,electricity_kwh,water_liters,waste_kg,students
2026-01-01,Engineering,18400,520000,920,850
2026-01-01,Library,-9600,210000,410,430
2026-01-01,,22600,780000,1350,620
2026-01-01,Hostel A,22600,780000,1350,620
2026-02-01,Science Complex,25100,N/A,910,0
2026-02-01,Admin Block,7300,142000,-50,180`
};

export const DEFAULT_ENERGY_RECORDS = DEFAULT_ENERGY_DATA;
export const DEFAULT_WATER_RECORDS = DEFAULT_WATER_DATA;
export const DEFAULT_WASTE_RECORDS = DEFAULT_WASTE_DATA;

export const ANOMALY_ENERGY_RECORDS: EnergyRecord[] = [
  ...DEFAULT_ENERGY_DATA.map((e) =>
    e.building === 'Hostel A' && e.date === '2026-03-01'
      ? { ...e, electricity_kwh: 34500 }
      : e.building === 'Science Complex' && e.date === '2026-03-01'
      ? { ...e, electricity_kwh: 33200 }
      : e
  ),
];

export const ANOMALY_WATER_RECORDS: WaterRecord[] = [
  ...DEFAULT_WATER_DATA.map((w) =>
    w.building === 'Hostel A' && w.date === '2026-03-01'
      ? { ...w, water_liters: 1250000 }
      : w
  ),
];

export const SAMPLE_ENERGY_CSV = SAMPLE_CSV_STRINGS.energy;
export const SAMPLE_WATER_CSV = SAMPLE_CSV_STRINGS.water;
export const SAMPLE_WASTE_CSV = SAMPLE_CSV_STRINGS.waste;
export const DIRTY_ENERGY_CSV = SAMPLE_CSV_STRINGS.dirtyTest;

