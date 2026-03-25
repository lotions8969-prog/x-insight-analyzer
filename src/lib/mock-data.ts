import type { TweetAnalytics, DailyMetrics, HourlyActivity, KeywordMetrics, FollowerTrend } from "@/types"
import { calcEngagementRate } from "./analytics"

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// Deterministic seed-based random (for consistent demo)
function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
}

const SAMPLE_TWEETS = [
  "Next.jsのApp Routerを使って爆速Webアプリを作った話。Server Componentsのキャッシュ戦略が最高すぎる。",
  "TypeScriptの型パズルに沼った一日。ConditionalTypesとinferを使いこなせると世界が変わる。",
  "Tailwind CSS v4がリリースされた！CSSネイティブ変数ベースに刷新されてビルドも爆速に。",
  "React 19の新機能まとめ。useOptimisticとuseActionStateがゲームチェンジャーすぎる件。",
  "朝活コーディング30日継続達成！毎朝6時から1時間のアルゴリズム演習が習慣になった。",
  "vercel v0でプロトタイプ作ったら10分でUI完成した。AIツールの進化が止まらない。",
  "shadcn/uiのcomponent設計が参考になりすぎる。Radix UIをラップしたcomponent設計のお手本。",
  "Prismaのrelation queryが強すぎる。N+1問題を意識せずに書けるのがやばい。",
  "PostgreSQLのJSON演算子を使いこなせば複雑なクエリも1行で書ける。",
  "個人開発のMRRが初めて1万円を超えた。小さくても継続することの大切さを実感。",
  "Claude APIのtool useを使ったエージェント実装してみた。思ったより簡単に動いた。",
  "Gitのworktreeを使うと複数ブランチの同時作業が捗りすぎる。もっと早く知りたかった。",
  "WebAssemblyでブラウザ上でFFmpegを動かした。動画変換がサーバーレスで完結する時代。",
  "RustでCLIツール作ってみた。cargo publishで配布まで一瞬で終わった。",
  "vim操作をマスターするとコーディングスピードが2倍になった気がする。",
  "Dockerのマルチステージビルドでイメージサイズを1/5に削減できた。",
  "GraphQLのDataLoaderパターンでN+1問題を完全に解決した話。",
  "Zod + React Hook Formの組み合わせが最強のフォームバリデーションだと思う。",
  "Turborepoでモノレポ構成にしたらCI/CDが劇的に速くなった。",
  "個人開発で月100万PVを達成するまでにやったSEO施策まとめ。",
]

export function generateMockTweets(count = 50): TweetAnalytics[] {
  const tweets: TweetAnalytics[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const daysAgo = seededRand(i * 7, 0, 89)
    const hoursAgo = seededRand(i * 3, 0, 23)
    const createdAt = new Date(now.getTime() - (daysAgo * 86400 + hoursAgo * 3600) * 1000)

    const impressions = seededRand(i * 11, 500, 50000)
    const likes = seededRand(i * 13, 0, Math.floor(impressions * 0.15))
    const retweets = seededRand(i * 17, 0, Math.floor(likes * 0.5))
    const replies = seededRand(i * 19, 0, Math.floor(likes * 0.3))
    const quotes = seededRand(i * 23, 0, Math.floor(retweets * 0.2))
    const bookmarks = seededRand(i * 29, 0, Math.floor(likes * 0.8))
    const engagementRate = calcEngagementRate(impressions, likes, retweets, replies, quotes)

    tweets.push({
      id: `demo_${i}`,
      text: SAMPLE_TWEETS[i % SAMPLE_TWEETS.length],
      createdAt,
      likeCount: likes,
      retweetCount: retweets,
      replyCount: replies,
      quoteCount: quotes,
      impressionCount: impressions,
      bookmarkCount: bookmarks,
      engagementRate,
      totalEngagements: likes + retweets + replies + quotes,
    })
  }

  return tweets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function generateMockFollowerTrend(days = 30): FollowerTrend[] {
  const trend: FollowerTrend[] = []
  const now = new Date()
  let followers = 1200

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400 * 1000)
    followers += seededRand(i * 31, -5, 25)
    trend.push({
      date: date.toISOString().split("T")[0],
      followerCount: Math.max(followers, 0),
      followingCount: 450,
      tweetCount: 800 + (days - i) * 2,
    })
  }

  return trend
}

export const MOCK_USER = {
  name: "デモユーザー",
  username: "demo_user",
  followerCount: 1342,
  followingCount: 450,
  tweetCount: 856,
  image: null,
}
