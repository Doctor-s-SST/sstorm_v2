import { callN8n } from "@/lib/admsHelper";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  return callN8n(
    process.env.N8N_ADMS_ATUALIZAR_URL!,
    body
  );
}