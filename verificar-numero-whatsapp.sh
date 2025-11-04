#!/bin/bash

# Script Rápido de Verificação de Número WhatsApp
# Uso: ./verificar-numero-whatsapp.sh [numero]

set -e

API_URL="${OCONNECTOR_API_URL:-https://oconnector-api.xerifegomes-e71.workers.dev}"

# Função para limpar número
clean_number() {
    echo "$1" | sed 's/[^0-9]//g'
}

NUMERO=$1

if [ -z "$NUMERO" ]; then
    echo "❌ Uso: ./verificar-numero-whatsapp.sh [numero]"
    echo ""
    echo "Exemplo: ./verificar-numero-whatsapp.sh 5522999999999"
    echo "Exemplo: ./verificar-numero-whatsapp.sh '(22) 99999-9999'"
    exit 1
fi

NUMERO_LIMPO=$(clean_number "$NUMERO")

echo "🔍 Verificando número: $NUMERO_LIMPO"
echo ""

# Testar API
echo "📡 Testando API..."
response=$(curl -s "${API_URL}/api/clientes?whatsapp=${NUMERO_LIMPO}")

echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Verificar resultado
if echo "$response" | jq -e '.data | length > 0' > /dev/null 2>&1; then
    echo "✅ Cliente encontrado!"
    echo ""
    echo "$response" | jq '.data[0] | {id, nome_imobiliaria, whatsapp_numero, status}'
else
    echo "❌ Cliente NÃO encontrado!"
    echo ""
    echo "Para criar um cliente, execute:"
    echo "curl -X POST ${API_URL}/api/clientes \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{"
    echo "    \"nome_imobiliaria\": \"Nome da Imobiliária\","
    echo "    \"whatsapp_numero\": \"${NUMERO_LIMPO}\","
    echo "    \"plano\": \"STARTER\","
    echo "    \"valor_mensal\": 500"
    echo "  }'"
fi

