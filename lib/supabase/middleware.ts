import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Rotas públicas — não requerem autenticação
const PUBLIC_ROUTES = [
  "/login",
  "/esqueci-senha",
  "/redefinir-senha",
  "/definir-senha",
  "/primeiro-acesso",
  "/convite",
  "/auth/callback",
];

// Rotas exclusivas do superadmin
const SUPERADMIN_ROUTES = ["/admin"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Permitir rotas públicas
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    // Se já está autenticado e tenta acessar login, redirecionar para dashboard
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Usuário não autenticado tentando acessar rota privada
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificar acesso a rotas de superadmin
  const isSuperadminRoute = SUPERADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isSuperadminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile ? (profile as { role: string }).role : null;

    if (role !== "superadmin") {
      return NextResponse.redirect(new URL("/acesso-negado", request.url));
    }
  }

  return supabaseResponse;
}
