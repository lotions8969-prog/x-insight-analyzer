import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        {
          "bg-zinc-700 text-zinc-200": variant === "default",
          "bg-emerald-500/20 text-emerald-400": variant === "success",
          "bg-amber-500/20 text-amber-400": variant === "warning",
          "bg-red-500/20 text-red-400": variant === "danger",
        },
        className
      )}
      {...props}
    />
  )
}
