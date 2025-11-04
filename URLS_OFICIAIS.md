# 🌐 URLs Oficiais do oConnector

## ✅ URLs de Produção

### Frontend
- **URL Principal:** https://oconnector.xerifegomes-e71.workers.dev
- **Prospects:** https://oconnector.xerifegomes-e71.workers.dev/prospects
- **WhatsApp:** https://oconnector.xerifegomes-e71.workers.dev/whatsapp
- **Dashboard:** https://oconnector.xerifegomes-e71.workers.dev/dashboard
- **Leads:** https://oconnector.xerifegomes-e71.workers.dev/leads

**Status:** ✅ Conectado ao GitHub para deploy automático

### Backend
- **API Principal:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Agente IA:** https://agent-training-worker.xerifegomes-e71.workers.dev

## 📋 Endpoints da API

### Autenticação
```
POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login
POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/register
GET  https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/verify
```

### Clientes
```
GET  https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes/me
POST https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes
```

### Leads
```
GET  https://oconnector-api.xerifegomes-e71.workers.dev/api/leads?cliente_id={id}
GET  https://oconnector-api.xerifegomes-e71.workers.dev/api/leads/stats?cliente_id={id}
```

### Prospects
```
GET  https://oconnector-api.xerifegomes-e71.workers.dev/api/prospects
POST https://oconnector-api.xerifegomes-e71.workers.dev/api/prospectar
```

### Agente IA
```
POST https://agent-training-worker.xerifegomes-e71.workers.dev/api/train
POST https://agent-training-worker.xerifegomes-e71.workers.dev/api/query
GET  https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/{cliente_id}
```

## ⚠️ URLs Antigas (NÃO USAR)

- ❌ `oconnector.pages.dev` (não é mais usado)
- ❌ `oconnector-frontend.pages.dev` (não é mais usado)
- ❌ `xxxxx.oconnector-frontend.pages.dev` (URLs temporárias antigas)

## 🔄 Deploy do Frontend

O frontend está conectado ao GitHub e faz deploy automático quando há push na branch principal.

### Verificar Deploy

```bash
# Testar se o frontend está online
curl -I https://oconnector.xerifegomes-e71.workers.dev

# Testar página de prospects
curl -I https://oconnector.xerifegomes-e71.workers.dev/prospects
```

## 📝 Notas

- O frontend está deployado como **Cloudflare Worker/Pages**
- O deploy é automático via GitHub integration
- Todos os serviços estão na conta `xerifegomes-e71` do Cloudflare

