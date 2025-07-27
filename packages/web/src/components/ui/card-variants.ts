import { cva, type VariantProps } from "class-variance-authority";

/**
 * 卡片组件变体配置
 */
const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        elevated: "shadow-lg hover:shadow-xl",
        glass: "bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-white/20 dark:border-neutral-700/50",
        outline: "border-2 bg-transparent",
        filled: "border-0 bg-muted",
        gradient: "bg-gradient-to-br from-white/90 to-neutral-50/90 dark:from-neutral-800/90 dark:to-neutral-900/90 backdrop-blur-sm",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:scale-[1.02] hover:shadow-lg",
        glow: "hover:shadow-lg hover:shadow-primary/25",
        border: "hover:border-primary",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "none",
    },
  }
);

const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      size: {
        sm: "p-4 pb-2",
        default: "p-6 pb-4",
        lg: "p-8 pb-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const cardContentVariants = cva(
  "",
  {
    variants: {
      size: {
        sm: "p-4 pt-0",
        default: "p-6 pt-0",
        lg: "p-8 pt-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const cardFooterVariants = cva(
  "flex items-center",
  {
    variants: {
      size: {
        sm: "p-4 pt-2",
        default: "p-6 pt-4",
        lg: "p-8 pt-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export { 
  cardVariants, 
  cardHeaderVariants, 
  cardContentVariants, 
  cardFooterVariants 
};

export type CardVariants = VariantProps<typeof cardVariants>;
export type CardHeaderVariants = VariantProps<typeof cardHeaderVariants>;
export type CardContentVariants = VariantProps<typeof cardContentVariants>;
export type CardFooterVariants = VariantProps<typeof cardFooterVariants>;