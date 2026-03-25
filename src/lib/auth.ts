import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

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

// デモログイン (APIキー不要)
providers.push(
  Credentials({
    id: "demo",
    name: "demo",
    credentials: {},
    async authorize() {
      // デモユーザーをDBに upsert
      const user = await prisma.user.upsert({
        where: { email: "demo@x-insight.local" },
        update: {},
        create: {
          email: "demo@x-insight.local",
          name: "デモユーザー",
          twitterHandle: "demo_user",
          image: null,
        },
      })
      return { id: user.id, name: user.name, email: user.email, image: user.image }
    },
  })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt", // Credentials は JWT が必要
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
})
