import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie")
  const session = cookie?.match(/session=([^;]+)/)?.[1]

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const res = await fetch(process.env.N8N_UPDATE_USER_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session,
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      { error: text || "Erro ao atualizar usuário" },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json({ user: data })
}
