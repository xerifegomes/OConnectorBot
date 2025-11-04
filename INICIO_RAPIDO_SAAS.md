# 🚀 Início Rápido - oConnector Tech (SaaS)

## 🎯 Para Começar a Vender Agora

Este guia mostra como usar a plataforma oConnector Tech para **vender soluções de automação** para seus clientes.

---

## 📋 Checklist Inicial

### ✅ Pré-requisitos
- [ ] Cloudflare Workers configurados e funcionando
- [ ] Google Places API Key configurada
- [ ] Bot WhatsApp configurado e rodando
- [ ] Dashboard acessível

### ✅ URLs de Produção
- **Dashboard:** https://oconnector.xerifegomes-e71.workers.dev
- **API:** https://oconnector-api.xerifegomes-e71.workers.dev
- **Agente IA:** https://agent-training-worker.xerifegomes-e71.workers.dev

---

## 🎯 Fluxo Completo: Do Cliente ao Lead

### 1️⃣ **Onboardar Novo Cliente**

Execute o script de onboarding:

```bash
./onboard-cliente.sh
```

O script vai:
1. ✅ Coletar dados da empresa do cliente
2. ✅ Criar registro no sistema
3. ✅ Treinar agente IA personalizado
4. ✅ Configurar WhatsApp

**Tempo:** 5-10 minutos  
**Resultado:** Cliente pronto para receber leads

---

### 2️⃣ **Fazer Prospecção para o Cliente**

Busque leads qualificados para o cliente:

```bash
./prospectar-para-cliente.sh <cliente_id> "nicho" "cidade" "estado"
```

**Exemplos:**

```bash
# Para uma imobiliária no Rio
./prospectar-para-cliente.sh 1 "imobiliária" "Rio de Janeiro" "RJ"

# Para um salão em São Paulo
./prospectar-para-cliente.sh 2 "salão de beleza" "São Paulo" "SP"

# Para uma clínica em Belo Horizonte
./prospectar-para-cliente.sh 3 "clínica médica" "Belo Horizonte" "MG"
```

O script vai:
1. ✅ Buscar prospects no Google Places
2. ✅ Classificar por potencial (A/B/C)
3. ✅ Gerar mensagens personalizadas
4. ✅ Salvar no banco de dados

**Resultado:** Lista de prospects prontos para contato

---

### 3️⃣ **Enviar Mensagens via WhatsApp**

#### Opção A: Via Dashboard (Recomendado)

1. Acesse: https://oconnector.xerifegomes-e71.workers.dev/prospects
2. Selecione o cliente
3. Veja os prospects encontrados
4. Clique em "Enviar para Bot" para cada prospect
5. O bot enviará mensagem personalizada automaticamente

#### Opção B: Via Bot Diretamente

O bot WhatsApp já está configurado e pode enviar mensagens automaticamente quando você enviar via API.

---

### 4️⃣ **Agente IA Faz Triagem**

Quando o prospect responde:
1. ✅ Agente IA identifica o cliente
2. ✅ Responde com informações personalizadas
3. ✅ Qualifica o interesse
4. ✅ Captura lead se houver interesse
5. ✅ Encaminha para humano se for lead quente

**Tudo automático!** 🎉

---

### 5️⃣ **Monitorar Resultados**

Acesse o dashboard para ver:
- 📊 Leads captados
- 💬 Conversas ativas
- 📈 Taxa de conversão
- 📱 Status dos envios
- 💰 ROI por cliente

**URL:** https://oconnector.xerifegomes-e71.workers.dev/dashboard

---

## 🎯 Exemplo Prático Completo

### Cenário: Onboarding de Imobiliária

```bash
# 1. Onboardar cliente
./onboard-cliente.sh

# Preencha:
# - Nome: Imobiliária Silva
# - WhatsApp: 21999999999
# - Segmento: imobiliária
# - FAQ: 5 perguntas/respostas
# - Plano: PROFESSIONAL

# Resultado: Cliente ID = 1

# 2. Prospecção
./prospectar-para-cliente.sh 1 "imobiliária" "Iguaba Grande" "RJ"

# Resultado: 25 prospects encontrados, mensagens geradas

# 3. Enviar mensagens via dashboard
# Acesse: https://oconnector.xerifegomes-e71.workers.dev/prospects
# Clique em "Enviar para Bot" para cada prospect

# 4. Monitorar
# Acesse: https://oconnector.xerifegomes-e71.workers.dev/leads
# Veja leads sendo captados em tempo real
```

---

## 📊 Scripts Disponíveis

### Gerenciamento de Clientes

| Script | Descrição |
|--------|-----------|
| `onboard-cliente.sh` | Onboardar novo cliente (criar + treinar) |
| `treinar-agente.sh` | Re-treinar agente de um cliente |
| `testar-agente.sh <cliente_id>` | Testar agente do cliente |

### Prospecção

| Script | Descrição |
|--------|-----------|
| `prospectar-para-cliente.sh <id> <nicho> <cidade> <estado>` | Prospectar para cliente específico |
| `prospectar-leads.sh <nicho> <cidade> <estado>` | Prospectar genérico |

### Gestão

| Script | Descrição |
|--------|-----------|
| `configurar-empresa.sh` | Configurar sua própria empresa (admin) |

---

## 🎯 Processo de Vendas

### 1. **Prospectar Cliente Potencial**

Use o próprio sistema para prospectar:
```bash
# Buscar imobiliárias sem site
./prospectar-leads.sh "imobiliária" "Sua Cidade" "SEU_ESTADO"
```

### 2. **Abordar Cliente**

Envie mensagem via WhatsApp oferecendo:
- ✅ Automação de prospecção
- ✅ Agente IA para atendimento
- ✅ Captação de leads 24/7
- ✅ Dashboard de gestão

### 3. **Demo Rápida**

Mostre:
- Dashboard funcionando
- Exemplo de agente IA
- Case de sucesso (mesmo que seja seu próprio caso)

### 4. **Fechar Venda**

- Plano STARTER: R$ 497/mês
- Plano PROFESSIONAL: R$ 997/mês
- Setup: R$ 997 (one-time)

### 5. **Onboardar**

```bash
./onboard-cliente.sh
```

### 6. **Entregar Resultados**

- Fazer prospecção inicial
- Enviar primeiras mensagens
- Mostrar leads captados
- Renovação garantida!

---

## 📈 Métricas Importantes

### Para o Cliente
- **Leads captados/mês**
- **Taxa de conversão**
- **ROI** (retorno sobre investimento)

### Para Você
- **MRR** (receita recorrente mensal)
- **CAC** (custo de aquisição)
- **Churn** (taxa de cancelamento)

---

## 🚀 Próximos Passos

1. ✅ **Onboardar primeiro cliente** (beta/teste)
2. ✅ **Validar processo** completo
3. ✅ **Refinar scripts** e documentação
4. ✅ **Começar a vender** ativamente
5. ✅ **Escalar** vendas

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte `MODELO_NEGOCIO_SAAS.md` para visão geral
- Consulte `README_USO_SIMPLIFICADO.md` para detalhes técnicos
- Verifique logs do Cloudflare Workers

---

**🎯 Lembre-se:** O objetivo é **automatizar** para que você possa **escalar** e **vender** para dezenas/hundreds de clientes!

