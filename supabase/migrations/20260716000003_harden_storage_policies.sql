-- Migration 3: Hardening de Políticas do Storage (Estrutura company_id/project_id/...)

-- Remover as políticas criadas na Fase 1 para substituir pela nova padronização
DROP POLICY IF EXISTS "Users can view project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete project files" ON storage.objects;

-- SELECT: Apenas se o usuário pertencer à mesma empresa (company_id no path)
CREATE POLICY "Users can view files of their company" ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = (public.get_my_company_id())::text AND
    (
        -- Se for project-assets ou documents ou rdo, valida se tem acesso ao projeto
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id::text = (storage.foldername(name))[2]
            AND p.company_id = public.get_my_company_id()
            AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
            AND p.deleted_at IS NULL
        )
        OR 
        -- Se for logo da empresa, admin pode ver
        (
            (storage.foldername(name))[2] = 'company-assets' 
            AND public.get_my_role() IN ('company_admin', 'superadmin')
        )
    )
);

-- INSERT: Depende do tipo de arquivo
CREATE POLICY "Users can insert files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = (public.get_my_company_id())::text AND
    (
        -- Se for documento de obra: admin ou gerente
        (
            (storage.foldername(name))[3] = 'documents' AND
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id::text = (storage.foldername(name))[2]
                AND p.company_id = public.get_my_company_id()
                AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
            )
        )
        OR
        -- Se for anexo de RDO: valida RDO editável e permissão no setor
        (
            -- foldername[3] = report_id, foldername[4] = sector
            public.can_edit_report_sector((storage.foldername(name))[3]::uuid, (storage.foldername(name))[4]::sector_type)
            AND public.is_report_editable((storage.foldername(name))[3]::uuid, (storage.foldername(name))[4]::sector_type)
        )
    )
);

-- UPDATE:
CREATE POLICY "Users can update files" ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = (public.get_my_company_id())::text AND
    (
        (
            (storage.foldername(name))[3] = 'documents' AND
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id::text = (storage.foldername(name))[2]
                AND p.company_id = public.get_my_company_id()
                AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
            )
        )
        OR
        (
            public.can_edit_report_sector((storage.foldername(name))[3]::uuid, (storage.foldername(name))[4]::sector_type)
            AND public.is_report_editable((storage.foldername(name))[3]::uuid, (storage.foldername(name))[4]::sector_type)
        )
    )
);

-- DELETE: Não permitir exclusão livre no Storage (apenas por admin ou no RDO)
CREATE POLICY "Users can delete files" ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = (public.get_my_company_id())::text AND
    (
        (
            (storage.foldername(name))[3] = 'documents' AND
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE p.id::text = (storage.foldername(name))[2]
                AND p.company_id = public.get_my_company_id()
                AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
            )
        )
        OR
        (
            public.can_edit_report_sector((storage.foldername(name))[3]::uuid, (storage.foldername(name))[4]::sector_type)
            AND public.is_report_editable((storage.foldername(name))[3]::uuid, (storage.foldername(name))[4]::sector_type)
        )
    )
);
