import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import type { Metadata } from "next";
import type { Profile } from "@/types/app";
import type { UserRole, UserStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "GESTOBRA",
};

interface RawProfileResult {
  id: string;
  company_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  companies: { id: string; name: string; logo_url: string | null } | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("id, company_id, full_name, email, phone, role, avatar_url, status, created_at, updated_at, deleted_at, companies(id, name, logo_url)")
    .eq("id", user.id)
    .single() as { data: RawProfileResult | null; error: unknown };

  if (!rawProfile) {
    redirect("/login");
  }

  const profile: Profile = {
    id: rawProfile.id,
    company_id: rawProfile.company_id,
    full_name: rawProfile.full_name,
    email: rawProfile.email,
    phone: rawProfile.phone,
    role: rawProfile.role as UserRole,
    avatar_url: rawProfile.avatar_url,
    status: rawProfile.status as UserStatus,
    created_at: rawProfile.created_at,
    updated_at: rawProfile.updated_at,
    deleted_at: rawProfile.deleted_at,
  };

  const company = rawProfile.companies ?? null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-surface-muted)" }}>
      <Sidebar profile={profile} company={company} />

      <div className="layout-authenticated flex-1 flex flex-col">
        <Header profile={profile} />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6" id="main-content">
          {children}
        </main>
      </div>

      <MobileNav role={profile.role} />
    </div>
  );
}
