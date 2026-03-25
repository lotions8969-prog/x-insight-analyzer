import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

  const [dbTweets, snapshots] = await Promise.all([
    prisma.tweet.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.followerSnapshot.findMany({
      where: { userId },
      orderBy: { recordedAt: "asc" },
      take: 90,
    }),
  ])

  const tweets: TweetAnalytics[] = dbTweets.map((t) => ({
    id: t.id,
    text: t.text,
    createdAt: t.createdAt,
    likeCount: t.likeCount,
    retweetCount: t.retweetCount,
    replyCount: t.replyCount,
    quoteCount: t.quoteCount,
    impressionCount: t.impressionCount,
    bookmarkCount: t.bookmarkCount,
    engagementRate: t.engagementRate,
    totalEngagements: t.likeCount + t.retweetCount + t.replyCount + t.quoteCount,
  }))

  const daily = computeDailyMetrics(tweets)
  const hourly = computeHourlyActivity(tweets)
  const keywords = extractKeywordMetrics(tweets)
  const bestHour = findBestPostingHour(hourly)

  const totalImpressions = tweets.reduce((s, t) => s + t.impressionCount, 0)
  const totalEngagements = tweets.reduce((s, t) => s + t.totalEngagements, 0)
  const avgEngagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0

  const followerGrowth = snapshots.length >= 2
    ? snapshots[snapshots.length - 1].followerCount - snapshots[0].followerCount
    : 0

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
    followerTrend: snapshots.map((s) => ({
      date: s.recordedAt.toISOString().split("T")[0],
      followerCount: s.followerCount,
      followingCount: s.followingCount,
      tweetCount: s.tweetCount,
    })),
    topTweets: tweets.slice(0, 10),
  })
}
