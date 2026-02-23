import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import { fetchRecentRainfall } from "@/lib/weather";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ villageId: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const { villageId } = await params;
    const village = await prisma.village.findUnique({
      where: { villageCode: villageId },
    });

    if (!village) {
      return NextResponse.json(
        { error: "Village not found" },
        { status: 404 }
      );
    }

    // Fetch live rainfall from Open-Meteo
    const rainfall = await fetchRecentRainfall(village.lat, village.lng);

    // Store weather records in DB
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

    const totalRainfall = rainfall.rainMm.reduce((sum, r) => sum + r, 0);

    return NextResponse.json({
      villageCode: village.villageCode,
      villageName: village.name,
      period: {
        from: rainfall.dates[0],
        to: rainfall.dates[rainfall.dates.length - 1],
        days: rainfall.dates.length,
      },
      totalRainfallMm: Math.round(totalRainfall * 10) / 10,
      dailyData: rainfall.dates.map((date, i) => ({
        date,
        rainMm: rainfall.rainMm[i],
      })),
    });
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
