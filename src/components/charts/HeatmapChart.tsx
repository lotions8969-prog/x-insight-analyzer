"use client"

import type { HourlyActivity } from "@/types"
import { cn } from "@/lib/utils"

interface Props {
  data: HourlyActivity[]
}

export function HeatmapChart({ data }: Props) {
  const maxRate = Math.max(...data.map((d) => d.avgEngagementRate), 0.001)

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {data.map((h) => {
          const intensity = h.avgEngagementRate / maxRate
          return (
            <div
              key={h.hour}
              className="group relative flex h-12 w-[calc(100%/24-4px)] min-w-[28px] cursor-default flex-col items-center justify-center rounded-md border border-zinc-700/50 transition-transform hover:scale-110"
              style={{
                background: `rgba(14, 165, 233, ${0.05 + intensity * 0.9})`,
              }}
            >
              <span className="text-[10px] font-semibold text-white">
                {h.hour}
              </span>
              <span className="text-[9px] text-zinc-300">
                {h.tweetCount > 0 ? `${h.avgEngagementRate.toFixed(1)}%` : "-"}
              </span>
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-800 px-2 py-1.5 text-xs opacity-0 shadow-xl ring-1 ring-zinc-700 group-hover:opacity-100 whitespace-nowrap z-10">
                <p className="font-semibold text-white">{h.hour}時台</p>
                <p className="text-zinc-400">投稿数: {h.tweetCount}</p>
                <p className="text-sky-400">ER: {h.avgEngagementRate.toFixed(2)}%</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>0時</span>
        <span>6時</span>
        <span>12時</span>
        <span>18時</span>
        <span>23時</span>
      </div>
    </div>
  )
}
