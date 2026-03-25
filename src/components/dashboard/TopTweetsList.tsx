"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Repeat2, Eye, TrendingUp } from "lucide-react"
import { formatNumber, formatPercent } from "@/lib/analytics"
import type { TweetAnalytics } from "@/types"

interface Props {
  tweets: TweetAnalytics[]
}

export function TopTweetsList({ tweets }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sky-400" />
          トップツイート（インプレッション順）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tweets.length === 0 && (
          <p className="text-center text-sm text-zinc-500 py-8">データがありません</p>
        )}
        {tweets.map((tweet, i) => (
          <div
            key={tweet.id}
            className="flex gap-3 rounded-lg bg-zinc-800/40 p-3 hover:bg-zinc-800/70 transition-colors"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-200 line-clamp-2">{tweet.text}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-sky-400" />
                  {formatNumber(tweet.impressionCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-pink-400" />
                  {formatNumber(tweet.likeCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-3 w-3 text-emerald-400" />
                  {formatNumber(tweet.retweetCount)}
                </span>
                <Badge
                  variant={tweet.engagementRate >= 2 ? "success" : tweet.engagementRate >= 0.5 ? "warning" : "default"}
                >
                  ER {formatPercent(tweet.engagementRate)}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
