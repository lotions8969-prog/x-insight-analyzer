import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TrendingUp, BarChart2, Clock, Hash, Users, Zap } from "lucide-react"

export default async function HomePage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  const hasTwitter = !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET)

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-2xl shadow-sky-500/30">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">X-Insight Analyzer</h1>
            <p className="mt-2 text-lg text-zinc-400">あなたのXアカウントを徹底分析</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: BarChart2, title: "インプレッション分析", desc: "日別・時間帯別の詳細な推移グラフ", color: "text-sky-400" },
            { icon: Zap, title: "エンゲージメント率", desc: "いいね・RT・リプライを総合評価", color: "text-amber-400" },
            { icon: Clock, title: "最適投稿時間帯", desc: "反応率が高い時間をヒートマップで特定", color: "text-emerald-400" },
            { icon: Hash, title: "キーワード分析", desc: "バズりやすいワードを自動抽出", color: "text-violet-400" },
            { icon: Users, title: "フォロワー推移", desc: "増減トレンドを時系列で可視化", color: "text-pink-400" },
            { icon: TrendingUp, title: "ツイート深掘り", desc: "URLで個別ツイートを詳細分析", color: "text-orange-400" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
              <Icon className={`mb-2 h-5 w-5 ${color}`} />
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {/* デモログインボタン（常に表示） */}
          <form
            action={async () => {
              "use server"
              await signIn("demo", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 py-4 text-base font-bold text-white transition-colors hover:bg-sky-600 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <TrendingUp className="h-5 w-5" />
              今すぐ試す（デモ）
            </button>
          </form>

          {/* Xログイン（APIキー設定済みの場合のみ） */}
          {hasTwitter && (
            <form
              action={async () => {
                "use server"
                await signIn("twitter", { redirectTo: "/dashboard" })
              }}
            >
              <button
                type="submit"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Xアカウントでログイン
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
