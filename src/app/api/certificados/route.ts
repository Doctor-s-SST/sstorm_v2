import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {

    try {

        const body = await req.json();

        const response = await fetch(
            process.env.N8N_CERTIFICADO_URL!,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Erro ao gerar certificados" },
                { status: response.status }
            );
        }

        const blob = await response.arrayBuffer();

        return new NextResponse(blob, {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": "attachment; filename=certificados.zip",
            },
        });

    } catch (err) {

        console.error("Erro proxy certificados:", err);

        return NextResponse.json(
            { error: "Erro interno" },
            { status: 500 }
        );
    }
}
