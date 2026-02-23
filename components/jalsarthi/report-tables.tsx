"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DispatchStatusBadge } from "./dispatch-status-badge";
import { PriorityBadge } from "./priority-badge";
import type { DistrictReport } from "@/lib/report-stats";
import type { Dispatch } from "@/lib/types";

// ── Sortable helper ─────────────────────────────

type SortDir = "asc" | "desc";

function useSortable<T>(data: T[], defaultKey: keyof T, defaultDir: SortDir = "desc") {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const cmp = aVal < bVal ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const indicator = (key: keyof T) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return { sorted, handleSort, indicator };
}

// ── District Summary Table ──────────────────────

interface DistrictSummaryTableProps {
  data: DistrictReport[];
}

export function DistrictSummaryTable({ data }: DistrictSummaryTableProps) {
  const { sorted, handleSort, indicator } = useSortable(
    data,
    "avgStressScore"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          District Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                District{indicator("name")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("totalVillages")}
              >
                Villages{indicator("totalVillages")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("criticalCount")}
              >
                Critical{indicator("criticalCount")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("warningCount")}
              >
                Warning{indicator("warningCount")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("safeCount")}
              >
                Safe{indicator("safeCount")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("avgStressScore")}
              >
                Avg Stress{indicator("avgStressScore")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("totalTankerDemand")}
              >
                Demand/wk{indicator("totalTankerDemand")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("activeDispatches")}
              >
                Dispatches{indicator("activeDispatches")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">
                  {row.totalVillages}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {row.criticalCount}
                </TableCell>
                <TableCell className="text-right text-yellow-600">
                  {row.warningCount}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {row.safeCount}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.avgStressScore}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.totalTankerDemand}
                </TableCell>
                <TableCell className="text-right">
                  {row.activeDispatches}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Dispatch History Table ──────────────────────

interface DispatchHistoryTableProps {
  dispatches: Dispatch[];
}

export function DispatchHistoryTable({
  dispatches,
}: DispatchHistoryTableProps) {
  const tableData = dispatches.map((d) => ({
    ...d,
    tankerReg: d.tanker?.registrationNo || "—",
    tripsLabel: `${d.tripsCompleted}/${d.tripsAssigned}`,
    createdDate: new Date(d.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  const { sorted, handleSort, indicator } = useSortable(
    tableData,
    "createdAt"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Dispatch History
        </CardTitle>
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
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("tankerReg")}
              >
                Tanker{indicator("tankerReg")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                Status{indicator("status")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("priority")}
              >
                Priority{indicator("priority")}
              </TableHead>
              <TableHead className="text-right">Trips</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("createdAt")}
              >
                Created{indicator("createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.villageName}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {row.tankerReg}
                </TableCell>
                <TableCell>
                  <DispatchStatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={row.priority} />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.tripsLabel}
                </TableCell>
                <TableCell className="text-sm">{row.createdDate}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No dispatches found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
