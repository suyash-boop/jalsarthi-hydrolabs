"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { RoleGuard } from "./role-guard";

interface HeaderProps {
  showSidebarTrigger?: boolean;
}

export function Header({ showSidebarTrigger = true }: HeaderProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isReports = pathname === "/dashboard/reports";
  const isSettings = pathname === "/dashboard/settings";

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-md transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      {showSidebarTrigger && (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}
      <div className="flex items-center gap-2">
        <Droplets className="h-5 w-5 text-secondary" />
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">Jal</span>
          <span className="text-secondary">Sarthi</span>
        </h1>
      </div>
      <p className="hidden sm:block text-xs text-muted-foreground ml-2">
        Drought Warning & Smart Tanker Management
      </p>
      <div className="ml-auto flex items-center gap-1">
        <Link href="/dashboard" className={navLinkClass(isDashboard)}>
          Dashboard
        </Link>
        <Link href="/dashboard/reports" className={navLinkClass(isReports)}>
          Reports
        </Link>
        <RoleGuard allowedRoles={["ADMIN"]}>
          <Link href="/dashboard/settings" className={navLinkClass(isSettings)}>
            Settings
          </Link>
        </RoleGuard>
      </div>
    </header>
  );
}
