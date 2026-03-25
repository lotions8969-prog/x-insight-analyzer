import type { TweetAnalytics, DailyMetrics, HourlyActivity, KeywordMetrics } from "@/types"

// Calculate engagement rate
export function calcEngagementRate(
  impressions: number,
  likes: number,
  retweets: number,
  replies: number,
  quotes: number
): number {
  if (impressions === 0) return 0
  const totalEngagements = likes + retweets + replies + quotes
  return (totalEngagements / impressions) * 100
}

// Group tweets by day and compute daily metrics
export function computeDailyMetrics(tweets: TweetAnalytics[]): DailyMetrics[] {
  const map = new Map<string, {
    impressions: number
    engagements: number
    likes: number
    retweets: number
    replies: number
    tweetCount: number
  }>()

  for (const t of tweets) {
    const date = t.createdAt.toISOString().split("T")[0]
    const existing = map.get(date) ?? {
      impressions: 0,
      engagements: 0,
      likes: 0,
      retweets: 0,
      replies: 0,
      tweetCount: 0,
    }
    existing.impressions += t.impressionCount
    existing.engagements += t.totalEngagements
    existing.likes += t.likeCount
    existing.retweets += t.retweetCount
    existing.replies += t.replyCount
    existing.tweetCount += 1
    map.set(date, existing)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      ...v,
      engagementRate: v.impressions > 0 ? (v.engagements / v.impressions) * 100 : 0,
    }))
}

// Compute hourly activity patterns
export function computeHourlyActivity(tweets: TweetAnalytics[]): HourlyActivity[] {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    totalEngagementRate: 0,
    totalImpressions: 0,
    tweetCount: 0,
  }))

  for (const t of tweets) {
    const hour = t.createdAt.getHours()
    hours[hour].totalEngagementRate += t.engagementRate
    hours[hour].totalImpressions += t.impressionCount
    hours[hour].tweetCount += 1
  }

  return hours.map((h) => ({
    hour: h.hour,
    avgEngagementRate: h.tweetCount > 0 ? h.totalEngagementRate / h.tweetCount : 0,
    avgImpressions: h.tweetCount > 0 ? h.totalImpressions / h.tweetCount : 0,
    tweetCount: h.tweetCount,
  }))
}

// Extract keywords and compute their metrics
export function extractKeywordMetrics(tweets: TweetAnalytics[], topN = 20): KeywordMetrics[] {
  const STOP_WORDS = new Set([
    "the", "a", "an", "is", "it", "in", "on", "at", "to", "for",
    "of", "and", "or", "but", "with", "this", "that", "are", "was",
    "RT", "https", "http", "co", "t", "I", "you", "my", "me",
    "が", "の", "は", "を", "に", "と", "で", "も", "や", "な",
  ])

  const map = new Map<string, { count: number; totalEngagementRate: number; totalImpressions: number }>()

  for (const tweet of tweets) {
    const words = tweet.text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[@#]\S+/g, "")
      .split(/[\s　、。！？!?,.\n]+/)
      .map((w) => w.toLowerCase().trim())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

    const unique = new Set(words)
    for (const word of unique) {
      const existing = map.get(word) ?? { count: 0, totalEngagementRate: 0, totalImpressions: 0 }
      existing.count += 1
      existing.totalEngagementRate += tweet.engagementRate
      existing.totalImpressions += tweet.impressionCount
      map.set(word, existing)
    }
  }

  return Array.from(map.entries())
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].totalImpressions - a[1].totalImpressions)
    .slice(0, topN)
    .map(([keyword, v]) => ({
      keyword,
      count: v.count,
      avgEngagementRate: v.count > 0 ? v.totalEngagementRate / v.count : 0,
      avgImpressions: v.count > 0 ? v.totalImpressions / v.count : 0,
    }))
}

// Find best posting hour
export function findBestPostingHour(hourly: HourlyActivity[]): number {
  return hourly.reduce((best, h) =>
    h.avgEngagementRate > hourly[best].avgEngagementRate ? h.hour : best, 0
  )
}

// Format large numbers
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

// Format percentage
export function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`
}
