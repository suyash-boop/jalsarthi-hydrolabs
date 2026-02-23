"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DistrictComparisonChart,
  StressPieChart,
  DispatchStatusChart,
  TankerUtilizationChart,
  TankerDemandByDistrictChart,
} from "@/components/jalsarthi/report-charts";
import {
  DistrictSummaryTable,
  DispatchHistoryTable,
} from "@/components/jalsarthi/report-tables";
import {
  StressForecastChart,
  RainfallTrendChart,
  DemandForecastTable,
} from "@/components/jalsarthi/forecast-charts";
import { useVillages } from "@/hooks/use-villages";
import { useTankers } from "@/hooks/use-tankers";
import { useDispatches } from "@/hooks/use-dispatches";
import { computeOverallStats } from "@/lib/stats";
import {
  computeDispatchStats,
  computeFleetStats,
  computeDistrictReport,
} from "@/lib/report-stats";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { useForecast } from "@/hooks/use-forecast";
import {
  ArrowLeft,
  Download,
  FileText,
  MapPin,
  AlertTriangle,
  Activity,
  Truck,
  Gauge,
  Droplets,
} from "lucide-react";

export default function ReportsPage() {
  const { villages } = useVillages();
  const { tankers } = useTankers();
  const { dispatches } = useDispatches();
  const { forecasts } = useForecast();

  const overallStats = useMemo(() => computeOverallStats(villages), [villages]);
  const dispatchStats = useMemo(
    () => computeDispatchStats(dispatches),
    [dispatches]
  );
  const fleetStats = useMemo(() => computeFleetStats(tankers), [tankers]);
  const districtReport = useMemo(
    () => computeDistrictReport(villages, dispatches),
    [villages, dispatches]
  );

  const handleExportCSV = () => {
    exportToCSV(
      districtReport as unknown as Record<string, unknown>[],
      [
        { key: "name", label: "District" },
        { key: "totalVillages", label: "Villages" },
        { key: "criticalCount", label: "Critical" },
        { key: "warningCount", label: "Warning" },
        { key: "safeCount", label: "Safe" },
        { key: "avgStressScore", label: "Avg Stress" },
        { key: "totalTankerDemand", label: "Tanker Demand/wk" },
        { key: "activeDispatches", label: "Active Dispatches" },
      ],
      `jalsarthi-report-${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      "report-content",
      `jalsarthi-report-${new Date().toISOString().slice(0, 10)}`
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-bold">Reports & Analytics</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      <div id="report-content" className="flex flex-col gap-8">
        {/* Section 1: KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Total Villages"
            value={overallStats.totalVillages}
            icon={<MapPin className="h-4 w-4" />}
          />
          <KPICard
            title="Critical"
            value={overallStats.criticalCount}
            icon={<AlertTriangle className="h-4 w-4" />}
            valueClass="text-red-600"
          />
          <KPICard
            title="Avg Stress"
            value={overallStats.avgStressScore}
            icon={<Activity className="h-4 w-4" />}
          />
          <KPICard
            title="Active Dispatches"
            value={dispatchStats.active}
            icon={<Truck className="h-4 w-4" />}
          />
          <KPICard
            title="Fleet Utilization"
            value={`${fleetStats.utilizationRate}%`}
            icon={<Gauge className="h-4 w-4" />}
          />
          <KPICard
            title="Tanker Demand/wk"
            value={overallStats.totalTankerDemand}
            icon={<Droplets className="h-4 w-4" />}
          />
        </div>

        {/* Section 2: District Overview */}
        <section>
          <h2 className="text-lg font-semibold mb-4">District Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <DistrictComparisonChart data={districtReport} />
            <StressPieChart
              critical={overallStats.criticalCount}
              warning={overallStats.warningCount}
              safe={overallStats.safeCount}
            />
          </div>
          <DistrictSummaryTable data={districtReport} />
        </section>

        {/* Section 3: Dispatch Performance */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Dispatch Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <DispatchStatusChart dispatches={dispatches} />
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">Dispatch Metrics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{dispatchStats.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dispatchStats.completed}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {dispatchStats.completionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Trips/Dispatch</p>
                    <p className="text-2xl font-bold">
                      {dispatchStats.avgTripsAssigned}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DispatchHistoryTable dispatches={dispatches} />
        </section>

        {/* Section 4: Fleet Analytics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Fleet Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TankerUtilizationChart fleetStats={fleetStats} />
            <TankerDemandByDistrictChart data={districtReport} />
          </div>
        </section>

        {/* Section 5: Demand Forecast */}
        {forecasts.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Demand Forecast (7-day Projection)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <StressForecastChart forecasts={forecasts} />
              <RainfallTrendChart forecasts={forecasts} />
            </div>
            <DemandForecastTable forecasts={forecasts} />
          </section>
        )}
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  valueClass,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{title}</span>
        </div>
        <p className={`text-2xl font-bold ${valueClass || ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
