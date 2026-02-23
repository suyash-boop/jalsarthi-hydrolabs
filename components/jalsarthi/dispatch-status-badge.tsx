import { Badge } from "@/components/ui/badge";
import type { DispatchStatus } from "@/lib/types";

const statusConfig: Record<
  DispatchStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-gray-500/15 text-gray-700 border-gray-500/30",
  },
  assigned: {
    label: "Assigned",
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
  completed: {
    label: "Completed",
    className: "bg-green-500/15 text-green-700 border-green-500/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500/15 text-red-700 border-red-500/30",
  },
};

export function DispatchStatusBadge({ status }: { status: DispatchStatus }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
