import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactKPIProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  status?: "success" | "warning" | "critical" | "neutral";
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  loading?: boolean;
  onClick?: () => void;
}

const statusColors = {
  success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/20 dark:border-green-800 dark:text-green-100",
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-100",
  critical: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-800 dark:text-red-100",
  neutral: "bg-background border-border text-foreground",
};

export function CompactKPI({
  label,
  value,
  icon: Icon,
  status = "neutral",
  trend,
  loading = false,
  onClick
}: CompactKPIProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-3 w-8 bg-muted rounded" />
        </div>
        <div className="h-6 w-12 bg-muted rounded mb-1" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border transition-all duration-200",
        statusColors[status],
        onClick && "cursor-pointer hover:shadow-md hover:scale-105"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 opacity-70" />
        {trend && (
          <span className={cn(
            "text-xs font-medium",
            trend.direction === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend.direction === "up" ? "↗" : "↘"} {trend.percentage}%
          </span>
        )}
      </div>
      <div className="text-base font-bold leading-none mb-1">
        {value}
      </div>
      <div className="text-xs opacity-70 leading-none">
        {label}
      </div>
    </div>
  );
}