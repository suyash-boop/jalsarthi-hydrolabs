"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DispatchStatusBadge } from "./dispatch-status-badge";
import { PriorityBadge } from "./priority-badge";
import { RoleGuard } from "./role-guard";
import type { Dispatch, DispatchStatus } from "@/lib/types";
import {
  MapPin,
  Truck,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";

interface DispatchDetailSheetProps {
  dispatch: Dispatch | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusFlow: DispatchStatus[] = [
  "pending",
  "in_transit",
  "delivering",
  "completed",
];

export function DispatchDetailSheet({
  dispatch,
  open,
  onClose,
  onUpdate,
}: DispatchDetailSheetProps) {
  const [loading, setLoading] = useState(false);

  if (!dispatch) return null;

  const progress =
    dispatch.tripsAssigned > 0
      ? (dispatch.tripsCompleted / dispatch.tripsAssigned) * 100
      : 0;

  const currentIdx = statusFlow.indexOf(dispatch.status);
  const nextStatus =
    currentIdx >= 0 && currentIdx < statusFlow.length - 1
      ? statusFlow[currentIdx + 1]
      : null;

  const handleStatusUpdate = async (newStatus: DispatchStatus) => {
    setLoading(true);
    try {
      await fetch(`/api/dispatches/${dispatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {dispatch.villageName}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-2">
            <DispatchStatusBadge status={dispatch.status} />
            <PriorityBadge priority={dispatch.priority} />
          </div>

          {/* Tanker Info */}
          {dispatch.tanker && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">
                    {dispatch.tanker.registrationNo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Driver</div>
                  <div>{dispatch.tanker.driverName}</div>
                  {dispatch.tanker.driverPhone && (
                    <>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </div>
                      <div>{dispatch.tanker.driverPhone}</div>
                    </>
                  )}
                  <div className="text-muted-foreground">Capacity</div>
                  <div>
                    {(dispatch.tanker.capacity / 1000).toFixed(0)}kL
                  </div>
                  <div className="text-muted-foreground">Depot</div>
                  <div>{dispatch.tanker.depotLocation}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>
                Trips: {dispatch.tripsCompleted}/{dispatch.tripsAssigned}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Separator />

          {/* Timeline */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(dispatch.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dispatched:</span>
              <span>{formatDate(dispatch.dispatchedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Arrived:</span>
              <span>{formatDate(dispatch.arrivedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Completed:</span>
              <span>{formatDate(dispatch.completedAt)}</span>
            </div>
          </div>

          {dispatch.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{dispatch.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
            <div className="flex flex-col gap-2">
              {nextStatus && (
                <Button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={loading}
                >
                  {loading
                    ? "Updating..."
                    : `Mark as ${nextStatus.replace("_", " ")}`}
                </Button>
              )}
              {dispatch.status !== "completed" &&
                dispatch.status !== "cancelled" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={loading}
                  >
                    Cancel Dispatch
                  </Button>
                )}
            </div>
          </RoleGuard>
        </div>
      </SheetContent>
    </Sheet>
  );
}
