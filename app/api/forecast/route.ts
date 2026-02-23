import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import {
  computeRainfallTrend,
  forecastStress,
  type ForecastResult,
} from "@/lib/forecast";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const villages = await prisma.village.findMany({
      include: {
        weatherRecords: {
          where: { date: { gte: sixtyDaysAgo } },
          orderBy: { date: "asc" },
        },
      },
    });

    const forecasts: ForecastResult[] = villages.map((village) => {
      const records = village.weatherRecords.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        rainMm: r.rainMm,
      }));

      const trendResult = computeRainfallTrend(records);
      const projection = forecastStress(
        {
          population: village.population,
          historicalAvgRainfall: village.historicalAvgRainfall,
          groundwaterLevel: village.groundwaterLevel,
          stressScore: village.stressScore,
          rainfallDeviation: village.rainfallDeviation,
          tankerDemand: village.tankerDemand,
        },
        trendResult.trend
      );

      return {
        villageId: village.villageCode,
        villageName: village.name,
        district: village.district,
        currentScore: village.stressScore,
        projectedScore: projection.projectedScore,
        currentDemand: village.tankerDemand,
        projectedDemand: projection.projectedDemand,
        riskLevel: projection.riskLevel,
        trend: trendResult.trend,
        weeklyRainfall: trendResult.weeklyTotals,
      };
    });

    // Sort by risk: rising first, then by projected score descending
    forecasts.sort((a, b) => {
      const riskOrder = { rising: 0, steady: 1, falling: 2 };
      const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return b.projectedScore - a.projectedScore;
    });

    return NextResponse.json(forecasts);
  } catch (error) {
    console.error("Failed to compute forecast:", error);
    return NextResponse.json(
      { error: "Failed to compute forecast" },
      { status: 500 }
    );
  }
}
