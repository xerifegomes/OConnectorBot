#!/bin/bash

# Script de Teste: Query RAG
# Testa endpoint /api/query do agent-training-worker

set -e

QUERY_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/query"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "💬 Testando query RAG..."
echo ""

# Parâmetros
CLIENTE_ID="${1:-1}"
PERGUNTA="${2:-Vocês trabalham com financiamento bancário?}"

echo "Cliente ID: $CLIENTE_ID"
echo "Pergunta: $PERGUNTA"
echo ""

payload=$(cat <<EOF
{
  "cliente_id": $CLIENTE_ID,
  "pergunta": "$PERGUNTA"
}
EOF
)

echo "Enviando query..."
response=$(curl -s -X POST "$QUERY_URL" \
  -H "Content-Type: application/json" \
  -d "$payload")

# Formatar e mostrar resposta
echo -e "${GREEN}Resposta:${NC}"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Verificar sucesso
if echo "$response" | grep -q "\"success\":true"; then
    echo ""
    echo -e "${GREEN}✅ Query processada com sucesso!${NC}"
    
    # Extrair resposta
    resposta=$(echo "$response" | jq -r '.resposta // "N/A"' 2>/dev/null || echo "N/A")
    contexto=$(echo "$response" | jq -r '.contexto_usado // "N/A"' 2>/dev/null || echo "N/A")
    
    echo ""
    echo -e "${GREEN}Resposta do agente:${NC}"
    echo "$resposta"
    echo ""
    echo "Contexto usado: $contexto documentos"
else
    echo ""
    echo -e "${RED}❌ Erro ao processar query${NC}"
    echo "Verifique se o cliente foi treinado primeiro"
    exit 1
fi

