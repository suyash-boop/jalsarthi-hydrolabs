interface StressInput {
  recentRainfallMm: number;
  historicalAvgRainfallMm: number;
  groundwaterLevel: number;
  population: number;
}

interface StressOutput {
  stressScore: number;
  rainfallDeviation: number;
  tankerDemand: number;
}

/**
 * Calculate Water Stress Index for a village.
 *
 * Formula:
 *   stressScore = rainfallComponent(40%) + groundwaterComponent(40%) + populationComponent(20%)
 *
 * Rainfall: deviation of -60% or worse = score 100
 * Groundwater: 20m+ depth = score 100
 * Population: 50k+ = score 100
 */
export function calculateWaterStress(input: StressInput): StressOutput {
  const {
    recentRainfallMm,
    historicalAvgRainfallMm,
    groundwaterLevel,
    population,
  } = input;

  // Rainfall deviation (compare recent vs same-period historical)
  let rainfallDeviation = 0;
  if (historicalAvgRainfallMm > 0) {
    rainfallDeviation =
      ((recentRainfallMm - historicalAvgRainfallMm) /
        historicalAvgRainfallMm) *
      100;
  }
  // Both are ~0 during dry season — no meaningful deviation
  // (avoids -100% when comparing 0mm against a tiny historical value)
  const rainfallScore = clamp((-rainfallDeviation / 60) * 100, 0, 100);

  // Groundwater depth (deeper = worse)
  const groundwaterScore = clamp((groundwaterLevel / 20) * 100, 0, 100);

  // Population pressure
  const populationScore = clamp((population / 50000) * 100, 0, 100);

  // Weighted combination
  const stressScore = Math.round(
    rainfallScore * 0.4 + groundwaterScore * 0.4 + populationScore * 0.2
  );

  const tankerDemand = calculateTankerDemand(stressScore, population);

  return {
    stressScore: clamp(stressScore, 0, 100),
    rainfallDeviation: Math.round(rainfallDeviation),
    tankerDemand,
  };
}

/**
 * Predictive tanker demand.
 *
 * Assumptions:
 * - Per-capita daily need: 40 liters (rural India LPCD)
 * - Tanker capacity: 10,000 liters
 * - Stress score determines fraction needing tanker supply:
 *   - <50 (safe): 0%
 *   - 50-75 (warning): 10% to 40% (linear)
 *   - 76-100 (critical): 40% to 80% (linear)
 */
function calculateTankerDemand(
  stressScore: number,
  population: number
): number {
  let needFraction: number;

  if (stressScore < 50) {
    needFraction = 0;
  } else if (stressScore <= 75) {
    needFraction = 0.1 + ((stressScore - 50) / 25) * 0.3;
  } else {
    needFraction = 0.4 + ((stressScore - 75) / 25) * 0.4;
  }

  const dailyLitersNeeded = population * needFraction * 40;
  const weeklyLiters = dailyLitersNeeded * 7;
  const trips = Math.ceil(weeklyLiters / 10000);

  return trips;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
