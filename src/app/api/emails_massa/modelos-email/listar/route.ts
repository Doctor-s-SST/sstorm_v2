import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const n8nResponse = await fetch(
      process.env.N8N_MODELOS_EMAIL_LISTAR_URL!,
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
      const errorText = await n8nResponse.text();
      return NextResponse.json(
        { error: "Erro ao listar modelos", details: errorText },
        { status: n8nResponse.status }
      );
    }

    const data = await n8nResponse.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro interno", details: error.message },
      { status: 500 }
    );
  }
}