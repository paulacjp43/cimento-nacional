-- ============================================================
-- CORREÇÃO: Política RLS da tabela "attachments"
-- Problema: Upload de fotos bloqueado com erro
--           "new row violates row-level security policy"
--
-- Causa: A política antiga exigia que o setor já existisse em
--        daily_report_sectors E que o usuário fosse responsável
--        por aquele setor. Isso bloqueava uploads válidos quando:
--        1. O setor ainda não foi formalmente criado no dia, ou
--        2. A função can_edit_report_sector retornava FALSE por
--           não encontrar o vínculo correto no project_members.
--
-- Solução: Substituir a política por uma versão mais permissiva
--          que valida:
--          a) O usuário pertence à mesma empresa (company_id)
--          b) O usuário é membro ativo do projeto vinculado ao relatório
--          c) O relatório não está aprovado (status != 'approved')
--          d) A permissão de setor é verificada: o responsável civil
--             só sobe foto no setor civil, etc. (Admins e gestores: qualquer setor)
-- ============================================================

-- 1. Remover políticas antigas de INSERT e UPDATE na tabela attachments
DROP POLICY IF EXISTS "Users can insert attachments" ON attachments;
DROP POLICY IF EXISTS "Users can update attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert attachments for their company" ON attachments;
DROP POLICY IF EXISTS "Users can update attachments of their company" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments of their company" ON attachments;

-- 2. Criar função auxiliar para verificar permissão de upload em attachment
--    (mais robusta que a anterior — não depende de daily_report_sectors existir)
CREATE OR REPLACE FUNCTION public.can_upload_attachment(
    p_report_id uuid,
    p_sector text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_project_id uuid;
    v_report_company_id uuid;
    v_report_status report_status;
    v_my_company_id uuid;
    v_global_role user_role;
    v_project_role project_role;
    v_member_sector sector_type;
BEGIN
    -- Obter dados do relatório
    SELECT project_id, company_id, status
    INTO v_project_id, v_report_company_id, v_report_status
    FROM daily_reports
    WHERE id = p_report_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Verificar se o usuário pertence à mesma empresa
    v_my_company_id := public.get_my_company_id();
    IF v_my_company_id IS NULL OR v_my_company_id != v_report_company_id THEN
        RETURN FALSE;
    END IF;

    -- Relatório aprovado: só admins podem fazer upload
    v_global_role := public.get_my_role();

    IF v_report_status = 'approved' THEN
        RETURN v_global_role IN ('company_admin', 'superadmin');
    END IF;

    -- Superadmin e admin da empresa: sempre podem
    IF v_global_role IN ('company_admin', 'superadmin') THEN
        RETURN TRUE;
    END IF;

    -- Verificar vínculo do usuário com o projeto
    SELECT role, sector
    INTO v_project_role, v_member_sector
    FROM project_members
    WHERE project_id = v_project_id
      AND user_id = auth.uid()
      AND status = 'active'
    LIMIT 1;

    IF v_project_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Gerente e visualizador com permissão: pode em qualquer setor
    IF v_project_role IN ('manager') THEN
        RETURN TRUE;
    END IF;

    -- Visualizador não pode fazer upload
    IF v_project_role = 'viewer' THEN
        RETURN FALSE;
    END IF;

    -- Responsáveis de setor: só podem no próprio setor
    IF v_project_role = 'civil'       AND p_sector = 'civil'      THEN RETURN TRUE; END IF;
    IF v_project_role = 'electrical'  AND p_sector = 'eletrica'   THEN RETURN TRUE; END IF;
    IF v_project_role = 'mechanical'  AND p_sector = 'mecanica'   THEN RETURN TRUE; END IF;
    IF v_project_role = 'safety'      AND p_sector = 'safety'     THEN RETURN TRUE; END IF;

    RETURN FALSE;
END;
$$;

-- 3. Criar nova política de INSERT — usa a função robusta acima
CREATE POLICY "Users can insert attachments"
ON attachments FOR INSERT TO authenticated
WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

-- 4. Criar nova política de UPDATE — mesma lógica
CREATE POLICY "Users can update attachments"
ON attachments FOR UPDATE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND public.can_upload_attachment(daily_report_id, sector::text)
);

-- 5. Criar nova política de DELETE — mesma lógica (só dono do registro ou admin)
CREATE POLICY "Users can delete attachments"
ON attachments FOR DELETE TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND (
        -- O próprio uploader pode deletar
        uploader_id = auth.uid()
        -- Admins e gestores também podem
        OR public.can_upload_attachment(daily_report_id, sector::text)
    )
);

-- 6. Garantir que a política de SELECT também existe e está correta
DROP POLICY IF EXISTS "Users can view attachments of their company" ON attachments;
DROP POLICY IF EXISTS "Users can view attachments" ON attachments;

CREATE POLICY "Users can view attachments"
ON attachments FOR SELECT TO authenticated
USING (
    company_id = public.get_my_company_id()
    AND EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id
          AND p.deleted_at IS NULL
          AND (
              public.get_my_role() IN ('company_admin', 'superadmin')
              OR public.is_project_member(p.id)
          )
    )
);
