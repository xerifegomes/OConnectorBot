# 🔄 Reiniciar Bot para Aplicar Correções

## ⚠️ Importante

O bot precisa ser **reiniciado** para aplicar as correções que foram feitas no código.

## 🚀 Como Reiniciar

### Opção 1: Reiniciar Manualmente (Recomendado)

```bash
# 1. Parar o bot atual
cd whatsapp-bot
pkill -f "node.*src/index.js"
pkill -f "node.*src/bot-server.js"

# 2. Aguardar alguns segundos
sleep 2

# 3. Iniciar novamente
npm start
```

### Opção 2: Se estiver usando PM2

```bash
cd whatsapp-bot
pm2 restart oconnector-whatsapp-bot
pm2 logs oconnector-whatsapp-bot
```

### Opção 3: Se estiver usando bot-server.js

```bash
cd whatsapp-bot
pkill -f bot-server.js
npm run server
# ou
node src/bot-server.js
```

## ✅ Verificar se Funcionou

Após reiniciar, verifique os logs. Deve aparecer:

```
✅ Bot configurado - Cliente ID: 4 (Número: 5522992363462)
```

E quando alguém enviar mensagem, **NÃO deve aparecer** o erro:
```
❌ TypeError: whatsappNumber.replace is not a function
```

## 📝 Correções Aplicadas

1. ✅ Bot aceita mensagens de qualquer número
2. ✅ Cliente identificado pelo número do bot
3. ✅ Erro no getGreeting corrigido
4. ✅ Tratamento de erros do Workers AI melhorado

## 🔍 Se Ainda Tiver Problemas

1. Verifique se o arquivo foi salvo corretamente
2. Verifique se não há processos antigos rodando: `ps aux | grep node`
3. Limpe o cache se necessário: `rm -rf whatsapp-bot/node_modules/.cache`
4. Reinicie novamente

