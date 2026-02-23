import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import type { Village } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const v = await prisma.village.findUnique({
      where: { villageCode: id },
    });

    if (!v) {
      return NextResponse.json(
        { error: "Village not found" },
        { status: 404 }
      );
    }

    const village: Village = {
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
    };

    return NextResponse.json(village);
  } catch (error) {
    console.error("Failed to fetch village:", error);
    return NextResponse.json(
      { error: "Failed to fetch village" },
      { status: 500 }
    );
  }
}
