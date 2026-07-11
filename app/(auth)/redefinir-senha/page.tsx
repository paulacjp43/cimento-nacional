"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter ao menos um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch("password", "");

  const rules = [
    { label: "Mínimo 8 caracteres", ok: password.length >= 8 },
    { label: "Uma letra maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Um número", ok: /[0-9]/.test(password) },
  ];

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      setError("Não foi possível redefinir a senha. O link pode ter expirado.");
      return;
    }

    toast.success("Senha redefinida com sucesso! Faça login com a nova senha.");
    router.push("/login");
  }

  if (!hasSession) {
    return (
      <div className="fade-in text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "#fef2f2", color: "#991b1b" }}
        >
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Link inválido ou expirado
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Solicite um novo link de recuperação de senha.
        </p>
        <a href="/esqueci-senha" className="btn btn-primary w-full">
          Solicitar novo link
        </a>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "#eff6ff", color: "var(--color-primary-700)" }}
        >
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Redefinir senha
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Crie uma nova senha segura para sua conta.
        </p>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6 text-sm"
          style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Nova senha */}
        <div>
          <label htmlFor="password" className="label label-required">
            Nova senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`input pr-10 ${errors.password ? "input-error" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Regras de senha */}
          <div className="mt-2 space-y-1">
            {rules.map((rule) => (
              <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                <CheckCircle
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: rule.ok ? "#10b981" : "var(--color-text-muted)" }}
                />
                <span style={{ color: rule.ok ? "#059669" : "var(--color-text-muted)" }}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmar senha */}
        <div>
          <label htmlFor="confirmPassword" className="label label-required">
            Confirmar nova senha
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`input pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="field-error" role="alert">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          id="btn-reset-password"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar nova senha"
          )}
        </button>
      </form>
    </div>
  );
}
