import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-zinc-400">認証エラーが発生しました</p>
        <Link href="/" className="text-sky-400 underline text-sm">
          トップに戻る
        </Link>
      </div>
    </div>
  )
}
