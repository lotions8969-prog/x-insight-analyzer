"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Eye, Heart, Repeat2, MessageCircle,
  Bookmark, TrendingUp, Search, ChevronUp, ChevronDown,
  RefreshCw
} from "lucide-react"
import { formatNumber, formatPercent } from "@/lib/analytics"
import type { TweetAnalytics } from "@/types"

type SortKey = "impressionCount" | "likeCount" | "retweetCount" | "engagementRate" | "createdAt"
type SortDir = "asc" | "desc"

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: "impressionCount", label: "インプレッション", icon: <Eye className="h-3.5 w-3.5" /> },
  { key: "likeCount", label: "いいね", icon: <Heart className="h-3.5 w-3.5" /> },
  { key: "retweetCount", label: "リポスト", icon: <Repeat2 className="h-3.5 w-3.5" /> },
  { key: "engagementRate", label: "ER", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: "createdAt", label: "日時", icon: null },
]

const PAGE_SIZE = 20

function erVariant(rate: number): "success" | "warning" | "danger" | "default" {
  if (rate >= 3) return "success"
  if (rate >= 1) return "warning"
  if (rate >= 0.1) return "default"
  return "danger"
}

export default function TweetsPage() {
  const [tweets, setTweets] = useState<TweetAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("impressionCount")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Try real data first, then demo
        let res = await fetch("/api/analytics/summary?range=all")
        if (!res.ok) throw new Error()
        const json = await res.json()
        setTweets(json.topTweets ?? [])
      } catch {
        try {
          const res = await fetch("/api/analytics/demo?range=all")
          const json = await res.json()
          setTweets(json.allTweets ?? [])
        } catch {
          setTweets([])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tweets.filter((t) => !q || t.text.toLowerCase().includes(q))
  }, [tweets, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = sortKey === "createdAt" ? new Date(a.createdAt).valueOf() : (a[sortKey] as number)
      const vb = sortKey === "createdAt" ? new Date(b.createdAt).valueOf() : (b[sortKey] as number)
      return sortDir === "desc" ? vb - va : va - vb
    })
  }, [filtered, sortKey, sortDir])

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
    setPage(1)
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
    ) : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              ダッシュボード
            </Button>
          </Link>
          <h1 className="text-base font-bold flex-1">ツイート一覧・分析</h1>
          <span className="text-sm text-zinc-400">{filtered.length}件</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 space-y-4">
        {/* Search + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="ツイートを検索..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleSort(opt.key)}
                className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortKey === opt.key
                    ? "border-sky-500 bg-sky-500/20 text-sky-300"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {opt.icon}
                {opt.label}
                <SortIcon k={opt.key} />
              </button>
            ))}
          </div>
        </div>

        {/* Tweet list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="h-7 w-7 animate-spin text-sky-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((tweet, i) => (
              <TweetRow
                key={tweet.id}
                tweet={tweet}
                rank={(page - 1) * PAGE_SIZE + i + 1}
              />
            ))}
            {paginated.length === 0 && (
              <div className="py-16 text-center text-zinc-500">
                {search ? "該当するツイートが見つかりません" : "ツイートがありません"}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              前へ
            </Button>
            <span className="text-sm text-zinc-400">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              次へ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function TweetRow({ tweet, rank }: { tweet: TweetAnalytics; rank: number }) {
  const date = new Date(tweet.createdAt)
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

  return (
    <Card className="hover:border-zinc-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Rank */}
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
            {rank}
          </span>
          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-100 leading-relaxed">{tweet.text}</p>
            {/* Metrics row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-sky-400">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-semibold">{formatNumber(tweet.impressionCount)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-pink-400" />
                {formatNumber(tweet.likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <Repeat2 className="h-3.5 w-3.5 text-emerald-400" />
                {formatNumber(tweet.retweetCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-amber-400" />
                {formatNumber(tweet.replyCount)}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5 text-violet-400" />
                {formatNumber(tweet.bookmarkCount)}
              </span>
              <Badge variant={erVariant(tweet.engagementRate)}>
                ER {formatPercent(tweet.engagementRate)}
              </Badge>
              <span className="ml-auto text-zinc-500">{dateStr}</span>
            </div>
            {/* Mini bar: engagement breakdown */}
            <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              {tweet.totalEngagements > 0 && (
                <>
                  <div className="bg-pink-500" style={{ width: `${(tweet.likeCount / tweet.totalEngagements) * 100}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${(tweet.retweetCount / tweet.totalEngagements) * 100}%` }} />
                  <div className="bg-amber-500" style={{ width: `${(tweet.replyCount / tweet.totalEngagements) * 100}%` }} />
                  <div className="bg-violet-500" style={{ width: `${(tweet.quoteCount / tweet.totalEngagements) * 100}%` }} />
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
