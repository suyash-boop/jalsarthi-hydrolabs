import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import { fetchRecentRainfall } from "@/lib/weather";
import { calculateWaterStress } from "@/lib/stress-algorithm";

export async function POST() {
  const auth = await requireAuth(["ADMIN"]);
  if (isAuthError(auth)) return auth;

  try {
    const villages = await prisma.village.findMany();
    const results: Array<{
      villageCode: string;
      name: string;
      oldScore: number;
      newScore: number;
      newTankerDemand: number;
    }> = [];

    for (const village of villages) {
      try {
        // Fetch live rainfall
        const rainfall = await fetchRecentRainfall(village.lat, village.lng);
        const totalRainfall = rainfall.rainMm.reduce((sum, r) => sum + r, 0);

        // Store weather records
        for (let i = 0; i < rainfall.dates.length; i++) {
          const date = new Date(rainfall.dates[i]);
          await prisma.weatherRecord.upsert({
            where: {
              villageId_date: {
                villageId: village.id,
                date,
              },
            },
            update: { rainMm: rainfall.rainMm[i] },
            create: {
              villageId: village.id,
              date,
              rainMm: rainfall.rainMm[i],
            },
          });
        }

        // Recalculate stress
        const stress = calculateWaterStress({
          recentRainfallMm: totalRainfall,
          historicalAvgRainfallMm: village.historicalAvgRainfall,
          groundwaterLevel: village.groundwaterLevel,
          population: village.population,
        });

        // Update village
        await prisma.village.update({
          where: { id: village.id },
          data: {
            stressScore: stress.stressScore,
            rainfallDeviation: stress.rainfallDeviation,
            tankerDemand: stress.tankerDemand,
          },
        });

        results.push({
          villageCode: village.villageCode,
          name: village.name,
          oldScore: village.stressScore,
          newScore: stress.stressScore,
          newTankerDemand: stress.tankerDemand,
        });
      } catch {
        // Skip failed villages, continue with others
      }

      // Polite delay between API calls
      await new Promise((r) => setTimeout(r, 100));
    }

    return NextResponse.json({
      message: `Refreshed ${results.length}/${villages.length} villages`,
      results,
    });
  } catch (error) {
    console.error("Failed to refresh scores:", error);
    return NextResponse.json(
      { error: "Failed to refresh scores" },
      { status: 500 }
    );
  }
}
