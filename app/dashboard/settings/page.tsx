"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserManagementTable } from "@/components/jalsarthi/user-management-table";
import { SystemActionsPanel } from "@/components/jalsarthi/system-actions-panel";
import { useVillages } from "@/hooks/use-villages";
import { useTankers } from "@/hooks/use-tankers";
import { useDispatches } from "@/hooks/use-dispatches";
import { useUsers } from "@/hooks/use-users";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { villages } = useVillages();
  const { tankers } = useTankers();
  const { dispatches } = useDispatches();
  const { users } = useUsers();

  const userRole = (
    session?.user as unknown as Record<string, unknown> | undefined
  )?.role as string | undefined;

  // ADMIN-only guard
  if (!session || userRole !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          Only administrators can access settings.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* Section 1: User Management */}
        <section>
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          <UserManagementTable />
        </section>

        {/* Section 2: System Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">System</h2>
          <SystemActionsPanel
            stats={{
              totalVillages: villages.length,
              totalTankers: tankers.length,
              totalDispatches: dispatches.length,
              totalUsers: users.length,
            }}
          />
        </section>
      </div>
    </div>
  );
}
