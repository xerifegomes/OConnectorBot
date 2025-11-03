#!/bin/bash

# Script de Teste: Prospecção de Imobiliárias
# Testa endpoint /api/prospectar

set -e

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api/prospectar"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Testando prospecção de imobiliárias..."
echo ""

# Parâmetros (podem ser passados como argumentos)
NICHO="${1:-imobiliária}"
CIDADE="${2:-Iguaba Grande}"

echo "Parâmetros:"
echo "  Nicho: $NICHO"
echo "  Cidade: $CIDADE"
echo ""

echo "Enviando requisição..."
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"nicho\": \"$NICHO\",
    \"cidade\": \"$CIDADE\"
  }")

# Formatar e mostrar resposta
echo -e "${GREEN}Resposta:${NC}"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Verificar sucesso
if echo "$response" | grep -q "\"success\":true"; then
    echo ""
    echo -e "${GREEN}✅ Prospecção realizada com sucesso!${NC}"
    
    # Contar resultados
    count=$(echo "$response" | jq '.resultados | length' 2>/dev/null || echo "0")
    echo "Prospects encontrados: $count"
else
    echo ""
    echo -e "${YELLOW}⚠️  Verifique a resposta acima${NC}"
fi

