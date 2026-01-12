import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.destinatarios || body.destinatarios.length === 0) {
      return NextResponse.json(
        { error: "Destinatários obrigatórios" },
        { status: 400 }
      );
    }

    const n8nResponse = await fetch(
      process.env.N8N_EMAIL_ACESSO_QUEST_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify(body),
      }
    );

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      throw new Error(text);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Erro envio email:", err);
    return NextResponse.json(
      { error: "Erro ao enviar e-mails" },
      { status: 500 }
    );
  }
}
