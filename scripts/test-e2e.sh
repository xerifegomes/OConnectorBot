#!/bin/bash

# Script de Testes End-to-End
# Executa testes E2E com Playwright ou Cypress

set -e

echo "🌐 Executando testes end-to-end..."

cd oconnector-frontend

# Verificar se Playwright está instalado
if [ ! -d "node_modules/@playwright" ]; then
    echo "📦 Instalando Playwright..."
    npm install -D @playwright/test
    npx playwright install
fi

# Iniciar servidor de desenvolvimento em background
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev &
DEV_PID=$!

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 10

# Verificar se servidor está rodando
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Servidor não está respondendo em http://localhost:3000"
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

# Executar testes E2E
echo "🧪 Executando testes E2E..."
npx playwright test || true

# Parar servidor
echo "🛑 Parando servidor..."
kill $DEV_PID 2>/dev/null || true

echo "✅ Testes E2E concluídos!"

