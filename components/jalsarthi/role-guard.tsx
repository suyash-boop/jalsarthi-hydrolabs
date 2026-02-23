"use client";

import { useSession } from "next-auth/react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
}: RoleGuardProps) {
  const { data: session } = useSession();
  const userRole =
    (session?.user as unknown as Record<string, unknown>)?.role as string;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || null;
  }

  return <>{children}</>;
}
