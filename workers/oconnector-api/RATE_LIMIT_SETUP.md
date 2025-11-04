# 🔒 Configuração de Rate Limiting - Google Places API

## 📋 Visão Geral

Este sistema implementa um bloqueio automático quando o limite de **300 requisições/dia** da Google Places API for atingido, evitando cobranças extras.

## 🚀 Passos para Configurar

### 1. Criar Workers KV Namespace

Execute o comando abaixo no terminal:

```bash
cd workers/oconnector-api
wrangler kv:namespace create "RATE_LIMIT"
```

Isso retornará algo como:
```
🌀  Creating namespace with title "oconnector-api-RATE_LIMIT"
✨  Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMIT", id = "abc123def456..." }
```

### 2. Criar Preview Namespace (para desenvolvimento local)

```bash
wrangler kv:namespace create "RATE_LIMIT" --preview
```

Isso retornará:
```
🌀  Creating namespace with title "oconnector-api-RATE_LIMIT_preview"
✨  Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMIT", preview_id = "xyz789..." }
```

### 3. Atualizar wrangler.toml

Copie os IDs retornados e atualize o arquivo `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "SEU_ID_REAL_AQUI"  # Substituir pelo ID real
preview_id = "SEU_PREVIEW_ID_AQUI"  # Substituir pelo preview ID real
```

### 4. Configurar Google Places API Key

No Cloudflare Dashboard ou no `wrangler.toml`:

```toml
[vars]
GOOGLE_PLACES_KEY = "sua_chave_aqui"
```

Ou configure via Dashboard:
1. Acesse: Cloudflare Dashboard → Workers & Pages → oconnector-api → Settings → Variables
2. Adicione: `GOOGLE_PLACES_KEY` = `sua_chave`

### 5. Fazer Deploy

```bash
wrangler deploy
```

## 🔍 Como Funciona

### Rate Limiting

- **Limite:** 300 requisições por dia
- **Reset:** Automático a cada 24 horas (baseado na data)
- **Armazenamento:** Workers KV (chave baseada em data: `places_api:YYYY-MM-DD`)

### Fluxo de Operação

1. **Verificação:** Antes de fazer requisição, verifica se já atingiu 300
2. **Bloqueio:** Se atingiu, retorna HTTP 429 com mensagem de erro
3. **Incremento:** Se permitido, incrementa contador após requisição bem-sucedida
4. **Reset:** Contador expira automaticamente após 25 horas

### Resposta quando Bloqueado

```json
{
  "success": false,
  "error": "Limite diário de requisições atingido",
  "message": "Limite de 300 requisições/dia foi atingido. Tente novamente amanhã.",
  "rateLimit": {
    "used": 300,
    "limit": 300,
    "remaining": 0,
    "resetAt": "2025-01-17T00:00:00.000Z"
  }
}
```

### Resposta com Sucesso

```json
{
  "success": true,
  "resultados": [...],
  "total": 20,
  "rateLimit": {
    "used": 45,
    "limit": 300,
    "remaining": 255,
    "warning": null
  }
}
```

## 📊 Monitoramento

### Verificar Uso Atual

O contador é armazenado no Workers KV com a chave:
- Formato: `places_api:YYYY-MM-DD`
- Exemplo: `places_api:2025-01-16`

### Verificar no Dashboard

1. Acesse: Cloudflare Dashboard → Workers & Pages → KV
2. Selecione o namespace `RATE_LIMIT`
3. Busque pela chave do dia atual

### Via CLI

```bash
# Ver contador do dia atual
wrangler kv:key get "places_api:2025-01-16" --namespace-id=SEU_ID

# Ver todas as chaves
wrangler kv:key list --namespace-id=SEU_ID
```

## ⚠️ Avisos Importantes

1. **Workers KV:** O namespace precisa ser criado antes do deploy
2. **API Key:** Google Places API Key deve estar configurada
3. **Limite:** O sistema bloqueia em 300, mas você pode ajustar a constante `RATE_LIMIT_MAX` no código
4. **Reset:** O contador reseta automaticamente à meia-noite (UTC)

## 🔧 Customização

### Alterar Limite

No arquivo `index.js`, linha 905:

```javascript
const RATE_LIMIT_MAX = 300; // Altere para o valor desejado
```

### Verificar Rate Limit sem Fazer Requisição

Você pode criar um endpoint adicional para verificar o status:

```javascript
// GET /api/rate-limit/status
if (path === '/api/rate-limit/status' && request.method === 'GET') {
  const rateLimit = await checkRateLimit(env.RATE_LIMIT);
  return jsonResponse({
    rateLimit,
    resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}
```

## ✅ Teste

```bash
# Testar endpoint de prospecção
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/prospectar \
  -H "Content-Type: application/json" \
  -d '{
    "nicho": "Imobiliária",
    "cidade": "São Paulo, SP"
  }'
```

## 📝 Notas

- O rate limiting é **por dia** (reset à meia-noite UTC)
- O contador é incrementado **apenas após requisição bem-sucedida**
- Se a Google Places API retornar erro, o contador **não é incrementado**
- O sistema é **tolerante a falhas**: se o KV falhar, permite requisição mas loga o erro

