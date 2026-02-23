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
  const tanker = await prisma.tanker.findUnique({
    where: { id },
    include: {
      dispatches: {
        where: { status: { in: ["pending", "assigned", "in_transit", "delivering"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!tanker) {
    return NextResponse.json({ error: "Tanker not found" }, { status: 404 });
  }

  return NextResponse.json(tanker);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["ADMIN", "EDITOR"]);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  try {
    const tanker = await prisma.tanker.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(tanker);
  } catch {
    return NextResponse.json({ error: "Tanker not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["ADMIN"]);
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const activeDispatches = await prisma.dispatch.count({
    where: {
      tankerId: id,
      status: { in: ["pending", "assigned", "in_transit", "delivering"] },
    },
  });

  if (activeDispatches > 0) {
    return NextResponse.json(
      { error: "Cannot delete tanker with active dispatches" },
      { status: 400 }
    );
  }

  try {
    await prisma.tanker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tanker not found" }, { status: 404 });
  }
}
