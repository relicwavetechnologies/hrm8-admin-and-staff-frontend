import { Badge } from "@/shared/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AIMatchBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function AIMatchBadge({ score, size = 'sm', showIcon = true }: AIMatchBadgeProps) {
  const getGradientClass = () => {
    if (score >= 90) return 'from-emerald-500 to-green-600';
    if (score >= 75) return 'from-purple-500 to-indigo-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    return 'from-gray-500 to-slate-600';
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <Badge 
      className={`bg-gradient-to-r ${getGradientClass()} text-white border-0 font-semibold ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && <Sparkles className={iconSizes[size]} />}
      {score}% AI Match
    </Badge>
  );
}
