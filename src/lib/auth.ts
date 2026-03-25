import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import Credentials from "next-auth/providers/credentials"

const providers = []

// Twitter OAuth (APIキーが設定されている場合のみ有効)
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    })
  )
}

// XのIDを入力してログイン（APIキー不要）
providers.push(
  Credentials({
    id: "twitter-handle",
    name: "Twitter Handle",
    credentials: {
      handle: { label: "X ID", type: "text" },
    },
    async authorize(credentials) {
      const raw = (credentials?.handle as string | undefined) ?? ""
      const handle = raw.replace(/^@/, "").trim()
      if (!handle) return null
      return {
        id: `handle:${handle}`,
        name: `@${handle}`,
        email: `${handle}@x-insight.local`,
        image: null,
        twitterHandle: handle,
      }
    },
  })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.twitterHandle = (user as { twitterHandle?: string }).twitterHandle ?? null
      }
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { twitterHandle?: string | null }).twitterHandle =
          token.twitterHandle as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
})
