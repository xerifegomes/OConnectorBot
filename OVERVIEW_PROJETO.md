# 📋 Visão Geral do Projeto oConnector

## 🎯 O que é o oConnector?

O **oConnector** é uma **plataforma SaaS multi-tenant** completa para **automação de prospecção e captação de leads** usando **WhatsApp**, **IA (Inteligência Artificial)** e **integração com Google Places**.

É um sistema que permite que empresas (principalmente imobiliárias e negócios locais) automatizem:
- ✅ Prospecção de clientes via Google Places
- ✅ Atendimento automatizado via WhatsApp com IA
- ✅ Gestão de leads e conversas
- ✅ Respostas inteligentes e contextualizadas

---

## 🚀 Funcionalidades Principais

### 1. 🤖 Bot WhatsApp Inteligente
- **Atendimento automatizado 24/7** com IA
- Respostas personalizadas por cliente usando **RAG (Retrieval-Augmented Generation)**
- Captura automática de leads
- Multi-tenant (suporta múltiplos clientes simultaneamente)
- Histórico de conversas e contexto

### 2. 📍 Prospecção Automatizada
- **Mapeamento de empresas** via Google Places API
- Busca por localização, tipo de negócio, nicho
- Classificação automática usando IA
- Geração de mensagens personalizadas para prospecção

### 3. 🎯 Dashboard Completo
- Gestão de leads
- Visualização de prospects
- Monitoramento de conversas WhatsApp
- Estatísticas e métricas

### 4. 🧠 IA Contextual (RAG)
- **Treinamento de agentes personalizados** por cliente
- Respostas baseadas no conhecimento específico de cada empresa
- Usa **Workers AI da Cloudflare** (Llama 3)
- Sistema de embeddings para busca semântica

---

## 🏗️ Arquitetura do Sistema

### **Frontend (Next.js 16)**
```
📱 oconnector-frontend/
├── Landing page profissional
├── Dashboard administrativo
├── Gestão de leads e prospects
└── Interface de integração WhatsApp
```

**URL:** https://oconnector.xerifegomes-e71.workers.dev

### **Backend (Cloudflare Workers)**
```
⚙️ workers/
├── oconnector-api/          # API REST principal
│   ├── CRUD de clientes, leads, prospects
│   ├── Integração Google Places
│   └── Geração de mensagens IA
│
└── agent-training-worker/   # Agente IA especializado
    ├── Treinamento RAG
    ├── Query contextualizada
    └── Sistema de embeddings
```

**URLs:**
- API: https://oconnector-api.xerifegomes-e71.workers.dev
- Agente IA: https://agent-training-worker.xerifegomes-e71.workers.dev

### **Bot WhatsApp**
```
🤖 whatsapp-bot/
├── Servidor local (whatsapp-web.js)
├── Integração com Workers AI
├── Gerenciamento de conversas
└── Captura automática de leads
```

### **Banco de Dados**
- **D1 Database** (SQLite serverless) - Cloudflare
- Tabelas: `clientes`, `leads`, `prospects`, `conhecimento`

---

## 🔄 Fluxo de Funcionamento

### 1. **Prospecção**
```
1. Usuário busca empresas no Google Places (ex: "Imobiliárias em Iguaba Grande")
2. Sistema classifica e organiza os prospects
3. Gera mensagens personalizadas usando IA
4. Pronto para enviar via WhatsApp
```

### 2. **Atendimento Automatizado**
```
1. Cliente envia mensagem no WhatsApp
2. Bot identifica o cliente (multi-tenant)
3. Busca contexto no agent-training-worker (RAG)
4. Gera resposta personalizada usando IA
5. Salva lead automaticamente (se for novo contato)
6. Envia resposta contextualizada
```

