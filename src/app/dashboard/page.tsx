"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { ImpressionsChart } from "@/components/charts/ImpressionsChart"
import { EngagementChart } from "@/components/charts/EngagementChart"
import { HeatmapChart } from "@/components/charts/HeatmapChart"
import { FollowerChart } from "@/components/charts/FollowerChart"
import { TweetAnalyzer } from "@/components/dashboard/TweetAnalyzer"
import { TopTweetsList } from "@/components/dashboard/TopTweetsList"
import { KeywordsCloud } from "@/components/dashboard/KeywordsCloud"
import {
  Eye, Heart, TrendingUp, Users, RefreshCw, Clock
} from "lucide-react"
import { formatNumber, formatPercent } from "@/lib/analytics"
import type { TimeRange } from "@/types"

type AnalyticsData = {
  summary: {
    totalTweets: number
    totalImpressions: number
    totalEngagements: number
    avgEngagementRate: number
    bestHour: number
    topKeywords: { keyword: string; count: number; avgEngagementRate: number; avgImpressions: number }[]
    followerGrowth: number
  }
  daily: { date: string; impressions: number; engagements: number; likes: number; retweets: number; replies: number; engagementRate: number; tweetCount: number }[]
  hourly: { hour: number; avgEngagementRate: number; avgImpressions: number; tweetCount: number }[]
  keywords: { keyword: string; count: number; avgEngagementRate: number; avgImpressions: number }[]
  followerTrend: { date: string; followerCount: number; followingCount: number; tweetCount: number }[]
  topTweets: { id: string; text: string; createdAt: Date; likeCount: number; retweetCount: number; replyCount: number; quoteCount: number; impressionCount: number; bookmarkCount: number; engagementRate: number; totalEngagements: number }[]
}

const RANGES: { label: string; value: TimeRange }[] = [
  { label: "7日", value: "7d" },
  { label: "30日", value: "30d" },
  { label: "90日", value: "90d" },
  { label: "全期間", value: "all" },
]

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>("30d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analytics/summary?range=${range}`)
      if (!res.ok) throw new Error("データ取得に失敗しました")
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function syncData() {
    setSyncing(true)
    try {
      const res = await fetch("/api/twitter/sync", { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "同期失敗")
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "同期エラー")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold">X-Insight Analyzer</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Range selector */}
            <div className="flex rounded-lg border border-zinc-700 p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    range === r.value
                      ? "bg-sky-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button onClick={syncData} disabled={syncing} size="sm" variant="outline">
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "同期中..." : "データ同期"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <RefreshCw className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <KpiCard
                title="インプレッション"
                value={formatNumber(data.summary.totalImpressions)}
                icon={Eye}
                color="blue"
              />
              <KpiCard
                title="総エンゲージメント"
                value={formatNumber(data.summary.totalEngagements)}
                icon={Heart}
                color="red"
              />
              <KpiCard
                title="エンゲージメント率"
                value={formatPercent(data.summary.avgEngagementRate)}
                icon={TrendingUp}
                color="purple"
              />
              <KpiCard
                title="フォロワー増減"
                value={`${data.summary.followerGrowth >= 0 ? "+" : ""}${formatNumber(data.summary.followerGrowth)}`}
                icon={Users}
                color="green"
              />
              <KpiCard
                title="最適投稿時間"
                value={`${data.summary.bestHour}時台`}
                icon={Clock}
                color="orange"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>インプレッション推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImpressionsChart data={data.daily} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>エンゲージメント推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <EngagementChart data={data.daily} />
                </CardContent>
              </Card>
            </div>

            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-400" />
                  投稿時間帯別エンゲージメント率ヒートマップ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HeatmapChart data={data.hourly} />
              </CardContent>
            </Card>

            {/* Follower trend + Keywords */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-400" />
                    フォロワー推移
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FollowerChart data={data.followerTrend} />
                </CardContent>
              </Card>
              <KeywordsCloud keywords={data.keywords} />
            </div>

            {/* Top Tweets + Tweet Analyzer */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TopTweetsList tweets={data.topTweets} />
              <TweetAnalyzer />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <p className="text-zinc-400">データがありません。まず「データ同期」を実行してください。</p>
            <Button onClick={syncData} disabled={syncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              データ同期
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
