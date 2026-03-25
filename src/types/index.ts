// Twitter API v2 Types

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  description?: string
  public_metrics: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
  created_at?: string
  verified?: boolean
}

export interface TweetPublicMetrics {
  like_count: number
  retweet_count: number
  reply_count: number
  quote_count: number
  impression_count: number
  bookmark_count: number
}

export interface TwitterTweet {
  id: string
  text: string
  created_at: string
  public_metrics: TweetPublicMetrics
  attachments?: {
    media_keys?: string[]
  }
}

// Analytics Types

export interface TweetAnalytics {
  id: string
  text: string
  createdAt: Date
  likeCount: number
  retweetCount: number
  replyCount: number
  quoteCount: number
  impressionCount: number
  bookmarkCount: number
  engagementRate: number
  totalEngagements: number
}

export interface DailyMetrics {
  date: string
  impressions: number
  engagements: number
  likes: number
  retweets: number
  replies: number
  engagementRate: number
  tweetCount: number
}

export interface HourlyActivity {
  hour: number
  avgEngagementRate: number
  avgImpressions: number
  tweetCount: number
}

export interface KeywordMetrics {
  keyword: string
  count: number
  avgEngagementRate: number
  avgImpressions: number
}

export interface FollowerTrend {
  date: string
  followerCount: number
  followingCount: number
  tweetCount: number
}

export interface AnalyticsSummary {
  totalTweets: number
  totalImpressions: number
  totalEngagements: number
  avgEngagementRate: number
  bestHour: number
  topKeywords: KeywordMetrics[]
  followerGrowth: number
}

// UI Types

export interface DateRange {
  from: Date
  to: Date
}

export type TimeRange = '7d' | '30d' | '90d' | 'all'
