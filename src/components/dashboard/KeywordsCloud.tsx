"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Hash } from "lucide-react"
import type { KeywordMetrics } from "@/types"
import { cn } from "@/lib/utils"

interface Props {
  keywords: KeywordMetrics[]
}

export function KeywordsCloud({ keywords }: Props) {
  const max = Math.max(...keywords.map((k) => k.avgEngagementRate), 0.001)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-sky-400" />
          反応の良いキーワード
        </CardTitle>
      </CardHeader>
      <CardContent>
        {keywords.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 py-8">データがありません</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => {
              const intensity = k.avgEngagementRate / max
              const size = intensity > 0.8 ? "text-lg" : intensity > 0.5 ? "text-base" : intensity > 0.3 ? "text-sm" : "text-xs"
              return (
                <div
                  key={k.keyword}
                  className={cn(
                    "rounded-full border border-sky-500/30 px-3 py-1 font-medium text-sky-300 transition-transform hover:scale-105 cursor-default",
                    size
                  )}
                  style={{ opacity: 0.4 + intensity * 0.6 }}
                  title={`ER: ${k.avgEngagementRate.toFixed(2)}% / 出現: ${k.count}回`}
                >
                  {k.keyword}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
