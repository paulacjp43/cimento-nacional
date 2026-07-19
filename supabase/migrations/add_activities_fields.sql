-- ============================================================
-- Adiciona novos campos ao daily_report_sectors:
--   day_forecast           → Previsão do Dia (o que foi planejado para HOJE)
--   not_executed_activities → Atividades Programadas Não Executadas
-- ============================================================

ALTER TABLE daily_report_sectors
  ADD COLUMN IF NOT EXISTS day_forecast TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS not_executed_activities TEXT DEFAULT '';

-- Verificação
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'daily_report_sectors'
  AND column_name IN ('day_forecast', 'not_executed_activities',
                      'executed_activities', 'next_day_forecast',
                      'general_observations')
ORDER BY ordinal_position;
