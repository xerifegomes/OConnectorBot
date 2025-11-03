#!/bin/bash

# Script de Teste Completo: Criar Cliente e Treinar Agente
# Cria um cliente primeiro, depois treina

set -e

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes"
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/train"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "📝 Teste Completo: Criar Cliente e Treinar Agente"
echo ""

# Primeiro, criar cliente via API (se endpoint existir)
# Ou usar ID existente
CLIENTE_ID="${1:-1}"

echo "Usando Cliente ID: $CLIENTE_ID"
echo ""

# Payload de treinamento
payload=$(cat <<EOF
{
  "cliente_id": $CLIENTE_ID,
  "nome_empresa": "Imobiliária Silva Teste",
  "whatsapp": "(22) 99999-9999",
  "endereco": "Rua XV, 100, Iguaba Grande - RJ",
  "horario": "Seg-Sex: 8h-18h, Sáb: 9h-13h",
  "diferenciais": "20 anos no mercado. Mais de 500 imóveis vendidos. Atendimento personalizado.",
  "corretor_nome": ["Carlos Silva", "Ana Santos"],
  "corretor_especialidade": ["Vendas", "Locação"],
  "faq_pergunta": [
    "Vocês trabalham com financiamento?",
    "Qual a taxa de corretagem?",
    "Aceita pets nos imóveis?"
  ],
  "faq_resposta": [
    "Sim! Temos parceria com Caixa, Itaú, Bradesco e Santander. Ajudamos em todo o processo.",
    "Na venda cobramos 6% do valor do imóvel. Na locação, 1 aluguel de taxa.",
    "Depende do imóvel. Temos várias opções pet-friendly!"
  ],
  "tom_voz": "amigavel",
  "usar_emojis": "moderado"
}
EOF
)

echo "🤖 Treinando agente..."
response=$(curl -s -X POST "$TRAINING_URL" \
  -H "Content-Type: application/json" \
  -d "$payload")

# Formatar e mostrar resposta
echo -e "${GREEN}Resposta:${NC}"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Verificar sucesso
if echo "$response" | grep -q "\"success\":true"; then
    echo ""
    echo -e "${GREEN}✅ Agente treinado com sucesso!${NC}"
    
    documentos=$(echo "$response" | jq -r '.documentos_processados // 0' 2>/dev/null || echo "0")
    metodo=$(echo "$response" | jq -r '.metodo // "N/A"' 2>/dev/null || echo "N/A")
    
    echo "Documentos processados: $documentos"
    echo "Método usado: $metodo"
    echo ""
    echo "Agora você pode testar queries RAG com:"
    echo "./backend-deployment/test-query.sh $CLIENTE_ID \"Vocês trabalham com financiamento?\""
else
    echo ""
    echo -e "${RED}❌ Erro ao treinar agente${NC}"
    exit 1
fi

