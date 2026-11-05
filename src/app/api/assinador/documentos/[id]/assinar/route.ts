import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json().catch(() => ({}));

    const n8nResponse = await fetch(
      process.env.N8N_ASSINAR_DOCUMENTO_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify({
          documento_id: id,
          ...body
        }),
      }
    );

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      throw new Error(text);
    }

    const data = await n8nResponse.json();

    return NextResponse.json(data);

  } catch (err) {

    console.error("Erro assinar documento:", err);

    return NextResponse.json(
      { error: "Erro ao assinar documento" },
      { status: 500 }
    );

  }
}