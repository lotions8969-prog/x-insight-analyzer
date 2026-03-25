import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { tweetStore, followerStore } from "@/app/api/twitter/sync/route"
import {
  computeDailyMetrics,
  computeHourlyActivity,
  extractKeywordMetrics,
  findBestPostingHour,
} from "@/lib/analytics"
import type { TweetAnalytics } from "@/types"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") ?? "30d"

  const since = new Date()
  if (range === "7d") since.setDate(since.getDate() - 7)
  else if (range === "30d") since.setDate(since.getDate() - 30)
  else if (range === "90d") since.setDate(since.getDate() - 90)
  else since.setFullYear(2000)

  const stored = (tweetStore.get(userId) ?? []) as TweetAnalytics[]
  const tweets = stored.filter((t) => new Date(t.createdAt) >= since)

  if (tweets.length === 0) {
    return NextResponse.json({ error: "No data. Please sync first." }, { status: 404 })
  }

  const daily = computeDailyMetrics(tweets)
  const hourly = computeHourlyActivity(tweets)
  const keywords = extractKeywordMetrics(tweets)
  const bestHour = findBestPostingHour(hourly)

  const totalImpressions = tweets.reduce((s, t) => s + t.impressionCount, 0)
  const totalEngagements = tweets.reduce((s, t) => s + t.totalEngagements, 0)
  const avgEngagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0

  const snapshots = (followerStore.get(userId) ?? []) as { date: string; followerCount: number; followingCount: number; tweetCount: number }[]
  const followerGrowth = snapshots.length >= 2
    ? snapshots[snapshots.length - 1].followerCount - snapshots[0].followerCount
    : 0

  const topTweets = [...tweets]
    .sort((a, b) => b.impressionCount - a.impressionCount)
    .slice(0, 10)

  return NextResponse.json({
    summary: {
      totalTweets: tweets.length,
      totalImpressions,
      totalEngagements,
      avgEngagementRate,
      bestHour,
      topKeywords: keywords.slice(0, 10),
      followerGrowth,
    },
    daily,
    hourly,
    keywords,
    followerTrend: snapshots,
    topTweets,
  })
}
