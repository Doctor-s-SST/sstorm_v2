import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const n8nResponse = await fetch(
      process.env.N8N_MODELOS_EMAIL_DELETAR_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify({ id: body.id }),
      }
    );

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      console.error("Erro n8n:", text);
      throw new Error(text);
    }

    return NextResponse.json({ status: "ok" });

  } catch (err) {
    console.error("Erro ao deletar email:", err);

    return NextResponse.json(
      { error: "Erro ao deletar modelo de e-mail" },
      { status: 500 }
    );
  }
}