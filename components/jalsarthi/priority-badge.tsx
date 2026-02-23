import { Badge } from "@/components/ui/badge";
import type { PriorityLevel } from "@/lib/types";

const priorityConfig: Record<
  PriorityLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-gray-500/15 text-gray-700 border-gray-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  },
  high: {
    label: "High",
    className: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/15 text-red-700 border-red-500/30",
  },
};

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
