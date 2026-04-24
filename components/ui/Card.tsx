import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function Card({ hover = false, className, children, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-ink-10 bg-paper p-4 shadow-sm",
        hover && "transition-shadow duration-150 hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
