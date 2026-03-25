"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { FollowerTrend } from "@/types"
import { formatNumber } from "@/lib/analytics"

interface Props {
  data: FollowerTrend[]
}

export function FollowerChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickFormatter={formatNumber}
          width={50}
        />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          labelStyle={{ color: "#e4e4e7" }}
          itemStyle={{ color: "#8b5cf6" }}
          formatter={(v) => [formatNumber(Number(v)), "フォロワー数"]}
        />
        <Area
          type="monotone"
          dataKey="followerCount"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#followerGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
