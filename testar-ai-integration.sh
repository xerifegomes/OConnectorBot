#!/bin/bash

# ==============================================================================
# Script de Teste - Integração WhatsApp + Workers AI
# ==============================================================================

set -e

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev"
ENDPOINT="${API_URL}/api/ai/chat"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Teste de Integração WhatsApp + Workers AI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==============================================================================
# Teste 1: Sem contexto (resposta genérica)
# ==============================================================================

echo "📝 Teste 1: Mensagem sem contexto de cliente"
echo "Endpoint: ${ENDPOINT}"
echo ""

response=$(curl -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá! Como funciona o atendimento?"
  }')

echo "Resposta:"
echo "$response" | jq . 2>/dev/null || echo "$response"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==============================================================================
# Teste 2: Com contexto de cliente (personalizado)
# ==============================================================================

echo "📝 Teste 2: Mensagem com contexto de cliente"
echo ""

response=$(curl -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Vocês têm imóveis em Cabo Frio?",
    "cliente_id": 1,
    "context": {
      "historico": [
        {"remetente": "cliente", "texto": "Olá!"},
        {"remetente": "agente", "texto": "Olá! Como posso ajudá-lo?"}
      ]
    }
  }')

echo "Resposta:"
echo "$response" | jq . 2>/dev/null || echo "$response"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==============================================================================
# Teste 3: Com whatsapp_number (busca cliente automaticamente)
# ==============================================================================

echo "📝 Teste 3: Mensagem com whatsapp_number (busca automática)"
echo ""

response=$(curl -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual é o horário de atendimento?",
    "whatsapp_number": "5522999999999"
  }')

echo "Resposta:"
echo "$response" | jq . 2>/dev/null || echo "$response"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==============================================================================
# Teste 4: Simulação de conversa completa
# ==============================================================================

echo "📝 Teste 4: Simulação de conversa completa"
echo ""

# Mensagem 1
echo "👤 Cliente: Olá, boa tarde!"
response=$(curl -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, boa tarde!",
    "cliente_id": 1
  }')
resposta1=$(echo "$response" | jq -r '.response' 2>/dev/null || echo "Erro")
echo "🤖 Bot: ${resposta1}"
echo ""

# Mensagem 2
echo "👤 Cliente: Tenho interesse em apartamentos com vista para o mar"
response=$(curl -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Tenho interesse em apartamentos com vista para o mar\",
    \"cliente_id\": 1,
    \"context\": {
      \"historico\": [
        {\"remetente\": \"cliente\", \"texto\": \"Olá, boa tarde!\"},
        {\"remetente\": \"agente\", \"texto\": \"${resposta1}\"}
      ]
    }
  }")
resposta2=$(echo "$response" | jq -r '.response' 2>/dev/null || echo "Erro")
echo "🤖 Bot: ${resposta2}"
echo ""

# Mensagem 3
echo "👤 Cliente: Qual a faixa de preço?"
response=$(curl -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Qual a faixa de preço?\",
    \"cliente_id\": 1,
    \"context\": {
      \"historico\": [
        {\"remetente\": \"cliente\", \"texto\": \"Olá, boa tarde!\"},
        {\"remetente\": \"agente\", \"texto\": \"${resposta1}\"},
        {\"remetente\": \"cliente\", \"texto\": \"Tenho interesse em apartamentos com vista para o mar\"},
        {\"remetente\": \"agente\", \"texto\": \"${resposta2}\"}
      ]
    }
  }")
resposta3=$(echo "$response" | jq -r '.response' 2>/dev/null || echo "Erro")
echo "🤖 Bot: ${resposta3}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==============================================================================
# Verificar logs de uso no D1
# ==============================================================================

echo "📊 Verificando logs de uso da IA..."
echo ""
echo "Para verificar os logs, execute:"
echo ""
echo "npx wrangler d1 execute oconnector_db --remote --command \\"
echo "  \"SELECT cliente_id, mensagem, resposta, tokens_estimados, created_at \\"
echo "  FROM ai_usage_logs ORDER BY created_at DESC LIMIT 5\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Testes concluídos!"
echo ""

