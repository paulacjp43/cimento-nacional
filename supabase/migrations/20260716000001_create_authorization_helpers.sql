-- Migration 1: Criar funções de autorização (Helpers Seguros)
-- Adiciona SET search_path = public para evitar elevação de privilégios em funções SECURITY DEFINER

-- Atualizando as funções existentes para usar search_path explícito
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid() AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.get_project_role(p_project_id uuid)
RETURNS project_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM project_members
  WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Novas funções para validação de acesso ao RDO e Setores

CREATE OR REPLACE FUNCTION public.can_view_project(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = p_project_id
      AND p.company_id = public.get_my_company_id()
      AND p.deleted_at IS NULL
      AND (
          public.get_my_role() IN ('company_admin', 'superadmin') 
          OR public.is_project_member(p.id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_report_sector(p_report_id uuid, p_sector sector_type)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
  v_company_id uuid;
  v_role project_role;
  v_member_sector sector_type;
  v_global_role user_role;
BEGIN
  -- Obter informações do relatório
  SELECT project_id, company_id INTO v_project_id, v_company_id
  FROM daily_reports WHERE id = p_report_id AND deleted_at IS NULL;

  IF NOT FOUND OR v_company_id != public.get_my_company_id() THEN
    RETURN FALSE;
  END IF;

  v_global_role := public.get_my_role();

  -- Admin sempre pode editar
  IF v_global_role IN ('company_admin', 'superadmin') THEN
    RETURN TRUE;
  END IF;

  -- Checar papel do usuário no projeto
  SELECT role, sector INTO v_role, v_member_sector
  FROM project_members
  WHERE project_id = v_project_id AND user_id = auth.uid() AND status = 'active' LIMIT 1;

  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Gerente da obra pode editar qualquer setor
  IF v_role = 'manager' THEN
    RETURN TRUE;
  END IF;

  -- Responsáveis só podem editar seu respectivo setor
  IF v_role = 'civil' AND p_sector = 'civil' THEN RETURN TRUE; END IF;
  IF v_role = 'electrical' AND p_sector = 'eletrica' THEN RETURN TRUE; END IF;
  IF v_role = 'mechanical' AND p_sector = 'mecanica' THEN RETURN TRUE; END IF;
  IF v_role = 'safety' AND p_sector = 'safety' THEN RETURN TRUE; END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_edit_report_sector_by_id(p_sector_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_id uuid;
  v_sector sector_type;
BEGIN
  SELECT daily_report_id, sector INTO v_report_id, v_sector
  FROM daily_report_sectors WHERE id = p_sector_id;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN public.can_edit_report_sector(v_report_id, v_sector);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_report_editable(p_report_id uuid, p_sector sector_type)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM daily_report_sectors
    WHERE daily_report_id = p_report_id 
      AND sector = p_sector
      AND status IN ('draft', 'returned')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_report_editable_by_sector_id(p_sector_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM daily_report_sectors
    WHERE id = p_sector_id
      AND status IN ('draft', 'returned')
  );
$$;
