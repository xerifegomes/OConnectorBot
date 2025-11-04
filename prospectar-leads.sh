#!/bin/bash

# Script de Prospecção de Leads via Google Places
# Busca empresas potenciais para contato

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Prospecção de Leads - Google Places                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api/prospectar"

# Parâmetros (podem ser passados como argumentos)
NICHO="${1:-empresa de tecnologia}"
CIDADE="${2:-Rio de Janeiro}"
ESTADO="${3:-RJ}"

echo -e "${GREEN}Parâmetros de busca:${NC}"
echo "  Nicho: $NICHO"
echo "  Cidade: $CIDADE"
echo "  Estado: $ESTADO"
echo ""

read -p "Deseja alterar os parâmetros? (s/n): " ALTERAR
if [ "$ALTERAR" = "s" ]; then
    read -p "Nicho: " NICHO
    read -p "Cidade: " CIDADE
    read -p "Estado: " ESTADO
fi

echo ""
echo -e "${YELLOW}🔍 Buscando prospects...${NC}"
echo ""

# Fazer requisição
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"nicho\": \"$NICHO\",
    \"cidade\": \"$CIDADE\",
    \"estado\": \"$ESTADO\"
  }")

# Separar corpo e código HTTP
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

# Verificar sucesso
if [ "$http_code" -eq 200 ] && echo "$body" | grep -q "\"success\":true"; then
    echo -e "${GREEN}✅ Prospecção realizada com sucesso!${NC}"
    echo ""
    
    # Contar resultados
    count=$(echo "$body" | jq '.resultados | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}Prospects encontrados:${NC} $count"
    echo ""
    
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}📋 Primeiros resultados:${NC}"
        echo ""
        
        # Mostrar primeiros 5 resultados
        echo "$body" | jq -r '.resultados[0:5][] | "\(.nome) - \(.telefone // "Sem telefone")"' 2>/dev/null || echo "$body"
        
        echo ""
        echo -e "${BLUE}Próximos passos:${NC}"
        echo "1. Ver todos os prospects no dashboard: https://oconnector.xerifegomes-e71.workers.dev/prospects"
        echo "2. Ou salvar em arquivo JSON:"
        echo "   curl -X POST '$API_URL' -H 'Content-Type: application/json' -d '{\"nicho\":\"$NICHO\",\"cidade\":\"$CIDADE\"}' | jq . > prospects.json"
    else
        echo -e "${YELLOW}⚠️  Nenhum prospect encontrado${NC}"
        echo "Tente ajustar os parâmetros de busca."
    fi
else
    echo -e "${RED}❌ Erro ao prospectar${NC}"
    echo -e "${RED}HTTP Code: $http_code${NC}"
    echo ""
    echo "Resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    exit 1
fi

