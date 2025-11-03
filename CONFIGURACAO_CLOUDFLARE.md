# ⚙️ Configuração Cloudflare - oConnector

**Data:** 03/11/2024  
**Status:** ✅ Configurado

---

## 🔐 Credenciais Configuradas

### Account ID
```
e71984852bedaf5f21cef5d949948498
```

### Zone ID
```
ea6add9629baf26c4d974cf4c1953511
```

### API Token
```
HKBiHQh8h0lW_FClxJPuR1P3TXHjvltok1T-vSUO
```

---

## 📋 Workers Deployados

### oconnector-api
- **URL:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Status:** ✅ Deployado e funcionando
- **Versão:** d514f6cf-f110-42db-a9a3-cbdb2b76032e
- **Database:** oconnector_db (D1)

### agent-training-worker
- **URL:** https://agent-training-worker.xerifegomes-e71.workers.dev
- **Status:** ⏳ Precisa correção (bug VECTORIZE)

---

## 🚀 Comandos Úteis

### Deploy via API Token

```bash
export CLOUDFLARE_API_TOKEN="HKBiHQh8h0lW_FClxJPuR1P3TXHjvltok1T-vSUO"
cd workers/oconnector-api
wrangler deploy
```

### Ou usando arquivo .env

```bash
# Carregar variáveis
export $(cat .env.cloudflare | xargs)

# Fazer deploy
cd workers/oconnector-api
wrangler deploy
```

---

## ⚠️ SEGURANÇA

**IMPORTANTE:**
- ✅ `.env.cloudflare` está no `.gitignore`
- ⚠️ **NÃO commitar** arquivos com tokens
- ⚠️ **NÃO compartilhar** tokens publicamente

---

## 📊 Status dos Bindings

### oconnector-api
- ✅ **DB** - D1 Database (oconnector_db)
- ✅ **AI** - Workers AI (automático)
- ✅ **ENV Vars** - Configuradas no dashboard

### agent-training-worker
- ✅ **DB** - D1 Database (oconnector_db)
- ✅ **AI** - Workers AI (automático)
- ❌ **VECTORIZE** - Não configurado (não necessário)

---

**Última atualização:** 03/11/2024

