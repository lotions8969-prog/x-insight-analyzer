import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TwitterClient } from "@/lib/twitter-client"
import { extractTweetId } from "@/lib/twitter-client"
import { calcEngagementRate } from "@/lib/analytics"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const urlOrId = searchParams.get("url") ?? ""

  const tweetId = extractTweetId(urlOrId) ?? urlOrId.replace(/\D/g, "")
  if (!tweetId) {
    return NextResponse.json({ error: "Invalid tweet URL or ID" }, { status: 400 })
  }

  // Check local DB first
  const cached = await prisma.tweet.findUnique({ where: { id: tweetId } })

  if (cached) {
    return NextResponse.json({ tweet: cached, fromCache: true })
  }

  // Fetch from API
  const account = await prisma.account.findFirst({
    where: { userId, provider: "twitter" },
  })
  if (!account?.access_token) {
    return NextResponse.json({ error: "Twitter account not connected" }, { status: 400 })
  }

  const client = new TwitterClient({ accessToken: account.access_token })

  try {
    const res = await client.getTweetById(tweetId)
    const tweet = res.data
    const m = tweet.public_metrics
    const engagementRate = calcEngagementRate(
      m.impression_count,
      m.like_count,
      m.retweet_count,
      m.reply_count,
      m.quote_count
    )

    return NextResponse.json({
      tweet: {
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        likeCount: m.like_count,
        retweetCount: m.retweet_count,
        replyCount: m.reply_count,
        quoteCount: m.quote_count,
        impressionCount: m.impression_count,
        bookmarkCount: m.bookmark_count,
        engagementRate,
      },
      fromCache: false,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch tweet" },
      { status: 500 }
    )
  }
}
