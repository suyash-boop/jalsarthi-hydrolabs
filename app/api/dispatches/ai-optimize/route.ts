import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import {
  buildOptimizerPrompt,
  callOpenAI,
  validatePlan,
  type VillageData,
  type TankerData,
  type WaterSourceData,
  type AIPlan,
} from "@/lib/ai-optimizer";

export async function POST(request: Request) {
  const auth = await requireAuth(["ADMIN"]);
  if (isAuthError(auth)) return auth;

  const userId = (auth.user as { id?: string }).id || "000000000000000000000000";

  try {
    const url = new URL(request.url);
    const apply = url.searchParams.get("apply") === "true";

    if (apply) {
      return await handleApply(request, userId);
    }

    return await handleGenerate();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI optimization failed";
    console.error("AI optimize error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleGenerate() {
  // Fetch villages with stress >= 50
  const dbVillages = await prisma.village.findMany({
    where: { stressScore: { gte: 50 } },
    orderBy: { stressScore: "desc" },
  });

  // Fetch active dispatches to identify already-served villages
  const activeDispatches = await prisma.dispatch.findMany({
    where: {
      status: { in: ["pending", "assigned", "in_transit", "delivering"] },
    },
    select: { villageId: true },
  });
  const activeVillageIds = new Set(activeDispatches.map((d) => d.villageId));

  const villages: VillageData[] = dbVillages.map((v) => ({
    id: v.id,
    villageCode: v.villageCode,
    name: v.name,
    district: v.district,
    lat: v.lat,
    lng: v.lng,
    population: v.population,
    stressScore: v.stressScore,
    rainfallDeviation: v.rainfallDeviation,
    groundwaterLevel: v.groundwaterLevel,
    tankerDemand: v.tankerDemand,
    hasActiveDispatch: activeVillageIds.has(v.villageCode),
  }));

  // Fetch available tankers
  const dbTankers = await prisma.tanker.findMany({
    where: { status: "available" },
  });

  const tankers: TankerData[] = dbTankers.map((t) => ({
    id: t.id,
    registrationNo: t.registrationNo,
    driverName: t.driverName,
    capacity: t.capacity,
    depotLocation: t.depotLocation,
    depotLat: t.depotLat,
    depotLng: t.depotLng,
  }));

  // Fetch water sources
  const dbSources = await prisma.waterSource.findMany();
  const waterSources: WaterSourceData[] = dbSources.map((s) => ({
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    capacity: s.capacity,
    currentLevel: s.currentLevel,
    district: s.district,
  }));

  if (tankers.length === 0) {
    return NextResponse.json({
      plan: {
        summary: "No available tankers for dispatch.",
        assignments: [],
      },
      context: {
        totalVillages: villages.length,
        criticalVillages: villages.filter((v) => v.stressScore > 75).length,
        unservedVillages: villages.filter((v) => !v.hasActiveDispatch).length,
        availableTankers: 0,
      },
    });
  }

  // Build prompt and call OpenAI
  const { system, user } = buildOptimizerPrompt(villages, tankers, waterSources);
  const rawPlan = await callOpenAI(system, user);
  const plan = validatePlan(rawPlan, villages, tankers);

  return NextResponse.json({
    plan,
    context: {
      totalVillages: villages.length,
      criticalVillages: villages.filter((v) => v.stressScore > 75).length,
      unservedVillages: villages.filter((v) => !v.hasActiveDispatch).length,
      availableTankers: tankers.length,
    },
  });
}

async function handleApply(request: Request, userId: string) {
  const body = await request.json();
  const plan = body.plan as AIPlan;

  if (!plan || !Array.isArray(plan.assignments)) {
    return NextResponse.json(
      { error: "Invalid plan data" },
      { status: 400 }
    );
  }

  const created = [];

  for (const assignment of plan.assignments) {
    // Verify tanker is still available
    const tanker = await prisma.tanker.findUnique({
      where: { id: assignment.tankerId },
    });
    if (!tanker || tanker.status !== "available") continue;

    // Get village data
    const village = await prisma.village.findUnique({
      where: { villageCode: assignment.villageId },
    });
    if (!village) continue;

    const dispatch = await prisma.dispatch.create({
      data: {
        tankerId: assignment.tankerId,
        villageId: village.villageCode,
        villageName: village.name,
        villageLat: village.lat,
        villageLng: village.lng,
        status: "pending",
        priority: assignment.priority,
        tripsAssigned: village.tankerDemand || 1,
        createdBy: userId,
      },
      include: { tanker: true },
    });

    await prisma.tanker.update({
      where: { id: assignment.tankerId },
      data: { status: "dispatched" },
    });

    created.push(dispatch);
  }

  return NextResponse.json({
    created,
    summary: `AI plan applied: ${created.length} dispatches created`,
  });
}
