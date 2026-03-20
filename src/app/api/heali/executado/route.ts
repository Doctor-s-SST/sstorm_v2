import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(process.env.N8N_HEALI_SALVAR_EXECUTADO_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Erro salvar executado:", err);

    return NextResponse.json(
      { error: "Erro ao salvar" },
      { status: 500 }
    );
  }
}
