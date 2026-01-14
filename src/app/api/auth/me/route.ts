import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSession(req: Request) {
  const cookie = req.headers.get("cookie");
  return cookie?.match(/session=([^;]+)/)?.[1];
}

export async function GET(req: Request) {
  const session = getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(process.env.N8N_AUTH_ME!, {
    headers: {
      "X-Session-Token": session,
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const data = await res.json();
  const user = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(process.env.N8N_UPDATE_USER_URL!, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session,
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: text || "Erro ao atualizar usuário" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ user: data.user ?? data });
}
