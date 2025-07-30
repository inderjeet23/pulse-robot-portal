import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  status: 'critical' | 'warning' | 'success' | 'neutral';
  onClick?: () => void;
  loading?: boolean;
  tooltipContent?: React.ReactNode;
}

const statusColors = {
  critical: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  warning: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
  neutral: 'text-gray-500 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
};

const statusIndicators = {
  critical: 'bg-red-500 shadow-red-500/20',
  warning: 'bg-amber-500 shadow-amber-500/20',
  success: 'bg-emerald-500 shadow-emerald-500/20',
  neutral: 'bg-gray-500 shadow-gray-500/20'
};

export function MetricCard({ 
  value, 
  label, 
  icon: Icon, 
  trend, 
  status,
  onClick,
  loading = false
  tooltipContent,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className="h-32 p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent className="p-0 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card 
          className={cn(
            "h-32 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl border-2 group",
            statusColors[status],
            onClick && "cursor-pointer hover:scale-[1.02]"
          )}
          onClick={onClick}
          style={{
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <CardContent className="p-0 h-full flex flex-col justify-between">
            {/* Header with icon and status indicator */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                statusIndicators[status]
              )}></div>
            </div>
            
            {/* Metric value and trend */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {value}
                </div>
                {trend && (
                  <div className="flex items-center gap-1 animate-float">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      trend.direction === 'up' ? "text-emerald-500" : "text-red-500"
                    )}>
                      {trend.percentage}%
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {label}
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      {tooltipContent && (
        <TooltipContent>
          <div className="space-y-1">
            {typeof tooltipContent === 'string' ? (
              <p className="text-xs">{tooltipContent}</p>
            ) : (
              tooltipContent
            )}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
