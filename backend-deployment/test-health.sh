#!/bin/bash

# Script de Health Check para oConnector Backend
# Testa ambos os workers e valida respostas

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verificando saúde dos workers oConnector..."
echo ""

# URLs dos workers
API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api"
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api"

# Teste 1: oconnector-api
echo "1️⃣  Testando oconnector-api..."
if response=$(curl -s -w "\n%{http_code}" "$API_URL" 2>/dev/null); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ oconnector-api: OK (HTTP $http_code)${NC}"
        echo "Resposta: $body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ oconnector-api: ERRO (HTTP $http_code)${NC}"
        echo "Resposta: $body"
    fi
else
    echo -e "${RED}❌ oconnector-api: Falha na conexão${NC}"
fi

echo ""

# Teste 2: agent-training-worker
echo "2️⃣  Testando agent-training-worker..."
if response=$(curl -s -w "\n%{http_code}" "$TRAINING_URL" 2>/dev/null); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ agent-training-worker: OK (HTTP $http_code)${NC}"
        echo "Resposta: $body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ agent-training-worker: ERRO (HTTP $http_code)${NC}"
        echo "Resposta: $body"
    fi
else
    echo -e "${RED}❌ agent-training-worker: Falha na conexão${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Health check concluído!"

