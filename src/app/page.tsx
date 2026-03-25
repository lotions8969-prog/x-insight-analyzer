"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { TrendingUp, BarChart2, Clock, Hash, Users, Zap, AtSign, ArrowRight, Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = handle.replace(/^@/, "").trim()
    if (!clean) { setError("X IDを入力してください"); return }
    setLoading(true)
    setError("")

    const res = await signIn("twitter-handle", {
      handle: clean,
      redirect: false,
    })

    if (res?.ok) {
      router.push("/dashboard")
    } else {
      setError("ログインに失敗しました。もう一度試してください。")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-10">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-2xl shadow-sky-500/30">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">X-Insight Analyzer</h1>
          <p className="text-zinc-400">XのIDを入力するだけで分析スタート</p>
        </div>

        {/* ID Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              placeholder="motohashi0731"
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 pl-12 pr-4 py-4 text-lg text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-500 py-4 text-base font-bold text-white hover:bg-sky-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
          >
            {loading
              ? <><Loader2 className="h-5 w-5 animate-spin" /> 分析中...</>
              : <><TrendingUp className="h-5 w-5" /> 分析を開始する <ArrowRight className="h-4 w-4" /></>
            }
          </button>
        </form>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BarChart2, title: "インプレッション", color: "text-sky-400" },
            { icon: Zap, title: "エンゲージメント率", color: "text-amber-400" },
            { icon: Clock, title: "最適投稿時間帯", color: "text-emerald-400" },
            { icon: Hash, title: "キーワード分析", color: "text-violet-400" },
            { icon: Users, title: "フォロワー推移", color: "text-pink-400" },
            { icon: TrendingUp, title: "ツイート深掘り", color: "text-orange-400" },
          ].map(({ icon: Icon, title, color }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
              <Icon className={`mx-auto mb-1.5 h-5 w-5 ${color}`} />
              <p className="text-xs font-medium text-zinc-300">{title}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
