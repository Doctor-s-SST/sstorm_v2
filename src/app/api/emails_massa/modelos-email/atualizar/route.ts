import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {

    const formData = await req.formData();

    const body = {
      id: formData.get("id"),
      nome: formData.get("nome"),
      assunto: formData.get("assunto"),
      html_template: formData.get("html_template"),
      variaveis_json: formData.get("variaveis_json"),
      ativo: formData.get("ativo"),
      departamento: formData.get("departamento"),
      copias: formData.get("copias"),
      anexos_existentes: formData.get("anexos_existentes"),
    };

    const files = formData.getAll("files");

    // novo formData para enviar ao n8n
    const n8nForm = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value) n8nForm.append(key, String(value));
    });

    files.forEach((file, index) => {
      n8nForm.append(`file_${index}`, file);
    });

    n8nForm.append("filesCount", String(files.length));

    const n8nResponse = await fetch(
      process.env.N8N_MODELOS_EMAIL_ATUALIZAR_URL!,
      {
        method: "POST",
        headers: {
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: n8nForm,
      }
    );

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      throw new Error(text);
    }

    return NextResponse.json({ status: "ok" });

  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao atualizar modelo de e-mail" },
      { status: 500 }
    );
  }
}