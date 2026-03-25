import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { TwitterClient } from "@/lib/twitter-client"
import { calcEngagementRate } from "@/lib/analytics"

// In-memory store for synced tweets (JWT mode - no DB for user sessions)
const tweetStore = new Map<string, object[]>()
const followerStore = new Map<string, object[]>()

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = (session as { accessToken?: string }).accessToken
  if (!accessToken) {
    return NextResponse.json({ error: "Twitter access token not found. Please reconnect your account." }, { status: 400 })
  }

  const userId = session.user.id
  const client = new TwitterClient({ accessToken })

  try {
    const meRes = await client.getMe()
    const twitterUser = meRes.data

    // Store follower snapshot in memory
    const snapshots = followerStore.get(userId) ?? []
    snapshots.push({
      date: new Date().toISOString().split("T")[0],
      followerCount: twitterUser.public_metrics.followers_count,
      followingCount: twitterUser.public_metrics.following_count,
      tweetCount: twitterUser.public_metrics.tweet_count,
    })
    followerStore.set(userId, snapshots.slice(-90))

    const tweetsRes = await client.getUserTweets(twitterUser.id, 100)
    const rawTweets = tweetsRes.data ?? []

    const tweets = rawTweets.map((tweet) => {
      const m = tweet.public_metrics
      const engagementRate = calcEngagementRate(
        m.impression_count,
        m.like_count,
        m.retweet_count,
        m.reply_count,
        m.quote_count
      )
      return {
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
        totalEngagements: m.like_count + m.retweet_count + m.reply_count + m.quote_count,
        hasMedia: !!tweet.attachments?.media_keys?.length,
      }
    })

    tweetStore.set(userId, tweets)

    return NextResponse.json({
      success: true,
      synced: tweets.length,
      followerCount: twitterUser.public_metrics.followers_count,
      username: twitterUser.username,
    })
  } catch (err) {
    console.error("Sync error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    )
  }
}

export { tweetStore, followerStore }
