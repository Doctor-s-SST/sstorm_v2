import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(process.env.N8N_DRIVE_RELAT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify({
        action: body.action,
        dataInicio: body.dataInicio || null,
        dataFim: body.dataFim || null,
        folderName: body.folderName || null,
        fileId: body.fileId || null,
      }),
    });

    // DOWNLOAD BINÁRIO
    if (body.action === "download") {
      const buffer = await response.arrayBuffer();

      return new Response(buffer, {
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") ||
            "application/zip",
          "Content-Disposition":
            response.headers.get("Content-Disposition") ||
            "attachment",
        },
      });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err) {
    console.error("Erro proxy Drive:", err);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
