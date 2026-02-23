import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const where: Record<string, unknown> = {};
  if (status) {
    if (status.includes(",")) {
      where.status = { in: status.split(",") };
    } else {
      where.status = status;
    }
  }
  if (priority) where.priority = priority;

  const dispatches = await prisma.dispatch.findMany({
    where,
    include: { tanker: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(dispatches);
}

export async function POST(request: Request) {
  const auth = await requireAuth(["ADMIN", "EDITOR"]);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();

    // Validate tanker exists and is available
    const tanker = await prisma.tanker.findUnique({
      where: { id: body.tankerId },
    });
    if (!tanker) {
      return NextResponse.json(
        { error: "Tanker not found" },
        { status: 404 }
      );
    }
    if (tanker.status !== "available") {
      return NextResponse.json(
        { error: "Tanker is not available" },
        { status: 400 }
      );
    }

    // Fetch village data
    const village = await prisma.village.findUnique({
      where: { villageCode: body.villageId },
    });
    if (!village) {
      return NextResponse.json(
        { error: "Village not found" },
        { status: 404 }
      );
    }

    // Optionally fetch water source
    let sourceData: {
      waterSourceId?: string;
      sourceLocation?: string;
      sourceLat?: number;
      sourceLng?: number;
    } = {};
    if (body.waterSourceId) {
      const source = await prisma.waterSource.findUnique({
        where: { id: body.waterSourceId },
      });
      if (source) {
        sourceData = {
          waterSourceId: source.id,
          sourceLocation: source.name,
          sourceLat: source.lat,
          sourceLng: source.lng,
        };
      }
    }

    // Auto-set priority based on stress score if not provided
    const priority =
      body.priority ||
      (village.stressScore > 75
        ? "urgent"
        : village.stressScore > 60
          ? "high"
          : village.stressScore > 40
            ? "medium"
            : "low");

    const dispatch = await prisma.dispatch.create({
      data: {
        tankerId: body.tankerId,
        villageId: village.villageCode,
        villageName: village.name,
        villageLat: village.lat,
        villageLng: village.lng,
        ...sourceData,
        status: "pending",
        priority,
        tripsAssigned: body.tripsAssigned || village.tankerDemand || 1,
        scheduledFor: body.scheduledFor
          ? new Date(body.scheduledFor)
          : undefined,
        createdBy: auth.user.id || "system",
        notes: body.notes || null,
      },
      include: { tanker: true },
    });

    // Update tanker status
    await prisma.tanker.update({
      where: { id: body.tankerId },
      data: { status: "dispatched" },
    });

    return NextResponse.json(dispatch, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create dispatch";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
