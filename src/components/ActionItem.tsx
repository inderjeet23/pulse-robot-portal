import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  priority: "critical" | "high" | "medium" | "low";
  actionLabel: string;
  onAction: () => void;
  value?: string | number;
  badge?: string;
}

const priorityColors = {
  critical: "bg-red-50 border-l-red-500 dark:bg-red-950/20",
  high: "bg-amber-50 border-l-amber-500 dark:bg-amber-950/20",
  medium: "bg-blue-50 border-l-blue-500 dark:bg-blue-950/20",
  low: "bg-gray-50 border-l-gray-500 dark:bg-gray-950/20",
};

const badgeColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function ActionItem({
  title,
  description,
  icon: Icon,
  priority,
  actionLabel,
  onAction,
  value,
  badge
}: ActionItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border-l-4 rounded-r-lg transition-all duration-200 hover:shadow-sm",
      priorityColors[priority]
    )}>
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          priority === "critical" ? "bg-red-100 dark:bg-red-900/40" :
          priority === "high" ? "bg-amber-100 dark:bg-amber-900/40" :
          priority === "medium" ? "bg-blue-100 dark:bg-blue-900/40" :
          "bg-gray-100 dark:bg-gray-900/40"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium truncate">{title}</h4>
          {badge && (
            <Badge variant="secondary" className={cn("text-xs", badgeColors[priority])}>
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        {value && (
          <p className="text-xs font-medium mt-1">{value}</p>
        )}
      </div>
      
      <Button 
        size="sm" 
        variant={priority === "critical" ? "destructive" : "outline"}
        onClick={onAction}
        className="flex-shrink-0 text-xs px-3 py-1 h-7"
      >
        {actionLabel}
      </Button>
    </div>
  );
}