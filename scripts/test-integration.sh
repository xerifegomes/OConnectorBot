#!/bin/bash

# Script de Testes de Integração
# Testa integração entre componentes e API

set -e

echo "🔗 Executando testes de integração..."

cd oconnector-frontend

# Verificar se ambiente está configurado
if [ ! -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local não encontrado. Criando template..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://oconnector-api.xerifegomes-e71.workers.dev
EOF
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Executar testes de integração
echo "🚀 Executando testes de integração..."
npm test -- --testPathPattern=integration --coverage

echo "✅ Testes de integração concluídos!"

