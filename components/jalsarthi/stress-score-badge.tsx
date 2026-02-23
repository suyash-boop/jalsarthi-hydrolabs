import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStressLevel, type StressLevel } from "@/lib/types";

interface StressScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

const levelConfig: Record<StressLevel, { label: string; className: string }> = {
  safe: {
    label: "Safe",
    className: "bg-stress-safe text-white",
  },
  warning: {
    label: "Warning",
    className: "bg-stress-warning text-black",
  },
  critical: {
    label: "Critical",
    className: "bg-stress-critical text-white",
  },
};

export function StressScoreBadge({
  score,
  showLabel = true,
  className,
}: StressScoreBadgeProps) {
  const level = getStressLevel(score);
  const config = levelConfig[level];

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, "font-mono tabular-nums", className)}
    >
      {score}
      {showLabel && (
        <span className="ml-1 font-sans text-xs">({config.label})</span>
      )}
    </Badge>
  );
}
