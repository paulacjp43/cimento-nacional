"use client";

import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types/app";

interface HeaderProps {
  profile: Profile;
}

export function Header({ profile }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .is("read_at", null);
      setUnreadCount(count ?? 0);
    };
    fetchUnread();
  }, [profile.id]);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 h-14 border-b print:hidden"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Botão hamburguer mobile */}
      <button
        className="lg:hidden btn btn-ghost btn-icon"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        aria-label="Abrir menu"
        aria-expanded={mobileSidebarOpen}
      >
        {mobileSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Logo mobile */}
      <div className="lg:hidden flex items-center gap-2">
        <div
          className="w-7 h-7 rounded bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Logo Cimento Nacional"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-bold text-xs" style={{ color: "var(--color-text-primary)" }}>
          Cimento Nacional
        </span>
      </div>

      {/* Spacer para desktop */}
      <div className="hidden lg:block flex-1" />

      {/* Ações direita */}
      <div className="flex items-center gap-2">
        {/* Status de conexão */}
        {!isOnline && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "#fef2f2", color: "#991b1b" }}
            role="status"
            aria-live="polite"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" aria-hidden="true" />
            Sem conexão
          </div>
        )}

        {/* Notificações */}
        <Link
          href="/notificacoes"
          className="btn btn-ghost btn-icon relative"
          aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} não lidas` : ""}`}
          id="btn-notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] rounded-full text-[10px] font-bold flex items-center justify-center px-0.5"
              style={{ background: "#ef4444", color: "white" }}
              aria-hidden="true"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link href="/perfil" className="flex items-center gap-2 group" aria-label="Meu perfil">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#1e3a8a", color: "#93c5fd" }}
          >
            {getInitials(profile.full_name)}
          </div>
          <span
            className="hidden md:block text-sm font-medium max-w-[120px] truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {profile.full_name.split(" ")[0]}
          </span>
        </Link>
      </div>
    </header>
  );
}
