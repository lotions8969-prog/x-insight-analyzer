"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { ImpressionsChart } from "@/components/charts/ImpressionsChart"
import { EngagementChart } from "@/components/charts/EngagementChart"
import { HeatmapChart } from "@/components/charts/HeatmapChart"
import { FollowerChart } from "@/components/charts/FollowerChart"
import { TweetAnalyzer } from "@/components/dashboard/TweetAnalyzer"
import { TopTweetsList } from "@/components/dashboard/TopTweetsList"
import { KeywordsCloud } from "@/components/dashboard/KeywordsCloud"
import {
  Eye, Heart, TrendingUp, Users, RefreshCw, Clock, BarChart2,
  AlertCircle, LogOut, Key, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react"
import { formatNumber, formatPercent } from "@/lib/analytics"
import type { TimeRange, TweetAnalytics } from "@/types"
import Link from "next/link"

type AnalyticsData = {
  isDemo?: boolean
  isReal?: boolean
  noImpressions?: boolean
  user?: { name: string; username: string; followerCount: number; image?: string | null }
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
  topTweets: TweetAnalytics[]
}

const RANGES: { label: string; value: TimeRange }[] = [
  { label: "7日", value: "7d" },
  { label: "30日", value: "30d" },
  { label: "90日", value: "90d" },
  { label: "全期間", value: "all" },
]

const STORAGE_KEY = "x_bearer_token"

export default function DashboardPage() {
  const { data: session } = useSession()
  const twitterHandle = (session?.user as { twitterHandle?: string } | undefined)?.twitterHandle

  const [range, setRange] = useState<TimeRange>("30d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  // Bearer Token state
  const [bearerToken, setBearerToken] = useState("")
  const [savedToken, setSavedToken] = useState("")
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenError, setTokenError] = useState("")

  // Load saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? ""
    setSavedToken(saved)
    setBearerToken(saved)
  }, [])

  const fetchData = useCallback(async (token?: string) => {
    setLoading(true)
    setError(null)
    const t = token ?? savedToken

    // Bearer Tokenとハンドルがあればリアルデータ
    if (t && twitterHandle) {
      try {
        const res = await fetch(
          `/api/analytics/real?handle=${twitterHandle}&token=${encodeURIComponent(t)}&range=${range}`
        )
        const json = await res.json()
        if (res.ok) {
          setData(json)
          setIsDemo(false)
          setLoading(false)
          return
        }
        setError(json.error ?? "データ取得に失敗しました")
      } catch (e) {
        setError(e instanceof Error ? e.message : "通信エラー")
      }
      setLoading(false)
      return
    }

    // フォールバック: デモデータ
    try {
      const res = await fetch(`/api/analytics/demo?range=${range}`)
      const json = await res.json()
      setData(json)
      setIsDemo(true)
    } catch {
      setError("データ取得に失敗しました")
    }
    setLoading(false)
  }, [range, savedToken, twitterHandle])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function applyToken() {
    if (!bearerToken.trim()) return
    setTokenLoading(true)
    setTokenError("")
    // 簡易バリデート: APIを1回叩いて確認
    try {
      const res = await fetch(
        `/api/analytics/real?handle=${twitterHandle ?? "twitter"}&token=${encodeURIComponent(bearerToken.trim())}&range=7d`
      )
      const json = await res.json()
      if (res.ok) {
        localStorage.setItem(STORAGE_KEY, bearerToken.trim())
        setSavedToken(bearerToken.trim())
        setShowTokenInput(false)
        fetchData(bearerToken.trim())
      } else {
        setTokenError(json.error ?? "トークンが無効です")
      }
    } catch {
      setTokenError("接続エラーです")
    }
    setTokenLoading(false)
  }

  function removeToken() {
    localStorage.removeItem(STORAGE_KEY)
    setSavedToken("")
    setBearerToken("")
    fetchData("")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold hidden sm:block">X-Insight Analyzer</h1>
            {(twitterHandle || data?.user?.username) && (
              <span className="text-sm font-semibold text-sky-400">
                @{twitterHandle ?? data?.user?.username}
              </span>
            )}
            {savedToken && (
              <Badge variant="success" className="hidden sm:flex">
                <CheckCircle2 className="h-3 w-3 mr-1" /> 実データ接続中
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Link href="/dashboard/tweets">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <BarChart2 className="mr-1.5 h-3.5 w-3.5" />ツイート一覧
              </Button>
            </Link>
            <div className="flex rounded-lg border border-zinc-700 p-0.5">
              {RANGES.map((r) => (
                <button key={r.value} onClick={() => setRange(r.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${range === r.value ? "bg-sky-500 text-white" : "text-zinc-400 hover:text-white"}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <Button onClick={() => setShowTokenInput(v => !v)} size="sm" variant={savedToken ? "ghost" : "outline"}>
              <Key className="h-3.5 w-3.5 mr-1" />
              {savedToken ? "API設定済" : "APIキー設定"}
              {showTokenInput ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" size="sm" variant="ghost">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bearer Token 入力パネル */}
        {showTokenInput && (
          <div className="border-t border-zinc-800 bg-zinc-900">
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-white">X API Bearer Token を入力すると実データで分析できます</p>
                  <p className="text-xs text-zinc-400">
                    取得方法: <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">developer.twitter.com</a> → アプリ作成 → Keys and Tokens → Bearer Token
                    <span className="ml-2 text-zinc-500">（無料プランで取得可）</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={bearerToken}
                      onChange={e => setBearerToken(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && applyToken()}
                      placeholder="AAAAAAAAAAAAAAAAAAAAAxxxxxxxx..."
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-sky-500 focus:outline-none"
                    />
                    <Button onClick={applyToken} disabled={tokenLoading || !bearerToken.trim()} size="sm">
                      {tokenLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "適用"}
                    </Button>
                    {savedToken && (
                      <Button onClick={removeToken} size="sm" variant="destructive">削除</Button>
                    )}
                  </div>
                  {tokenError && <p className="text-red-400 text-xs">{tokenError}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 space-y-5">
        {/* Status banner */}
        {isDemo && !savedToken && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-300">現在はデモデータを表示しています</p>
              <p className="text-amber-400/80 mt-0.5">
                右上の「APIキー設定」から Bearer Token を入力すると、<strong>@{twitterHandle}</strong> の実際のツイートデータで分析できます。
              </p>
            </div>
          </div>
        )}
        {data?.noImpressions && (
          <div className="flex items-start gap-3 rounded-xl bg-sky-500/10 border border-sky-500/20 p-3">
            <AlertCircle className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky-300">
              インプレッション数はXの仕様上、本人のOAuth認証が必要なため表示できません。いいね・RT・リプライ・エンゲージメント率は実データです。
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-sky-400" />
              <p className="text-sm text-zinc-400">
                {savedToken ? `@${twitterHandle} のデータを取得中...` : "読み込み中..."}
              </p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* User profile (real data) */}
            {data.user && (
              <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                {data.user.image && (
                  <img src={data.user.image} alt={data.user.name} className="h-12 w-12 rounded-full" />
                )}
                <div>
                  <p className="font-bold text-white">{data.user.name}</p>
                  <p className="text-sm text-zinc-400">@{data.user.username}</p>
                </div>
                <div className="ml-auto flex gap-6 text-center">
                  <div><p className="text-lg font-bold text-white">{formatNumber(data.user.followerCount)}</p><p className="text-xs text-zinc-500">フォロワー</p></div>
                  <div><p className="text-lg font-bold text-white">{formatNumber(data.user.followingCount ?? 0)}</p><p className="text-xs text-zinc-500">フォロー中</p></div>
                  <div><p className="text-lg font-bold text-white">{formatNumber(data.user.tweetCount ?? 0)}</p><p className="text-xs text-zinc-500">ツイート</p></div>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <KpiCard title="インプレッション" value={data.noImpressions ? "---" : formatNumber(data.summary.totalImpressions)} icon={Eye} color="blue" />
              <KpiCard title="総エンゲージメント" value={formatNumber(data.summary.totalEngagements)} icon={Heart} color="red" />
              <KpiCard title="エンゲージメント率" value={formatPercent(data.summary.avgEngagementRate)} icon={TrendingUp} color="purple" />
              <KpiCard title="フォロワー増減" value={`${data.summary.followerGrowth >= 0 ? "+" : ""}${formatNumber(data.summary.followerGrowth)}`} icon={Users} color="green" />
              <KpiCard title="最適投稿時間" value={`${data.summary.bestHour}時台`} icon={Clock} color="orange" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">
                  {data.noImpressions ? "エンゲージメント推移（いいね・RT・リプライ）" : "インプレッション推移"}
                </CardTitle></CardHeader>
                <CardContent><ImpressionsChart data={data.daily} /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">エンゲージメント詳細推移</CardTitle></CardHeader>
                <CardContent><EngagementChart data={data.daily} /></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-sky-400" />投稿時間帯ヒートマップ
                  </CardTitle>
                  <Badge variant="success">最適: {data.summary.bestHour}時台</Badge>
                </div>
              </CardHeader>
              <CardContent><HeatmapChart data={data.hourly} /></CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.followerTrend.length > 0 ? (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-violet-400" />フォロワー推移
                  </CardTitle></CardHeader>
                  <CardContent><FollowerChart data={data.followerTrend} /></CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader><CardTitle className="text-base text-zinc-400">フォロワー推移</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-zinc-500 py-8 text-center">データ同期を複数回実行すると表示されます</p></CardContent>
                </Card>
              )}
              <KeywordsCloud keywords={data.keywords} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TopTweetsList tweets={data.topTweets} />
              <TweetAnalyzer />
            </div>

            <div className="text-center pb-4">
              <Link href="/dashboard/tweets">
                <Button variant="outline" size="lg">
                  <BarChart2 className="mr-2 h-4 w-4" />全ツイートを分析する
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <p className="text-zinc-400">データがありません。</p>
            <Button onClick={() => fetchData()}>再読み込み</Button>
          </div>
        )}
      </div>
    </div>
  )
}
