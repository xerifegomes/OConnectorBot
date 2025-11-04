#!/bin/bash

# Script para reiniciar o bot WhatsApp

echo "🔄 Reiniciando Bot WhatsApp..."
echo ""

cd whatsapp-bot || exit 1

# Parar processos antigos
echo "🛑 Parando processos antigos..."
pkill -f "node.*src/index.js" 2>/dev/null
pkill -f "node.*src/bot-server.js" 2>/dev/null
pkill -f "bot-server.js" 2>/dev/null

# Aguardar processos terminarem
sleep 2

# Verificar se ainda há processos
REMAINING=$(ps aux | grep -E "node.*bot|bot-server" | grep -v grep | wc -l | tr -d ' ')
if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  Ainda há processos rodando. Tentando forçar parada..."
    pkill -9 -f "node.*bot" 2>/dev/null
    sleep 1
fi

echo "✅ Processos antigos parados"
echo ""
echo "🚀 Iniciando bot..."
echo ""

# Iniciar bot
npm start

