import { signOut } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  await signOut({ redirectTo: "/" })
}
