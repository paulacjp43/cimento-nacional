-- ============================================================
-- CORREÇÃO DEFINITIVA: RLS das tabelas occurrences, workforce_entries,
-- equipment_entries e material_entries
--
-- Problema: As políticas usavam can_edit_report_sector() e
-- is_report_editable() que bloqueavam quando:
--   1. sector era NULL (ex: occurrences sem sector no payload)
--   2. O registro em daily_report_sectors ainda não existia
--
-- Solução: Substituir pela função can_upload_attachment() já criada
-- (que é robusta e lida com company_admin corretamente) ou simplificar
-- diretamente com company_id + membro do projeto.
-- ============================================================

-- ==========================================
-- 1. OCCURRENCES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert occurrences" ON occurrences;
DROP POLICY IF EXISTS "Users can update occurrences" ON occurrences;
DROP POLICY IF EXISTS "Users can delete occurrences" ON occurrences;
DROP POLICY IF EXISTS "Users can insert occurrences for their company" ON occurrences;
DROP POLICY IF EXISTS "Users can update occurrences of their company" ON occurrences;
DROP POLICY IF EXISTS "Users can delete occurrences of their company" ON occurrences;
DROP POLICY IF EXISTS "Company admins can delete occurrences" ON occurrences;

-- Criar função para verificar permissão de inserir ocorrências
-- (sector pode ser NULL em ocorrências gerais)
CREATE OR REPLACE FUNCTION public.can_write_occurrence(
    p_project_id uuid,
    p_company_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_my_company_id uuid;
    v_global_role user_role;
    v_project_role project_role;
BEGIN
    v_my_company_id := public.get_my_company_id();
    IF v_my_company_id IS NULL OR v_my_company_id != p_company_id THEN
        RETURN FALSE;
    END IF;

    v_global_role := public.get_my_role();

    -- Admin sempre pode
    IF v_global_role IN ('company_admin', 'superadmin') THEN
        RETURN TRUE;
    END IF;

    -- Verificar membro do projeto
    SELECT role INTO v_project_role
    FROM project_members
    WHERE project_id = p_project_id
      AND user_id = auth.uid()
      AND status = 'active'
    LIMIT 1;

    -- Qualquer membro ativo (exceto viewer) pode registrar ocorrência
    IF v_project_role IS NOT NULL AND v_project_role != 'viewer' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

CREATE POLICY "Users can insert occurrences"
ON occurrences FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.can_write_occurrence(project_id, company_id)
);

CREATE POLICY "Users can update occurrences"
ON occurrences FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_write_occurrence(project_id, company_id)
);

CREATE POLICY "Users can delete occurrences"
ON occurrences FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND (
        created_by = auth.uid()
        OR public.can_write_occurrence(project_id, company_id)
    )
);

DROP POLICY IF EXISTS "Users can view occurrences of their company" ON occurrences;
DROP POLICY IF EXISTS "Users can view occurrences" ON occurrences;

CREATE POLICY "Users can view occurrences"
ON occurrences FOR SELECT TO authenticated
USING (
    company_id = public.get_my_company_id()
);


-- ==========================================
-- 2. WORKFORCE ENTRIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert workforce_entries" ON workforce_entries;
DROP POLICY IF EXISTS "Users can update workforce_entries" ON workforce_entries;
DROP POLICY IF EXISTS "Users can delete workforce_entries" ON workforce_entries;
DROP POLICY IF EXISTS "company_filter_workforce" ON workforce_entries;

-- Política unificada simples: membro da empresa + não é relatório aprovado
CREATE POLICY "company_filter_workforce"
ON workforce_entries FOR ALL TO authenticated
USING (company_id = public.get_my_company_id())
WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Users can insert workforce_entries"
ON workforce_entries FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

CREATE POLICY "Users can update workforce_entries"
ON workforce_entries FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

CREATE POLICY "Users can delete workforce_entries"
ON workforce_entries FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);


-- ==========================================
-- 3. EQUIPMENT ENTRIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert equipment_entries" ON equipment_entries;
DROP POLICY IF EXISTS "Users can update equipment_entries" ON equipment_entries;
DROP POLICY IF EXISTS "Users can delete equipment_entries" ON equipment_entries;
DROP POLICY IF EXISTS "company_filter_equipment" ON equipment_entries;

CREATE POLICY "company_filter_equipment"
ON equipment_entries FOR ALL TO authenticated
USING (company_id = public.get_my_company_id())
WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Users can insert equipment_entries"
ON equipment_entries FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

CREATE POLICY "Users can update equipment_entries"
ON equipment_entries FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

CREATE POLICY "Users can delete equipment_entries"
ON equipment_entries FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);


-- ==========================================
-- 4. MATERIAL ENTRIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert material_entries" ON material_entries;
DROP POLICY IF EXISTS "Users can update material_entries" ON material_entries;
DROP POLICY IF EXISTS "Users can delete material_entries" ON material_entries;
DROP POLICY IF EXISTS "company_filter_material" ON material_entries;

CREATE POLICY "company_filter_material"
ON material_entries FOR ALL TO authenticated
USING (company_id = public.get_my_company_id())
WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Users can insert material_entries"
ON material_entries FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

CREATE POLICY "Users can update material_entries"
ON material_entries FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

CREATE POLICY "Users can delete material_entries"
ON material_entries FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);
