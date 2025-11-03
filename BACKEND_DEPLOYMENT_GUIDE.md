# 🚀 Guia de Deployment - oConnector Backend

**Data:** 02/11/2024  
**Versão:** 1.0 Final

---

## 📋 PRÓXIMA AÇÃO IMEDIATA

Execute na ordem:

### 1. SQL no D1 Console

```sql
-- Tabela conhecimento (fallback Vectorize)
CREATE TABLE IF NOT EXISTS conhecimento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE INDEX IF NOT EXISTS idx_conhecimento_cliente ON conhecimento(cliente_id);

-- Adicionar colunas em clientes
ALTER TABLE clientes ADD COLUMN dados_treinamento TEXT;
ALTER TABLE clientes ADD COLUMN data_ultimo_treino DATETIME;
```

**Local:** Cloudflare Dashboard → Workers & Pages → D1 → oconnector_db → SQL Editor

---

### 2. Teste Health Check

```bash
# Executar script de health check
chmod +x backend-deployment/test-health.sh
./backend-deployment/test-health.sh

# Ou manualmente:
curl https://oconnector-api.xerifegomes-e71.workers.dev/api
curl https://agent-training-worker.xerifegomes-e71.workers.dev/api
```

**Esperado:**
- Ambos retornam `200 OK`
- Resposta JSON com `success: true`
- Mensagem de confirmação de cada API

---

### 3. Execute Integration Test 1: Prospecção

```bash
# Executar script de prospecção
chmod +x backend-deployment/test-prospectar.sh
./backend-deployment/test-prospectar.sh "imobiliária" "Iguaba Grande"

# Ou manualmente:
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/prospectar \
  -H "Content-Type: application/json" \
  -d '{"nicho": "imobiliária", "cidade": "Iguaba Grande"}'
```

**Esperado:**
- `success: true`
- Array `resultados` com prospects encontrados
- Cada prospect com `perfil` (A/B/C) e `prioridade` (1-10)

---

## 📁 ARQUIVOS CRIADOS

1. **`oconnector-backend-deployment.yaml`** - Especificação completa do deployment
2. **`backend-deployment/schema.sql`** - SQL para criar tabelas faltantes
3. **`backend-deployment/test-health.sh`** - Script de health check
4. **`backend-deployment/test-prospectar.sh`** - Teste de prospecção
5. **`backend-deployment/test-treinar.sh`** - Teste de treinamento de agente
6. **`backend-deployment/test-query.sh`** - Teste de query RAG

---

## 🔍 CHECKLIST COMPLETO

### Pre-Deployment

- [ ] Verificar credenciais Google API
- [ ] Configurar variáveis de ambiente nos workers
- [ ] Executar SQLs faltantes no D1
- [ ] Validar estrutura de tabelas

### Deployment

- [ ] Verificar código dos workers
- [ ] Testar endpoints localmente (se possível)
- [ ] Save and Deploy ambos workers
- [ ] Verificar URLs ativas

### Post-Deployment

- [ ] Health check ambos workers ✅
- [ ] Testar prospecção ✅
- [ ] Testar treinamento de agente
- [ ] Testar query RAG
- [ ] Validar multi-tenant isolation

---

## 🧪 SCRIPTS DE TESTE

Todos os scripts estão em `backend-deployment/`:

```bash
# Health check
./backend-deployment/test-health.sh

# Prospecção
./backend-deployment/test-prospectar.sh "imobiliária" "Cabo Frio"

# Treinar agente
./backend-deployment/test-treinar.sh 1

# Query RAG
./backend-deployment/test-query.sh 1 "Qual o horário de funcionamento?"
```

---

## ✅ SUCCESS CRITERIA

O backend estará 100% pronto quando:

- ✅ Ambos workers retornam 200 no `/api`
- ✅ Prospecção retorna array de prospects
- ✅ Treinamento salva dados no D1
- ✅ Query RAG retorna respostas contextualizadas
- ✅ Multi-tenant isolamento validado
- ✅ Workers AI responde em < 2s

---

## 📚 DOCUMENTAÇÃO COMPLETA

Consulte `oconnector-backend-deployment.yaml` para:
- Arquitetura completa
- Todos os endpoints
- Testes de integração end-to-end
- Troubleshooting
- Próximos passos

---

**Backend estará 100% pronto após estes 3 passos!** 🚀

