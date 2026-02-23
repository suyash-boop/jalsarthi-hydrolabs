import type { Village, DistrictStats } from "./types";
import { getStressLevel } from "./types";

export function computeDistrictStats(villageData: Village[]): DistrictStats[] {
  const districtMap = new Map<string, Village[]>();
  for (const v of villageData) {
    const existing = districtMap.get(v.district) || [];
    existing.push(v);
    districtMap.set(v.district, existing);
  }

  return Array.from(districtMap.entries())
    .map(([name, vils]) => ({
      name,
      totalVillages: vils.length,
      criticalCount: vils.filter(
        (v) => getStressLevel(v.stressScore) === "critical"
      ).length,
      warningCount: vils.filter(
        (v) => getStressLevel(v.stressScore) === "warning"
      ).length,
      safeCount: vils.filter((v) => getStressLevel(v.stressScore) === "safe")
        .length,
      avgStressScore: Math.round(
        vils.reduce((sum, v) => sum + v.stressScore, 0) / vils.length
      ),
      totalTankerDemand: vils.reduce((sum, v) => sum + v.tankerDemand, 0),
    }))
    .sort((a, b) => b.avgStressScore - a.avgStressScore);
}

export function computeOverallStats(villageData: Village[]) {
  return {
    totalVillages: villageData.length,
    criticalCount: villageData.filter(
      (v) => getStressLevel(v.stressScore) === "critical"
    ).length,
    warningCount: villageData.filter(
      (v) => getStressLevel(v.stressScore) === "warning"
    ).length,
    safeCount: villageData.filter(
      (v) => getStressLevel(v.stressScore) === "safe"
    ).length,
    totalTankerDemand: villageData.reduce((sum, v) => sum + v.tankerDemand, 0),
    avgStressScore: Math.round(
      villageData.reduce((sum, v) => sum + v.stressScore, 0) /
        villageData.length
    ),
  };
}
