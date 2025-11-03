-- =============================================================================
-- oConnector Backend - Schema SQL para D1 Database
-- Data: 2025-11-02
-- =============================================================================

-- Tabela conhecimento (fallback Vectorize para RAG)
CREATE TABLE IF NOT EXISTS conhecimento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE INDEX IF NOT EXISTS idx_conhecimento_cliente ON conhecimento(cliente_id);

-- Adicionar colunas em clientes (se não existirem)
-- Nota: ALTER TABLE ADD COLUMN pode falhar se coluna já existe
-- Executar manualmente se necessário

-- Adicionar coluna dados_treinamento
-- ALTER TABLE clientes ADD COLUMN dados_treinamento TEXT;

-- Adicionar coluna data_ultimo_treino
-- ALTER TABLE clientes ADD COLUMN data_ultimo_treino DATETIME;

-- Verificar estrutura de tabelas existentes
-- SELECT name FROM sqlite_master WHERE type='table';

-- Verificar contagens
-- SELECT COUNT(*) as total_prospects FROM prospects;
-- SELECT COUNT(*) as total_clientes FROM clientes;
-- SELECT COUNT(*) as total_leads FROM leads;
-- SELECT COUNT(*) as total_conhecimento FROM conhecimento;

