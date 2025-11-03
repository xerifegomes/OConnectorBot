#!/bin/bash

# Script para iniciar bot server localmente
# Uso: ./start-local.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Iniciando oConnector WhatsApp Bot Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando .env a partir do .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado. Configure as variáveis antes de continuar."
        exit 1
    else
        echo "❌ Arquivo .env.example também não encontrado!"
        exit 1
    fi
fi

# Carregar variáveis de ambiente
export $(cat .env | grep -v '^#' | xargs)

# Definir porta padrão se não existir
export PORT=${PORT:-3001}

echo "📋 Configuração:"
echo "   Porta: $PORT"
echo "   API: ${OCONNECTOR_API_URL:-'não configurada'}"
echo ""

# Verificar se porta está em uso
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta $PORT já está em uso!"
    echo "   Matando processo na porta $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "✅ Iniciando bot server..."
echo ""
echo "📱 QR Code estará disponível em:"
echo "   http://localhost:$PORT/qr"
echo ""
echo "📊 Status disponível em:"
echo "   http://localhost:$PORT/status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar bot server
npm run server

