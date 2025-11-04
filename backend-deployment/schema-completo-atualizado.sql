-- =============================================================================
-- oConnector Backend - Schema Completo Atualizado D1 Database
-- Data: 2025-11-04
-- Inclui correção: coluna updated_at na tabela leads
-- =============================================================================

-- ============================================
-- TABELA: leads (ATUALIZADA)
-- ============================================
-- Nota: Esta é a estrutura atual após correção de 04/11/2025
-- A coluna updated_at foi adicionada via ALTER TABLE

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  tipo_interesse TEXT,
  tipo_imovel TEXT,
  regiao TEXT,
  faixa_preco TEXT,
  observacoes TEXT,
  origem TEXT,
  status TEXT DEFAULT 'novo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Índice para melhorar performance de busca por cliente
CREATE INDEX IF NOT EXISTS idx_leads_cliente ON leads(cliente_id);

-- Índice para melhorar performance de busca por telefone
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);

-- Índice para melhorar performance de busca por status
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- ============================================
-- TABELA: conhecimento
-- ============================================
CREATE TABLE IF NOT EXISTS conhecimento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE INDEX IF NOT EXISTS idx_conhecimento_cliente ON conhecimento(cliente_id);

-- ============================================
-- EXTENSÕES DA TABELA clientes
-- ============================================
-- Nota: Execute estes ALTER TABLE apenas se as colunas não existirem
-- Se der erro "duplicate column name", ignore - a coluna já existe

-- Adicionar dados_treinamento
-- ALTER TABLE clientes ADD COLUMN dados_treinamento TEXT;

-- Adicionar data_ultimo_treino  
-- ALTER TABLE clientes ADD COLUMN data_ultimo_treino DATETIME;

-- ============================================
-- VERIFICAÇÃO DE ESTRUTURA
-- ============================================

-- Verificar todas as tabelas
SELECT name, type FROM sqlite_master WHERE type='table' ORDER BY name;

-- Verificar estrutura da tabela leads
PRAGMA table_info(leads);

-- Verificar estrutura da tabela conhecimento
PRAGMA table_info(conhecimento);

-- Verificar estrutura da tabela clientes
PRAGMA table_info(clientes);

-- Contagens
SELECT 
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM conhecimento) as total_conhecimento,
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COUNT(*) FROM prospects) as total_prospects;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
HISTÓRICO DE ALTERAÇÕES:

04/11/2025 - Correção Crítica
- Adicionada coluna updated_at na tabela leads
- Corrigido erro: D1_ERROR: no such column: updated_at
- Script de correção: fix-leads-table.sql
- Todos os registros existentes atualizados com updated_at = created_at

CAMPOS DA TABELA LEADS:
- id: ID único do lead (auto-incremento)
- cliente_id: Referência ao cliente (FK)
- nome: Nome do lead
- telefone: Telefone (obrigatório)
- email: Email (opcional)
- tipo_interesse: compra/venda/aluguel (imobiliária)
- tipo_imovel: casa/apartamento/terreno/etc
- regiao: Região de interesse
- faixa_preco: Faixa de preço
- observacoes: Observações gerais
- origem: whatsapp/site/etc
- status: novo/contatado/qualificado/convertido/perdido
- created_at: Data de criação (automático)
- updated_at: Data de última atualização (automático)

TRIGGERS SUGERIDOS (OPCIONAL):
Se desejar atualização automática de updated_at:

CREATE TRIGGER update_leads_timestamp 
AFTER UPDATE ON leads
BEGIN
  UPDATE leads SET updated_at = datetime('now') 
  WHERE id = NEW.id;
END;
*/

