import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  status?: 'success' | 'warning' | 'error' | 'neutral';
  onClick?: () => void;
  subtitle?: string;
  loading?: boolean;
}

const statusColors = {
  success: 'text-success bg-success/10 hover:bg-success/20',
  warning: 'text-warning bg-warning/10 hover:bg-warning/20',
  error: 'text-error bg-error/10 hover:bg-error/20',
  neutral: 'text-neutral bg-neutral/10 hover:bg-neutral/20'
};

const statusIndicators = {
  success: 'bg-success',
  warning: 'bg-warning animate-pulse-error',
  error: 'bg-error animate-pulse-error',
  neutral: 'bg-neutral'
};

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  status = 'neutral',
  onClick,
  subtitle,
  loading = false
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className="h-30 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated cursor-pointer">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 animate-shimmer"></div>
            <div className="w-2 h-2 rounded-full bg-muted animate-shimmer"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-20 bg-muted rounded animate-shimmer"></div>
            <div className="h-4 w-24 bg-muted rounded animate-shimmer"></div>
            <div className="h-3 w-16 bg-muted rounded animate-shimmer"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "h-30 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated group",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Header with icon and status indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200",
            statusColors[status]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn(
            "w-2 h-2 rounded-full",
            statusIndicators[status]
          )}></div>
        </div>
        
        {/* Metric value */}
        <div className="space-y-2">
          <div className="font-mono text-3xl font-semibold text-foreground animate-count-up">
            {value}
          </div>
          
          {/* Title and subtitle */}
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </div>
            )}
          </div>
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-error" />
              )}
              <span className={cn(
                "font-medium",
                trend.value > 0 ? "text-success" : "text-error"
              )}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}