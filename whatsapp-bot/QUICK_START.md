# 🚀 Quick Start - WhatsApp Bot

## Instalação Rápida

```bash
# 1. Entrar no diretório
cd whatsapp-bot

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
# Edite .env se necessário

# 4. Iniciar bot
npm start
```

## Primeira Execução

1. **Execute o bot:**
   ```bash
   npm start
   ```

2. **Escanear QR Code:**
   - Um QR Code aparecerá no terminal
   - Abra o WhatsApp no celular
   - Vá em: **Menu (⋯) → Aparelhos conectados → Conectar um aparelho**
   - Escaneie o QR Code

3. **Aguardar conexão:**
   - Aguarde a mensagem: `✅ WhatsApp Bot conectado e pronto!`

## Verificar se Funciona

### 1. Verificar Cliente no Banco

O bot precisa que o número WhatsApp esteja cadastrado na tabela `clientes`:

```sql
-- Verificar cliente
SELECT id, nome_imobiliaria, whatsapp_numero 
FROM clientes 
WHERE whatsapp_numero LIKE '%22999999999%';
```

### 2. Treinar Cliente (se necessário)

```bash
cd ../backend-deployment
./test-treinar.sh 1
```

### 3. Enviar Mensagem de Teste

Envie uma mensagem para o número conectado do WhatsApp e veja o bot responder!

## Estrutura de Arquivos

```
whatsapp-bot/
├── src/
│   ├── index.js           # Entry point
│   ├── bot.js             # Classe principal
│   ├── message-handler.js # Handler de mensagens
│   ├── ai-agent.js        # Integração com agent-training-worker
│   ├── cliente-manager.js # Gerenciamento de clientes
│   ├── lead-manager.js    # Gerenciamento de leads
│   └── config.js          # Configurações
├── .wwebjs_auth/          # Sessão WhatsApp (gerado automaticamente)
├── logs/                  # Logs do bot
├── package.json
├── .env.example
└── README.md
```

## Comandos Úteis

```bash
# Iniciar
npm start

# Modo desenvolvimento (com watch)
npm run dev

# Ver logs em tempo real
tail -f logs/whatsapp-bot.log

# Parar (Ctrl+C)
```

## Troubleshooting

### Bot não conecta
- Remova `.wwebjs_auth/`
- Execute `npm start` novamente
- Escaneie novo QR Code

### "Número não associado a cliente"
- Verifique se o número está na tabela `clientes`
- Campo `whatsapp_numero` deve conter apenas dígitos
- Cliente deve estar ativo

### Respostas genéricas
- Verifique se cliente foi treinado:
  ```bash
  curl https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/1
  ```
- Treine o cliente se necessário

## Próximos Passos

1. ✅ Bot configurado e funcionando
2. ⏳ Treinar clientes
3. ⏳ Testar respostas personalizadas
4. ⏳ Monitorar logs

---

**Pronto para uso!** 🎉

