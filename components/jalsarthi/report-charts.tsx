"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DistrictReport, FleetStats } from "@/lib/report-stats";
import type { Dispatch } from "@/lib/types";

// ── District Comparison Chart ───────────────────

interface DistrictComparisonChartProps {
  data: DistrictReport[];
}

export function DistrictComparisonChart({
  data,
}: DistrictComparisonChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          District Stress Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend verticalAlign="top" height={30} />
              <Bar
                dataKey="criticalCount"
                name="Critical"
                fill="#ef4444"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="warningCount"
                name="Warning"
                fill="#eab308"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="safeCount"
                name="Safe"
                fill="#22c55e"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Stress Pie Chart ────────────────────────────

interface StressPieChartProps {
  critical: number;
  warning: number;
  safe: number;
}

const STRESS_COLORS = ["#ef4444", "#eab308", "#22c55e"];

export function StressPieChart({ critical, warning, safe }: StressPieChartProps) {
  const data = [
    { name: "Critical", value: critical },
    { name: "Warning", value: warning },
    { name: "Safe", value: safe },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Village Stress Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={STRESS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Dispatch Status Chart ───────────────────────

interface DispatchStatusChartProps {
  dispatches: Dispatch[];
}

const DISPATCH_COLORS: Record<string, string> = {
  pending: "#6b7280",
  assigned: "#3b82f6",
  in_transit: "#f59e0b",
  delivering: "#8b5cf6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

export function DispatchStatusChart({ dispatches }: DispatchStatusChartProps) {
  const statusMap = new Map<string, number>();
  for (const d of dispatches) {
    statusMap.set(d.status, (statusMap.get(d.status) || 0) + 1);
  }

  const data = Array.from(statusMap.entries()).map(([status, count]) => ({
    name: status.replace("_", " "),
    value: count,
    fill: DISPATCH_COLORS[status] || "#6b7280",
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Dispatch Status Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tanker Utilization Chart ────────────────────

interface TankerUtilizationChartProps {
  fleetStats: FleetStats;
}

const TANKER_STATUS_COLORS: Record<string, string> = {
  available: "#22c55e",
  dispatched: "#3b82f6",
  in_transit: "#f59e0b",
  delivering: "#8b5cf6",
  maintenance: "#6b7280",
  offline: "#374151",
};

export function TankerUtilizationChart({
  fleetStats,
}: TankerUtilizationChartProps) {
  const data = Object.entries(fleetStats.statusBreakdown).map(
    ([status, count]) => ({
      name: status.replace("_", " "),
      count,
      fill: TANKER_STATUS_COLORS[status] || "#6b7280",
    })
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Fleet Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip />
              <Bar dataKey="count" name="Tankers" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tanker Demand by District ───────────────────

interface TankerDemandByDistrictChartProps {
  data: DistrictReport[];
}

export function TankerDemandByDistrictChart({
  data,
}: TankerDemandByDistrictChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Tanker Demand by District (trips/week)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="totalTankerDemand"
                name="Demand (trips/wk)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
