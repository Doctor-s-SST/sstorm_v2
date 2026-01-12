import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { dataInicio, dataFim } = body

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { error: "Data de início e fim são obrigatórias" },
        { status: 400 }
      )
    }

    const n8nResponse = await fetch(
      process.env.N8N_LER_EMAILS_QUEST_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify({
          dataInicio,
          dataFim,
        }),
      }
    )

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text()
      throw new Error(text)
    }

    const data = await n8nResponse.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error("Erro ao ler emails:", err)
    return NextResponse.json(
      { error: "Erro ao ler e-mails" },
      { status: 500 }
    )
  }
}
