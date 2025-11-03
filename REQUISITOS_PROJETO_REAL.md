# 📋 REQUISITOS REAIS DO PROJETO oConnector

**Domínio:** oconnector.tech  
**Conceito:** Plataforma de Prospecção Inteligente B2B

---

## 🎯 VISÃO GERAL

**oConnector** é uma plataforma que:
- Mapeia empresas via Google Places
- Identifica oportunidades (tem/não tem site)
- Aborda via WhatsApp com IA personalizada
- Agente especializado em tecnologia e soluções

---

## ✅ O QUE JÁ TEMOS (Funcionando)

### 1. ✅ Backend API
- Google Places API integrada
- Prospecção funcionando
- Database estruturado
- Workers AI configurado

### 2. ✅ Sistema de Mapeamento
- Busca empresas por região/nicho
- Retorna dados completos
- Classificação automática

### 3. ✅ Bot WhatsApp
- Código completo criado
- Integração com backend

### 4. ✅ Workers AI
- LLM configurado
- Embeddings configurado

---

## ❌ O QUE PRECISA SER AJUSTADO

### 1. ❌ Landing Page oconnector.tech
**Status:** Não existe ainda

**Requisitos:**
- Landing page moderna e tecnológica
- Domínio: oconnector.tech
- Apresentar o oConnector como solução
- Design profissional

**Ação:**
- Criar landing page do zero
- Focar em tecnologia e inovação
- Design moderno

---

### 2. ❌ Identificação de Presença Digital
**Status:** Não implementado

**Requisitos:**
- Verificar se empresa TEM site
- Verificar se empresa NÃO TEM site
- Classificar por oportunidade (sem site = maior prioridade)

**Como fazer:**
```javascript
// Para cada empresa do Google Places:
const temSite = empresa.website && empresa.website.length > 0;
const oportunidade = temSite ? 'baixa' : 'alta';

// Salvar no banco:
await DB.prepare(`
  INSERT INTO prospects (
    nome, telefone, endereco, website, 
    tem_site, oportunidade, rating
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`).bind(...);
```

**Ação:**
- Adicionar campo `tem_site` (BOOLEAN)
- Adicionar campo `oportunidade` (alta/média/baixa)
- Filtrar empresas sem site como prioridade

---

### 3. ❌ Treinar Agente como "oConnector"
**Status:** Não treinado

**Requisitos:**
O agente deve ser treinado para ser:

**Nome:** oConnector  
**Especialidade:** Tecnologia e soluções para empresas  
**Personalidade:** Profissional, consultivo, humanizado

**Conhecimento:**
- Soluções tecnológicas para empresas
- Websites e presença digital
- Automação e sistemas
- Transformação digital
- Melhorias de processos

**Exemplo de treinamento:**
```javascript
{
  "nome_agente": "oConnector",
  "especialidade": "Tecnologia e Soluções para Empresas",
  "personalidade": "Profissional, consultivo e humanizado",
  "objetivo": "Identificar necessidades e oferecer soluções tecnológicas",
  
  "conhecimento": [
    "Sou o oConnector, especialista em tecnologia e soluções para empresas",
    "Ajudamos empresas a transformar seus negócios através da tecnologia",
    "Criamos websites, sistemas e automações personalizadas",
    "Identificamos oportunidades de melhoria através da tecnologia",
    "Abordagem consultiva e personalizada para cada cliente"
  ],
  
  "faqs": [
    {
      "pergunta": "O que é o oConnector?",
      "resposta": "Somos especialistas em tecnologia e soluções para empresas. Ajudamos negócios a crescer através da transformação digital."
    },
    {
      "pergunta": "Como vocês podem ajudar?",
      "resposta": "Criamos websites, sistemas personalizados, automações e soluções tecnológicas que aumentam eficiência e vendas."
    }
  ]
}
```

**Ação:**
- Criar script de treinamento
- Treinar agente com base de conhecimento
- Testar respostas

---

### 4. ❌ Geração de Abordagens Personalizadas
**Status:** Parcial

**Requisitos:**
Gerar mensagens personalizadas que:
- Usam nome da empresa
- Usam localização
- Usam rating/reviews
- Identificam necessidade (sem site)
- Oferecem solução específica
- São humanizadas (não spam)

**Exemplo:**
```javascript
async function gerarAbordagem(empresa) {
  const prompt = `
Você é o oConnector, especialista em tecnologia e soluções para empresas.
Aborde a empresa ${empresa.nome} de forma profissional e humanizada.

Dados da empresa:
- Nome: ${empresa.nome}
- Localização: ${empresa.cidade}, ${empresa.estado}
- Rating: ${empresa.rating} ⭐
- ${empresa.tem_site ? 'TEM site' : 'NÃO TEM site'}

Crie uma abordagem:
- Profissional e consultiva
- Identifique a necessidade (especialmente se não tem site)
- Ofereça solução específica
- Seja humanizado, não robótico
- Convide para conversa

Máximo 300 palavras.
  `;
  
  const resposta = await AI.run('@cf/meta/llama-3-8b-instruct', {
    messages: [{ role: 'user', content: prompt }]
  });
  
  return resposta.response;
}
```

**Ação:**
- Criar função de geração de abordagem
- Integrar com Workers AI
- Testar diferentes cenários

---

### 5. ❌ Filtragem e Priorização
**Status:** Não implementado

**Requisitos:**
- Priorizar empresas SEM site
- Filtrar por região específica
- Ordenar por oportunidade (alta/média/baixa)

**Ação:**
- Adicionar lógica de priorização
- Criar endpoint de listagem filtrada
- Dashboard mostrando oportunidades

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Ajustes Backend (2-3h)**
- [ ] Adicionar campo `tem_site` na tabela prospects
- [ ] Adicionar campo `oportunidade` na tabela prospects
- [ ] Implementar verificação de website
- [ ] Criar lógica de priorização
- [ ] Endpoint para listar empresas sem site

### **Fase 2: Treinar Agente (1h)**
- [ ] Criar base de conhecimento do oConnector
- [ ] Treinar agente com personalidade e expertise
- [ ] Testar respostas do agente

### **Fase 3: Geração de Abordagens (2h)**
- [ ] Criar função de geração de abordagem personalizada
- [ ] Integrar com Workers AI
- [ ] Testar diferentes cenários
- [ ] Ajustar tom e personalidade

### **Fase 4: Landing Page (4-6h)**
- [ ] Criar landing page moderna
- [ ] Design tecnológico e profissional
- [ ] Deploy no domínio oconnector.tech
- [ ] SEO e otimizações

### **Fase 5: Dashboard (2-3h)**
- [ ] Dashboard de oportunidades
- [ ] Filtrar empresas sem site
- [ ] Métricas de prospecção
- [ ] Histórico de abordagens

---

## 🚀 PRÓXIMAS AÇÕES IMEDIATAS

1. **Ajustar schema do banco** (adicionar `tem_site`, `oportunidade`)
2. **Implementar verificação de website** no mapeamento
3. **Treinar agente oConnector** com base de conhecimento
4. **Criar função de geração de abordagem** personalizada
5. **Criar landing page** oconnector.tech

---

**Agora está claro! Vamos ajustar o projeto para essa visão correta!** 🎯

