#!/bin/bash

# Script de Diagnóstico e Correção de Número WhatsApp
# Este script ajuda a resolver o erro: "Este número não está configurado para atendimento"

set -e

echo "🔍 DIAGNÓSTICO - Número WhatsApp Não Configurado"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
API_URL="${OCONNECTOR_API_URL:-https://oconnector-api.xerifegomes-e71.workers.dev}"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-e71984852bedaf5f21cef5d949948498}"

# Função para limpar número (igual ao bot)
clean_number() {
    echo "$1" | sed 's/[^0-9]//g'
}

# Função para testar API
test_api() {
    local whatsapp=$1
    echo "🔗 Testando API: GET ${API_URL}/api/clientes?whatsapp=${whatsapp}"
    response=$(curl -s "${API_URL}/api/clientes?whatsapp=${whatsapp}")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

# Passo 1: Obter número do WhatsApp conectado
echo "📱 PASSO 1: Identificar número WhatsApp conectado"
echo "--------------------------------------------------"
echo ""
echo "Por favor, informe o número WhatsApp que está conectado ao bot:"
echo "(Formato: 22999999999 ou 5522999999999)"
read -p "Número: " NUMERO_INPUT

if [ -z "$NUMERO_INPUT" ]; then
    echo -e "${RED}❌ Número não informado!${NC}"
    exit 1
fi

NUMERO_LIMPO=$(clean_number "$NUMERO_INPUT")
echo -e "${GREEN}✅ Número limpo: ${NUMERO_LIMPO}${NC}"
echo ""

# Passo 2: Testar API
echo "📡 PASSO 2: Testando busca na API"
echo "----------------------------------"
test_api "$NUMERO_LIMPO"
echo ""

# Passo 3: Verificar no banco de dados
echo "🗄️  PASSO 3: Verificando no banco de dados D1"
echo "----------------------------------------------"
echo ""

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${YELLOW}⚠️  CLOUDFLARE_ACCOUNT_ID não configurado${NC}"
    echo "Execute: export CLOUDFLARE_ACCOUNT_ID=seu_account_id"
    echo ""
else
    echo "Buscando clientes no banco..."
    echo ""
    cd backend-deployment 2>/dev/null || true
    wrangler d1 execute oconnector_db --remote --command "SELECT id, nome_imobiliaria, whatsapp_numero, status FROM clientes WHERE whatsapp_numero LIKE '%${NUMERO_LIMPO}%';" 2>/dev/null || \
        echo -e "${YELLOW}⚠️  Não foi possível conectar ao banco. Verifique as credenciais do Cloudflare.${NC}"
    cd - > /dev/null 2>&1
    echo ""
fi

# Passo 4: Verificar todos os clientes
echo "📋 PASSO 4: Listando todos os clientes cadastrados"
echo "---------------------------------------------------"
echo ""
if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
    cd backend-deployment 2>/dev/null || true
    wrangler d1 execute oconnector_db --remote --command "SELECT id, nome_imobiliaria, whatsapp_numero, status FROM clientes LIMIT 10;" 2>/dev/null || \
        echo -e "${YELLOW}⚠️  Não foi possível conectar ao banco.${NC}"
    cd - > /dev/null 2>&1
    echo ""
fi

# Passo 5: Sugestões de correção
echo "🔧 PASSO 5: Sugestões de Correção"
echo "----------------------------------"
echo ""

# Verificar se há clientes
echo "Opções para resolver:"
echo ""
echo "1️⃣  Criar novo cliente com este número:"
echo "   curl -X POST ${API_URL}/api/clientes \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{"
echo "       \"nome_imobiliaria\": \"Nome da Imobiliária\","
echo "       \"whatsapp_numero\": \"${NUMERO_LIMPO}\","
echo "       \"plano\": \"STARTER\","
echo "       \"valor_mensal\": 500"
echo "     }'"
echo ""

echo "2️⃣  Atualizar cliente existente (se houver):"
echo "   UPDATE clientes SET whatsapp_numero = '${NUMERO_LIMPO}', status = 'ativo' WHERE id = X;"
echo ""

echo "3️⃣  Verificar logs do bot para ver qual número está sendo usado:"
echo "   tail -f whatsapp-bot/logs/whatsapp-bot.log"
echo ""

echo "4️⃣  Verificar cache do bot (limpar se necessário):"
echo "   O cache do ClienteManager expira em 5 minutos automaticamente."
echo ""

# Passo 6: Criar cliente automaticamente?
echo "❓ Deseja criar um cliente automaticamente com este número? (s/n)"
read -p "Resposta: " CRIAR_CLIENTE

if [ "$CRIAR_CLIENTE" = "s" ] || [ "$CRIAR_CLIENTE" = "S" ]; then
    echo ""
    read -p "Nome da Imobiliária: " NOME_IMOBILIARIA
    read -p "Plano (STARTER/PRO/ENTERPRISE) [STARTER]: " PLANO
    PLANO=${PLANO:-STARTER}
    read -p "Valor Mensal [500]: " VALOR_MENSAL
    VALOR_MENSAL=${VALOR_MENSAL:-500}
    
    echo ""
    echo "Criando cliente..."
    response=$(curl -s -X POST "${API_URL}/api/clientes" \
        -H "Content-Type: application/json" \
        -d "{
            \"nome_imobiliaria\": \"${NOME_IMOBILIARIA}\",
            \"whatsapp_numero\": \"${NUMERO_LIMPO}\",
            \"plano\": \"${PLANO}\",
            \"valor_mensal\": ${VALOR_MENSAL}
        }")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # Verificar se foi criado
    echo "Verificando se foi criado..."
    test_api "$NUMERO_LIMPO"
    
    echo ""
    echo -e "${GREEN}✅ Cliente criado! Agora você precisa treiná-lo:${NC}"
    echo "   cd backend-deployment"
    echo "   ./test-treinar.sh <cliente_id>"
    echo ""
fi

echo ""
echo "================================================"
echo "✅ Diagnóstico concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Certifique-se de que o cliente existe e está 'ativo'"
echo "   2. O número WhatsApp deve estar exatamente como no banco"
echo "   3. Treine o cliente após criar: ./test-treinar.sh <cliente_id>"
echo "   4. Reinicie o bot se necessário"
echo ""

