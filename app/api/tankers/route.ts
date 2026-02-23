import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status ? { status: status as never } : {};
  const tankers = await prisma.tanker.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tankers);
}

export async function POST(request: Request) {
  const auth = await requireAuth(["ADMIN", "EDITOR"]);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const tanker = await prisma.tanker.create({
      data: {
        registrationNo: body.registrationNo,
        driverName: body.driverName,
        driverPhone: body.driverPhone || null,
        capacity: body.capacity,
        depotLocation: body.depotLocation,
        depotLat: body.depotLat,
        depotLng: body.depotLng,
      },
    });
    return NextResponse.json(tanker, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create tanker";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
