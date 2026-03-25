import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TwitterClient } from "@/lib/twitter-client"
import { calcEngagementRate } from "@/lib/analytics"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Get stored access token from Account table
  const account = await prisma.account.findFirst({
    where: { userId, provider: "twitter" },
  })
  if (!account?.access_token) {
    return NextResponse.json({ error: "Twitter account not connected" }, { status: 400 })
  }

  const client = new TwitterClient({ accessToken: account.access_token })

  try {
    // Fetch user profile
    const meRes = await client.getMe()
    const twitterUser = meRes.data

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        twitterId: twitterUser.id,
        twitterHandle: twitterUser.username,
      },
    })

    // Save follower snapshot
    await prisma.followerSnapshot.create({
      data: {
        userId,
        followerCount: twitterUser.public_metrics.followers_count,
        followingCount: twitterUser.public_metrics.following_count,
        tweetCount: twitterUser.public_metrics.tweet_count,
      },
    })

    // Fetch tweets (up to 100 most recent)
    const tweetsRes = await client.getUserTweets(twitterUser.id, 100)
    const tweets = tweetsRes.data ?? []

    let synced = 0
    for (const tweet of tweets) {
      const m = tweet.public_metrics
      const engagementRate = calcEngagementRate(
        m.impression_count,
        m.like_count,
        m.retweet_count,
        m.reply_count,
        m.quote_count
      )

      await prisma.tweet.upsert({
        where: { id: tweet.id },
        update: {
          likeCount: m.like_count,
          retweetCount: m.retweet_count,
          replyCount: m.reply_count,
          quoteCount: m.quote_count,
          impressionCount: m.impression_count,
          bookmarkCount: m.bookmark_count,
          engagementRate,
          fetchedAt: new Date(),
        },
        create: {
          id: tweet.id,
          userId,
          text: tweet.text,
          createdAt: new Date(tweet.created_at),
          likeCount: m.like_count,
          retweetCount: m.retweet_count,
          replyCount: m.reply_count,
          quoteCount: m.quote_count,
          impressionCount: m.impression_count,
          bookmarkCount: m.bookmark_count,
          engagementRate,
          hasMedia: !!tweet.attachments?.media_keys?.length,
        },
      })
      synced++
    }

    return NextResponse.json({
      success: true,
      synced,
      followerCount: twitterUser.public_metrics.followers_count,
    })
  } catch (err) {
    console.error("Sync error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    )
  }
}
