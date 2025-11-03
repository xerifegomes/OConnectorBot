# 📖 O QUE É O PROJETO oConnector?

**Versão:** 1.0  
**Data:** 03/11/2024  
**Status:** 85% completo (MVP quase pronto)

---

## 🎯 CONCEITO GERAL

O **oConnector** é uma **plataforma SaaS multi-tenant** completa que ajuda **negócios locais** (especialmente imobiliárias) a:

1. **Prospectar clientes** automaticamente via Google Places
2. **Capturar leads** através de bot WhatsApp inteligente com IA
3. **Gerar mensagens personalizadas** usando Inteligência Artificial
4. **Gerenciar leads** em um dashboard profissional

---

## 🚀 O QUE O SISTEMA FAZ?

### 1. **Prospecção Automática** 🎯

- Busca empresas no Google Places por nicho e cidade
- Exemplo: "Encontrar todas as imobiliárias em Iguaba Grande"
- Retorna dados completos: nome, telefone, endereço, rating
- Classifica prospects automaticamente (A/B/C) por prioridade

### 2. **Bot WhatsApp Inteligente** 🤖

- Bot que atende clientes 24/7 no WhatsApp
- Respostas personalizadas por cliente usando IA (RAG)
- Treinado com informações específicas de cada empresa
- Captura leads automaticamente
- Multi-tenant: suporta múltiplos clientes simultaneamente

### 3. **Sistema de IA (RAG)** 🧠

- **RAG (Retrieval-Augmented Generation)**: Sistema que usa conhecimento específico de cada cliente
- Treina agentes personalizados com:
  - Informações da empresa (horário, endereço, diferenciais)
  - FAQs (perguntas e respostas frequentes)
  - Informações da equipe (corretores, especialidades)
  - Tom de voz e personalidade
- Gera respostas contextualizadas e personalizadas

### 4. **Dashboard de Gestão** 📊

- Visualizar leads capturados
- Ver estatísticas (leads por dia, status, origem)
- Exportar dados em CSV
- Gerenciar configurações do bot
- Ver histórico de conversas

### 5. **Sistema Multi-tenant** 🏢

- Cada cliente tem seu próprio espaço isolado
- Dados separados por `cliente_id`
- Cada cliente pode ter seu próprio bot treinado
- Sistema escalável para múltiplos clientes simultâneos

---

## 🏗️ ARQUITETURA TÉCNICA

### **Frontend** (Interface do Usuário)

#### Versão 1: HTML/CSS/JS (Estático)
- Landing page profissional
- Páginas de login e cadastro
- Dashboard completo
- Deploy: Cloudflare Pages

#### Versão 2: Next.js (Moderno)
- Framework: Next.js 16.0.1
- React 19.2.0 + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Design system completo
- Responsivo e moderno

### **Backend** (API e Lógica)

#### Cloudflare Workers (Serverless)
- **oconnector-api**: API principal
  - Autenticação (login, registro, verify)
  - CRUD de prospects, clientes, leads
  - Integração com Google Places API
  - Geração de mensagens com Workers AI

- **agent-training-worker**: Sistema RAG
  - Treinamento de agentes personalizados
  - Queries RAG para respostas contextualizadas
  - Gerenciamento de conhecimento (D1 + Vectorize)

### **Database**

#### D1 Database (SQLite no Cloudflare)
- **prospects**: Dados de prospecção do Google Places
- **clientes**: Clientes cadastrados no oConnector
- **leads**: Leads capturados pelos bots
- **usuarios**: Sistema de autenticação
- **conhecimento**: Base de conhecimento para RAG

### **Inteligência Artificial**

#### Workers AI (Cloudflare)
- **Embeddings**: `@cf/baai/bge-base-en-v1.5`
- **LLM**: `@cf/meta/llama-3-8b-instruct`
- Geração de mensagens personalizadas
- Classificação automática de prospects
- Respostas contextualizadas via RAG

### **Bot WhatsApp**

#### WhatsApp Web.js
- Biblioteca: `whatsapp-web.js`
- Multi-tenant: suporta múltiplos clientes
- Integração com agent-training-worker
- Captura automática de leads
- Histórico de conversas

---

## 📊 FLUXO DE FUNCIONAMENTO

### **Fluxo 1: Onboarding de Cliente**

```
1. Cliente se cadastra no sistema
   ↓
2. Sistema prospecta empresas no Google Places
   ↓
3. Cliente escolhe quais prospects contratar
   ↓
4. Cliente fornece informações (FAQs, equipe, horários)
   ↓
5. Sistema treina agente IA personalizado
   ↓
6. Bot WhatsApp conectado e pronto para atender
```

