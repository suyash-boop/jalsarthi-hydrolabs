"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ForecastResult, RiskLevel } from "@/lib/forecast";

// ── Risk Level Badge ────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, { label: string; variant: "destructive" | "secondary" | "outline" }> = {
    rising: { label: "Rising", variant: "destructive" },
    steady: { label: "Steady", variant: "secondary" },
    falling: { label: "Falling", variant: "outline" },
  };
  const { label, variant } = config[level];
  return <Badge variant={variant}>{label}</Badge>;
}

// ── Stress Forecast Chart ───────────────────────

interface StressForecastChartProps {
  forecasts: ForecastResult[];
}

export function StressForecastChart({ forecasts }: StressForecastChartProps) {
  // Show top 15 villages by projected score
  const data = forecasts
    .slice(0, 15)
    .map((f) => ({
      name: f.villageName.length > 12
        ? f.villageName.slice(0, 12) + "..."
        : f.villageName,
      current: f.currentScore,
      projected: f.projectedScore,
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Stress Score: Current vs Projected (7-day)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Legend verticalAlign="top" height={30} />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label="Critical" />
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" label="Warning" />
              <Bar
                dataKey="current"
                name="Current"
                fill="#6b7280"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="projected"
                name="Projected"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Rainfall Trend Chart ────────────────────────

interface RainfallTrendChartProps {
  forecasts: ForecastResult[];
}

export function RainfallTrendChart({ forecasts }: RainfallTrendChartProps) {
  // Aggregate weekly rainfall by district
  const districtMap = new Map<string, number[]>();
  for (const f of forecasts) {
    if (!districtMap.has(f.district)) {
      districtMap.set(f.district, [0, 0, 0, 0]);
    }
    const totals = districtMap.get(f.district)!;
    for (let i = 0; i < 4; i++) {
      totals[i] += f.weeklyRainfall[i] || 0;
    }
  }

  // Average per district
  const districtCounts = new Map<string, number>();
  for (const f of forecasts) {
    districtCounts.set(f.district, (districtCounts.get(f.district) || 0) + 1);
  }

  const weekLabels = ["Week -4", "Week -3", "Week -2", "Week -1"];
  const data = weekLabels.map((label, i) => {
    const entry: Record<string, string | number> = { week: label };
    for (const [district, totals] of districtMap.entries()) {
      const count = districtCounts.get(district) || 1;
      entry[district] = Math.round((totals[i] / count) * 10) / 10;
    }
    return entry;
  });

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];
  const districts = Array.from(districtMap.keys());

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Avg Rainfall Trend by District (mm/week)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11 }} />
              {districts.map((d, i) => (
                <Bar
                  key={d}
                  dataKey={d}
                  name={d}
                  fill={COLORS[i % COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Demand Forecast Table ───────────────────────

interface DemandForecastTableProps {
  forecasts: ForecastResult[];
}

type SortKey = "villageName" | "currentScore" | "projectedScore" | "currentDemand" | "projectedDemand";
type SortDir = "asc" | "desc";

export function DemandForecastTable({ forecasts }: DemandForecastTableProps) {
  const [filter, setFilter] = useState<"all" | "rising" | "steady" | "falling">("all");
  const [sortKey, setSortKey] = useState<SortKey>("projectedScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const indicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  const filtered = filter === "all"
    ? forecasts
    : forecasts.filter((f) => f.riskLevel === filter);

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    const cmp = aVal < bVal ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Village Demand Forecast
          </CardTitle>
          <div className="flex gap-1">
            {(["all", "rising", "steady", "falling"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("villageName")}
              >
                Village{indicator("villageName")}
              </TableHead>
              <TableHead>District</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("currentScore")}
              >
                Current{indicator("currentScore")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("projectedScore")}
              >
                Projected{indicator("projectedScore")}
              </TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("currentDemand")}
              >
                Demand Now{indicator("currentDemand")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("projectedDemand")}
              >
                Demand Est.{indicator("projectedDemand")}
              </TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((f) => {
              const scoreDelta = f.projectedScore - f.currentScore;
              const demandDelta = f.projectedDemand - f.currentDemand;
              return (
                <TableRow key={f.villageId}>
                  <TableCell className="font-medium">{f.villageName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {f.district}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {f.currentScore}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {f.projectedScore}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${
                      scoreDelta > 0
                        ? "text-red-600"
                        : scoreDelta < 0
                          ? "text-green-600"
                          : ""
                    }`}
                  >
                    {scoreDelta > 0 ? "+" : ""}
                    {scoreDelta}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {f.currentDemand}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${
                      demandDelta > 0
                        ? "text-red-600"
                        : demandDelta < 0
                          ? "text-green-600"
                          : ""
                    }`}
                  >
                    {f.projectedDemand}
                    {demandDelta !== 0 && (
                      <span className="text-xs ml-1">
                        ({demandDelta > 0 ? "+" : ""}
                        {demandDelta})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={f.riskLevel} />
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {f.trend}
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-8"
                >
                  No forecast data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
