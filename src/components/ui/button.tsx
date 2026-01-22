import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const buttonVariants = ({
  variant = "default",
  size = "default",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className">) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
    variant === "default" &&
      "bg-[#7755FF] text-white hover:bg-[#7755FF]/90",
    variant === "accent" &&
      "bg-[#FF5F00] text-white hover:bg-[#FF5F00]/90",
    variant === "outline" &&
      "border border-border bg-transparent text-foreground hover:bg-muted",
    variant === "ghost" && "bg-transparent hover:bg-muted",
    size === "default" && "h-11 px-5 text-sm",
    size === "sm" && "h-9 px-4 text-sm",
    size === "lg" && "h-12 px-6 text-base",
    size === "icon" && "h-10 w-10",
    className
  );

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

