# 🚀 Guia de Uso Simplificado - oConnector

**Para uso único da sua empresa de tecnologia**

Este guia simplifica o uso do oConnector para sua empresa, focando em:
1. ✅ Buscar leads via Google Places
2. ✅ Treinar agente IA para abordagem personalizada
3. ✅ Enviar mensagens via WhatsApp

---

## 📋 Pré-requisitos

- ✅ Cloudflare Workers configurados e funcionando
- ✅ Google Places API Key configurada
- ✅ Node.js 18+ instalado
- ✅ WhatsApp Business ou pessoal

---

## 🎯 Passo a Passo

### 1️⃣ Configurar Dados da Empresa

Primeiro, configure as informações da sua empresa que serão usadas para treinar o agente:

```bash
chmod +x configurar-empresa.sh
./configurar-empresa.sh
```

O script vai solicitar:
- Nome da empresa
- WhatsApp
- Endereço
- Horário de funcionamento
- Diferenciais
- Equipe (opcional)
- FAQ (perguntas e respostas frequentes)

**Arquivo criado:** `config-empresa.json`

---

### 2️⃣ Treinar o Agente IA

Treine o agente com as informações da sua empresa:

```bash
chmod +x treinar-agente.sh
./treinar-agente.sh
```

O agente será treinado usando o **agent-training-worker** e estará pronto para responder perguntas sobre sua empresa de forma personalizada.

**Tempo estimado:** 10-30 segundos

---

### 3️⃣ Testar o Agente

Teste se o agente está funcionando:

```bash
chmod +x testar-agente.sh

# Teste padrão
./testar-agente.sh

# Ou teste com pergunta customizada
./testar-agente.sh 1 "Qual o horário de funcionamento?"
./testar-agente.sh 1 "Quais serviços vocês oferecem?"
```

---

### 4️⃣ Buscar Leads via Google Places

Procure empresas potenciais para contato:

```bash
chmod +x prospectar-leads.sh

# Busca padrão (empresas de tecnologia no Rio de Janeiro)
./prospectar-leads.sh

# Busca customizada
./prospectar-leads.sh "desenvolvimento de software" "São Paulo" "SP"
./prospectar-leads.sh "consultoria em TI" "Belo Horizonte" "MG"
```

Os resultados serão salvos no banco de dados e poderão ser visualizados no dashboard.

---

### 5️⃣ Iniciar Bot WhatsApp

Inicie o bot para começar a enviar mensagens:

```bash
cd whatsapp-bot
npm install  # Se ainda não instalou
npm start
```

**Primeira vez:**
1. Um QR Code será exibido no terminal
2. Abra o WhatsApp no celular
3. Vá em: **Menu → Aparelhos conectados → Conectar um aparelho**
4. Escaneie o QR Code
5. Aguarde a mensagem "✅ WhatsApp Bot conectado e pronto!"

---

### 6️⃣ Enviar Mensagens

#### Via Dashboard (Recomendado)

1. Acesse: https://oconnector.xerifegomes-e71.workers.dev/prospects
2. Veja os prospects encontrados
3. Clique em "Enviar para Bot" para cada prospect
4. O bot enviará mensagens personalizadas usando o agente IA

#### Via API (Programático)

```bash
# Enviar mensagem para um prospect específico
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "22999999999",
    "mensagem": "Olá! Gostaria de apresentar nossos serviços..."
  }'
```

---

## 🔄 Fluxo Completo

```
1. Configurar Empresa → ./configurar-empresa.sh
   ↓
2. Treinar Agente → ./treinar-agente.sh
   ↓
3. Testar Agente → ./testar-agente.sh
   ↓
4. Buscar Leads → ./prospectar-leads.sh
   ↓
5. Iniciar Bot → cd whatsapp-bot && npm start
   ↓
6. Enviar Mensagens → Via dashboard ou API
   ↓
7. Bot Responde → Automaticamente usando IA
```

---

## 📊 Estrutura de Arquivos

```
OCON/
├── config-empresa.json          # Configuração da sua empresa
├── configurar-empresa.sh        # Script de configuração
├── treinar-agente.sh            # Script de treinamento
├── testar-agente.sh             # Script de teste
├── prospectar-leads.sh          # Script de prospecção
├── whatsapp-bot/                # Bot WhatsApp
│   ├── src/
│   │   ├── bot.js              # Bot principal
│   │   └── message-handler.js  # Handler de mensagens
│   └── package.json
└── README_USO_SIMPLIFICADO.md  # Este arquivo
```

---

## 🎯 Configuração do WhatsApp

O bot precisa estar associado a um número WhatsApp. Configure no arquivo `config-empresa.json`:

```json
{
  "whatsapp": "22999999999"  // Apenas números, sem formatação
}
```

O bot automaticamente identifica mensagens recebidas e responde usando o agente IA treinado.

---

## 🧪 Testes Rápidos

### Verificar se o agente está treinado:

```bash
curl https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/1
```

### Testar pergunta ao agente:

```bash
curl -X POST https://agent-training-worker.xerifegomes-e71.workers.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "pergunta": "Qual o horário de funcionamento?"
  }'
```

### Verificar leads encontrados:

```bash
curl https://oconnector-api.xerifegomes-e71.workers.dev/api/prospects
```

---

## ⚙️ Personalização

### Modificar Tom de Voz

Edite `config-empresa.json`:

```json
{
  "tom_voz": "amigavel",  // opções: "amigavel", "profissional", "descontraido"
  "usar_emojis": "moderado"  // opções: "nenhum", "moderado", "bastante"
}
```

Depois, execute novamente: `./treinar-agente.sh`

### Adicionar Mais FAQs

1. Edite `config-empresa.json`
2. Adicione perguntas e respostas no array
3. Execute: `./treinar-agente.sh`

---

## 📱 Dashboard

Acesse o dashboard para:
- 📊 Ver todos os prospects encontrados
- 📝 Ver leads capturados
- 💬 Ver conversas do WhatsApp
- 📈 Ver estatísticas

**URL:** https://oconnector.xerifegomes-e71.workers.dev

---

## 🐛 Troubleshooting

### Agente não responde

```bash
# Verificar se está treinado
./testar-agente.sh

# Re-treinar se necessário
./treinar-agente.sh
```

### Bot não conecta

```bash
cd whatsapp-bot
rm -rf .wwebjs_auth  # Remover sessão antiga
npm start            # Reconectar
```

### Nenhum prospect encontrado

- Verifique se a Google Places API Key está configurada
- Tente ajustar os parâmetros de busca (nicho, cidade)
- Verifique os logs do Cloudflare Workers

---

## 🚀 Próximos Passos

1. ✅ Configure sua empresa
2. ✅ Treine o agente
3. ✅ Busque leads
4. ✅ Inicie o bot
5. ✅ Comece a enviar mensagens!

---

**Dúvidas?** Consulte a documentação completa em `README.md`

