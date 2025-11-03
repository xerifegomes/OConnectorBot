# 🤖 oConnector WhatsApp Bot

Bot WhatsApp inteligente integrado com agent-training-worker para respostas contextualizadas usando IA.

---

## 🚀 Funcionalidades

- ✅ **Respostas Inteligentes**: Integrado com agent-training-worker para respostas personalizadas por cliente
- ✅ **Multi-tenant**: Suporta múltiplos clientes simultaneamente
- ✅ **Captura de Leads**: Salva automaticamente novos leads no sistema
- ✅ **RAG (Retrieval-Augmented Generation)**: Usa conhecimento específico de cada cliente
- ✅ **Cache Inteligente**: Cache de respostas para melhor performance
- ✅ **Histórico de Conversas**: Mantém contexto das conversas
- ✅ **Logs Estruturados**: Sistema de logging completo

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- WhatsApp Business ou WhatsApp pessoal (para escanear QR Code)
- Conta Cloudflare com agent-training-worker deployado

---

## 🛠️ Instalação

```bash
# Entrar no diretório
cd whatsapp-bot

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

---

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
# URLs das APIs
AGENT_TRAINING_API_URL=https://agent-training-worker.xerifegomes-e71.workers.dev
OCONNECTOR_API_URL=https://oconnector-api.xerifegomes-e71.workers.dev

# Caminho da sessão WhatsApp (gerado automaticamente)
WHATSAPP_SESSION_PATH=./.wwebjs_auth

# Configurações
AUTO_REPLY=true
ENABLE_AI_RESPONSES=true
LOG_LEVEL=info
```

---

## 🚀 Executar

```bash
# Modo produção
npm start

# Modo desenvolvimento (com watch)
npm run dev
```

**Primeira execução:**
1. Um QR Code será exibido no terminal
2. Abra o WhatsApp no celular
3. Vá em: **Menu → Aparelhos conectados → Conectar um aparelho**
4. Escaneie o QR Code
5. Aguarde a mensagem "✅ WhatsApp Bot conectado e pronto!"

---

## 📊 Fluxo de Funcionamento

### 1. Mensagem Recebida
```
Cliente envia mensagem → Bot recebe
```

### 2. Identificação do Cliente
```
Bot identifica número WhatsApp → Busca cliente_id no banco
```

### 3. Primeira Mensagem (Novo Lead)
```
Salva lead automaticamente → Envia saudação personalizada
```

### 4. Resposta IA
```
Faz query no agent-training-worker → Obtém resposta contextualizada → Envia resposta
```

### 5. Histórico
```
Mantém histórico da conversa → Usa para contexto nas próximas mensagens
```

---

## 🔧 Estrutura do Projeto

```
whatsapp-bot/
├── src/
│   ├── index.js          # Entrada principal
│   ├── bot.js            # Classe principal do bot
│   ├── message-handler.js # Handler de mensagens
│   ├── ai-agent.js       # Integração com agent-training-worker
│   ├── cliente-manager.js # Gerenciamento de clientes
│   ├── lead-manager.js   # Gerenciamento de leads
│   └── config.js         # Configurações
├── .wwebjs_auth/         # Sessão WhatsApp (gerado automaticamente)
├── logs/                 # Logs do bot
├── package.json
├── .env.example
└── README.md
```

---

## 📝 Mapeamento Cliente → WhatsApp

Para que o bot funcione, é necessário que o número WhatsApp esteja associado a um cliente no banco.

### Opção 1: Via API (Recomendado)

O bot busca automaticamente o cliente pelo campo `whatsapp_numero` na tabela `clientes`.

### Opção 2: Manual (Desenvolvimento)

Você pode adicionar mapeamento manual editando o código (não recomendado para produção).

---

## 🧪 Testes

```bash
# Testar conexão com APIs
npm test
```

---

## 📊 Monitoramento

### Logs

Os logs são salvos em:
- Console (tempo real)
- `logs/whatsapp-bot.log` (arquivo)

### Métricas

O bot registra:
- Mensagens recebidas/enviadas
- Leads capturados
- Erros e exceções
- Tempo de resposta do agente IA

---

## 🔒 Segurança

- ✅ Sessão WhatsApp armazenada localmente (`.wwebjs_auth`)
- ✅ Não compartilhe a pasta `.wwebjs_auth`
- ✅ Use variáveis de ambiente para secrets
- ✅ Validação de cliente antes de responder

---

## 🐛 Troubleshooting

### Bot não conecta

1. Remova a pasta `.wwebjs_auth`
2. Execute `npm start` novamente
3. Escaneie o novo QR Code

### "Número não associado a cliente"

1. Verifique se o número está na tabela `clientes`
2. Campo `whatsapp_numero` deve conter o número (apenas dígitos)
3. Cliente deve estar ativo (`status = 'ativo'`)

### Respostas genéricas

1. Verifique se o cliente foi treinado:
   ```bash
   curl https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/CLIENTE_ID
   ```
2. Treine o cliente se necessário
3. Verifique logs para erros específicos

---

## 🚀 Deploy em Produção

### Opção 1: VPS (Recomendado)

- Railway, DigitalOcean, Contabo, etc.
- PM2 para gerenciar processo:
  ```bash
  npm install -g pm2
  pm2 start src/index.js --name oconnector-bot
  pm2 save
  pm2 startup
  ```

### Opção 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

---

## 📈 Próximas Melhorias

- [ ] Suporte a mídias (imagens, documentos)
- [ ] Botões interativos
- [ ] Lista de mensagens
- [ ] Agendamento de mensagens
- [ ] Dashboard de monitoramento
- [ ] Webhook para notificações
- [ ] Suporte a múltiplas sessões (vários números)

---

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação completa em `BACKEND_DEPLOYMENT_GUIDE.md`.

---

**Desenvolvido para oConnector** 🚀

