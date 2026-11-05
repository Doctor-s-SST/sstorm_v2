import { callN8n } from "@/lib/admsHelper";

export const runtime = "nodejs";

export async function POST() {
  return callN8n(
    process.env.N8N_ADMS_LISTAR_URL!,
    {}
  );
}