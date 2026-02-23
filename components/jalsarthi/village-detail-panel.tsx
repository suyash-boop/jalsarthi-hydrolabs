"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StressScoreBadge } from "./stress-score-badge";
import { DispatchStatusBadge } from "./dispatch-status-badge";
import { PriorityBadge } from "./priority-badge";
import { RoleGuard } from "./role-guard";
import type { Village, Dispatch } from "@/lib/types";
import { getStressLevel } from "@/lib/types";
import {
  Users,
  Droplets,
  Truck,
  ArrowDown,
  MapPin,
  TrendingDown,
  Gauge,
  Plus,
} from "lucide-react";

interface VillageDetailPanelProps {
  village: Village | null;
  dispatches?: Dispatch[];
  open: boolean;
  onClose: () => void;
  onRequestTanker?: () => void;
}

export function VillageDetailPanel({
  village,
  dispatches = [],
  open,
  onClose,
  onRequestTanker,
}: VillageDetailPanelProps) {
  if (!village) return null;

  const level = getStressLevel(village.stressScore);

  // Filter active dispatches for this village
  const villageDispatches = dispatches.filter(
    (d) =>
      d.villageName === village.name &&
      d.status !== "completed" &&
      d.status !== "cancelled"
  );

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="text-xl">{village.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {village.taluka}, {village.district}
              </SheetDescription>
            </div>
            <StressScoreBadge score={village.stressScore} />
          </div>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-4">
          {/* Stress Score Gauge */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  Water Stress Index
                </span>
                <span className="text-2xl font-bold font-mono">
                  {village.stressScore}
                  <span className="text-sm font-normal text-muted-foreground">
                    /100
                  </span>
                </span>
              </div>
              <Progress
                value={village.stressScore}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Safe</span>
                <span>Warning</span>
                <span>Critical</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={Users}
              label="Population"
              value={village.population.toLocaleString()}
            />
            <MetricCard
              icon={Truck}
              label="Tanker Demand"
              value={`${village.tankerDemand} trips/wk`}
            />
            <MetricCard
              icon={Droplets}
              label="Rainfall Deviation"
              value={`${village.rainfallDeviation}%`}
              valueColor={
                village.rainfallDeviation < -30
                  ? "text-stress-critical"
                  : village.rainfallDeviation < -15
                    ? "text-stress-warning"
                    : "text-stress-safe"
              }
            />
            <MetricCard
              icon={ArrowDown}
              label="Groundwater Level"
              value={`${village.groundwaterLevel}m`}
              valueColor={
                village.groundwaterLevel > 15
                  ? "text-stress-critical"
                  : village.groundwaterLevel > 10
                    ? "text-stress-warning"
                    : "text-stress-safe"
              }
            />
          </div>

          <Separator />

          {/* Active Dispatches */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-muted-foreground" />
              Active Dispatches
              {villageDispatches.length > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-1">
                  {villageDispatches.length}
                </Badge>
              )}
            </h4>
            {villageDispatches.length > 0 ? (
              <div className="flex flex-col gap-2">
                {villageDispatches.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold">
                          {d.tanker?.registrationNo ?? "Unassigned"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={d.priority} />
                          <DispatchStatusBadge status={d.status} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Trips: {d.tripsCompleted}/{d.tripsAssigned}
                        </span>
                        <Progress
                          value={
                            d.tripsAssigned > 0
                              ? (d.tripsCompleted / d.tripsAssigned) * 100
                              : 0
                          }
                          className="h-1.5 w-20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-3 bg-muted/50 rounded-lg">
                No active dispatches
              </p>
            )}
          </div>

          <Separator />

          {/* Water Supply Estimate */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                7-Day Demand Forecast
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Est. water needed
                  </span>
                  <span className="font-mono font-semibold">
                    {(village.tankerDemand * 10000).toLocaleString()} L
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tanker trips</span>
                  <span className="font-mono font-semibold">
                    {village.tankerDemand}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Priority level
                  </span>
                  <Badge
                    variant={
                      level === "critical"
                        ? "destructive"
                        : level === "warning"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {level === "critical"
                      ? "Urgent"
                      : level === "warning"
                        ? "Medium"
                        : "Low"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Tanker Button */}
          <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
            <Button
              className="w-full"
              onClick={onRequestTanker}
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Tanker Dispatch
            </Button>
          </RoleGuard>

          {/* Coordinates */}
          <div className="text-xs text-muted-foreground text-center font-mono">
            {village.lat.toFixed(4)}N, {village.lng.toFixed(4)}E
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={`text-lg font-semibold font-mono ${valueColor || ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
