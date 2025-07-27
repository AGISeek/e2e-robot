import React from "react";
import { cn } from "@/lib/utils";

/**
 * 加载状态组件 - 提供统一的加载指示器
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)} aria-label="加载中">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 bg-current rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    >
      {children}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("space-y-4 p-6 rounded-lg border bg-card", className)}>
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-20 w-full" />
      <div className="flex space-x-2">
        <LoadingSkeleton className="h-8 w-16" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  loadingText = "加载中...",
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}