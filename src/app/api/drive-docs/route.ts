import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(process.env.N8N_DRIVE_DOCS_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify(body),
    });

    // Se for download, repassa stream
    if (body.action === "download") {
      const blob = await response.arrayBuffer();

      return new Response(blob, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": response.headers.get(
            "Content-Disposition"
          ) || "attachment",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (err) {
    console.error("Erro proxy Drive:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
