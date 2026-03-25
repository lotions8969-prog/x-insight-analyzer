"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Repeat2, MessageCircle, Eye, Bookmark, TrendingUp } from "lucide-react"
import { formatNumber, formatPercent } from "@/lib/analytics"

interface TweetResult {
  id: string
  text: string
  createdAt: string
  likeCount: number
  retweetCount: number
  replyCount: number
  quoteCount: number
  impressionCount: number
  bookmarkCount: number
  engagementRate: number
}

export function TweetAnalyzer() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TweetResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/analytics/tweet?url=${encodeURIComponent(input)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch")
      setResult(data.tweet)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const totalEngagements = result
    ? result.likeCount + result.retweetCount + result.replyCount + result.quoteCount
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-sky-400" />
          ツイート深掘り分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="ツイートURLまたはIDを入力..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
          />
          <Button onClick={analyze} disabled={loading}>
            {loading ? "分析中..." : "分析"}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Tweet text */}
            <div className="rounded-lg bg-zinc-800 p-4 text-sm text-zinc-200 leading-relaxed">
              {result.text}
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[
                { icon: Eye, label: "インプレッション", value: result.impressionCount, color: "text-sky-400" },
                { icon: Heart, label: "いいね", value: result.likeCount, color: "text-pink-400" },
                { icon: Repeat2, label: "リポスト", value: result.retweetCount, color: "text-emerald-400" },
                { icon: MessageCircle, label: "リプライ", value: result.replyCount, color: "text-amber-400" },
                { icon: Bookmark, label: "ブックマーク", value: result.bookmarkCount, color: "text-violet-400" },
                { icon: TrendingUp, label: "ER", value: null, color: "text-orange-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-lg bg-zinc-800/60 p-3 text-center">
                  <Icon className={`mx-auto mb-1 h-4 w-4 ${color}`} />
                  <p className="text-xs text-zinc-400">{label}</p>
                  <p className="font-bold text-white">
                    {label === "ER" ? formatPercent(result.engagementRate) : formatNumber(value!)}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">総エンゲージメント: {formatNumber(totalEngagements)}</Badge>
              <Badge
                variant={result.engagementRate >= 2 ? "success" : result.engagementRate >= 0.5 ? "warning" : "danger"}
              >
                ER {formatPercent(result.engagementRate)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
