"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "./stats-overview";
import { TankerStatsOverview } from "./tanker-stats-overview";
import { VillageCard } from "./village-card";
import { StressDistributionChart, RainfallChart } from "./charts";
import { TankerFleetPanel } from "./tanker-fleet-panel";
import { DispatchPanel } from "./dispatch-panel";
import { DispatchCreateDialog } from "./dispatch-create-dialog";
import { AutoAssignDialog } from "./auto-assign-dialog";
import { RoleGuard } from "./role-guard";
import { computeOverallStats } from "@/lib/stats";
import { getStressLevel } from "@/lib/types";
import type { Village, StressLevel, Tanker, Dispatch } from "@/lib/types";
import { Search, BarChart3, List, Plus, Zap, LogOut } from "lucide-react";

type SidebarMode = "villages" | "tankers";
type VillageView = "list" | "charts";
type TankerSubView = "fleet" | "dispatches";

interface AppSidebarProps {
  villages: Village[];
  tankers: Tanker[];
  dispatches: Dispatch[];
  selectedVillage?: Village | null;
  onVillageSelect?: (village: Village) => void;
  onDispatchSelect?: (dispatch: Dispatch) => void;
  onTankerRefetch: () => void;
  onDispatchRefetch: () => void;
  onModeChange?: (mode: "villages" | "tankers") => void;
}

