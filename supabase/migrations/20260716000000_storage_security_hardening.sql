-- Supabase Storage Hardening para gestobra-files

-- 1. Remover políticas antigas e inseguras
DROP POLICY IF EXISTS "authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_view" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON storage.objects;

-- 2. Criar novas políticas baseadas em RLS de Projetos (Pastas: projects/{project_id}/*)

-- SELECT: Apenas se o usuário pertencer à mesma empresa do projeto referenciado no caminho
CREATE POLICY "Users can view project files" ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = 'projects' AND
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id::text = (storage.foldername(name))[2]
        AND p.company_id = public.get_my_company_id()
        AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
        AND p.deleted_at IS NULL
    )
);

-- INSERT: Apenas company_admin ou membros ativos do projeto podem fazer upload
CREATE POLICY "Users can insert project files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = 'projects' AND
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id::text = (storage.foldername(name))[2]
        AND p.company_id = public.get_my_company_id()
        AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
        AND p.deleted_at IS NULL
    )
);

-- UPDATE: Mesma regra do INSERT
CREATE POLICY "Users can update project files" ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = 'projects' AND
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id::text = (storage.foldername(name))[2]
        AND p.company_id = public.get_my_company_id()
        AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
        AND p.deleted_at IS NULL
    )
);

-- DELETE: Mesma regra
CREATE POLICY "Users can delete project files" ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'gestobra-files' AND
    (storage.foldername(name))[1] = 'projects' AND
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id::text = (storage.foldername(name))[2]
        AND p.company_id = public.get_my_company_id()
        AND (public.get_my_role() IN ('company_admin', 'superadmin') OR public.is_project_member(p.id))
        AND p.deleted_at IS NULL
    )
);
