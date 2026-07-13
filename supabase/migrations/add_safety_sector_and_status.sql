-- 1. ADD NEW ENUM VALUES
-- PostgreSQL requires ADD VALUE to be executed one by one
ALTER TYPE sector_type ADD VALUE IF NOT EXISTS 'safety';
ALTER TYPE project_role ADD VALUE IF NOT EXISTS 'safety';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'not_applicable';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'partial_approval';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'partial_returned';

-- 2. ADD COLUMN FOR SAFETY METRICS
ALTER TABLE daily_report_sectors ADD COLUMN IF NOT EXISTS safety_metrics JSONB DEFAULT '{}'::jsonb;

-- 3. INITIALIZE SAFETY SECTOR FOR ALL EXISTING DAILY REPORTS
INSERT INTO daily_report_sectors (
    daily_report_id, 
    sector, 
    status, 
    company_id, 
    created_by, 
    created_at, 
    updated_at
)
SELECT 
    dr.id as daily_report_id, 
    'safety'::sector_type as sector,
    CASE 
        WHEN dr.status = 'approved' THEN 'not_applicable'::report_status
        ELSE 'draft'::report_status
    END as status,
    dr.company_id,
    dr.created_by,
    dr.created_at,
    NOW() as updated_at
FROM daily_reports dr
WHERE NOT EXISTS (
    SELECT 1 FROM daily_report_sectors drs 
    WHERE drs.daily_report_id = dr.id AND drs.sector = 'safety'
);

-- 4. CREATE FUNCTION TO CALCULATE CONSOLIDATED STATUS
CREATE OR REPLACE FUNCTION calculate_consolidated_status(p_report_id UUID) 
RETURNS report_status AS $$
DECLARE
    v_total INT;
    v_draft INT;
    v_submitted INT;
    v_approved INT;
    v_returned INT;
    v_not_applicable INT;
    v_cancelled INT;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'draft'),
        COUNT(*) FILTER (WHERE status = 'submitted'),
        COUNT(*) FILTER (WHERE status = 'approved'),
        COUNT(*) FILTER (WHERE status = 'returned'),
        COUNT(*) FILTER (WHERE status = 'not_applicable'),
        COUNT(*) FILTER (WHERE status = 'cancelled')
    INTO 
        v_total, v_draft, v_submitted, v_approved, v_returned, v_not_applicable, v_cancelled
    FROM daily_report_sectors
    WHERE daily_report_id = p_report_id;

    -- Rules:
    -- 1 & 2. Any draft -> draft (Em elaboração)
    IF v_draft > 0 THEN
        RETURN 'draft'::report_status;
    END IF;

    -- 5. Any returned -> partial_returned (Devolvido parcialmente)
    IF v_returned > 0 THEN
        RETURN 'partial_returned'::report_status;
    END IF;

    -- 8. All cancelled -> cancelled
    IF v_total > 0 AND v_cancelled = v_total THEN
        RETURN 'cancelled'::report_status;
    END IF;

    -- Total valid is Total minus cancelled minus not_applicable
    DECLARE
        v_valid_sectors INT := v_total - v_cancelled - v_not_applicable;
    BEGIN
        -- If all valid are approved -> approved
        IF v_valid_sectors > 0 AND v_approved = v_valid_sectors THEN
            RETURN 'approved'::report_status;
        END IF;

        -- If all valid are submitted -> submitted (Aguardando aprovação)
        IF v_valid_sectors > 0 AND v_submitted = v_valid_sectors THEN
            RETURN 'submitted'::report_status;
        END IF;

        -- If there's a mix of approved and submitted -> partial_approval
        IF v_approved > 0 AND v_submitted > 0 THEN
            RETURN 'partial_approval'::report_status;
        END IF;

        -- Fallback
        IF v_total > 0 AND v_not_applicable = v_total THEN
            -- if all are not_applicable
            RETURN 'approved'::report_status; 
        END IF;

        RETURN 'draft'::report_status;
    END;
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE TRIGGER FUNCTION TO UPDATE THE PARENT REPORT
CREATE OR REPLACE FUNCTION update_daily_report_status_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update status based on either INSERT/UPDATE (NEW) or DELETE (OLD)
    IF TG_OP = 'DELETE' THEN
        UPDATE daily_reports
        SET status = calculate_consolidated_status(OLD.daily_report_id)
        WHERE id = OLD.daily_report_id;
        RETURN OLD;
    ELSE
        UPDATE daily_reports
        SET status = calculate_consolidated_status(NEW.daily_report_id)
        WHERE id = NEW.daily_report_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE THE TRIGGER
DROP TRIGGER IF EXISTS trigger_update_daily_report_status ON daily_report_sectors;
CREATE TRIGGER trigger_update_daily_report_status
AFTER INSERT OR UPDATE OF status OR DELETE
ON daily_report_sectors
FOR EACH ROW
EXECUTE FUNCTION update_daily_report_status_trigger();

-- 7. RECALCULATE STATUS FOR ALL EXISTING REPORTS
UPDATE daily_reports
SET status = calculate_consolidated_status(id);
