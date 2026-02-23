export interface Village {
  id: string;
  name: string;
  district: string;
  taluka: string;
  lat: number;
  lng: number;
  population: number;
  stressScore: number; // 0-100
  rainfallDeviation: number; // percentage deviation from normal (e.g., -35 means 35% below normal)
  groundwaterLevel: number; // meters below ground level
  tankerDemand: number; // estimated tanker trips needed per week
}

export interface WaterSource {
  id: string;
  name: string;
  type: "dam" | "reservoir" | "borewell" | "river";
  lat: number;
  lng: number;
  capacity: number; // million liters
  currentLevel: number; // percentage (0-100)
  district: string;
}

export type StressLevel = "safe" | "warning" | "critical";

export function getStressLevel(score: number): StressLevel {
  if (score < 50) return "safe";
  if (score <= 75) return "warning";
  return "critical";
}

export interface DistrictStats {
  name: string;
  totalVillages: number;
  criticalCount: number;
  warningCount: number;
  safeCount: number;
  avgStressScore: number;
  totalTankerDemand: number;
}
