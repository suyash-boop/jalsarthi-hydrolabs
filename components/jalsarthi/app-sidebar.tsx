"use client";

import { useState, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "./stats-overview";
import { VillageCard } from "./village-card";
import { computeOverallStats } from "@/lib/mock-data";
import { getStressLevel } from "@/lib/types";
import type { Village, StressLevel } from "@/lib/types";
import { Search } from "lucide-react";

interface AppSidebarProps {
  villages: Village[];
  selectedVillage?: Village | null;
  onVillageSelect?: (village: Village) => void;
}

export function AppSidebar({
  villages,
  selectedVillage,
  onVillageSelect,
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | StressLevel>("all");

  const stats = useMemo(() => computeOverallStats(villages), [villages]);

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

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
          Maharashtra Overview
        </h2>
        <StatsOverview
          criticalCount={stats.criticalCount}
          warningCount={stats.warningCount}
          safeCount={stats.safeCount}
          totalTankerDemand={stats.totalTankerDemand}
        />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Villages ({filteredVillages.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
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
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
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

            <ScrollArea className="h-[calc(100vh-380px)]">
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
