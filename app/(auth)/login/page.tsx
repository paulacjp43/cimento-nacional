"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    setAuthError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setIsLoading(false);
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid_credentials")
      ) {
        setAuthError("E-mail ou senha incorretos. Verifique suas credenciais.");
      } else if (error.message.includes("Email not confirmed")) {
        setAuthError(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada."
        );
      } else {
        setAuthError("Ocorreu um erro ao entrar. Tente novamente.");
      }
      return;
    }

    toast.success("Login realizado com sucesso!");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Bem-vindo de volta
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Entre com seu e-mail e senha para acessar o sistema.
        </p>
      </div>

      {/* Alerta de erro */}
      {authError && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6 text-sm"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
          }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* E-mail */}
        <div>
          <label htmlFor="email" className="label label-required">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com.br"
            className={`input ${errors.email ? "input-error" : ""}`}
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="field-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Senha */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="label label-required" style={{ marginBottom: 0 }}>
              Senha
            </label>
            <Link
              href="/esqueci-senha"
              className="text-sm font-medium"
              style={{ color: "var(--color-primary-700)" }}
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input pr-10 ${errors.password ? "input-error" : ""}`}
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="field-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Botão entrar */}
        <button
          type="submit"
          id="btn-login"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full mt-2"
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Entrar
            </>
          )}
        </button>
      </form>

      {/* Info adicional */}
      <p className="mt-8 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
        O acesso ao sistema é restrito a usuários cadastrados.
        <br />
        Entre em contato com o administrador da sua empresa.
      </p>
    </div>
  );
}
