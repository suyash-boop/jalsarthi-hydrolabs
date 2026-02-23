import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(["ADMIN"]);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const { user } = authResult;

  // Prevent self-demotion
  if (user.id === id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, EDITOR, or VIEWER" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
