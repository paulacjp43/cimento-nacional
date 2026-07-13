import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";

const allowedNextRoutes = ["/definir-senha", "/redefinir-senha"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // O token_hash é utilizado em links mágicos (Implicit Flow) caso o PKCE não engate
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  
  const next = searchParams.get("next") ?? "/dashboard";

  // Previne open redirect vulnerabilities
  const redirectPath = allowedNextRoutes.includes(next) ? next : "/dashboard";
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Executando no middleware pode lançar exceção
            }
          },
        },
      }
    );
    
    // Troca o auth code por uma sessão persistente nos cookies do SSR
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    } else {
      console.error("Erro ao trocar código por sessão no callback:", error);
    }
  }

  // Se usar flow implicito com token_hash (ex: magic link) em vez de PKCE code
  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    } else {
      console.error("Erro ao verificar token_hash no callback:", error);
    }
  }

  // Se nada funcionou ou deu erro, vai pro login
  const url = new URL("/login", request.url);
  url.searchParams.set("error", "Link inválido ou expirado.");
  return NextResponse.redirect(url);
}
