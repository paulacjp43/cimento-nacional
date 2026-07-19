-- ============================================================
-- ADICIONA CAMPOS DE ESPALHAMENTO E TEMPERATURA NO CONTROLE TECNOLÓGICO
-- ============================================================

ALTER TABLE public.concrete_control
  ADD COLUMN IF NOT EXISTS spread_test INTEGER, -- Teste de Espalhamento (mm)
  ADD COLUMN IF NOT EXISTS average_temperature NUMERIC(4,1); -- Temperatura Média (ºC)