### **Fluxo 2: Captura de Lead**

```
1. Cliente envia mensagem no WhatsApp
   ↓
2. Bot identifica qual cliente oConnector
   ↓
3. Bot consulta agente IA treinado (RAG)
   ↓
4. Agente gera resposta personalizada
   ↓
5. Bot responde ao cliente
   ↓
6. Se houver interesse, lead é salvo automaticamente
   ↓
7. Lead aparece no dashboard do cliente
```

### **Fluxo 3: Geração de Mensagens**

```
1. Sistema tem lista de prospects (imobiliárias)
   ↓
2. Para cada prospect, gera mensagem personalizada
   ↓
3. Mensagem usa IA para incluir:
   - Nome da empresa
   - Diferenciais relevantes
   - Call-to-action personalizado
   ↓
4. Mensagem pronta para envio
```

---

## 🎯 CASO DE USO PRINCIPAL

### **Para Imobiliárias:**

1. **Prospecção**: Encontrar todas as imobiliárias em uma cidade
2. **Contato**: Gerar mensagens personalizadas para cada uma
3. **Bot**: Imobiliária contrata oConnector e recebe bot WhatsApp
4. **Treinamento**: Sistema treina bot com informações da imobiliária
5. **Atendimento**: Bot atende clientes 24/7 no WhatsApp
6. **Leads**: Todos os leads são capturados automaticamente
7. **Gestão**: Imobiliária vê todos os leads no dashboard

---

## 💼 MODELO DE NEGÓCIO

### **SaaS Multi-tenant**
- Cada cliente paga uma mensalidade
- Planos: STARTER, PROFESSIONAL, ENTERPRISE
- Cada cliente tem seu próprio espaço isolado
- Sistema escalável para muitos clientes

---

## 🛠️ TECNOLOGIAS USADAS

### **Frontend**
- Next.js 16.0.1
- React 19.2.0
- TypeScript
- Tailwind CSS
- shadcn/ui

### **Backend**
- Cloudflare Workers (serverless)
- D1 Database (SQLite)
- Workers AI (IA)
- Vectorize (opcional, para RAG)

### **Integrações**
- Google Places API
- WhatsApp Web.js
- Workers AI (LLM + Embeddings)

### **Deploy**
- Cloudflare Pages (frontend)
- Cloudflare Workers (backend)
- Cloudflare D1 (database)

---

## 📈 STATUS ATUAL

### **85% Completo**

#### ✅ **Funcionando:**
- ✅ Backend API deployado
- ✅ Autenticação implementada
- ✅ Prospecção Google Places funcionando
- ✅ Database estruturado
- ✅ Frontend deployado
- ✅ Workers AI configurado
- ✅ Bot WhatsApp (código pronto)

#### ⏳ **Faltando (15%):**
- ⏳ Corrigir bug no training worker (5 min)
- ⏳ Integrar frontend com backend (1-2h)
- ⏳ Deploy bot WhatsApp em produção

---

## 🎯 PRÓXIMOS PASSOS

### **Para MVP Completo (2-3 horas):**
1. ✅ Autenticação (CONCLUÍDA)
2. ⏳ Corrigir bug training (5 min)
3. ⏳ Integrar frontend (1-2h)

### **Para Produção (1-2 semanas):**
- Landing page marketing completa
- Dashboard do cliente completo
- Testes end-to-end
- Deploy bot WhatsApp
- Sistema de notificações

---

## 📊 RESUMO EXECUTIVO

**O oConnector é:**
- 🤖 **Bot WhatsApp inteligente** com IA personalizada
- 📊 **Dashboard de gestão** de leads
- 🎯 **Sistema de prospecção** automática
- 🏢 **Plataforma SaaS** multi-tenant
- 🧠 **IA RAG** para respostas contextualizadas

**Ideal para:**
- Imobiliárias
- Negócios locais
- Empresas que querem atender clientes 24/7
- Quem quer capturar e gerenciar leads automaticamente

---

## 🔗 LINKS E INFORMAÇÕES

- **Frontend:** https://oconnector-frontend.pages.dev
- **API:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Training API:** https://agent-training-worker.xerifegomes-e71.workers.dev
- **Email:** dev@oconnector.tech

---

**Desenvolvido com ❤️ para automatizar e escalar negócios locais!** 🚀

