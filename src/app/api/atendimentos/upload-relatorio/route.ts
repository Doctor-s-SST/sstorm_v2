import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Envia para o n8n (certifique-se de que o n8n espera um Multipart Form Data)
    const resn8n = await fetch(process.env.N8N_ATENDIMENTO_DASHBOARD_URL!, {
      method: "POST",
      headers: {
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: formData, // Repassa o arquivo diretamente
    });

    if (!resn8n.ok) {
      throw new Error("Erro no processamento do n8n");
    }

    const data = await resn8n.json();

    // Retorna o JSON estruturado com analytics e pacientes
    return NextResponse.json(data);

  } catch (err) {
    console.error("Erro no processamento:", err);
    return NextResponse.json({ error: "Falha ao processar relatório" }, { status: 500 });
  }
}