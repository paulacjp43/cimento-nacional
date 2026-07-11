"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HardHat, FileText, AlertTriangle, Calendar } from "lucide-react";
import type { UserRole } from "@/types/database";

interface MobileNavProps {
  role: UserRole;
}

const NAV = [
  {
    href: "/dashboard",
    label: "Início",
    icon: LayoutDashboard,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"] as UserRole[],
  },
  {
    href: "/obras",
    label: "Obras",
    icon: HardHat,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"] as UserRole[],
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: FileText,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"] as UserRole[],
  },
  {
    href: "/calendario",
    label: "Calendário",
    icon: Calendar,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"] as UserRole[],
  },
  {
    href: "/ocorrencias",
    label: "Ocorrências",
    icon: AlertTriangle,
    roles: ["superadmin", "company_admin", "project_manager", "civil_responsible", "electrical_responsible", "mechanical_responsible", "viewer"] as UserRole[],
  },
];

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const visibleItems = NAV.filter((item) => item.roles.includes(role));

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
      aria-label="Navegação mobile"
    >
      <div className="flex items-stretch" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {visibleItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 min-h-[56px] transition-colors"
              style={{
                color: isActive ? "var(--color-primary-700)" : "var(--color-text-muted)",
                background: isActive ? "var(--color-primary-50)" : "transparent",
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-tight text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
