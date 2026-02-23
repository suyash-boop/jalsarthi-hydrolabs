"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRef } from "react-map-gl/mapbox";
import type { Village, WaterSource, Tanker, Dispatch } from "@/lib/types";
import { getStressLevel } from "@/lib/types";
import { StressScoreBadge } from "./stress-score-badge";
import { Users, Droplets, Truck, ArrowDown, Flame, Layers, Sun, Moon } from "lucide-react";
import type { LineLayout, LinePaint, HeatmapPaint } from "mapbox-gl";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const INITIAL_VIEW = {
  longitude: 75.7139,
  latitude: 19.7515,
  zoom: 6.5,
  pitch: 40,
  bearing: -5,
};

// --- Marker styling helpers ---

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

function getMarkerGlow(score: number): string {
  const level = getStressLevel(score);
  switch (level) {
    case "safe":
      return "0 0 8px 2px rgba(34,197,94,0.5)";
    case "warning":
      return "0 0 10px 3px rgba(234,179,8,0.5)";
    case "critical":
      return "0 0 14px 4px rgba(239,68,68,0.6)";
  }
}

function getWaterSourceColor(level: number): string {
  if (level > 60) return "#3b82f6";
  if (level > 30) return "#60a5fa";
  return "#93c5fd";
}

function getTankerMarkerColor(status: string): string {
  switch (status) {
    case "available":
      return "#22c55e";
    case "dispatched":
      return "#3b82f6";
    case "in_transit":
      return "#f59e0b";
    case "delivering":
      return "#8b5cf6";
    case "maintenance":
      return "#6b7280";
    case "offline":
      return "#374151";
    default:
      return "#6b7280";
  }
}

function getTankerGlow(status: string): string {
  const color = getTankerMarkerColor(status);
  return `0 0 8px 2px ${color}80`;
}

// --- Component ---

interface MaharashtraMapProps {
  villages: Village[];
  waterSources?: WaterSource[];
  tankers?: Tanker[];
  dispatches?: Dispatch[];
  selectedVillage?: Village | null;
  onVillageSelect?: (village: Village | null) => void;
}

