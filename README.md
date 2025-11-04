# 🚀 oConnector Tech - Plataforma SaaS de Automação

**Solução completa de prospecção e atendimento automatizado para negócios locais**

Plataforma SaaS que vende automação de prospecção e atendimento digital para empresas locais (imobiliárias, salões, clínicas, etc) usando IA, Google APIs e WhatsApp.

---

## 🚀 Funcionalidades

### Para seus Clientes:
- **Prospecção Automatizada** - Mapeia empresas via Google Places API e classifica prospects
- **Abordagem Personalizada** - Gera e envia mensagens automáticas via WhatsApp
- **Agente IA de Triagem** - Qualifica leads automaticamente 24/7
- **Dashboard de Gestão** - Monitora leads, conversas e ROI em tempo real
- **Onboarding Rápido** - Cliente operacional em menos de 1 hora

### Para Você (Empresa de Tecnologia):
- **Plataforma Multi-tenant** - Gerencia múltiplos clientes simultaneamente
- **Automação Completa** - Processo de prospecção → abordagem → triagem → venda
- **Escalável** - Infraestrutura serverless (Cloudflare Workers)
- **Modelo Recorrente** - Assinaturas mensais (MRR)

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

- **Dashboard:** https://oconnector.xerifegomes-e71.workers.dev
- **API:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Agente IA:** https://agent-training-worker.xerifegomes-e71.workers.dev

**✅ Todos os serviços deployados e funcionando**

---

## 📚 Documentação

### 🚀 Para Começar
- **[INICIO_RAPIDO_SAAS.md](INICIO_RAPIDO_SAAS.md)** - Guia rápido para vender e operar
- **[MODELO_NEGOCIO_SAAS.md](MODELO_NEGOCIO_SAAS.md)** - Visão completa do modelo de negócio
- **[README_USO_SIMPLIFICADO.md](README_USO_SIMPLIFICADO.md)** - Guia técnico detalhado

### 📋 Scripts Disponíveis

#### Onboarding de Clientes
```bash
./onboard-cliente.sh              # Onboardar novo cliente (criar + treinar agente)
./treinar-agente.sh               # Re-treinar agente de um cliente
./testar-agente.sh <cliente_id>   # Testar agente do cliente
```

#### Prospecção
```bash
./prospectar-para-cliente.sh <id> <nicho> <cidade> <estado>  # Prospectar para cliente específico
./prospectar-leads.sh <nicho> <cidade> <estado>              # Prospectar genérico
```

#### Configuração
```bash
./configurar-empresa.sh           # Configurar sua própria empresa (admin)
```

---

## 🎯 Fluxo do Negócio

```
1. Onboardar Cliente
   ↓
   ./onboard-cliente.sh
   ↓
2. Prospecção Automatizada
   ↓
   ./prospectar-para-cliente.sh
   ↓
3. Abordagem via WhatsApp
   ↓
   Bot envia mensagens personalizadas
   ↓
4. Triagem com Agente IA
   ↓
   Agente qualifica leads automaticamente
   ↓
5. Venda
   ↓
   Cliente fecha com leads qualificados
```

---

## 💰 Modelo de Negócio

### Planos de Assinatura
- **STARTER:** R$ 497/mês (100 prospects, 500 mensagens)
- **PROFESSIONAL:** R$ 997/mês (300 prospects, 2.000 mensagens)
- **PREMIUM:** R$ 1.997/mês (Ilimitado + recursos avançados)

### Receita
- Assinaturas mensais recorrentes (MRR)
- Setup/Onboarding: R$ 997 (one-time)
- Margem: 80-90%

Veja detalhes completos em: **[MODELO_NEGOCIO_SAAS.md](MODELO_NEGOCIO_SAAS.md)**

---

## 📝 Licença

Proprietário - Todos os direitos reservados

---

## 👤 Autor

oConnector Team

---

**Status:** 🚀 Em desenvolvimento ativo
