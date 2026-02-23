import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import { recommendTankers } from "@/lib/tanker-allocation";
import { sendWhatsAppMessage, buildDispatchMessage } from "@/lib/whatsapp";
import type { Tanker } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireAuth(["ADMIN"]);
  if (isAuthError(auth)) return auth;

  const userId = (auth.user as { id?: string }).id || "000000000000000000000000";

  try {
    const body = await request.json();
    const minStressScore = body.minStressScore ?? 70;
    const maxDispatches = body.maxDispatches ?? 10;

    // Get critical villages without active dispatches
    const villages = await prisma.village.findMany({
      where: { stressScore: { gte: minStressScore } },
      orderBy: { stressScore: "desc" },
    });

    // Get existing active dispatches to exclude villages that already have one
    const activeDispatches = await prisma.dispatch.findMany({
      where: {
        status: { in: ["pending", "assigned", "in_transit", "delivering"] },
      },
      select: { villageId: true },
    });
    const activeVillageIds = new Set(activeDispatches.map((d) => d.villageId));

    const unservedVillages = villages.filter(
      (v) => !activeVillageIds.has(v.villageCode)
    );

    // Get available tankers
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

    const created = [];
    const skipped = [];
    const usedTankerIds = new Set<string>();

    for (const village of unservedVillages) {
      if (created.length >= maxDispatches) break;

      const availableTankers = mapped.filter(
        (t) => !usedTankerIds.has(t.id)
      );
      if (availableTankers.length === 0) break;

      const recommendations = recommendTankers(
        availableTankers,
        village.lat,
        village.lng
      );

      if (recommendations.length === 0) {
        skipped.push(village.name);
        continue;
      }

      const best = recommendations[0];
      const priority =
        village.stressScore > 75
          ? "urgent"
          : village.stressScore > 60
            ? "high"
            : "medium";

      const dispatch = await prisma.dispatch.create({
        data: {
          tankerId: best.tankerId,
          villageId: village.villageCode,
          villageName: village.name,
          villageLat: village.lat,
          villageLng: village.lng,
          status: "pending",
          priority: priority as "urgent" | "high" | "medium",
          tripsAssigned: village.tankerDemand || 1,
          createdBy: userId,
        },
        include: { tanker: true },
      });

      await prisma.tanker.update({
        where: { id: best.tankerId },
        data: { status: "dispatched" },
      });

      // Send WhatsApp notification to driver (fire-and-forget)
      if (dispatch.tanker?.driverPhone) {
        const msg = buildDispatchMessage({
          villageName: village.name,
          priority,
          tankerReg: dispatch.tanker.registrationNo,
          tripsAssigned: village.tankerDemand || 1,
          villageLat: village.lat,
          villageLng: village.lng,
        });
        sendWhatsAppMessage(dispatch.tanker.driverPhone, msg).catch((err) =>
          console.error("WhatsApp notification failed:", err)
        );
      }

      usedTankerIds.add(best.tankerId);
      created.push(dispatch);
    }

    return NextResponse.json({
      created,
      skipped,
      summary: `Created ${created.length} dispatches, skipped ${skipped.length} villages`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Auto-assign failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
