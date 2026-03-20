import { NextResponse } from "next/server";


export async function GET() {
  const res = await fetch(process.env.N8N_HEALI_LISTAR_EXECUTADO_URL!, {
    headers: {
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
    },
  });

  const data = await res.json();

  return NextResponse.json(data);
}