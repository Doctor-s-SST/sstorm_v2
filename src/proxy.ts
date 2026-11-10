import { NextRequest, NextResponse } from "next/server";

// Rotas de API acessíveis sem sessão.
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

// Valida a sessão na própria rota; evita uma segunda chamada ao n8n.
const SELF_VALIDATED_API_ROUTES = ["/api/auth/me"];

// Módulos em standby ou sem uso: telas voltam ao início e APIs respondem 404.
const STANDBY_ROUTES = ["/adms", "/assinador", "/emails_massa", "/atendimentos"];

function isStandby(pathname: string) {
  const path = pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
  return STANDBY_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

const SESSION_CHECK_TIMEOUT_MS = 10000;

// Retorna null quando não foi possível validar (n8n indisponível).
async function isSessionValid(token: string): Promise<boolean | null> {
  let res: Response;

  try {
    res = await fetch(process.env.N8N_AUTH_ME!, {
      headers: {
        "X-Session-Token": token,
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(SESSION_CHECK_TIMEOUT_MS),
    });
  } catch {
    return null;
  }

  if (res.status >= 500) return null;
  if (!res.ok) return false;

  // Sessão inválida também pode voltar como 200 com corpo vazio.
  try {
    const data = await res.json();
    const user = Array.isArray(data) ? data[0] : data;
    return Boolean(user?.id || user?.email);
  } catch {
    return false;
  }
}

async function protectApi(req: NextRequest, token: string | undefined) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_API_ROUTES.includes(pathname) ||
    SELF_VALIDATED_API_ROUTES.includes(pathname)
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const valid = await isSessionValid(token);

  if (valid === null) {
    return NextResponse.json(
      { error: "Não foi possível validar a sessão" },
      { status: 503 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register"];

  const isApi = pathname === "/api" || pathname.startsWith("/api/");

  if (isStandby(pathname)) {
    return isApi
      ? NextResponse.json({ error: "Módulo em standby" }, { status: 404 })
      : NextResponse.redirect(new URL("/", req.url));
  }

  if (isApi) {
    return protectApi(req, token);
  }

  if (pathname.startsWith("/email-assets")) {
    return NextResponse.next();
  }

  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
