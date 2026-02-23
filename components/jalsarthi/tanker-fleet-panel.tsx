"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TankerStatusBadge } from "./tanker-status-badge";
import { TankerFormDialog } from "./tanker-form-dialog";
import { RoleGuard } from "./role-guard";
import type { Tanker, TankerStatus } from "@/lib/types";
import { Search, Plus, Truck, Phone, Droplets } from "lucide-react";

interface TankerFleetPanelProps {
  tankers: Tanker[];
  onRefetch: () => void;
}

export function TankerFleetPanel({
  tankers,
  onRefetch,
}: TankerFleetPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TankerStatus | "all">(
    "all"
  );
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...tankers];
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.registrationNo.toLowerCase().includes(q) ||
          t.driverName.toLowerCase().includes(q) ||
          t.depotLocation.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tankers, statusFilter, searchQuery]);

  const statusOptions: { value: TankerStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "Ready" },
    { value: "dispatched", label: "Busy" },
    { value: "maintenance", label: "Maint." },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tanker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <RoleGuard allowedRoles={["ADMIN"]}>
          <Button
            size="sm"
            className="h-8"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </RoleGuard>
      </div>

      <div className="flex gap-1">
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
          {filtered.map((tanker) => (
            <Card key={tanker.id} className="py-2 cursor-pointer hover:bg-muted/50">
              <CardContent className="px-3 py-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-semibold truncate">
                        {tanker.registrationNo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tanker.driverName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {(tanker.capacity / 1000).toFixed(0)}kL
                      </span>
                      {tanker.driverPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {tanker.driverPhone.slice(-4)}
                        </span>
                      )}
                      <span>{tanker.depotLocation}</span>
                    </div>
                  </div>
                  <TankerStatusBadge status={tanker.status} />
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tankers found
            </p>
          )}
        </div>
      </ScrollArea>

      <TankerFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={onRefetch}
      />
    </div>
  );
}
