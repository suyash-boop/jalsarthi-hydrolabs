import type { Dispatch, Tanker, Village } from "./types";
import { computeDistrictStats } from "./stats";

// ── Dispatch Stats ──────────────────────────────

export interface DispatchStats {
  total: number;
  completed: number;
  cancelled: number;
  active: number;
  pending: number;
  completionRate: number;
  avgTripsAssigned: number;
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}

export function computeDispatchStats(dispatches: Dispatch[]): DispatchStats {
  const statusBreakdown: Record<string, number> = {};
  const priorityBreakdown: Record<string, number> = {};
  let totalTrips = 0;

  for (const d of dispatches) {
    statusBreakdown[d.status] = (statusBreakdown[d.status] || 0) + 1;
    priorityBreakdown[d.priority] = (priorityBreakdown[d.priority] || 0) + 1;
    totalTrips += d.tripsAssigned;
  }

  const completed = statusBreakdown["completed"] || 0;
  const cancelled = statusBreakdown["cancelled"] || 0;
  const pending = statusBreakdown["pending"] || 0;
  const finished = completed + cancelled;
  const active = dispatches.length - finished;

  return {
    total: dispatches.length,
    completed,
    cancelled,
    active,
    pending,
    completionRate: finished > 0 ? Math.round((completed / finished) * 100) : 0,
    avgTripsAssigned:
      dispatches.length > 0
        ? Math.round((totalTrips / dispatches.length) * 10) / 10
        : 0,
    statusBreakdown,
    priorityBreakdown,
  };
}

// ── Fleet Stats ─────────────────────────────────

export interface FleetStats {
  total: number;
  available: number;
  dispatched: number;
  inTransit: number;
  delivering: number;
  maintenance: number;
  offline: number;
  utilizationRate: number;
  avgCapacity: number;
  statusBreakdown: Record<string, number>;
}

export function computeFleetStats(tankers: Tanker[]): FleetStats {
  const statusBreakdown: Record<string, number> = {};
  let totalCapacity = 0;

  for (const t of tankers) {
    statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
    totalCapacity += t.capacity;
  }

  const activeStatuses = ["dispatched", "in_transit", "delivering"];
  const activeCount = tankers.filter((t) =>
    activeStatuses.includes(t.status)
  ).length;
  const operationalCount = tankers.filter(
    (t) => t.status !== "maintenance" && t.status !== "offline"
  ).length;

  return {
    total: tankers.length,
    available: statusBreakdown["available"] || 0,
    dispatched: statusBreakdown["dispatched"] || 0,
    inTransit: statusBreakdown["in_transit"] || 0,
    delivering: statusBreakdown["delivering"] || 0,
    maintenance: statusBreakdown["maintenance"] || 0,
    offline: statusBreakdown["offline"] || 0,
    utilizationRate:
      operationalCount > 0
        ? Math.round((activeCount / operationalCount) * 100)
        : 0,
    avgCapacity:
      tankers.length > 0 ? Math.round(totalCapacity / tankers.length) : 0,
    statusBreakdown,
  };
}

// ── District Report ─────────────────────────────

export interface DistrictReport {
  name: string;
  totalVillages: number;
  criticalCount: number;
  warningCount: number;
  safeCount: number;
  avgStressScore: number;
  totalTankerDemand: number;
  activeDispatches: number;
}

export function computeDistrictReport(
  villages: Village[],
  dispatches: Dispatch[]
): DistrictReport[] {
  const districtStats = computeDistrictStats(villages);

  // Count active dispatches per district by mapping village names to districts
  const villageDistrictMap = new Map<string, string>();
  for (const v of villages) {
    villageDistrictMap.set(v.name, v.district);
  }

  const activeStatuses = ["pending", "assigned", "in_transit", "delivering"];
  const districtDispatchCount = new Map<string, number>();
  for (const d of dispatches) {
    if (activeStatuses.includes(d.status)) {
      const district = villageDistrictMap.get(d.villageName);
      if (district) {
        districtDispatchCount.set(
          district,
          (districtDispatchCount.get(district) || 0) + 1
        );
      }
    }
  }

  return districtStats.map((ds) => ({
    ...ds,
    activeDispatches: districtDispatchCount.get(ds.name) || 0,
  }));
}
