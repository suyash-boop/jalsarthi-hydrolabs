import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import { recommendTankers } from "@/lib/tanker-allocation";
import type { Tanker } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireAuth(["ADMIN", "EDITOR"]);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();

    const village = await prisma.village.findUnique({
      where: { villageCode: body.villageId },
    });
    if (!village) {
      return NextResponse.json(
        { error: "Village not found" },
        { status: 404 }
      );
    }

    const tankers = await prisma.tanker.findMany({
      where: { status: "available" },
    });

    const mapped: Tanker[] = tankers.map((t) => ({
      id: t.id,
      registrationNo: t.registrationNo,
      driverName: t.driverName,
      driverPhone: t.driverPhone ?? undefined,
      capacity: t.capacity,
      depotLocation: t.depotLocation,
      depotLat: t.depotLat,
      depotLng: t.depotLng,
      status: t.status as Tanker["status"],
    }));

    const recommendations = recommendTankers(
      mapped,
      village.lat,
      village.lng,
      body.sourceLat,
      body.sourceLng,
      5
    );

    return NextResponse.json(recommendations);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get recommendations";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
