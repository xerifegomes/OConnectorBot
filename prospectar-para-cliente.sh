#!/bin/bash

# Script de Prospecção para Cliente Específico
# Busca leads e gera mensagens personalizadas para um cliente

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Prospecção para Cliente - oConnector Tech              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se cliente_id foi fornecido
CLIENTE_ID="${1}"
if [ -z "$CLIENTE_ID" ]; then
    echo -e "${RED}❌ Erro: Cliente ID é obrigatório${NC}"
    echo ""
    echo "Uso: ./prospectar-para-cliente.sh <cliente_id> [nicho] [cidade] [estado]"
    echo ""
    echo "Exemplo:"
    echo "  ./prospectar-para-cliente.sh 1 \"imobiliária\" \"Rio de Janeiro\" \"RJ\""
    exit 1
fi

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api/prospectar"
GENERAR_MSG_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api/gerar-mensagem"

# Parâmetros
NICHO="${2:-imobiliária}"
CIDADE="${3:-Rio de Janeiro}"
ESTADO="${4:-RJ}"

echo -e "${CYAN}📋 Parâmetros:${NC}"
echo "  Cliente ID: $CLIENTE_ID"
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

# Buscar prospects
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"nicho\": \"$NICHO\",
    \"cidade\": \"$CIDADE\",
    \"estado\": \"$ESTADO\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -ne 200 ] || ! echo "$body" | grep -q "\"success\":true"; then
    echo -e "${RED}❌ Erro ao buscar prospects${NC}"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    exit 1
fi

count=$(echo "$body" | jq '.resultados | length' 2>/dev/null || echo "0")
echo -e "${GREEN}✅ $count prospects encontrados${NC}"
echo ""

if [ "$count" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum prospect encontrado${NC}"
    exit 0
fi

# Classificar e mostrar prospects
echo -e "${CYAN}📊 Prospects encontrados:${NC}"
echo ""

# Mostrar primeiros 10
echo "$body" | jq -r '.resultados[0:10][] | "\(.nome) - \(.telefone // "Sem telefone") - Rating: \(.rating // "N/A")"' 2>/dev/null

if [ "$count" -gt 10 ]; then
    echo "... e mais $((count - 10)) prospects"
fi

echo ""
read -p "Deseja gerar mensagens personalizadas para esses prospects? (s/n): " GERAR_MSG
if [ "$GERAR_MSG" != "s" ]; then
    echo "Prospecção concluída. Prospects salvos no banco."
    exit 0
fi

echo ""
echo -e "${YELLOW}💬 Gerando mensagens personalizadas...${NC}"
echo ""

# Gerar mensagens para cada prospect
prospects_data=$(echo "$body" | jq '.resultados' 2>/dev/null)
prospects_count=$(echo "$prospects_data" | jq 'length' 2>/dev/null || echo "0")

success_count=0
error_count=0

# Processar cada prospect
for i in $(seq 0 $((prospects_count - 1))); do
    prospect=$(echo "$prospects_data" | jq ".[$i]" 2>/dev/null)
    nome=$(echo "$prospect" | jq -r '.nome' 2>/dev/null)
    telefone=$(echo "$prospect" | jq -r '.telefone' 2>/dev/null)
    
    if [ -z "$telefone" ] || [ "$telefone" = "null" ]; then
        echo -e "${YELLOW}⚠️  $nome: Sem telefone, pulando...${NC}"
        ((error_count++))
        continue
    fi
    
    # Gerar mensagem personalizada
    msg_response=$(curl -s -X POST "$GENERAR_MSG_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"cliente_id\": $CLIENTE_ID,
        \"prospect_nome\": \"$nome\",
        \"prospect_info\": $prospect
      }" 2>/dev/null)
    
    if echo "$msg_response" | grep -q "\"success\":true"; then
        mensagem=$(echo "$msg_response" | jq -r '.mensagem' 2>/dev/null)
        echo -e "${GREEN}✅ $nome${NC}"
        echo "   📱 $telefone"
        echo "   💬 ${mensagem:0:80}..."
        ((success_count++))
    else
        echo -e "${RED}❌ $nome: Erro ao gerar mensagem${NC}"
        ((error_count++))
    fi
    
    # Pequeno delay para não sobrecarregar API
    sleep 0.5
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✅ Prospecção Concluída!                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Total de prospects:${NC} $count"
echo -e "${GREEN}Mensagens geradas:${NC} $success_count"
echo -e "${YELLOW}Erros:${NC} $error_count"
echo ""
echo -e "${CYAN}Próximos passos:${NC}"
echo "1. Ver prospects no dashboard: https://oconnector.xerifegomes-e71.workers.dev/prospects"
echo "2. Enviar mensagens via bot WhatsApp"
echo "3. Monitorar respostas e leads captados"
echo ""

