-- ============================================================
-- CRIAÇÃO DA TABELA DE CONTROLE TECNOLÓGICO (CONCRETO)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.concrete_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    daily_report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    molding_date DATE NOT NULL DEFAULT CURRENT_DATE,
    structural_element TEXT NOT NULL, -- e.g., Laje 1o Pavimento
    supplier TEXT, -- e.g., Polimix
    concrete_class TEXT, -- e.g., Fck 30 MPa
    slump INTEGER, -- e.g., 120 (mm)
    volume NUMERIC(10,2), -- e.g., 15.5 (m³)
    delivery_note TEXT, -- e.g., NF 12345 / Lacre 98765
    strength_7d NUMERIC(5,2), -- e.g., 22.5 (MPa)
    strength_28d NUMERIC(5,2), -- e.g., 32.1 (MPa)
    status TEXT NOT NULL DEFAULT 'Aguardando', -- Aguardando, Aprovado, Reprovado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.concrete_control ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS simplificadas por company_id (compatível com fix_emergencial_rls_simplificado.sql)
DROP POLICY IF EXISTS "concrete_control_select" ON public.concrete_control;
CREATE POLICY "concrete_control_select"
ON public.concrete_control FOR SELECT TO authenticated
USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "concrete_control_insert" ON public.concrete_control;
CREATE POLICY "concrete_control_insert"
ON public.concrete_control FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "concrete_control_update" ON public.concrete_control;
CREATE POLICY "concrete_control_update"
ON public.concrete_control FOR UPDATE TO authenticated
USING (company_id = public.get_my_company_id())
WITH CHECK (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "concrete_control_delete" ON public.concrete_control;
CREATE POLICY "concrete_control_delete"
ON public.concrete_control FOR DELETE TO authenticated
USING (company_id = public.get_my_company_id());
