import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * 通知组件变体配置
 */
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        info:
          "border-blue-500/50 text-blue-700 dark:border-blue-500 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

/**
 * 带有图标的通知组件
 */
interface IconAlertProps {
  variant?: VariantProps<typeof alertVariants>["variant"];
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function IconAlert({ 
  variant = "default", 
  title, 
  description, 
  icon, 
  className,
  onClose 
}: IconAlertProps) {
  const defaultIcons = {
    default: "ℹ️",
    destructive: "❌",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  const displayIcon = icon || defaultIcons[variant || "default"];

  return (
    <Alert variant={variant} className={cn("relative", className)}>
      {displayIcon && <span className="text-lg">{displayIcon}</span>}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="sr-only">关闭</span>
          ✕
        </button>
      )}
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}

/**
 * 简单的通知组件
 */
interface SimpleAlertProps {
  children: React.ReactNode;
  variant?: VariantProps<typeof alertVariants>["variant"];
  className?: string;
}

export function SimpleAlert({ children, variant = "default", className }: SimpleAlertProps) {
  return (
    <Alert variant={variant} className={className}>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };