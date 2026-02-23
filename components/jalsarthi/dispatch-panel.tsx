"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { DispatchStatusBadge } from "./dispatch-status-badge";
import { PriorityBadge } from "./priority-badge";
import type { Dispatch, DispatchStatus } from "@/lib/types";
import { MapPin, Truck } from "lucide-react";

interface DispatchPanelProps {
  dispatches: Dispatch[];
  onSelect: (dispatch: Dispatch) => void;
}

export function DispatchPanel({ dispatches, onSelect }: DispatchPanelProps) {
  const [statusFilter, setStatusFilter] = useState<DispatchStatus | "all">(
    "all"
  );

  const filtered = useMemo(() => {
    if (statusFilter === "all") return dispatches;
    return dispatches.filter((d) => d.status === statusFilter);
  }, [dispatches, statusFilter]);

  const statusOptions: { value: DispatchStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in_transit", label: "Transit" },
    { value: "delivering", label: "Active" },
    { value: "completed", label: "Done" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 flex-wrap">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-480px)]">
        <div className="flex flex-col gap-2 pr-2">
          {filtered.map((dispatch) => {
            const progress =
              dispatch.tripsAssigned > 0
                ? (dispatch.tripsCompleted / dispatch.tripsAssigned) * 100
                : 0;
            return (
              <Card
                key={dispatch.id}
                className="py-2 cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(dispatch)}
              >
                <CardContent className="px-3 py-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-semibold truncate">
                          {dispatch.villageName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <Truck className="h-3 w-3" />
                        <span>
                          {dispatch.tanker?.registrationNo || "Unassigned"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <DispatchStatusBadge status={dispatch.status} />
                      <PriorityBadge priority={dispatch.priority} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        Trips: {dispatch.tripsCompleted}/
                        {dispatch.tripsAssigned}
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No dispatches found
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
