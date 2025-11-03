# 🔗 Integração com Cloudflare Workers

## Como o Bot se Integra

### 1. Agent Training Worker

**Endpoint usado:** `POST /api/query`

**Payload:**
```json
{
  "cliente_id": 1,
  "pergunta": "Qual o horário de funcionamento?",
  "contexto": {
    "historico_mensagens": [...],
    "timestamp": "2024-11-02T..."
  }
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "resposta": "Nosso horário é Seg-Sex: 8h-18h...",
  "contexto_usado": 5,
  "fontes": ["faq", "info_empresa"]
}
```

---

### 2. oConnector API

**Endpoints usados:**

#### Salvar Lead
```http
POST /api/leads
Content-Type: application/json

{
  "cliente_id": 1,
  "nome": "João Silva",
  "telefone": "22999999999",
  "email": null,
  "origem": "whatsapp_bot",
  "mensagem_inicial": "Olá, gostaria de informações",
  "status": "novo"
}
```

#### Buscar Cliente por WhatsApp
```http
GET /api/clientes?whatsapp=22999999999
```

**Resposta:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "nome_imobiliaria": "Imobiliária Silva",
    "whatsapp_numero": "22999999999",
    "plano": "STARTER",
    "status": "ativo"
  }]
}
```

---

## 🔄 Fluxo Completo

```
1. Mensagem chega no WhatsApp
   ↓
2. Bot identifica número → Busca cliente_id
   ↓
3. Primeira mensagem? → Salva lead
   ↓
4. Faz query no agent-training-worker
   ↓
5. Obtém resposta contextualizada (RAG)
   ↓
6. Envia resposta para o cliente
   ↓
7. Atualiza histórico da conversa
```

---

## 📊 Multi-tenancy

Cada cliente tem seu próprio agente treinado:
- Cliente 1 → Respostas sobre Imobiliária A
- Cliente 2 → Respostas sobre Imobiliária B
- Isolamento completo via `cliente_id`

---

## 🧪 Testar Integração

### 1. Verificar Cliente Treinado

```bash
curl https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/1
```

### 2. Testar Query

```bash
curl -X POST https://agent-training-worker.xerifegomes-e71.workers.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "pergunta": "Qual o horário de funcionamento?"
  }'
```

### 3. Verificar Lead Salvo

```bash
curl https://oconnector-api.xerifegomes-e71.workers.dev/api/leads?cliente_id=1
```

---

## 🔐 Segurança

- ✅ Validação de cliente antes de responder
- ✅ Timeout nas requisições API (10s)
- ✅ Retry logic para falhas temporárias
- ✅ Cache para reduzir chamadas API

