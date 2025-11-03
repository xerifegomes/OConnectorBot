-- =============================================================================
-- oConnector Backend - Setup Completo D1 Database
-- Execute este script completo no SQL Editor do D1
-- =============================================================================

-- 1. Criar tabela conhecimento
CREATE TABLE IF NOT EXISTS conhecimento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- 2. Criar índice
CREATE INDEX IF NOT EXISTS idx_conhecimento_cliente ON conhecimento(cliente_id);

-- 3. Adicionar colunas em clientes (pode falhar se já existir - é normal)
-- Se der erro "duplicate column name", a coluna já existe - ignore o erro

-- Adicionar dados_treinamento
ALTER TABLE clientes ADD COLUMN dados_treinamento TEXT;

-- Adicionar data_ultimo_treino
ALTER TABLE clientes ADD COLUMN data_ultimo_treino DATETIME;

-- 4. Verificar resultado
SELECT 
  'Setup completo!' as status,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table') as total_tabelas,
  (SELECT COUNT(*) FROM conhecimento) as registros_conhecimento,
  (SELECT COUNT(*) FROM clientes) as total_clientes;

