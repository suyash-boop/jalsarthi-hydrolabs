"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TankerStatusBadge } from "./tanker-status-badge";
import { StressScoreBadge } from "./stress-score-badge";
import type { Village, AllocationRecommendation } from "@/lib/types";
import { MapPin, Truck, Clock, Route } from "lucide-react";

interface DispatchCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  villages: Village[];
}

export function DispatchCreateDialog({
  open,
  onClose,
  onSuccess,
  villages,
}: DispatchCreateDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [recommendations, setRecommendations] = useState<
    AllocationRecommendation[]
  >([]);
  const [selectedTankerId, setSelectedTankerId] = useState<string | null>(null);
  const [trips, setTrips] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sortedVillages = [...villages]
    .filter((v) => v.tankerDemand > 0)
    .sort((a, b) => b.stressScore - a.stressScore);

  const filteredVillages = searchQuery.trim()
    ? sortedVillages.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedVillages;

  const handleVillageSelect = async (village: Village) => {
    setSelectedVillage(village);
    setTrips(String(village.tankerDemand || 1));
    setLoading(true);
    try {
      const res = await fetch("/api/dispatches/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villageId: village.id }),
      });
      if (res.ok) {
        setRecommendations(await res.json());
      }
    } finally {
      setLoading(false);
    }
    setStep(2);
  };

  const handleCreate = async () => {
    if (!selectedVillage || !selectedTankerId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dispatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tankerId: selectedTankerId,
          villageId: selectedVillage.id,
          tripsAssigned: parseInt(trips),
          notes: notes || undefined,
        }),
      });
      if (res.ok) {
        onSuccess();
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedVillage(null);
    setRecommendations([]);
    setSelectedTankerId(null);
    setTrips("1");
    setNotes("");
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Select Village"
              : step === 2
                ? "Select Tanker"
                : "Confirm Dispatch"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Search village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
            <ScrollArea className="h-64">
              <div className="flex flex-col gap-1.5">
                {filteredVillages.map((v) => (
                  <Card
                    key={v.id}
                    className="py-1.5 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleVillageSelect(v)}
                  >
                    <CardContent className="px-3 py-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{v.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {v.district} - {v.tankerDemand} trips/wk
                            </p>
                          </div>
                        </div>
                        <StressScoreBadge score={v.stressScore} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Village: </span>
              <span className="font-medium">{selectedVillage?.name}</span>
              <span className="text-muted-foreground">
                {" "}
                ({selectedVillage?.district})
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Finding best tankers...
              </p>
            ) : (
              <ScrollArea className="h-48">
                <div className="flex flex-col gap-1.5">
                  {recommendations.map((rec) => (
                    <Card
                      key={rec.tankerId}
                      className={`py-1.5 cursor-pointer transition-colors ${
                        selectedTankerId === rec.tankerId
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedTankerId(rec.tankerId)}
                    >
                      <CardContent className="px-3 py-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {rec.tanker.registrationNo}
                              </span>
                              <TankerStatusBadge status={rec.tanker.status} />
                            </div>
                            <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Route className="h-3 w-3" />
                                {rec.distance} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />~{rec.estimatedTime} min
                              </span>
                              <span>
                                {(rec.tanker.capacity / 1000).toFixed(0)}kL
                              </span>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {rec.score}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No available tankers
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Trips</label>
                <Input
                  type="number"
                  min="1"
                  value={trips}
                  onChange={(e) => setTrips(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Input
                  placeholder="Any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedTankerId || loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Dispatch"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
