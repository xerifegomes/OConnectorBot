#!/bin/bash

# Script para resetar bot em caso de loop infinito

echo "🛑 RESETANDO BOT - Loop Infinito Detectado"
echo "=========================================="
echo ""

cd whatsapp-bot || exit 1

# Parar todos os processos do bot
echo "🛑 Parando todos os processos do bot..."
pkill -9 -f "node.*src/index.js" 2>/dev/null
pkill -9 -f "node.*src/bot-server.js" 2>/dev/null
pkill -9 -f "node.*bot" 2>/dev/null
sleep 2

# Verificar se ainda há processos
REMAINING=$(ps aux | grep -E "node.*bot|bot-server" | grep -v grep | wc -l | tr -d ' ')
if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  Ainda há processos rodando. Forçando parada..."
    pkill -9 -f "node.*bot" 2>/dev/null
    sleep 1
fi

echo "✅ Processos parados"
echo ""

# Perguntar se quer resetar sessão
read -p "Deseja resetar a sessão do WhatsApp? (s/n): " RESET_SESSION

if [ "$RESET_SESSION" = "s" ] || [ "$RESET_SESSION" = "S" ]; then
    echo ""
    echo "🗑️  Removendo sessão..."
    
    # Fazer backup da sessão antiga
    if [ -d ".wwebjs_auth" ]; then
        BACKUP_NAME=".wwebjs_auth.backup.$(date +%Y%m%d_%H%M%S)"
        echo "📦 Fazendo backup: $BACKUP_NAME"
        mv .wwebjs_auth "$BACKUP_NAME" 2>/dev/null || rm -rf .wwebjs_auth
    fi
    
    echo "✅ Sessão removida"
    echo ""
    echo "⚠️  IMPORTANTE: Você precisará escanear o QR Code novamente"
else
    echo ""
    echo "ℹ️  Sessão mantida. O bot tentará usar a sessão existente."
fi

echo ""
echo "✅ Bot resetado!"
echo ""
echo "🚀 Para iniciar novamente:"
echo "   cd whatsapp-bot"
echo "   npm start"
echo ""

