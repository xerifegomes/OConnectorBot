-- =============================================================================
-- Corrigir tabela leads - Adicionar coluna updated_at
-- =============================================================================

-- Adicionar coluna updated_at na tabela leads
ALTER TABLE leads ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Atualizar leads existentes com data de criação como updated_at inicial
UPDATE leads SET updated_at = created_at WHERE updated_at IS NULL;

-- Verificar resultado
SELECT 
  'Coluna updated_at adicionada!' as status,
  COUNT(*) as total_leads
FROM leads;

-- Verificar estrutura atualizada
PRAGMA table_info(leads);

