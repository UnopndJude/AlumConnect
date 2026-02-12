import { NextResponse } from "next/server"
import { createServerClient } from "@/infrastructure/supabase/auth"

export async function POST() {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true, message: "로그아웃되었습니다." })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
