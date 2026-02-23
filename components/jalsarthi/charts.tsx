"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Village } from "@/lib/types";
import { getStressLevel } from "@/lib/types";

const stressColors: Record<string, string> = {
  safe: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
};

const chartConfig = {
  stressScore: {
    label: "Stress Score",
  },
  rainfallDeviation: {
    label: "Rainfall Deviation",
    color: "var(--color-secondary)",
  },
} satisfies ChartConfig;

interface StressDistributionChartProps {
  villages: Village[];
}

export function StressDistributionChart({
  villages,
}: StressDistributionChartProps) {
  const data = useMemo(() => {
    return [...villages]
      .sort((a, b) => b.stressScore - a.stressScore)
      .map((v) => ({
        name: v.name.length > 8 ? v.name.slice(0, 7) + ".." : v.name,
        fullName: v.name,
        stressScore: v.stressScore,
        level: getStressLevel(v.stressScore),
      }));
  }, [villages]);

  return (
    <Card>
      <CardHeader className="px-3 pb-2">
        <CardTitle className="text-sm font-medium">
          Village Stress Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ChartContainer config={chartConfig} className="!aspect-auto h-[280px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: -10, right: 4, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={9} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={9}
              width={58}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="fullName"
                  nameKey="fullName"
                />
              }
            />
            <Bar dataKey="stressScore" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={stressColors[entry.level]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface RainfallChartProps {
  villages: Village[];
}

export function RainfallChart({ villages }: RainfallChartProps) {
  const data = useMemo(() => {
    return [...villages]
      .sort((a, b) => a.rainfallDeviation - b.rainfallDeviation)
      .map((v) => ({
        name: v.name.length > 8 ? v.name.slice(0, 7) + ".." : v.name,
        fullName: v.name,
        rainfallDeviation: v.rainfallDeviation,
        level: getStressLevel(v.stressScore),
      }));
  }, [villages]);

  return (
    <Card>
      <CardHeader className="px-3 pb-2">
        <CardTitle className="text-sm font-medium">
          Rainfall Deviation (%)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ChartContainer config={chartConfig} className="!aspect-auto h-[280px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: -10, right: 4, top: 4, bottom: 4 }}>
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={9} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={9}
              width={58}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="fullName"
                  nameKey="fullName"
                />
              }
            />
            <Bar
              dataKey="rainfallDeviation"
              radius={[0, 4, 4, 0]}
              barSize={12}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.rainfallDeviation < -30
                      ? "#ef4444"
                      : entry.rainfallDeviation < -15
                        ? "#eab308"
                        : "#22c55e"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
