import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import type { WaterSource } from "@/lib/types";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const dbSources = await prisma.waterSource.findMany({
      orderBy: { capacity: "desc" },
    });

    const sources: WaterSource[] = dbSources.map((s) => ({
      id: s.sourceCode,
      name: s.name,
      type: s.type as WaterSource["type"],
      lat: s.lat,
      lng: s.lng,
      capacity: s.capacity,
      currentLevel: s.currentLevel,
      district: s.district,
    }));

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Failed to fetch water sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch water sources" },
      { status: 500 }
    );
  }
}
