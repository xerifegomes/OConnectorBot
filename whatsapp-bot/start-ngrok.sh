#!/bin/bash

# Script para iniciar ngrok e bot server juntos

echo "🚀 Iniciando ngrok e bot server..."

# Matar processos existentes
pkill -f "ngrok" 2>/dev/null
pkill -f "bot-server.js" 2>/dev/null
sleep 2

# Iniciar bot server em background
cd "$(dirname "$0")"
npm run server > /tmp/bot-server.log 2>&1 &
BOT_PID=$!

echo "✅ Bot server iniciado (PID: $BOT_PID)"
echo "⏳ Aguardando bot server iniciar..."
sleep 3

# Verificar se bot server está rodando
if ! curl -s http://localhost:3001/status > /dev/null 2>&1; then
    echo "❌ Erro: Bot server não iniciou corretamente"
    exit 1
fi

# Iniciar ngrok
echo "🌐 Iniciando ngrok..."
ngrok http 3001 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "✅ Ngrok iniciado (PID: $NGROK_PID)"
echo "⏳ Aguardando ngrok iniciar..."
sleep 5

# Obter URL pública
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | sed 's/"public_url":"//' | sed 's/"//')

if [ -z "$NGROK_URL" ]; then
    echo "❌ Erro: Não foi possível obter URL do ngrok"
    echo "📋 Verifique os logs: tail -f /tmp/ngrok.log"
    exit 1
fi

echo ""
echo "✅ Tudo pronto!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Bot Server: http://localhost:3001"
echo "🌐 URL Pública: $NGROK_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Atualize o wrangler.toml com:"
echo "   WHATSAPP_BOT_SERVER_URL = \"$NGROK_URL\""
echo ""
echo "🛑 Para parar: pkill -f ngrok && pkill -f bot-server"
echo "📋 Logs: tail -f /tmp/bot-server.log /tmp/ngrok.log"

