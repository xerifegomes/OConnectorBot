#!/bin/bash

# Script de Treinamento do Agente IA
# Treina o agente com as informações da sua empresa

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Treinamento do Agente IA - oConnector                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se arquivo de configuração existe
CONFIG_FILE="config-empresa.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Arquivo de configuração não encontrado!${NC}"
    echo ""
    echo "Execute primeiro: ./configurar-empresa.sh"
    exit 1
fi

# URL do agent-training-worker
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/train"

echo -e "${YELLOW}📋 Carregando configuração da empresa...${NC}"
echo ""

# Ler e validar JSON
PAYLOAD=$(cat "$CONFIG_FILE")
if ! echo "$PAYLOAD" | jq . > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Arquivo de configuração inválido!${NC}"
    exit 1
fi

# Mostrar resumo
CLIENTE_ID=$(echo "$PAYLOAD" | jq -r '.cliente_id')
NOME_EMPRESA=$(echo "$PAYLOAD" | jq -r '.nome_empresa')
echo -e "${GREEN}Empresa:${NC} $NOME_EMPRESA"
echo -e "${GREEN}Cliente ID:${NC} $CLIENTE_ID"
echo ""

# Perguntar se deseja continuar
read -p "Deseja treinar o agente com essas informações? (s/n): " CONFIRMAR
if [ "$CONFIRMAR" != "s" ]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo -e "${YELLOW}🤖 Treinando agente IA...${NC}"
echo ""

# Fazer requisição
response=$(curl -s -w "\n%{http_code}" -X POST "$TRAINING_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Separar corpo e código HTTP
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

# Formatar e mostrar resposta
echo -e "${GREEN}Resposta:${NC}"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""

# Verificar sucesso
if [ "$http_code" -eq 200 ] && echo "$body" | grep -q "\"success\":true"; then
    echo -e "${GREEN}✅ Agente treinado com sucesso!${NC}"
    echo ""
    
    documentos=$(echo "$body" | jq -r '.documentos_processados // 0' 2>/dev/null || echo "0")
    metodo=$(echo "$body" | jq -r '.metodo // "N/A"' 2>/dev/null || echo "N/A")
    
    echo -e "${GREEN}Documentos processados:${NC} $documentos"
    echo -e "${GREEN}Método usado:${NC} $metodo"
    echo ""
    echo -e "${BLUE}Próximos passos:${NC}"
    echo "1. Execute: ./testar-agente.sh"
    echo "2. Execute: ./prospectar-leads.sh"
    echo "3. Inicie o bot WhatsApp: cd whatsapp-bot && npm start"
else
    echo -e "${RED}❌ Erro ao treinar agente${NC}"
    echo -e "${RED}HTTP Code: $http_code${NC}"
    exit 1
fi

