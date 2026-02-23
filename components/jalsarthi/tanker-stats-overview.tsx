import { Card, CardContent } from "@/components/ui/card";
import { Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface TankerStatsOverviewProps {
  totalTankers: number;
  availableCount: number;
  activeDispatches: number;
  pendingDispatches: number;
}

export function TankerStatsOverview({
  totalTankers,
  availableCount,
  activeDispatches,
  pendingDispatches,
}: TankerStatsOverviewProps) {
  const items = [
    {
      label: "Total Fleet",
      value: totalTankers,
      icon: Truck,
      className: "text-foreground",
    },
    {
      label: "Available",
      value: availableCount,
      icon: CheckCircle,
      className: "text-green-600",
    },
    {
      label: "Active",
      value: activeDispatches,
      icon: AlertTriangle,
      className: "text-orange-600",
    },
    {
      label: "Pending",
      value: pendingDispatches,
      icon: Clock,
      className: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <Card key={item.label} className="py-2">
          <CardContent className="px-3 py-0">
            <div className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.className}`} />
              <div>
                <p className="text-lg font-bold leading-none">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
