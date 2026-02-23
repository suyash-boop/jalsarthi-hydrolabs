import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, CheckCircle2, Truck } from "lucide-react";

interface StatsOverviewProps {
  criticalCount: number;
  warningCount: number;
  safeCount: number;
  totalTankerDemand: number;
}

export function StatsOverview({
  criticalCount,
  warningCount,
  safeCount,
  totalTankerDemand,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Critical",
      value: criticalCount,
      icon: AlertCircle,
      colorClass: "text-stress-critical",
      bgClass: "bg-stress-critical/10",
    },
    {
      label: "Warning",
      value: warningCount,
      icon: AlertTriangle,
      colorClass: "text-stress-warning",
      bgClass: "bg-stress-warning/10",
    },
    {
      label: "Safe",
      value: safeCount,
      icon: CheckCircle2,
      colorClass: "text-stress-safe",
      bgClass: "bg-stress-safe/10",
    },
    {
      label: "Tankers/wk",
      value: totalTankerDemand,
      icon: Truck,
      colorClass: "text-secondary",
      bgClass: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={cn("rounded-md p-1.5", stat.bgClass)}>
                <stat.icon className={cn("h-4 w-4", stat.colorClass)} />
              </div>
              <div>
                <p className="text-lg font-bold font-mono leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
