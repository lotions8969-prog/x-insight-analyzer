import { NextRequest, NextResponse } from "next/server"
import {
  generateMockTweets,
  generateMockFollowerTrend,
  MOCK_USER,
} from "@/lib/mock-data"
import {
  computeDailyMetrics,
  computeHourlyActivity,
  extractKeywordMetrics,
  findBestPostingHour,
} from "@/lib/analytics"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") ?? "30d"

  const allTweets = generateMockTweets(80)
  const since = new Date()
  if (range === "7d") since.setDate(since.getDate() - 7)
  else if (range === "30d") since.setDate(since.getDate() - 30)
  else if (range === "90d") since.setDate(since.getDate() - 90)
  else since.setFullYear(2000)

  const tweets = allTweets.filter((t) => t.createdAt >= since)
  const daily = computeDailyMetrics(tweets)
  const hourly = computeHourlyActivity(tweets)
  const keywords = extractKeywordMetrics(tweets)
  const bestHour = findBestPostingHour(hourly)

  const totalImpressions = tweets.reduce((s, t) => s + t.impressionCount, 0)
  const totalEngagements = tweets.reduce((s, t) => s + t.totalEngagements, 0)
  const avgEngagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0

  const followerDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 90
  const followerTrend = generateMockFollowerTrend(followerDays)
  const followerGrowth = followerTrend.length >= 2
    ? followerTrend[followerTrend.length - 1].followerCount - followerTrend[0].followerCount
    : 0

  const topTweets = [...tweets]
    .sort((a, b) => b.impressionCount - a.impressionCount)
    .slice(0, 10)

  return NextResponse.json({
    isDemo: true,
    user: MOCK_USER,
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
    followerTrend,
    topTweets,
    allTweets: tweets,
  })
}
