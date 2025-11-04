-- Tabela de logs de uso da IA
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  mensagem TEXT NOT NULL,
  resposta TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT 'llama-3-8b-instruct',
  tokens_estimados INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_cliente ON ai_usage_logs(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created_at);

SELECT '✅ Tabela ai_usage_logs criada!' as resultado;

