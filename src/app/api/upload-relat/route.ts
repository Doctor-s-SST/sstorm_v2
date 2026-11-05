import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(process.env.N8N_IMPORTAR_RELAT_COND_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
    });

  } catch (err: any) {
    console.error("🔥 ERRO:", err);

    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}