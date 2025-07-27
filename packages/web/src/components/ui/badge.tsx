import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * 徽章组件变体配置
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white shadow hover:bg-green-500/80",
        warning:
          "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-500/80",
        info:
          "border-transparent bg-blue-500 text-white shadow hover:bg-blue-500/80",
        glass:
          "border-white/20 bg-white/10 text-white backdrop-blur-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

/**
 * 状态徽章组件
 */
interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "pending";
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, children, className, showIcon = true }: StatusBadgeProps) {
  const statusConfig = {
    success: {
      variant: "success" as const,
      icon: "✅",
    },
    warning: {
      variant: "warning" as const,
      icon: "⚠️",
    },
    error: {
      variant: "destructive" as const,
      icon: "❌",
    },
    info: {
      variant: "info" as const,
      icon: "ℹ️",
    },
    pending: {
      variant: "secondary" as const,
      icon: "⏳",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {children}
    </Badge>
  );
}

/**
 * 计数徽章组件
 */
interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

export function CountBadge({ count, max = 99, className, variant = "default" }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) {
    return null;
  }

  return (
    <Badge variant={variant} size="sm" className={cn("rounded-full min-w-[20px] h-5 p-0 flex items-center justify-center", className)}>
      {displayCount}
    </Badge>
  );
}

export { Badge, badgeVariants };