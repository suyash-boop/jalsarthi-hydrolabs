import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import type { Village } from "@/lib/types";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const dbVillages = await prisma.village.findMany({
      orderBy: { stressScore: "desc" },
    });

    const villages: Village[] = dbVillages.map((v) => ({
      id: v.villageCode,
      name: v.name,
      district: v.district,
      taluka: v.taluka,
      lat: v.lat,
      lng: v.lng,
      population: v.population,
      stressScore: v.stressScore,
      rainfallDeviation: v.rainfallDeviation,
      groundwaterLevel: v.groundwaterLevel,
      tankerDemand: v.tankerDemand,
    }));

    return NextResponse.json(villages);
  } catch (error) {
    console.error("Failed to fetch villages:", error);
    return NextResponse.json(
      { error: "Failed to fetch villages" },
      { status: 500 }
    );
  }
}
