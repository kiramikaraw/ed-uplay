import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gameButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-lg font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-secondary/30",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-success/30",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-warning/30",
        purple: "bg-purple text-purple-foreground hover:bg-purple/90 shadow-purple/30",
        orange: "bg-orange text-orange-foreground hover:bg-orange/90 shadow-orange/30",
        outline: "border-2 border-primary bg-background text-primary hover:bg-primary/10",
        ghost: "hover:bg-accent/50 shadow-none",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        default: "h-12 px-6",
        lg: "h-14 px-8 text-xl",
        xl: "h-16 px-10 text-2xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface GameButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gameButtonVariants> {
  asChild?: boolean;
}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(gameButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GameButton.displayName = "GameButton";

export { GameButton, gameButtonVariants };
