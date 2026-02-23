"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Truck,
  ClipboardList,
  Users,
} from "lucide-react";

interface SystemActionsPanelProps {
  stats: {
    totalVillages: number;
    totalTankers: number;
    totalDispatches: number;
    totalUsers: number;
  };
}

export function SystemActionsPanel({ stats }: SystemActionsPanelProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const handleRefreshScores = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await fetch("/api/villages/refresh-scores", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setRefreshResult({
          success: true,
          message: data.message,
          timestamp: new Date().toLocaleString("en-IN"),
        });
      } else {
        setRefreshResult({
          success: false,
          message: data.error || "Failed to refresh scores",
          timestamp: new Date().toLocaleString("en-IN"),
        });
      }
    } catch {
      setRefreshResult({
        success: false,
        message: "Network error",
        timestamp: new Date().toLocaleString("en-IN"),
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* System Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Button
              onClick={handleRefreshScores}
              disabled={refreshing}
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing
                ? "Refreshing Stress Scores..."
                : "Refresh All Stress Scores"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Fetches live rainfall data and recalculates all village stress
              scores.
            </p>
          </div>

          {refreshResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-md text-sm ${
                refreshResult.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {refreshResult.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              <div>
                <p>{refreshResult.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {refreshResult.timestamp}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVillages}</p>
                <p className="text-xs text-muted-foreground">Villages</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTankers}</p>
                <p className="text-xs text-muted-foreground">Tankers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDispatches}</p>
                <p className="text-xs text-muted-foreground">Dispatches</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                v1.0
              </Badge>
              <span className="text-xs text-muted-foreground">
                JalSarthi - Hydro Labs
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
