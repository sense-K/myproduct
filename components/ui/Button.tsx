import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:opacity-90",
  secondary: "border border-ink-10 bg-paper text-ink hover:border-ink",
  accent: "bg-accent text-cream hover:opacity-90",
  ghost: "text-ink-60 hover:bg-ink-10 hover:text-ink",
  danger: "bg-accent text-cream hover:opacity-80",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-[8px]",
  md: "h-10 px-4 text-sm rounded-[8px]",
  lg: "h-12 px-5 text-sm rounded-[8px]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", className, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
