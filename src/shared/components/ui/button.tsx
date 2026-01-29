import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,border-color,box-shadow] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-[color] [&_svg]:duration-500",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border border-border bg-background hover:bg-muted",
        "outline-primary": "border border-primary text-primary !bg-white hover:!bg-primary hover:!text-white shadow-sm hover:shadow-md",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105",
        reverse: "bg-primary-foreground text-primary border border-primary hover:bg-primary hover:text-primary-foreground shadow-md hover:shadow-lg",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        default: "h-10 px-4 py-2 rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-lg",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-sm",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
