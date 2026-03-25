// X (Twitter) API v2 Client

const TWITTER_API_BASE = "https://api.twitter.com/2"

interface TwitterApiOptions {
  accessToken: string
}

export class TwitterClient {
  private accessToken: string

  constructor({ accessToken }: TwitterApiOptions) {
    this.accessToken = accessToken
  }

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${TWITTER_API_BASE}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Twitter API error ${res.status}: ${error}`)
    }

    return res.json()
  }

  // Get authenticated user's profile
  async getMe() {
    return this.fetch<{ data: {
      id: string
      name: string
      username: string
      profile_image_url: string
      description: string
      public_metrics: {
        followers_count: number
        following_count: number
        tweet_count: number
        listed_count: number
      }
      created_at: string
    } }>("/users/me", {
      "user.fields": "id,name,username,profile_image_url,description,public_metrics,created_at",
    })
  }

  // Get user by ID
  async getUserById(userId: string) {
    return this.fetch<{ data: {
      id: string
      name: string
      username: string
      profile_image_url: string
      public_metrics: {
        followers_count: number
        following_count: number
        tweet_count: number
        listed_count: number
      }
    } }>(`/users/${userId}`, {
      "user.fields": "id,name,username,profile_image_url,public_metrics",
    })
  }

  // Get user's tweets with public metrics (requires OAuth 2.0 user context for own tweets)
  async getUserTweets(userId: string, maxResults = 100, paginationToken?: string) {
    const params: Record<string, string> = {
      max_results: String(Math.min(maxResults, 100)),
      "tweet.fields": "id,text,created_at,public_metrics,attachments",
      "media.fields": "type",
      expansions: "attachments.media_keys",
    }
    if (paginationToken) {
      params.pagination_token = paginationToken
    }

    return this.fetch<{
      data: Array<{
        id: string
        text: string
        created_at: string
        public_metrics: {
          like_count: number
          retweet_count: number
          reply_count: number
          quote_count: number
          impression_count: number
          bookmark_count: number
        }
        attachments?: { media_keys?: string[] }
      }>
      meta: {
        next_token?: string
        result_count: number
        newest_id: string
        oldest_id: string
      }
    }>(`/users/${userId}/tweets`, params)
  }

  // Get single tweet by ID
  async getTweetById(tweetId: string) {
    return this.fetch<{
      data: {
        id: string
        text: string
        created_at: string
        author_id: string
        public_metrics: {
          like_count: number
          retweet_count: number
          reply_count: number
          quote_count: number
          impression_count: number
          bookmark_count: number
        }
      }
    }>(`/tweets/${tweetId}`, {
      "tweet.fields": "id,text,created_at,author_id,public_metrics",
    })
  }
}

// Extract tweet ID from URL
export function extractTweetId(url: string): string | null {
  const patterns = [
    /twitter\.com\/\w+\/status\/(\d+)/,
    /x\.com\/\w+\/status\/(\d+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
