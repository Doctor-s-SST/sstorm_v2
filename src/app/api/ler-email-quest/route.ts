import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { dataInicio, dataFim } = body;

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        { error: "Data de início e fim são obrigatórias" },
        { status: 400 }
      );
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 180000); // 3 minutos

    const n8nResponse = await fetch(process.env.N8N_LER_EMAILS_QUEST_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify({
        dataInicio,
        dataFim,
        signal: controller.signal,
      }),
    });

    clearTimeout(timeout);

    const responseText = await n8nResponse.text();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responseJson: any;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { message: responseText };
    }

    if (!n8nResponse.ok) {
      return NextResponse.json(responseJson, { status: n8nResponse.status });
    }

    return NextResponse.json(responseJson);
  } catch (err) {
    console.error("Erro ao ler emails:", err);
    return NextResponse.json({ error: "Erro ao ler e-mails" }, { status: 500 });
  }
}
