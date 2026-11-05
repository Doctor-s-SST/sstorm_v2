import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Documento não informado" },
        { status: 400 }
      )
    }

    const n8nResponse = await fetch(
      `${process.env.N8N_DOCUMENTO_DETALHE_URL}?id=${id}`,
      {
        headers: {
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
      }
    )

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text()
      throw new Error(text)
    }

    const data = await n8nResponse.json()

    return NextResponse.json(data)

  } catch (err) {

    console.error("Erro detalhe documento:", err)

    return NextResponse.json(
      { error: "Erro ao buscar documento" },
      { status: 500 }
    )

  }
}