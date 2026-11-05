import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {

    const body = await req.json()

    const { nome, tipo, arquivo_base64 } = body

    if (!arquivo_base64) {
      return NextResponse.json(
        { error: "Arquivo obrigatório" },
        { status: 400 }
      )
    }

    const n8nResponse = await fetch(
      process.env.N8N_UPLOAD_DOCUMENTO_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify({
          nome,
          tipo,
          arquivo_base64
        })
      }
    )

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text()
      throw new Error(text)
    }

    const data = await n8nResponse.json()

    return NextResponse.json(data)

  } catch (err) {

    console.error("Erro upload documento:", err)

    return NextResponse.json(
      { error: "Erro ao enviar documento" },
      { status: 500 }
    )

  }
}