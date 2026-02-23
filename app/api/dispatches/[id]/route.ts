import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const dispatch = await prisma.dispatch.findUnique({
    where: { id },
    include: { tanker: true },
  });

  if (!dispatch) {
    return NextResponse.json(
      { error: "Dispatch not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(dispatch);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["ADMIN", "EDITOR"]);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const dispatch = await prisma.dispatch.findUnique({ where: { id } });
  if (!dispatch) {
    return NextResponse.json(
      { error: "Dispatch not found" },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.status) {
    updateData.status = body.status;

    // Set timestamps based on status transitions
    if (body.status === "in_transit" && !dispatch.dispatchedAt) {
      updateData.dispatchedAt = new Date();
    }
    if (body.status === "delivering" && !dispatch.arrivedAt) {
      updateData.arrivedAt = new Date();
    }
    if (body.status === "completed") {
      updateData.completedAt = new Date();
      updateData.tripsCompleted = dispatch.tripsAssigned;
      // Free up the tanker
      await prisma.tanker.update({
        where: { id: dispatch.tankerId },
        data: { status: "available" },
      });
    }
    if (body.status === "cancelled") {
      // Free up the tanker
      await prisma.tanker.update({
        where: { id: dispatch.tankerId },
        data: { status: "available" },
      });
    }
    if (body.status === "in_transit") {
      await prisma.tanker.update({
        where: { id: dispatch.tankerId },
        data: { status: "in_transit" },
      });
    }
    if (body.status === "delivering") {
      await prisma.tanker.update({
        where: { id: dispatch.tankerId },
        data: { status: "delivering" },
      });
    }
  }

  if (body.tripsCompleted !== undefined) {
    updateData.tripsCompleted = body.tripsCompleted;
  }
  if (body.notes !== undefined) {
    updateData.notes = body.notes;
  }

  const updated = await prisma.dispatch.update({
    where: { id },
    data: updateData,
    include: { tanker: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["ADMIN"]);
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const dispatch = await prisma.dispatch.findUnique({ where: { id } });
  if (!dispatch) {
    return NextResponse.json(
      { error: "Dispatch not found" },
      { status: 404 }
    );
  }

  // Free tanker if dispatch was active
  if (["pending", "assigned", "in_transit", "delivering"].includes(dispatch.status)) {
    await prisma.tanker.update({
      where: { id: dispatch.tankerId },
      data: { status: "available" },
    });
  }

  await prisma.dispatch.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