### 3. **Treinamento de Agente**
```
1. Cliente preenche informações (empresa, serviços, FAQ)
2. Sistema processa e cria embeddings
3. Salva conhecimento no banco (D1)
4. Agente fica pronto para responder perguntas específicas
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes)

### Backend
- **Cloudflare Workers** (serverless)
- **D1 Database** (SQLite serverless)
- **Workers AI** (Llama 3, Embeddings BGE)
- **Vectorize** (opcional, busca vetorial)

### Bot
- **whatsapp-web.js** (integração WhatsApp)
- **Express.js** (servidor)
- **Node.js 18+**

### IA
- **Llama 3** (via Workers AI) - Geração de texto
- **BGE Embeddings** - Busca semântica
- **RAG** - Retrieval-Augmented Generation

---

## 👥 Caso de Uso Principal

### **Para Imobiliárias e Negócios Locais**

1. **Cliente se cadastra** no sistema
2. **Treina seu agente** com informações da empresa:
   - Nome, horários, diferenciais
   - Corretores e especialidades
   - FAQ (perguntas frequentes)
   - Tom de voz personalizado

3. **Sistema prospecta** empresas via Google Places
4. **Bot atende** automaticamente no WhatsApp:
   - Responde perguntas sobre horários
   - Informa sobre serviços
   - Captura leads automaticamente
   - Agenda visitas (futuro)

5. **Dashboard** mostra:
   - Leads capturados
   - Conversas realizadas
   - Prospects encontrados
   - Estatísticas

---

## 📊 Benefícios

### Para o Negócio
- ✅ **Automação completa** do atendimento
- ✅ **Prospecção inteligente** via Google Places
- ✅ **Redução de custos** com atendimento 24/7
- ✅ **Escalabilidade** (multi-tenant)
- ✅ **IA contextual** para respostas personalizadas

### Para o Cliente Final
- ✅ **Atendimento rápido** 24/7
- ✅ **Respostas precisas** sobre a empresa
- ✅ **Experiência personalizada**
- ✅ **Facilidade de contato** via WhatsApp

---

## 🔐 Segurança e Infraestrutura

- ✅ **Multi-tenancy** - Isolamento de dados por cliente
- ✅ **Autenticação JWT**
- ✅ **Serverless** - Escalável automaticamente
- ✅ **Backup automático** (D1 Database)
- ✅ **Rate limiting** e proteções

---

## 📈 Status Atual

### ✅ Funcionando
- Frontend deployado
- API REST funcionando
- Agent Training Worker online
- Integração com Google Places
- Sistema de autenticação

### 🚧 Em Desenvolvimento
- Melhorias no bot WhatsApp
- Novas funcionalidades de dashboard
- Integrações adicionais

---

## 🎯 Próximos Passos

1. **Melhorias no Bot**
   - Suporte a mídias (imagens, documentos)
   - Botões interativos
   - Agendamento de mensagens

2. **Analytics**
   - Dashboard de métricas
   - Relatórios de conversão
   - Análise de conversas

3. **Integrações**
   - CRM externo
   - Calendário para agendamentos
   - Webhooks para notificações

---

## 📞 Informações de Deploy

### URLs de Produção
- **Frontend:** https://oconnector.xerifegomes-e71.workers.dev
- **API:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Agente IA:** https://agent-training-worker.xerifegomes-e71.workers.dev

### Conta Cloudflare
- **Account ID:** `e71984852bedaf5f21cef5d949948498`
- **Zone ID:** `ea6add9629baf26c4d974cf4c1953511`

---

## 📝 Resumo Executivo

O **oConnector** é uma **plataforma completa de automação** que combina:
- 🤖 **IA Avançada** (RAG + Llama 3)
- 📱 **WhatsApp** (canal mais usado no Brasil)
- 📍 **Google Places** (prospecção inteligente)
- ☁️ **Cloudflare** (infraestrutura serverless)

**Objetivo:** Automatizar completamente o processo de prospecção e atendimento para empresas locais, especialmente imobiliárias, reduzindo custos e aumentando eficiência.

**Diferencial:** Sistema de IA contextual que aprende informações específicas de cada cliente e responde de forma personalizada, mantendo a qualidade do atendimento humano.

---

**Desenvolvido para transformar o atendimento ao cliente através de IA e automação** 🚀

