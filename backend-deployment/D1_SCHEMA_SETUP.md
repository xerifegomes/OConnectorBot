# 📝 SQL para Executar no D1 Database

## ⚠️ IMPORTANTE: Execute este SQL no Cloudflare Dashboard

**Localização:** Cloudflare Dashboard → Workers & Pages → D1 → oconnector_db → SQL Editor

---

## 1. Criar Tabela `conhecimento`

```sql
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
```

---

## 2. Adicionar Colunas na Tabela `clientes`

⚠️ **Nota:** `ALTER TABLE ADD COLUMN` pode falhar se a coluna já existir. Execute uma de cada vez.

```sql
-- Adicionar coluna dados_treinamento
ALTER TABLE clientes ADD COLUMN dados_treinamento TEXT;

-- Adicionar coluna data_ultimo_treino
ALTER TABLE clientes ADD COLUMN data_ultimo_treino DATETIME;
```

**Se der erro de coluna já existente, ignore. A coluna já está criada.**

---

## 3. Verificar Estrutura (Opcional)

```sql
-- Verificar tabelas existentes
SELECT name FROM sqlite_master WHERE type='table';

-- Verificar contagens
SELECT COUNT(*) as total_prospects FROM prospects;
SELECT COUNT(*) as total_clientes FROM clientes;
SELECT COUNT(*) as total_leads FROM leads;
SELECT COUNT(*) as total_conhecimento FROM conhecimento;

-- Verificar estrutura da tabela conhecimento
PRAGMA table_info(conhecimento);

-- Verificar estrutura da tabela clientes
PRAGMA table_info(clientes);
```

---

## 4. Script Completo (Copiar e Colar)

```sql
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
-- Ignore erros de "duplicate column name" se aparecerem

-- Adicionar dados_treinamento
INSERT OR IGNORE INTO clientes (dados_treinamento) VALUES (NULL) WHERE 1=0;
-- Nota: Se a coluna não existir, você precisará executar manualmente:
-- ALTER TABLE clientes ADD COLUMN dados_treinamento TEXT;

-- Adicionar data_ultimo_treino
INSERT OR IGNORE INTO clientes (data_ultimo_treino) VALUES (NULL) WHERE 1=0;
-- Nota: Se a coluna não existir, você precisará executar manualmente:
-- ALTER TABLE clientes ADD COLUMN data_ultimo_treino DATETIME;

-- 4. Verificar resultado
SELECT 
  'Tabelas criadas:' as status,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table') as total_tabelas,
  (SELECT COUNT(*) FROM conhecimento) as registros_conhecimento,
  (SELECT COUNT(*) FROM clientes) as total_clientes;
```

---

## ✅ VALIDAÇÃO PÓS-EXECUÇÃO

Após executar o SQL, verifique:

1. ✅ Tabela `conhecimento` criada
2. ✅ Índice `idx_conhecimento_cliente` criado
3. ✅ Colunas adicionadas em `clientes` (ou já existiam)

Execute para verificar:

```sql
-- Verificar se tabela conhecimento existe
SELECT name FROM sqlite_master WHERE type='table' AND name='conhecimento';

-- Verificar estrutura da tabela conhecimento
PRAGMA table_info(conhecimento);

-- Verificar colunas da tabela clientes
PRAGMA table_info(clientes);
```

---

## 🚀 PRÓXIMO PASSO

Após executar o SQL:
1. Execute o health check: `./backend-deployment/test-health.sh`
2. Execute o teste de prospecção: `./backend-deployment/test-prospectar.sh`

