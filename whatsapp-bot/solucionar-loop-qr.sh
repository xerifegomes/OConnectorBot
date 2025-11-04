#!/bin/bash

# Script para solucionar loop infinito de QR Codes

echo "🔧 SOLUCIONANDO LOOP INFINITO DE QR CODES"
echo "=========================================="
echo ""

cd "$(dirname "$0")" || exit 1

# 1. Parar bot
echo "🛑 1. Parando bot..."
pkill -9 -f "node.*bot" 2>/dev/null
sleep 2
echo "✅ Bot parado"
echo ""

# 2. Verificar WhatsApp no celular
echo "📱 2. VERIFICAÇÃO IMPORTANTE:"
echo "   - Abra o WhatsApp no seu celular"
echo "   - Vá em: Menu (⋮) → Aparelhos conectados"
echo "   - Verifique se há algum dispositivo conectado"
echo "   - Se houver, DESCONECTE todos os dispositivos"
echo ""
read -p "Pressione ENTER após verificar/desconectar dispositivos..."

# 3. Limpar sessão completamente
echo ""
echo "🗑️  3. Limpando sessão completamente..."
rm -rf .wwebjs_auth/ 2>/dev/null
rm -rf .wwebjs_cache/ 2>/dev/null
rm -rf "$HOME/.cache/puppeteer" 2>/dev/null
echo "✅ Sessão limpa"
echo ""

# 4. Verificar dependências
echo "📦 4. Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "   Instalando dependências..."
    npm install
else
    echo "   Dependências OK"
fi
echo ""

# 5. Iniciar bot
echo "🚀 5. Iniciando bot..."
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - O bot vai gerar um QR Code"
echo "   - Escaneie IMEDIATAMENTE (menos de 60 segundos)"
echo "   - Se gerar mais de 3 QR codes, o bot vai parar automaticamente"
echo ""
echo "   Iniciando em 3 segundos..."
sleep 3

# Iniciar bot em foreground para ver o QR Code
npm start

