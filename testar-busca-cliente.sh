#!/bin/bash

# Script para testar a busca de cliente pelo número WhatsApp
# Simula exatamente o que o bot faz

set -e

API_URL="${OCONNECTOR_API_URL:-https://oconnector-api.xerifegomes-e71.workers.dev}"

echo "🧪 TESTE - Busca de Cliente (Simulação do Bot)"
echo "================================================"
echo ""

# Função para limpar número (igual ao bot)
clean_number() {
    echo "$1" | sed 's/[^0-9]//g'
}

# Testar com o número do OConnector
NUMERO_BOT="5522992363462"
NUMERO_LIMPO=$(clean_number "$NUMERO_BOT")

echo "📱 Número do Bot: $NUMERO_BOT"
echo "📱 Número limpo: $NUMERO_LIMPO"
echo ""

echo "🔗 Testando busca na API..."
echo "GET ${API_URL}/api/clientes?whatsapp=${NUMERO_LIMPO}"
echo ""

response=$(curl -s "${API_URL}/api/clientes?whatsapp=${NUMERO_LIMPO}")

echo "📥 Resposta da API:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Verificar se encontrou
if echo "$response" | jq -e '.data | length > 0' > /dev/null 2>&1; then
    echo "✅ SUCESSO: Cliente encontrado!"
    echo ""
    cliente=$(echo "$response" | jq '.data[0]')
    echo "📋 Dados do Cliente:"
    echo "$cliente" | jq '{id, nome_imobiliaria, whatsapp_numero, status, data_ultimo_treino}'
    echo ""
    echo "✅ O bot DEVERIA encontrar este cliente!"
    echo ""
    echo "⚠️  Se o bot ainda mostra erro, pode ser:"
    echo "   1. O bot está usando um número diferente (verifique logs)"
    echo "   2. Problema de cache (aguarde 5 minutos ou reinicie o bot)"
    echo "   3. O bot está buscando pelo número de quem ENVIOU (não do bot)"
    echo "   4. Erro na URL da API configurada no bot"
else
    echo "❌ ERRO: Cliente NÃO encontrado!"
    echo ""
    echo "O bot não vai conseguir encontrar este cliente."
fi

echo ""
echo "================================================"
echo "🔍 PRÓXIMOS PASSOS:"
echo ""
echo "1. Verifique os logs do bot:"
echo "   tail -f whatsapp-bot/logs/whatsapp-bot.log"
echo ""
echo "2. Procure por mensagens como:"
echo "   '⚠️ Número X não está associado a nenhum cliente'"
echo ""
echo "3. Verifique qual número está sendo usado na busca"
echo ""

