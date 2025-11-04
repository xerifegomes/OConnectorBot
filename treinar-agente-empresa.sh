#!/bin/bash

# Script para treinar o agente com dados da empresa oConnector Tech
# Baseado no payload do YAML fornecido

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Treinamento Agente IA - oConnector Tech               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

CLIENTE_ID="${1:-4}"
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/train"

echo -e "${CYAN}Treinando agente para cliente ID: $CLIENTE_ID${NC}"
echo ""

# Payload completo baseado no YAML
payload=$(cat <<EOF
{
  "cliente_id": $CLIENTE_ID,
  "nome_empresa": "OConnector Tech",
  "whatsapp": "+5522992363462",
  "email": "dev@oconnector.tech",
  "endereco": "Rua Afeu Ferreira 5 - Iguaba Grande - RJ - CEP: 28962-010",
  "horario": "das 09:00 às 18:00, de segunda a sexta",
  "missao": "Transformar a prospecção de negócios locais usando IA e automação via WhatsApp, sem depender de métodos antigos",
  "diferenciais": "5 anos experiência, Prospecção automatizada Google APIs, Bot WhatsApp IA personalizado, Dashboard tempo real, Multi-tenant seguro, Integração CRM, Cancelamento simples",
  "servicos": ["Prospecção automatizada", "Bot WhatsApp 24/7", "Landing page optimizada", "Dashboard leads", "Integração CRM"],
  "segmentos": ["Imobiliárias", "Salões", "Clínicas", "Pet Shops", "Negócios locais B2C"],
  "tecnologias": ["Cloudflare Workers", "Workers AI Llama 3", "Google Places API", "whatsapp-web.js", "Next.js"],
  "tom_voz": "profissional_amigavel",
  "usar_emojis": "moderado"
}
EOF
)

echo -e "${YELLOW}🤖 Enviando dados de treinamento...${NC}"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$TRAINING_URL" \
  -H "Content-Type: application/json" \
  -d "$payload")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo -e "${GREEN}Resposta:${NC}"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" -eq 200 ] && echo "$body" | grep -q "\"success\":true"; then
    documentos=$(echo "$body" | jq -r '.documentos_processados // 0' 2>/dev/null || echo "0")
    erros=$(echo "$body" | jq -r '.erros // 0' 2>/dev/null || echo "0")
    metodo=$(echo "$body" | jq -r '.metodo // "N/A"' 2>/dev/null || echo "N/A")
    
    echo -e "${GREEN}✅ Agente treinado com sucesso!${NC}"
    echo ""
    echo -e "${GREEN}Documentos processados:${NC} $documentos"
    echo -e "${GREEN}Erros:${NC} $erros"
    echo -e "${GREEN}Método usado:${NC} $metodo"
    echo ""
    
    if [ "$documentos" -gt 0 ]; then
        echo -e "${BLUE}✅ Treinamento concluído! O agente está pronto para uso.${NC}"
        echo ""
        echo "Teste o agente:"
        echo "curl -X POST https://agent-training-worker.xerifegomes-e71.workers.dev/api/query \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"cliente_id\": $CLIENTE_ID, \"pergunta\": \"O que é o OConnector Tech?\"}'"
    else
        echo -e "${YELLOW}⚠️  Nenhum documento processado. Verifique se o Vectorize está configurado.${NC}"
    fi
else
    echo -e "${RED}❌ Erro ao treinar agente${NC}"
    echo -e "${RED}HTTP Code: $http_code${NC}"
    exit 1
fi

