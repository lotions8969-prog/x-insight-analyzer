"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { DailyMetrics } from "@/types"

interface Props {
  data: DailyMetrics[]
}

export function EngagementChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          yAxisId="count"
          tick={{ fontSize: 11, fill: "#71717a" }}
          width={40}
        />
        <YAxis
          yAxisId="rate"
          orientation="right"
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickFormatter={(v) => `${v.toFixed(1)}%`}
          width={50}
        />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          labelStyle={{ color: "#e4e4e7" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="likes"
          stroke="#f43f5e"
          strokeWidth={2}
          dot={false}
          name="いいね"
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="retweets"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="リポスト"
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="replies"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          name="リプライ"
        />
        <Line
          yAxisId="rate"
          type="monotone"
          dataKey="engagementRate"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={false}
          name="エンゲージメント率"
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
