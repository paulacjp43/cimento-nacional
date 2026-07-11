"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HardHat,
  FileText,
  Calendar,
  AlertTriangle,
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Profile } from "@/types/app";
import type { UserRole } from "@/types/database";
import { getInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"],
    exact: true,
  },
  {
    href: "/obras",
    label: "Obras",
    icon: <HardHat className="w-4 h-4" />,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"],
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: <FileText className="w-4 h-4" />,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"],
  },
  {
    href: "/calendario",
    label: "Calendário",
    icon: <Calendar className="w-4 h-4" />,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"],
  },
  {
    href: "/ocorrencias",
    label: "Ocorrências",
    icon: <AlertTriangle className="w-4 h-4" />,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"],
  },
  {
    href: "/usuarios",
    label: "Usuários",
    icon: <Users className="w-4 h-4" />,
    roles: ["superadmin", "company_admin"],
  },
  {
    href: "/empresa",
    label: "Empresa",
    icon: <Building2 className="w-4 h-4" />,
    roles: ["company_admin"],
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: <Settings className="w-4 h-4" />,
    roles: ["company_admin"],
  },
];

interface SidebarProps {
  profile: Profile;
  company: { id: string; name: string; logo_url: string | null } | null;
}

export function Sidebar({ profile, company }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(profile.role)
  );

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sessão encerrada com sucesso.");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar hidden lg:flex" aria-label="Navegação principal">
      {/* Logo / Empresa */}
      <div className="p-4 border-b" style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: "#1e40af", color: "white" }}
          >
            G
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              GESTOBRA
            </p>
            {company && (
              <p className="text-xs truncate" style={{ color: "#64748b" }}>
                {company.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" role="navigation">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: "#334155" }}>
          Menu
        </p>
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${isActive(item) ? "active" : ""}`}
            aria-current={isActive(item) ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {isActive(item) && (
              <ChevronRight className="w-3 h-3 opacity-50" aria-hidden="true" />
            )}
          </Link>
        ))}

        {/* Superadmin links */}
        {profile.role === "superadmin" && (
          <>
            <hr className="my-3" style={{ borderColor: "#1e293b" }} />
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: "#334155" }}>
              Plataforma
            </p>
            <Link
              href="/admin/empresas"
              className={`sidebar-nav-item ${pathname.startsWith("/admin") ? "active" : ""}`}
            >
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Gerenciar Empresas</span>
            </Link>
          </>
        )}
      </nav>

      {/* Perfil do usuário */}
      <div className="p-3 border-t" style={{ borderColor: "#1e293b" }}>
        <Link href="/perfil" className="sidebar-nav-item mb-1 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "#1e3a8a", color: "#93c5fd" }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(profile.full_name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: "#e2e8f0" }}>
              {profile.full_name}
            </p>
            <p className="text-xs truncate" style={{ color: "#64748b" }}>
              {profile.email}
            </p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          id="btn-logout"
          className="sidebar-nav-item w-full text-left mt-1"
          style={{ color: "#64748b" }}
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
