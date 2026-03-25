"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  color?: "blue" | "green" | "purple" | "orange" | "red"
}

const colorMap = {
  blue: "text-sky-400 bg-sky-400/10",
  green: "text-emerald-400 bg-emerald-400/10",
  purple: "text-violet-400 bg-violet-400/10",
  orange: "text-orange-400 bg-orange-400/10",
  red: "text-red-400 bg-red-400/10",
}

export function KpiCard({ title, value, change, icon: Icon, color = "blue" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-400">{title}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            {change !== undefined && (
              <p className={cn("mt-1 text-xs font-medium", change >= 0 ? "text-emerald-400" : "text-red-400")}>
                {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs前期
              </p>
            )}
          </div>
          <div className={cn("rounded-lg p-2.5", colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
