"use client";

import { useState, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Village } from "@/lib/types";
import { getStressLevel } from "@/lib/types";
import { StressScoreBadge } from "./stress-score-badge";
import { Users, Droplets, Truck, ArrowDown } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const INITIAL_VIEW = {
  longitude: 75.7139,
  latitude: 19.7515,
  zoom: 6.5,
};

function getMarkerColor(score: number): string {
  const level = getStressLevel(score);
  switch (level) {
    case "safe":
      return "#22c55e";
    case "warning":
      return "#eab308";
    case "critical":
      return "#ef4444";
  }
}

interface MaharashtraMapProps {
  villages: Village[];
  selectedVillage?: Village | null;
  onVillageSelect?: (village: Village | null) => void;
}

export function MaharashtraMap({
  villages,
  selectedVillage,
  onVillageSelect,
}: MaharashtraMapProps) {
  const [popupVillage, setPopupVillage] = useState<Village | null>(null);

  const handleMarkerClick = useCallback(
    (village: Village) => {
      setPopupVillage(village);
      onVillageSelect?.(village);
    },
    [onVillageSelect]
  );

  return (
    <Map
      initialViewState={INITIAL_VIEW}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {villages.map((village) => (
        <Marker
          key={village.id}
          longitude={village.lng}
          latitude={village.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleMarkerClick(village);
          }}
        >
          <div
            className="cursor-pointer transition-transform hover:scale-125"
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: getMarkerColor(village.stressScore),
              border: "2px solid white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              transform:
                selectedVillage?.id === village.id ? "scale(1.5)" : "scale(1)",
            }}
          />
        </Marker>
      ))}

      {popupVillage && (
        <Popup
          longitude={popupVillage.lng}
          latitude={popupVillage.lat}
          anchor="bottom"
          onClose={() => setPopupVillage(null)}
          closeOnClick={false}
        >
          <div className="p-3 min-w-[200px]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-sm">{popupVillage.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {popupVillage.taluka}, {popupVillage.district}
                </p>
              </div>
              <StressScoreBadge score={popupVillage.stressScore} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>{popupVillage.population.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-muted-foreground" />
                <span>{popupVillage.rainfallDeviation}% rain</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
                <span>{popupVillage.groundwaterLevel}m GW</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-muted-foreground" />
                <span>{popupVillage.tankerDemand}/wk</span>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}
