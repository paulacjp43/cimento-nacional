-- PASSO 1: Rode SOMENTE ESTAS 5 LINHAS primeiro, e depois de dar "Success", apague elas e rode o Passo 2.
ALTER TYPE sector_type ADD VALUE IF NOT EXISTS 'safety';
ALTER TYPE project_role ADD VALUE IF NOT EXISTS 'safety';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'not_applicable';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'partial_approval';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'partial_returned';
