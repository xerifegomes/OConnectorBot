#!/bin/bash

# Script de Testes Unitários
# Executa testes unitários do projeto Next.js

set -e

echo "🧪 Executando testes unitários..."

cd oconnector-frontend

# Verificar se Jest está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Executar testes
echo "🚀 Executando testes..."
npm test -- --coverage --watchAll=false

echo "✅ Testes unitários concluídos!"

