-- RLS Policies for new RDO tables

-- 1. equipment_entries
ALTER TABLE equipment_entries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view equipment_entries of their company' AND tablename = 'equipment_entries') THEN
    CREATE POLICY "Users can view equipment_entries of their company" ON equipment_entries FOR SELECT USING (company_id IN (SELECT get_my_company_id()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert equipment_entries for their company' AND tablename = 'equipment_entries') THEN
    CREATE POLICY "Users can insert equipment_entries for their company" ON equipment_entries FOR INSERT WITH CHECK (company_id IN (SELECT get_my_company_id()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update equipment_entries of their company' AND tablename = 'equipment_entries') THEN
    CREATE POLICY "Users can update equipment_entries of their company" ON equipment_entries FOR UPDATE USING (company_id IN (SELECT get_my_company_id()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete equipment_entries of their company' AND tablename = 'equipment_entries') THEN
    CREATE POLICY "Users can delete equipment_entries of their company" ON equipment_entries FOR DELETE USING (company_id IN (SELECT get_my_company_id()));
  END IF;
END $$;


-- 2. material_entries
ALTER TABLE material_entries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view material_entries of their company' AND tablename = 'material_entries') THEN
    CREATE POLICY "Users can view material_entries of their company" ON material_entries FOR SELECT USING (company_id IN (SELECT get_my_company_id()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert material_entries for their company' AND tablename = 'material_entries') THEN
    CREATE POLICY "Users can insert material_entries for their company" ON material_entries FOR INSERT WITH CHECK (company_id IN (SELECT get_my_company_id()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update material_entries of their company' AND tablename = 'material_entries') THEN
    CREATE POLICY "Users can update material_entries of their company" ON material_entries FOR UPDATE USING (company_id IN (SELECT get_my_company_id()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete material_entries of their company' AND tablename = 'material_entries') THEN
    CREATE POLICY "Users can delete material_entries of their company" ON material_entries FOR DELETE USING (company_id IN (SELECT get_my_company_id()));
  END IF;
END $$;


-- 3. attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view attachments of their company' AND tablename = 'attachments') THEN
    CREATE POLICY "Users can view attachments of their company" ON attachments FOR SELECT USING (company_id IN (SELECT get_my_company_id()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert attachments for their company' AND tablename = 'attachments') THEN
    CREATE POLICY "Users can insert attachments for their company" ON attachments FOR INSERT WITH CHECK (company_id IN (SELECT get_my_company_id()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update attachments of their company' AND tablename = 'attachments') THEN
    CREATE POLICY "Users can update attachments of their company" ON attachments FOR UPDATE USING (company_id IN (SELECT get_my_company_id()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete attachments of their company' AND tablename = 'attachments') THEN
    CREATE POLICY "Users can delete attachments of their company" ON attachments FOR DELETE USING (company_id IN (SELECT get_my_company_id()));
  END IF;
END $$;


-- 4. Storage Bucket Policies (gestobra-files)
-- Gestobra-files is for project attachments, company avatars, etc.
-- Using auth.uid() directly or checking through tables if needed.

-- Give authenticated users access to read all files in their company folders?
-- For now, let's allow authenticated users to select/insert/delete if they are logged in.

CREATE POLICY "Allow authenticated users to read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'gestobra-files');
CREATE POLICY "Allow authenticated users to insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gestobra-files');
CREATE POLICY "Allow authenticated users to update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gestobra-files');
CREATE POLICY "Allow authenticated users to delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gestobra-files');

