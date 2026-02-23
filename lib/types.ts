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

// ──────────────────────────────────────────────
// Tanker Management Types
// ──────────────────────────────────────────────

export type TankerStatus =
  | "available"
  | "dispatched"
  | "in_transit"
  | "delivering"
  | "maintenance"
  | "offline";

export type DispatchStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivering"
  | "completed"
  | "cancelled";

export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export interface Tanker {
  id: string;
  registrationNo: string;
  driverName: string;
  driverPhone?: string;
  capacity: number;
  depotLocation: string;
  depotLat: number;
  depotLng: number;
  status: TankerStatus;
}

export interface Dispatch {
  id: string;
  tankerId: string;
  tanker?: Tanker;
  villageId: string;
  villageName: string;
  villageLat: number;
  villageLng: number;
  waterSourceId?: string;
  sourceLocation?: string;
  sourceLat?: number;
  sourceLng?: number;
  status: DispatchStatus;
  priority: PriorityLevel;
  tripsAssigned: number;
  tripsCompleted: number;
  scheduledFor?: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface DispatchCreateInput {
  tankerId: string;
  villageId: string;
  waterSourceId?: string;
  priority: PriorityLevel;
  tripsAssigned: number;
  scheduledFor?: string;
  notes?: string;
}

export interface AllocationRecommendation {
  tankerId: string;
  tanker: Tanker;
  distance: number;
  estimatedTime: number;
  score: number;
}
