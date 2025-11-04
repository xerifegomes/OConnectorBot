#!/bin/bash

# Script para limpar sessão do WhatsApp e gerar novo QR Code

echo "🔄 Limpando sessão do WhatsApp..."

# Parar bot server
echo "⏹️  Parando bot server..."
pkill -f "bot-server.js" 2>/dev/null
sleep 2

# Limpar sessão
echo "🗑️  Removendo sessão antiga..."
cd "$(dirname "$0")"
rm -rf .wwebjs_auth/session

echo "✅ Sessão limpa!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Verifique no WhatsApp do celular:"
echo "   Configurações → Aparelhos conectados"
echo "   Desconecte dispositivos não utilizados (máximo 4)"
echo ""
echo "2. Reinicie o bot server:"
echo "   ./start-ngrok.sh"
echo ""
echo "3. Escaneie o novo QR Code"
echo ""
echo "⚠️  IMPORTANTE: Se o erro persistir, aguarde 5-10 minutos antes de tentar novamente"

