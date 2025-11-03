# 🏠 Deploy Local - Bot WhatsApp Server

## 🚀 Início Rápido

### **1. Configurar Ambiente**

```bash
cd whatsapp-bot

# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env (se necessário)
nano .env
```

### **2. Instalar Dependências**

```bash
npm install
```

### **3. Iniciar Bot Server**

**Opção A - Script automático:**
```bash
chmod +x start-local.sh
./start-local.sh
```

**Opção B - Manual:**
```bash
npm run server
```

**Opção C - Modo desenvolvimento:**
```bash
npm run dev:server
```

---

## 📱 URLs Locais

Após iniciar, o bot estará disponível em:

- **QR Code:** http://localhost:3001/qr
- **Status:** http://localhost:3001/status
- **Info:** http://localhost:3001/info
- **Restart:** POST http://localhost:3001/restart

---

## 🌐 Acessar de Outros Dispositivos

### **Opção 1: ngrok (Recomendado)**

Instalar ngrok:
```bash
# macOS
brew install ngrok

# ou baixar de: https://ngrok.com/download
```

Iniciar túnel:
```bash
ngrok http 3001
```

Você receberá uma URL pública, exemplo:
```
https://abc123.ngrok.io → http://localhost:3001
```

**Atualizar Worker:**
No `wrangler.toml` ou via dashboard:
```
WHATSAPP_BOT_SERVER_URL=https://abc123.ngrok.io
```

---

### **Opção 2: IP Local da Rede**

Descobrir IP local:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# ou
ipconfig getifaddr en0  # macOS
```

Acessar de outros dispositivos na mesma rede:
```
http://192.168.1.XXX:3001/qr
```

**Atualizar Worker:**
Se seu Worker tiver acesso à mesma rede (improvável), use o IP local.

---

## ⚙️ Configuração do Worker

### **Opção 1: Usar ngrok**

1. Iniciar ngrok: `ngrok http 3001`
2. Copiar URL pública (ex: `https://abc123.ngrok.io`)
3. Adicionar no `wrangler.toml`:

```toml
[vars]
WHATSAPP_BOT_SERVER_URL=https://abc123.ngrok.io
```

4. Deploy:
```bash
cd workers/oconnector-api
wrangler deploy
```

### **Opção 2: Desabilitar Proxy (apenas local)**

Para testar apenas localmente, você pode modificar `whatsapp-bot-handler.js` para:
- Primeiro tentar bot server
- Se falhar, retornar erro informativo

---

## 🔧 Manter Bot Rodando

### **Usando PM2 (Recomendado)**

Instalar PM2:
```bash
npm install -g pm2
```

Iniciar com PM2:
```bash
pm2 start src/bot-server.js --name whatsapp-bot
```

Comandos úteis:
```bash
pm2 list              # Ver processos
pm2 logs whatsapp-bot # Ver logs
pm2 restart whatsapp-bot # Reiniciar
pm2 stop whatsapp-bot    # Parar
pm2 delete whatsapp-bot  # Remover
```

PM2 mantém o bot rodando mesmo após reiniciar o computador.

---

### **Usando nohup**

```bash
nohup npm run server > bot.log 2>&1 &
```

---

### **Usando screen/tmux**

```bash
# Criar sessão screen
screen -S whatsapp-bot

# Rodar bot
npm run server

# Detachar: Ctrl+A, depois D
# Reatar: screen -r whatsapp-bot
```

---

## 🔍 Verificar se Está Funcionando

### **1. Verificar Bot Server**

```bash
curl http://localhost:3001/status
```

Resposta esperada:
```json
{
  "status": "waiting_qr",
  "qr": "...",
  "ready": false
}
```

### **2. Verificar QR Code**

```bash
curl http://localhost:3001/qr
```

### **3. Verificar Worker (se usar ngrok)**

```bash
curl https://oconnector-api.xerifegomes-e71.workers.dev/api/whatsapp/qr
```

---

## 📋 Checklist

- [ ] `.env` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Bot server iniciado (`npm run server`)
- [ ] Porta 3001 acessível
- [ ] QR Code disponível em `/qr`
- [ ] (Opcional) ngrok configurado
- [ ] (Opcional) Worker atualizado com URL ngrok
- [ ] Bot mantém conexão ativa

---

## 🐛 Troubleshooting

### **Porta já em uso**
```bash
# Matar processo na porta 3001
lsof -ti:3001 | xargs kill -9
```

### **Bot não conecta**
- Verificar se `.wwebjs_auth/` existe
- Remover `.wwebjs_auth/` e tentar novamente (vai gerar novo QR)

### **Erro de import**
```bash
# Verificar se node_modules está instalado
rm -rf node_modules package-lock.json
npm install
```

### **QR Code não aparece**
- Aguardar alguns segundos (bot precisa gerar QR)
- Verificar logs do bot
- Tentar reiniciar: `POST /restart`

---

## 🔄 Próximos Passos

Quando conseguir uma plataforma (Fly.io, DigitalOcean, etc):

1. Pare o bot local
2. Siga o guia de deploy da plataforma
3. Atualize `WHATSAPP_BOT_SERVER_URL` no Worker
4. Deploy do Worker

---

## 💡 Dica

Use **PM2** para manter o bot rodando 24/7 localmente, mesmo quando fechar o terminal!

