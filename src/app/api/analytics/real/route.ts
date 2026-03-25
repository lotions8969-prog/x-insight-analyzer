import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { TwitterClient } from "@/lib/twitter-client"
import { calcEngagementRate, computeDailyMetrics, computeHourlyActivity, extractKeywordMetrics, findBestPostingHour } from "@/lib/analytics"
import type { TweetAnalytics } from "@/types"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const handle = searchParams.get("handle")
  const bearerToken = searchParams.get("token")
  const range = searchParams.get("range") ?? "30d"

  if (!handle || !bearerToken) {
    return NextResponse.json({ error: "handle and token required" }, { status: 400 })
  }

  const client = new TwitterClient({ accessToken: bearerToken })

  try {
    // ユーザー情報取得
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${handle}?user.fields=id,name,username,profile_image_url,public_metrics,description,created_at`,
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    )
    if (!userRes.ok) {
      const err = await userRes.json()
      return NextResponse.json({ error: err?.detail ?? "ユーザーが見つかりません" }, { status: 400 })
    }
    const userData = await userRes.json()
    const user = userData.data

    // ツイート取得（最大100件）
    const tweetsRes = await client.getUserTweets(user.id, 100)
    const rawTweets = tweetsRes.data ?? []

    // 期間フィルタ
    const since = new Date()
    if (range === "7d") since.setDate(since.getDate() - 7)
    else if (range === "30d") since.setDate(since.getDate() - 30)
    else if (range === "90d") since.setDate(since.getDate() - 90)
    else since.setFullYear(2000)

    const tweets: TweetAnalytics[] = rawTweets
      .filter(t => new Date(t.created_at) >= since)
      .map(tweet => {
        const m = tweet.public_metrics
        // インプレッションはBearer Tokenでは取得不可 → 0にする
        const impressions = m.impression_count ?? 0
        const engagementRate = calcEngagementRate(
          impressions || (m.like_count + m.retweet_count + m.reply_count + m.quote_count) * 20,
          m.like_count, m.retweet_count, m.reply_count, m.quote_count
        )
        return {
          id: tweet.id,
          text: tweet.text,
          createdAt: new Date(tweet.created_at),
          likeCount: m.like_count,
          retweetCount: m.retweet_count,
          replyCount: m.reply_count,
          quoteCount: m.quote_count,
          impressionCount: impressions,
          bookmarkCount: m.bookmark_count ?? 0,
          engagementRate,
          totalEngagements: m.like_count + m.retweet_count + m.reply_count + m.quote_count,
        }
      })

    const daily = computeDailyMetrics(tweets)
    const hourly = computeHourlyActivity(tweets)
    const keywords = extractKeywordMetrics(tweets)
    const bestHour = findBestPostingHour(hourly)

    const totalImpressions = tweets.reduce((s, t) => s + t.impressionCount, 0)
    const totalEngagements = tweets.reduce((s, t) => s + t.totalEngagements, 0)
    const avgEngagementRate = totalEngagements > 0
      ? tweets.reduce((s, t) => s + t.engagementRate, 0) / tweets.length
      : 0

    const topTweets = [...tweets].sort((a, b) => b.totalEngagements - a.totalEngagements).slice(0, 10)

    return NextResponse.json({
      isReal: true,
      noImpressions: totalImpressions === 0,
      user: {
        name: user.name,
        username: user.username,
        image: user.profile_image_url,
        followerCount: user.public_metrics.followers_count,
        followingCount: user.public_metrics.following_count,
        tweetCount: user.public_metrics.tweet_count,
      },
      summary: {
        totalTweets: tweets.length,
        totalImpressions,
        totalEngagements,
        avgEngagementRate,
        bestHour,
        topKeywords: keywords.slice(0, 10),
        followerGrowth: 0,
      },
      daily,
      hourly,
      keywords,
      followerTrend: [],
      topTweets,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "API error" },
      { status: 500 }
    )
  }
}
