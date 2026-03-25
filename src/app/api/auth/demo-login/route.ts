import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function POST() {
  try {
    await signIn("demo", { redirectTo: "/dashboard" })
  } catch (e) {
    // signIn throws a redirect, catch it
    const err = e as { digest?: string }
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
