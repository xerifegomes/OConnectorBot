# 📱 Como Conectar o WhatsApp - Guia Completo

**Data:** 03/11/2024  
**Status:** ✅ Integração pronta

---

## 🎯 ONDE ENTRA NA INTEGRAÇÃO?

### **1. Bot Server (Backend)**
O bot server precisa estar rodando localmente para gerar o QR Code.

**Localização:** `whatsapp-bot/`

**Iniciar:**
```bash
cd whatsapp-bot
npm run server
```

**O que faz:**
- Inicializa o bot WhatsApp
- Gera QR Code automaticamente
- Expõe endpoints HTTP em `http://localhost:3001`
- Gerencia conexão com WhatsApp Web

---

### **2. Interface Web (Frontend)**
A interface web busca o QR Code do bot server e exibe para você.

**URL:** `https://oconnector.pages.dev/whatsapp`

**O que faz:**
- Conecta com bot server local (`localhost:3001`)
- Busca QR Code automaticamente
- Exibe QR Code em dialog
- Mostra status em tempo real
- Permite enviar/receber mensagens

---

## 🔄 FLUXO COMPLETO DE INTEGRAÇÃO

```
┌─────────────────────────────────────┐
│  1. Bot Server (localhost:3001)    │
│     - Inicia bot WhatsApp           │
│     - Gera QR Code                  │
│     - Expõe endpoints HTTP          │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               ↓
┌─────────────────────────────────────┐
│  2. Interface Web (Frontend)        │
│     - Busca QR Code do bot server   │
│     - Exibe QR Code para você       │
│     - Mostra status em tempo real   │
└──────────────┬──────────────────────┘
               │
               │ Você escaneia
               ↓
┌─────────────────────────────────────┐
│  3. WhatsApp (Celular)              │
│     - Escaneia QR Code              │
│     - Conecta com bot server        │
│     - Bot fica pronto para usar     │
└─────────────────────────────────────┘
```

---

## 📋 PASSO A PASSO

### **PASSO 1: Iniciar Bot Server**

```bash
cd /Volumes/LexarAPFS/OCON/whatsapp-bot
npm run server
```

**Você verá:**
```
🚀 WhatsApp Bot Server rodando na porta 3001
📱 QR Code disponível em: http://localhost:3001/qr
📊 Status disponível em: http://localhost:3001/status
🚀 Inicializando oConnector WhatsApp Bot...
```

**Aguarde aparecer:**
```
📱 Escaneie o QR Code abaixo com o WhatsApp:
```

---

### **PASSO 2: Acessar Interface Web**

Abra no navegador:
```
https://oconnector.pages.dev/whatsapp
```

**Você verá:**
- Status: "Bot Offline" (se bot server não estiver rodando)
- Botão: "Conectar WhatsApp"

---

### **PASSO 3: Conectar WhatsApp**

1. **Clique em "Conectar WhatsApp"**
   - Interface busca QR Code do bot server
   - QR Code aparece em um dialog

2. **Escaneie o QR Code:**
   - Abra WhatsApp no celular
   - Vá em: **Menu → Aparelhos conectados**
   - Toque em: **Conectar um aparelho**
   - Escaneie o QR Code que aparece na tela

3. **Aguarde conexão:**
   - Status muda para "Conectado"
   - Você verá seu número WhatsApp
   - Bot fica pronto para receber mensagens

---

## 🔍 VERIFICAÇÃO

### **Verificar se Bot Server está rodando:**

```bash
curl http://localhost:3001/status
```

**Resposta esperada:**
```json
{
  "status": "waiting_qr",
  "qr": "QR_CODE_AQUI...",
  "ready": false
}
```

### **Verificar QR Code:**

```bash
curl http://localhost:3001/qr
```

**Resposta esperada:**
```json
{
  "success": true,
  "qr": "QR_CODE_AQUI...",
  "status": "waiting_qr"
}
```

---

## ⚠️ PROBLEMAS COMUNS

### **"Bot Offline" na interface**

**Causa:** Bot server não está rodando

**Solução:**
```bash
cd whatsapp-bot
npm run server
```

---

### **"Agent Inativo"**

**Causa:** Agent IA não está configurado ou não está treinado

**Solução:**
- Verificar se `agent-training-worker` está deployado
- Treinar cliente (se necessário)
- Verificar logs do bot

---

### **QR Code não aparece**

**Causa 1:** Bot server não está rodando
**Solução:** Iniciar bot server

**Causa 2:** Porta 3001 ocupada
**Solução:**
```bash
./whatsapp-bot/KILL_PORT.sh
# ou
lsof -ti:3001 | xargs kill -9
```

**Causa 3:** CORS ou erro de conexão
**Solução:** Verificar se bot server está acessível em `localhost:3001`

---

## 🎯 ONDE ESTÁ A INTEGRAÇÃO?

### **Arquivos Principais:**

1. **Bot Server:**
   - `whatsapp-bot/src/bot-server.js` - Servidor Express
   - `whatsapp-bot/src/bot.js` - Bot WhatsApp principal
   - `whatsapp-bot/src/message-handler.js` - Handler de mensagens

2. **Interface Web:**
   - `oconnector-frontend/app/(dashboard)/whatsapp/page.tsx` - Página WhatsApp
   - `oconnector-frontend/lib/api.ts` - Cliente API

3. **Backend API:**
   - `workers/oconnector-api/whatsapp-bot-handler.js` - Handlers WhatsApp
   - `workers/oconnector-api/index.js` - Worker principal

---

## 🚀 COMANDOS RÁPIDOS

### **Iniciar Bot Server:**
```bash
cd whatsapp-bot && npm run server
```

### **Ver logs:**
```bash
tail -f /tmp/whatsapp-bot.log
```

### **Verificar status:**
```bash
curl http://localhost:3001/status
```

### **Liberar porta:**
```bash
./whatsapp-bot/KILL_PORT.sh
```

---

## ✅ CHECKLIST

- [ ] Bot server iniciado (`npm run server`)
- [ ] Bot server rodando em `localhost:3001`
- [ ] Interface acessada (`oconnector.pages.dev/whatsapp`)
- [ ] Botão "Conectar WhatsApp" clicado
- [ ] QR Code aparece no dialog
- [ ] QR Code escaneado com celular
- [ ] Status muda para "Conectado"
- [ ] Bot pronto para receber mensagens

---

**Status:** ✅ Integração completa e pronta para usar!

