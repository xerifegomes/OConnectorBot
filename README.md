# 🤖 OConnector Bot

**Bot WhatsApp com IA e Automação para Prospecção B2B**

Sistema completo de automação para prospecção inteligente de clientes usando WhatsApp, Google Places API e Workers AI da Cloudflare.

---

## 🚀 Funcionalidades

- **Bot WhatsApp Inteligente** - Atendimento automatizado 24/7 com IA
- **Prospecção Automatizada** - Mapeamento de empresas via Google Places API
- **IA Contextual** - Respostas personalizadas usando Workers AI (Llama 3)
- **Dashboard Completo** - Gestão de leads, prospects e conversas
- **Multi-tenancy** - Suporte a múltiplos clientes

---

## 🏗️ Arquitetura

### **Frontend (Next.js)**
- Landing page profissional
- Dashboard administrativo
- Interface de gestão de leads e prospects
- Integração WhatsApp Web

### **Backend (Cloudflare Workers)**
- **oconnector-api** - API REST principal
- **agent-training-worker** - Agente IA especializado (RAG)
- **D1 Database** - SQLite serverless
- **Workers AI** - Modelos Llama 3 e embeddings

### **Bot WhatsApp**
- Servidor local com `whatsapp-web.js`
- Integração com Workers AI
- Gerenciamento de conversas e leads
- QR Code para autenticação

---

## 📁 Estrutura do Projeto

```
OCON/
├── oconnector-frontend/     # Frontend Next.js
├── workers/
│   ├── oconnector-api/      # API REST principal
│   └── agent-training-worker/ # Agente IA
├── whatsapp-bot/            # Bot WhatsApp
└── backend-deployment/      # Scripts de deploy
```

---

## 🛠️ Tecnologias

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Cloudflare Workers, D1 Database, Workers AI
- **Bot:** whatsapp-web.js, Express.js
- **IA:** Llama 3 (via Workers AI), Embeddings BGE

---

## 📋 Pré-requisitos

- Node.js 18+
- Conta Cloudflare (Workers, D1, Workers AI)
- Conta Google Cloud (Places API)
- WhatsApp Business

---

## 🚀 Instalação

### **1. Frontend**
```bash
cd oconnector-frontend
npm install
npm run dev
```

### **2. Backend (Cloudflare Workers)**
```bash
cd workers/oconnector-api
npx wrangler deploy
```

### **3. Bot WhatsApp**
```bash
cd whatsapp-bot
npm install
npm run server
```

---

## 🌐 URLs de Deploy

- **Frontend:** https://oconnector.pages.dev
- **API:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Agente IA:** https://agent-training-worker.xerifegomes-e71.workers.dev

---

## 📝 Licença

Proprietário - Todos os direitos reservados

---

## 👤 Autor

oConnector Team

---

**Status:** 🚀 Em desenvolvimento ativo
