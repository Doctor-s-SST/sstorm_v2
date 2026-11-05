import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {

    const n8nResponse = await fetch(
      process.env.N8N_LISTAR_DOCUMENTOS_URL!,
      {
        headers: {
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
      }
    );

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      throw new Error(text);
    }

    const data = await n8nResponse.json();

    return NextResponse.json(data);

  } catch (err) {

    console.error("Erro listar documentos:", err);

    return NextResponse.json(
      { error: "Erro ao listar documentos" },
      { status: 500 }
    );

  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  const res = await fetch(process.env.N8N_DOCUMENTOS_DELETAR_URL!, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!
    },
    body: JSON.stringify({ id })
  })

  return new NextResponse(await res.text(), {
    status: res.status
  })
}