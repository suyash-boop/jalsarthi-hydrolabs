import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type AuthResult =
  | NextResponse
  | {
      session: Session;
      user: NonNullable<Session["user"]>;
      role: string;
    };

export async function requireAuth(
  allowedRoles?: string[]
): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role =
    (session.user as unknown as Record<string, unknown>).role as string;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { session, user: session.user, role };
}

export function isAuthError(result: AuthResult): result is NextResponse {
  return result instanceof NextResponse;
}
