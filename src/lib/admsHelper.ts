import { NextResponse } from "next/server";

export async function callN8n(url: string, body: any) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Erro no n8n" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("Erro proxy n8n:", err);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}