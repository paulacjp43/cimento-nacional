-- Migration 2: Hardening de Políticas RLS do PostgreSQL (Tabelas do RDO)

-- ==========================================
-- 1. EQUIPMENT ENTRIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert equipment_entries for their company" ON equipment_entries;
DROP POLICY IF EXISTS "Users can update equipment_entries of their company" ON equipment_entries;
DROP POLICY IF EXISTS "Users can delete equipment_entries of their company" ON equipment_entries;

CREATE POLICY "Users can insert equipment_entries" ON equipment_entries FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can update equipment_entries" ON equipment_entries FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can delete equipment_entries" ON equipment_entries FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);


-- ==========================================
-- 2. MATERIAL ENTRIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert material_entries for their company" ON material_entries;
DROP POLICY IF EXISTS "Users can update material_entries of their company" ON material_entries;
DROP POLICY IF EXISTS "Users can delete material_entries of their company" ON material_entries;

CREATE POLICY "Users can insert material_entries" ON material_entries FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can update material_entries" ON material_entries FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can delete material_entries" ON material_entries FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);


-- ==========================================
-- 3. WORKFORCE ENTRIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert workforce_entries for their company" ON workforce_entries;
DROP POLICY IF EXISTS "Users can update workforce_entries of their company" ON workforce_entries;
DROP POLICY IF EXISTS "Users can delete workforce_entries of their company" ON workforce_entries;

CREATE POLICY "Users can insert workforce_entries" ON workforce_entries FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can update workforce_entries" ON workforce_entries FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can delete workforce_entries" ON workforce_entries FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);


-- ==========================================
-- 4. OCCURRENCES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert occurrences for their company" ON occurrences;
DROP POLICY IF EXISTS "Users can update occurrences of their company" ON occurrences;
DROP POLICY IF EXISTS "Users can delete occurrences of their company" ON occurrences;
-- Manter a policy de "Company admins can delete occurrences" que já existe para deleção lógica/física administrativa.

CREATE POLICY "Users can insert occurrences" ON occurrences FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can update occurrences" ON occurrences FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can delete occurrences" ON occurrences FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);


-- ==========================================
-- 5. ATTACHMENTS
-- ==========================================
DROP POLICY IF EXISTS "Users can insert attachments for their company" ON attachments;
DROP POLICY IF EXISTS "Users can update attachments of their company" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments of their company" ON attachments;

CREATE POLICY "Users can insert attachments" ON attachments FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can update attachments" ON attachments FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);

CREATE POLICY "Users can delete attachments" ON attachments FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector(daily_report_id, sector)
    AND public.is_report_editable(daily_report_id, sector)
);


-- ==========================================
-- 6. REPORT ACTIVITIES
-- ==========================================
DROP POLICY IF EXISTS "Users can insert report_activities for their company" ON report_activities;
DROP POLICY IF EXISTS "Users can update report_activities of their company" ON report_activities;
DROP POLICY IF EXISTS "Users can delete report_activities of their company" ON report_activities;

CREATE POLICY "Users can insert report_activities" ON report_activities FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector_by_id(daily_report_sector_id)
    AND public.is_report_editable_by_sector_id(daily_report_sector_id)
);

CREATE POLICY "Users can update report_activities" ON report_activities FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector_by_id(daily_report_sector_id)
    AND public.is_report_editable_by_sector_id(daily_report_sector_id)
);

CREATE POLICY "Users can delete report_activities" ON report_activities FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id() 
    AND public.can_edit_report_sector_by_id(daily_report_sector_id)
    AND public.is_report_editable_by_sector_id(daily_report_sector_id)
);
