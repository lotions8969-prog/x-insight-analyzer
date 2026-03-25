import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TrendingUp, BarChart2, Clock, Hash } from "lucide-react"

export default async function HomePage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/25">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">X-Insight Analyzer</h1>
          <p className="text-zinc-400">
            Xアカウントのインプレッション・エンゲージメントを詳細分析
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: BarChart2, title: "詳細分析", desc: "インプレッション・ER・いいね推移" },
            { icon: Clock, title: "最適時間帯", desc: "反応の良い投稿時間を特定" },
            { icon: Hash, title: "キーワード分析", desc: "反応率の高いワードを抽出" },
            { icon: TrendingUp, title: "フォロワー推移", desc: "増減トレンドを可視化" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <Icon className="mb-2 h-5 w-5 text-sky-400" />
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Sign in */}
        <form
          action={async () => {
            "use server"
            await signIn("twitter", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-500 py-3.5 text-base font-semibold text-white transition-colors hover:bg-sky-600 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xアカウントでログイン
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          X Developer Portalで取得したAPIキーが必要です
        </p>
      </div>
    </div>
  )
}
