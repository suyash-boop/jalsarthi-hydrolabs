import { Badge } from "@/components/ui/badge";
import type { TankerStatus } from "@/lib/types";

const statusConfig: Record<
  TankerStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className: "bg-green-500/15 text-green-700 border-green-500/30",
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  },
  delivering: {
    label: "Delivering",
    className: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  },
  offline: {
    label: "Offline",
    className: "bg-gray-500/15 text-gray-700 border-gray-500/30",
  },
};

export function TankerStatusBadge({ status }: { status: TankerStatus }) {
  const config = statusConfig[status] || statusConfig.offline;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
