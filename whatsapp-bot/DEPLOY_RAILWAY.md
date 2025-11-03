# 🚂 Deploy do Bot Server no Railway

## Passo a Passo

### 1. Instalar Railway CLI

```bash
npm i -g @railway/cli
```

### 2. Login no Railway

```bash
railway login
```

### 3. Criar Projeto

```bash
cd whatsapp-bot
railway init
```

### 4. Configurar Variáveis de Ambiente

No dashboard do Railway ou via CLI:

```bash
railway variables set PORT=3001
railway variables set AGENT_TRAINING_API_URL=https://agent-training-worker.xerifegomes-e71.workers.dev
railway variables set OCONNECTOR_API_URL=https://oconnector-api.xerifegomes-e71.workers.dev
railway variables set WHATSAPP_SESSION_PATH=/data/.wwebjs_auth
```

### 5. Deploy

```bash
railway up
```

### 6. Obter URL

Após o deploy, Railway fornece uma URL:
```
https://seu-bot-production.up.railway.app
```

### 7. Atualizar Worker

Adicionar no `wrangler.toml`:

```toml
[vars]
WHATSAPP_BOT_SERVER_URL=https://seu-bot-production.up.railway.app
```

### 8. Deploy Worker Atualizado

```bash
cd workers/oconnector-api
wrangler deploy
```

---

## ✅ Verificar Funcionamento

```bash
# Testar QR Code
curl https://seu-bot-production.up.railway.app/qr

# Testar Status
curl https://seu-bot-production.up.railway.app/status
```

---

## 🔄 Deploy Automático

Railway detecta mudanças no Git automaticamente.

Basta fazer push:

```bash
git add .
git commit -m "Atualizar bot server"
git push
```

Railway faz deploy automaticamente!

---

## 📊 Monitoramento

- Acesse dashboard Railway: https://railway.app
- Veja logs em tempo real
- Configure alertas

---

## 💾 Persistência

Railway mantém volumes para `.wwebjs_auth/` automaticamente.

Sessão do WhatsApp será mantida entre deploys.

