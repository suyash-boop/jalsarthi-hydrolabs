import { calculateWaterStress } from "./stress-algorithm";

// ── Types ──────────────────────────────────────

export type RainfallTrend = "declining" | "stable" | "improving";
export type RiskLevel = "rising" | "steady" | "falling";

export interface TrendResult {
  weeklyTotals: number[]; // last 4 weeks, index 0 = oldest
  movingAvg7d: number[];
  trend: RainfallTrend;
}

export interface ForecastResult {
  villageId: string;
  villageName: string;
  district: string;
  currentScore: number;
  projectedScore: number;
  currentDemand: number;
  projectedDemand: number;
  riskLevel: RiskLevel;
  trend: RainfallTrend;
  weeklyRainfall: number[];
}

// ── Rainfall Trend Analysis ────────────────────

export function computeRainfallTrend(
  records: { date: string; rainMm: number }[]
): TrendResult {
  // Sort by date ascending
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group into 4 weekly buckets (most recent 28 days)
  const now = new Date();
  const weeklyTotals: number[] = [0, 0, 0, 0];

  for (const r of sorted) {
    const daysAgo = Math.floor(
      (now.getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo < 0 || daysAgo >= 28) continue;
    const weekIdx = 3 - Math.floor(daysAgo / 7); // 0=oldest, 3=most recent
    weeklyTotals[weekIdx] += r.rainMm;
  }

  // Round weekly totals
  for (let i = 0; i < 4; i++) {
    weeklyTotals[i] = Math.round(weeklyTotals[i] * 10) / 10;
  }

  // 7-day moving average
  const movingAvg7d: number[] = [];
  const dailyValues = sorted.map((r) => r.rainMm);
  for (let i = 6; i < dailyValues.length; i++) {
    const window = dailyValues.slice(i - 6, i + 1);
    const avg = window.reduce((s, v) => s + v, 0) / 7;
    movingAvg7d.push(Math.round(avg * 100) / 100);
  }

  // Trend: compare most recent 2 weeks vs prior 2 weeks
  const recentAvg = (weeklyTotals[2] + weeklyTotals[3]) / 2;
  const priorAvg = (weeklyTotals[0] + weeklyTotals[1]) / 2;

  let trend: RainfallTrend;
  if (priorAvg === 0 && recentAvg === 0) {
    trend = "stable";
  } else if (priorAvg === 0) {
    trend = "improving";
  } else {
    const change = ((recentAvg - priorAvg) / priorAvg) * 100;
    if (change < -15) trend = "declining";
    else if (change > 15) trend = "improving";
    else trend = "stable";
  }

  return { weeklyTotals, movingAvg7d, trend };
}

// ── Stress Forecast ────────────────────────────

interface VillageInput {
  population: number;
  historicalAvgRainfall: number;
  groundwaterLevel: number;
  stressScore: number;
  rainfallDeviation: number;
  tankerDemand: number;
}

export function forecastStress(
  village: VillageInput,
  trend: RainfallTrend
): { projectedScore: number; projectedDemand: number; riskLevel: RiskLevel } {
  // Adjust rainfall deviation based on trend
  let deviationShift: number;
  switch (trend) {
    case "declining":
      deviationShift = -10; // deviation worsens (more negative)
      break;
    case "improving":
      deviationShift = 8; // deviation improves (less negative)
      break;
    default:
      deviationShift = 0;
  }

  const projectedDeviation = village.rainfallDeviation + deviationShift;

  // Reverse-engineer the recent rainfall from current deviation
  // deviation = ((recent - historical) / historical) * 100
  // recent = historical * (1 + deviation/100)
  const projectedRainfall =
    village.historicalAvgRainfall * (1 + projectedDeviation / 100);

  const result = calculateWaterStress({
    recentRainfallMm: Math.max(0, projectedRainfall),
    historicalAvgRainfallMm: village.historicalAvgRainfall,
    groundwaterLevel: village.groundwaterLevel,
    population: village.population,
  });

  // Determine risk level
  const scoreDelta = result.stressScore - village.stressScore;
  let riskLevel: RiskLevel;
  if (scoreDelta > 3) riskLevel = "rising";
  else if (scoreDelta < -3) riskLevel = "falling";
  else riskLevel = "steady";

  return {
    projectedScore: result.stressScore,
    projectedDemand: result.tankerDemand,
    riskLevel,
  };
}