export function MaharashtraMap({
  villages,
  waterSources = [],
  tankers = [],
  dispatches = [],
  selectedVillage,
  onVillageSelect,
}: MaharashtraMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupVillage, setPopupVillage] = useState<Village | null>(null);
  const [popupSource, setPopupSource] = useState<WaterSource | null>(null);
  const [popupTanker, setPopupTanker] = useState<Tanker | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");

  const isDark = mapTheme === "dark";

  // Fly-to selected village
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedVillage) {
      mapRef.current.flyTo({
        center: [selectedVillage.lng, selectedVillage.lat],
        zoom: 10,
        pitch: 50,
        duration: 1800,
        essential: true,
      });
    } else {
      mapRef.current.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        pitch: INITIAL_VIEW.pitch,
        bearing: INITIAL_VIEW.bearing,
        duration: 1400,
        essential: true,
      });
    }
  }, [selectedVillage]);

  const applyFog = useCallback((dark: boolean) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).setFog(
      dark
        ? {
            range: [0.8, 8],
            color: "#0f172a",
            "high-color": "#1e3a5f",
            "horizon-blend": 0.4,
            "star-intensity": 0.15,
            "space-color": "#0a0a1a",
          }
        : {
            range: [1, 12],
            color: "#ffffff",
            "high-color": "#a4c8ff",
            "horizon-blend": 0.3,
            "star-intensity": 0,
            "space-color": "#d0e4ff",
          }
    );
  }, []);

  const handleMapLoad = useCallback(() => {
    applyFog(isDark);
  }, [applyFog, isDark]);

  // Re-apply fog when theme changes
  useEffect(() => {
    applyFog(isDark);
  }, [isDark, applyFog]);

  const handleMarkerClick = useCallback(
    (village: Village) => {
      setPopupVillage(village);
      setPopupSource(null);
      setPopupTanker(null);
      onVillageSelect?.(village);
    },
    [onVillageSelect]
  );

  const handleSourceClick = useCallback((source: WaterSource) => {
    setPopupSource(source);
    setPopupVillage(null);
    setPopupTanker(null);
  }, []);

  const handleTankerClick = useCallback((tanker: Tanker) => {
    setPopupTanker(tanker);
    setPopupVillage(null);
    setPopupSource(null);
  }, []);

  // --- GeoJSON data ---

  // Heatmap source
  const heatmapGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: villages.map((v) => ({
        type: "Feature" as const,
        properties: { stressScore: v.stressScore },
        geometry: {
          type: "Point" as const,
          coordinates: [v.lng, v.lat],
        },
      })),
    }),
    [villages]
  );

  // Active dispatch routes
  const activeDispatches = useMemo(
    () =>
      dispatches.filter(
        (d) =>
          d.status !== "completed" &&
          d.status !== "cancelled" &&
          d.tanker
      ),
    [dispatches]
  );

  const routeGeoJSON = useMemo(() => {
    const features = activeDispatches.map((d) => {
      const tanker = d.tanker!;
      return {
        type: "Feature" as const,
        properties: {
          priority: d.priority,
          status: d.status,
          id: d.id,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [tanker.depotLng, tanker.depotLat],
            [d.villageLng, d.villageLat],
          ],
        },
      };
    });
    return { type: "FeatureCollection" as const, features };
  }, [activeDispatches]);

  const solidRouteGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routeGeoJSON.features.filter(
        (f) => f.properties.status !== "pending"
      ),
    }),
    [routeGeoJSON]
  );

  const dashedRouteGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routeGeoJSON.features.filter(
        (f) => f.properties.status === "pending"
      ),
    }),
    [routeGeoJSON]
  );

  // --- Paint configs ---

  const solidRouteLayout: LineLayout = { "line-join": "round", "line-cap": "round" };
  const solidRoutePaint: LinePaint = {
    "line-color": [
      "match",
      ["get", "priority"],
      "urgent", "#ef4444",
      "high", "#f97316",
      "medium", "#60a5fa",
      "low", "#9ca3af",
      "#6b7280",
    ],
    "line-width": 3,
    "line-opacity": 0.9,
  };

  const dashedRouteLayout: LineLayout = { "line-join": "round", "line-cap": "round" };
  const dashedRoutePaint: LinePaint = {
    "line-color": [
      "match",
      ["get", "priority"],
      "urgent", "#ef4444",
      "high", "#f97316",
      "medium", "#60a5fa",
      "low", "#9ca3af",
      "#6b7280",
    ],
    "line-width": 2,
    "line-opacity": 0.6,
    "line-dasharray": [4, 3],
  };

  const heatmapPaint: HeatmapPaint = {
    "heatmap-weight": [
      "interpolate", ["linear"], ["get", "stressScore"],
      0, 0,
      50, 0.3,
      75, 0.7,
      100, 1,
    ],
    "heatmap-intensity": [
      "interpolate", ["linear"], ["zoom"],
      5, 0.6,
      10, 1,
    ],
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0, "rgba(0,0,0,0)",
      0.1, "rgba(34,197,94,0.2)",
      0.3, "rgba(34,197,94,0.4)",
      0.5, "rgba(234,179,8,0.5)",
      0.7, "rgba(239,68,68,0.6)",
      1, "rgba(239,68,68,0.8)",
    ],
    "heatmap-radius": [
      "interpolate", ["linear"], ["zoom"],
      5, 25,
      8, 40,
      12, 60,
    ],
    "heatmap-opacity": [
      "interpolate", ["linear"], ["zoom"],
      6, 0.7,
      10, 0.4,
      13, 0,
    ],
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW}
      style={{ width: "100%", height: "100%" }}
      mapStyle={`mapbox://styles/mapbox/${isDark ? "dark" : "light"}-v11`}
      mapboxAccessToken={MAPBOX_TOKEN}
      terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
      onLoad={handleMapLoad}
      maxPitch={65}
    >
      <NavigationControl position="top-right" showCompass visualizePitch />

      {/* Terrain DEM Source */}
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />

      {/* Heatmap Layer */}
      <Source id="village-heatmap" type="geojson" data={heatmapGeoJSON}>
        <Layer
          id="village-heatmap-layer"
          type="heatmap"
          paint={heatmapPaint}
          layout={{ visibility: showHeatmap ? "visible" : "none" }}
        />
      </Source>

      {/* Dispatch Route Lines */}
      {solidRouteGeoJSON.features.length > 0 && (
        <Source id="solid-routes" type="geojson" data={solidRouteGeoJSON}>
          <Layer
            id="solid-route-lines"
            type="line"
            layout={solidRouteLayout}
            paint={solidRoutePaint}
          />
        </Source>
      )}
      {dashedRouteGeoJSON.features.length > 0 && (
        <Source id="dashed-routes" type="geojson" data={dashedRouteGeoJSON}>
          <Layer
            id="dashed-route-lines"
            type="line"
            layout={dashedRouteLayout}
            paint={dashedRoutePaint}
          />
        </Source>
      )}

      {/* Controls — Heatmap Toggle + Theme Toggle */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowHeatmap((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border transition-all ${
            showHeatmap
              ? isDark
                ? "bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                : "bg-red-500/15 border-red-500/30 text-red-600 shadow-sm"
              : isDark
                ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/15"
                : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          Heatmap
        </button>
        <button
          onClick={() => setMapTheme((t) => (t === "dark" ? "light" : "dark"))}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md border transition-all ${
            isDark
              ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/15"
              : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
          }`}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

      {/* Map Legend */}
      <div className={`absolute bottom-8 left-4 backdrop-blur-md border rounded-lg p-3 z-10 text-xs space-y-1.5 transition-colors ${
        isDark ? "bg-black/70 border-white/10" : "bg-white/80 border-black/10"
      }`}>
        <p className={`font-semibold mb-1 flex items-center gap-1.5 ${isDark ? "text-white/90" : "text-black/90"}`}>
          <Layers className="h-3.5 w-3.5" />
          Legend
        </p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className={isDark ? "text-white/60" : "text-black/60"}>Safe (&lt; 50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#eab308] shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
          <span className={isDark ? "text-white/60" : "text-black/60"}>Warning (50-75)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
          <span className={isDark ? "text-white/60" : "text-black/60"}>Critical (&gt; 75)</span>
        </div>
        {waterSources.length > 0 && (
          <>
            <div className={`border-t pt-1.5 mt-1.5 ${isDark ? "border-white/10" : "border-black/10"}`}>
              <p className={`font-semibold mb-1 ${isDark ? "text-white/90" : "text-black/90"}`}>Water Sources</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rotate-45 bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
              <span className={isDark ? "text-white/60" : "text-black/60"}>Dam / Reservoir</span>
            </div>
          </>
        )}
        {tankers.length > 0 && (
          <>
            <div className={`border-t pt-1.5 mt-1.5 ${isDark ? "border-white/10" : "border-black/10"}`}>
              <p className={`font-semibold mb-1 ${isDark ? "text-white/90" : "text-black/90"}`}>Tankers</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.5)]"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
              <span className={isDark ? "text-white/60" : "text-black/60"}>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
              <span className={isDark ? "text-white/60" : "text-black/60"}>Dispatched</span>
            </div>
          </>
        )}
        {activeDispatches.length > 0 && (
          <>
            <div className={`border-t pt-1.5 mt-1.5 ${isDark ? "border-white/10" : "border-black/10"}`}>
              <p className={`font-semibold mb-1 ${isDark ? "text-white/90" : "text-black/90"}`}>Routes</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#ef4444] shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              <span className={isDark ? "text-white/60" : "text-black/60"}>Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#60a5fa] shadow-[0_0_4px_rgba(96,165,250,0.5)]" />
              <span className={isDark ? "text-white/60" : "text-black/60"}>Normal</span>
            </div>
          </>
        )}
      </div>

      {/* Water Source Markers */}
      {waterSources.map((source) => (
        <Marker
          key={source.id}
          longitude={source.lng}
          latitude={source.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleSourceClick(source);
          }}
        >
          <div
            className="cursor-pointer transition-transform hover:scale-125"
            style={{
              width: 18,
              height: 18,
              backgroundColor: getWaterSourceColor(source.currentLevel),
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: `0 0 10px 2px ${getWaterSourceColor(source.currentLevel)}80`,
              transform: "rotate(45deg)",
            }}
          />
        </Marker>
      ))}

      {/* Village Markers with glow + pulse for critical */}
      {villages.map((village) => {
        const isCritical = village.stressScore > 75;
        const isSelected = selectedVillage?.id === village.id;
        const size = isCritical ? 18 : 14;
        const color = getMarkerColor(village.stressScore);

        return (
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
            <div className="relative flex items-center justify-center cursor-pointer">
              {/* Pulse ring for critical villages */}
              {isCritical && (
                <div
                  className="absolute marker-pulse-ring rounded-full"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: color,
                  }}
                />
              )}
              {/* Main marker dot */}
              <div
                className="relative transition-transform duration-200"
                style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: color,
                  border: "2px solid rgba(255,255,255,0.9)",
                  boxShadow: isSelected
                    ? `0 0 18px 6px ${color}90`
                    : getMarkerGlow(village.stressScore),
                  transform: isSelected ? "scale(1.8)" : "scale(1)",
                }}
              />
            </div>
          </Marker>
        );
      })}

      {/* Tanker Depot Markers */}
      {tankers.map((tanker) => (
        <Marker
          key={`tanker-${tanker.id}`}
          longitude={tanker.depotLng}
          latitude={tanker.depotLat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleTankerClick(tanker);
          }}
        >
          <div
            className="cursor-pointer transition-transform hover:scale-125 flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              backgroundColor: getTankerMarkerColor(tanker.status),
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: getTankerGlow(tanker.status),
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          />
        </Marker>
      ))}

      {/* Village Popup */}
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

      {/* Water Source Popup */}
      {popupSource && (
        <Popup
          longitude={popupSource.lng}
          latitude={popupSource.lat}
          anchor="bottom"
          onClose={() => setPopupSource(null)}
          closeOnClick={false}
        >
          <div className="p-3 min-w-[180px]">
            <h3 className="font-semibold text-sm">{popupSource.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {popupSource.type.charAt(0).toUpperCase() +
                popupSource.type.slice(1)}{" "}
              &middot; {popupSource.district}
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-mono">
                  {popupSource.capacity.toLocaleString()} ML
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Level</span>
                <span className="font-mono font-semibold">
                  {popupSource.currentLevel}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${popupSource.currentLevel}%`,
                    backgroundColor: getWaterSourceColor(
                      popupSource.currentLevel
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </Popup>
      )}

      {/* Tanker Popup */}
      {popupTanker && (
        <Popup
          longitude={popupTanker.depotLng}
          latitude={popupTanker.depotLat}
          anchor="bottom"
          onClose={() => setPopupTanker(null)}
          closeOnClick={false}
        >
          <div className="p-3 min-w-[200px]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-sm">
                  {popupTanker.registrationNo}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {popupTanker.depotLocation}
                </p>
              </div>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                style={{
                  backgroundColor: getTankerMarkerColor(popupTanker.status) + "20",
                  color: getTankerMarkerColor(popupTanker.status),
                }}
              >
                {popupTanker.status.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-muted-foreground" />
                <span>{(popupTanker.capacity / 1000).toFixed(0)}kL</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>{popupTanker.driverName}</span>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}
