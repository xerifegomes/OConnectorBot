#!/bin/bash

# Script de Teste do Agente IA
# Testa se o agente está funcionando corretamente

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Teste do Agente IA - oConnector                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

CLIENTE_ID="${1:-1}"
QUERY_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/query"

# Pergunta padrão ou passada como argumento
PERGUNTA="${2:-Qual o horário de funcionamento?}"

echo -e "${GREEN}Cliente ID:${NC} $CLIENTE_ID"
echo -e "${GREEN}Pergunta:${NC} $PERGUNTA"
echo ""

# Verificar status primeiro
echo -e "${YELLOW}📊 Verificando status do agente...${NC}"
STATUS_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/$CLIENTE_ID"
status_response=$(curl -s "$STATUS_URL")
status_success=$(echo "$status_response" | jq -r '.success' 2>/dev/null || echo "false")

if [ "$status_success" != "true" ]; then
    echo -e "${RED}❌ Erro ao verificar status${NC}"
    echo "$status_response"
    exit 1
fi

treinado=$(echo "$status_response" | jq -r '.treinamento' 2>/dev/null || echo "null")
if [ "$treinado" = "null" ]; then
    echo -e "${YELLOW}⚠️  Agente ainda não foi treinado!${NC}"
    echo ""
    echo "Execute primeiro: ./treinar-agente.sh"
    exit 1
fi

echo -e "${GREEN}✅ Agente está treinado${NC}"
echo ""

# Fazer query
echo -e "${YELLOW}💬 Fazendo pergunta ao agente...${NC}"
echo ""

payload=$(cat <<EOF
{
  "cliente_id": $CLIENTE_ID,
  "pergunta": "$PERGUNTA"
}
EOF
)

response=$(curl -s -X POST "$QUERY_URL" \
  -H "Content-Type: application/json" \
  -d "$payload")

# Mostrar resposta
echo -e "${GREEN}Resposta do Agente:${NC}"
echo ""
echo "$response" | jq -r '.resposta // .error' 2>/dev/null || echo "$response"
echo ""

# Verificar sucesso
if echo "$response" | grep -q "\"success\":true"; then
    echo -e "${GREEN}✅ Agente funcionando corretamente!${NC}"
    
    contexto=$(echo "$response" | jq -r '.contexto_usado // "N/A"' 2>/dev/null || echo "N/A")
    echo -e "${GREEN}Contexto usado:${NC} $contexto documentos"
else
    echo -e "${RED}❌ Erro ao processar pergunta${NC}"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    exit 1
fi

echo ""
echo -e "${BLUE}Para testar outras perguntas:${NC}"
echo "./testar-agente.sh $CLIENTE_ID \"Sua pergunta aqui\""

