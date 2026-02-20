import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID não informado" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${process.env.N8N_CERTIFICADOS_DOWNLOAD_URL}?id=${id}`,
            {
                method: "GET",
                headers: {
                    "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
                },
            }
        );

        // Se ainda estiver processando
        if (response.status === 202) {
            const data = await response.json();
            return NextResponse.json(data, { status: 202 });
        }

        // Se erro no n8n
        if (!response.ok) {
            return NextResponse.json(
                { error: "Erro ao baixar certificados" },
                { status: response.status }
            );
        }

        // Se retornou arquivo
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="certificados.zip"';

        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": contentDisposition,
            },
        });

    } catch (err) {

        console.error("Erro proxy download certificados:", err);

        return NextResponse.json(
            { error: "Erro interno" },
            { status: 500 }
        );
    }
}