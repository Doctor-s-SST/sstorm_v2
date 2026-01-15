import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { email } from "zod";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const session = cookie?.match(/session=([^;]+)/)?.[1];

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.current_password || !body.new_password) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // 🔐 hash apenas da NOVA senha
    const new_password_hash = await bcrypt.hash(
      body.new_password,
      10
    );

    const res = await fetch(
      process.env.N8N_UPDATE_PASSWORD_URL!,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session,
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify({
          email: body.email,
          current_password: body.current_password,
          new_password_hash,
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Erro ao redefinir senha" },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PASSWORD UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
