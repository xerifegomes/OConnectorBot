-- =====================================================
-- Migração: Tabela de logs de uso da IA
-- Descrição: Armazena métricas de uso do Workers AI
-- Data: 2025-01-04
-- =====================================================

-- Criar tabela de logs de uso da IA
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  mensagem TEXT NOT NULL,
  resposta TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT 'llama-3-8b-instruct',
  tokens_estimados INTEGER DEFAULT 0,
  tempo_resposta_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_cliente ON ai_usage_logs(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_modelo ON ai_usage_logs(modelo);

-- View para estatísticas de uso
CREATE VIEW IF NOT EXISTS ai_usage_stats AS
SELECT 
  cliente_id,
  c.nome_imobiliaria,
  COUNT(*) as total_mensagens,
  SUM(tokens_estimados) as total_tokens,
  AVG(tempo_resposta_ms) as tempo_medio_ms,
  DATE(created_at) as data
FROM ai_usage_logs
LEFT JOIN clientes c ON c.id = cliente_id
GROUP BY cliente_id, DATE(created_at);

-- Comentários
COMMENT ON TABLE ai_usage_logs IS 'Logs de uso do Workers AI para métricas e billing';
COMMENT ON COLUMN ai_usage_logs.tokens_estimados IS 'Estimativa de tokens usados (mensagem + resposta)';
COMMENT ON COLUMN ai_usage_logs.tempo_resposta_ms IS 'Tempo de resposta da IA em milissegundos';

-- Resultado
SELECT '✅ Tabela ai_usage_logs criada com sucesso!' as resultado;

