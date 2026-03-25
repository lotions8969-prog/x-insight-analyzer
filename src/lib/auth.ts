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

// デモログイン (APIキー不要・常に有効)
providers.push(
  Credentials({
    id: "demo",
    name: "Demo",
    credentials: {},
    async authorize() {
      return {
        id: "demo-user",
        name: "デモユーザー",
        email: "demo@x-insight.local",
        image: null,
        isDemo: true,
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
        token.isDemo = (user as { isDemo?: boolean }).isDemo ?? false
      }
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session as { isDemo?: boolean }).isDemo = token.isDemo as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
})
