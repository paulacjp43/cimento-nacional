-- Enable DELETE for admins on various tables

-- Projects
CREATE POLICY "Company admins can delete projects" 
ON projects FOR DELETE 
TO authenticated
USING (
  company_id IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);

-- Project Members
CREATE POLICY "Company admins can delete project members" 
ON project_members FOR DELETE 
TO authenticated
USING (
  company_id IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);

-- Daily Reports
CREATE POLICY "Company admins can delete daily reports" 
ON daily_reports FOR DELETE 
TO authenticated
USING (
  company_id IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);

-- Daily Report Sectors
CREATE POLICY "Company admins can delete daily report sectors" 
ON daily_report_sectors FOR DELETE 
TO authenticated
USING (
  company_id IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);

-- Report Activities
CREATE POLICY "Company admins can delete report activities" 
ON report_activities FOR DELETE 
TO authenticated
USING (
  company_id IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);

-- Occurrences
CREATE POLICY "Company admins can delete occurrences" 
ON occurrences FOR DELETE 
TO authenticated
USING (
  company_id IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);

-- Sector Communications
CREATE POLICY "Company admins can delete sector messages" 
ON sector_messages FOR DELETE 
TO authenticated
USING (
  (SELECT company_id FROM daily_reports WHERE id = sector_messages.daily_report_id) IN (SELECT get_my_company_id()) 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin', 'superadmin')
);