export function AppSidebar({
  villages,
  tankers,
  dispatches,
  selectedVillage,
  onVillageSelect,
  onDispatchSelect,
  onTankerRefetch,
  onDispatchRefetch,
  onModeChange,
}: AppSidebarProps) {
  const [mode, setMode] = useState<SidebarMode>("villages");
  const [villageView, setVillageView] = useState<VillageView>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | StressLevel>("all");
  const [tankerSubView, setTankerSubView] = useState<TankerSubView>("fleet");
  const [dispatchCreateOpen, setDispatchCreateOpen] = useState(false);
  const [autoAssignOpen, setAutoAssignOpen] = useState(false);

  const { data: session } = useSession();

  const stats = useMemo(() => computeOverallStats(villages), [villages]);

  const tankerStats = useMemo(() => {
    const activeStatuses = ["pending", "assigned", "in_transit", "delivering"];
    return {
      totalTankers: tankers.length,
      availableCount: tankers.filter((t) => t.status === "available").length,
      activeDispatches: dispatches.filter((d) =>
        activeStatuses.includes(d.status)
      ).length,
      pendingDispatches: dispatches.filter((d) => d.status === "pending")
        .length,
    };
  }, [tankers, dispatches]);

  const filteredVillages = useMemo(() => {
    let result = [...villages].sort((a, b) => b.stressScore - a.stressScore);

    if (activeTab !== "all") {
      result = result.filter(
        (v) => getStressLevel(v.stressScore) === activeTab
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.district.toLowerCase().includes(q) ||
          v.taluka.toLowerCase().includes(q)
      );
    }

    return result;
  }, [villages, activeTab, searchQuery]);

  const handleRefetchAll = () => {
    onTankerRefetch();
    onDispatchRefetch();
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 pb-2">
        {/* Top-level mode toggle */}
        <Tabs
          value={mode}
          onValueChange={(v) => {
            const newMode = v as SidebarMode;
            setMode(newMode);
            onModeChange?.(newMode);
          }}
          className="mb-3"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="villages" className="text-xs font-medium">
              Villages
            </TabsTrigger>
            <TabsTrigger value="tankers" className="text-xs font-medium">
              Tankers
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Mode-specific stats */}
        {mode === "tankers" ? (
          <TankerStatsOverview {...tankerStats} />
        ) : (
          <StatsOverview
            criticalCount={stats.criticalCount}
            warningCount={stats.warningCount}
            safeCount={stats.safeCount}
            totalTankerDemand={stats.totalTankerDemand}
          />
        )}
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          {/* Villages Mode */}
          {mode === "villages" && (
            <>
              <div className="flex items-center justify-between px-2">
                <SidebarGroupLabel className="px-0">
                  {villageView === "list"
                    ? `Villages (${filteredVillages.length})`
                    : "Analytics"}
                </SidebarGroupLabel>
                <div className="flex gap-1">
                  <button
                    onClick={() => setVillageView("list")}
                    className={`p-1 rounded-md transition-colors ${
                      villageView === "list"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setVillageView("charts")}
                    className={`p-1 rounded-md transition-colors ${
                      villageView === "charts"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <SidebarGroupContent>
                {villageView === "list" ? (
                  <>
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search village, district..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>

                    <Tabs
                      value={activeTab}
                      onValueChange={(v) =>
                        setActiveTab(v as typeof activeTab)
                      }
                      className="mb-2"
                    >
                      <TabsList className="grid w-full grid-cols-4 h-8">
                        <TabsTrigger value="all" className="text-xs">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="critical" className="text-xs">
                          Critical
                        </TabsTrigger>
                        <TabsTrigger value="warning" className="text-xs">
                          Warning
                        </TabsTrigger>
                        <TabsTrigger value="safe" className="text-xs">
                          Safe
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <div className="flex flex-col gap-2 pr-2">
                        {filteredVillages.map((village) => (
                          <VillageCard
                            key={village.id}
                            village={village}
                            isSelected={selectedVillage?.id === village.id}
                            onClick={onVillageSelect}
                          />
                        ))}
                        {filteredVillages.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No villages found
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <ScrollArea className="h-[calc(100vh-340px)]">
                    <div className="flex flex-col gap-3 pr-2">
                      <StressDistributionChart villages={villages} />
                      <RainfallChart villages={villages} />
                    </div>
                  </ScrollArea>
                )}
              </SidebarGroupContent>
            </>
          )}

          {/* Tankers Mode */}
          {mode === "tankers" && (
            <>
              <div className="flex items-center justify-between px-2">
                <SidebarGroupLabel className="px-0">
                  {tankerSubView === "fleet"
                    ? `Fleet (${tankers.length})`
                    : `Dispatches (${dispatches.length})`}
                </SidebarGroupLabel>
              </div>
              <SidebarGroupContent>
                <div className="flex items-center gap-1 mb-2">
                  <button
                    onClick={() => setTankerSubView("fleet")}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      tankerSubView === "fleet"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Fleet
                  </button>
                  <button
                    onClick={() => setTankerSubView("dispatches")}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      tankerSubView === "dispatches"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Dispatches
                  </button>
                  <div className="flex-1" />
                  <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setDispatchCreateOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Dispatch
                    </Button>
                  </RoleGuard>
                  <RoleGuard allowedRoles={["ADMIN"]}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setAutoAssignOpen(true)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Auto
                    </Button>
                  </RoleGuard>
                </div>

                {tankerSubView === "fleet" ? (
                  <TankerFleetPanel
                    tankers={tankers}
                    onRefetch={onTankerRefetch}
                  />
                ) : (
                  <DispatchPanel
                    dispatches={dispatches}
                    onSelect={(d) => onDispatchSelect?.(d)}
                  />
                )}

                <DispatchCreateDialog
                  open={dispatchCreateOpen}
                  onClose={() => setDispatchCreateOpen(false)}
                  onSuccess={handleRefetchAll}
                  villages={villages}
                />
                <AutoAssignDialog
                  open={autoAssignOpen}
                  onClose={() => setAutoAssignOpen(false)}
                  onSuccess={handleRefetchAll}
                />
              </SidebarGroupContent>
            </>
          )}
        </SidebarGroup>
      </SidebarContent>

      {/* User profile footer */}
      {session?.user && (
        <SidebarFooter className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {session.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name}
              </p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {(session.user as { role?: string }).role ?? "VIEWER"}
              </Badge>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
