"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StressScoreBadge } from "./stress-score-badge";
import { cn } from "@/lib/utils";
import type { Village } from "@/lib/types";
import { Droplets, Users, Truck } from "lucide-react";

interface VillageCardProps {
  village: Village;
  isSelected?: boolean;
  onClick?: (village: Village) => void;
}

export function VillageCard({ village, isSelected, onClick }: VillageCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md"
      )}
      onClick={() => onClick?.(village)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">{village.name}</h4>
            <p className="text-xs text-muted-foreground">
              {village.taluka}, {village.district}
            </p>
          </div>
          <StressScoreBadge score={village.stressScore} showLabel={false} />
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {village.population.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            {village.rainfallDeviation}%
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            {village.tankerDemand}/wk
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
