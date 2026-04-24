import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "feedback" | "certificate" | "category" | "career" | "neutral";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  feedback: "bg-accent-soft text-accent",
  certificate: "bg-sage-soft text-sage",
  category: "bg-ink-10 text-ink-60",
  career: "bg-cream border border-ink-10 text-ink-60",
  neutral: "bg-ink-10 text-ink-60",
};

export function Badge({ variant = "neutral", className, children, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
