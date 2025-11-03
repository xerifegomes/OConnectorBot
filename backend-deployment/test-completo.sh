#!/bin/bash

# Script de Teste Completo - Validar Todo o Sistema
# Executa todos os testes necessários para validar MVP

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev"
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTE COMPLETO DO SISTEMA oConnector"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função para testar
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testando: ${name}${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null)
    else
        response=$(curl -s -X "$method" -w "\n%{http_code}" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        if [ -z "$expected" ] || echo "$body" | grep -q "$expected"; then
            echo -e "${GREEN}✅ PASSOU${NC}"
            echo "   HTTP: $http_code"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${RED}❌ FALHOU${NC}"
            echo "   Resposta não contém: $expected"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        echo -e "${RED}❌ FALHOU${NC}"
        echo "   HTTP: $http_code"
        echo "   Resposta: $body" | head -3
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Teste 1: Health Check oconnector-api
echo "1️⃣  Health Check oconnector-api"
test_endpoint \
    "GET /api" \
    "GET" \
    "$API_URL/api" \
    "" \
    "success"

echo ""

# Teste 2: Health Check agent-training-worker
echo "2️⃣  Health Check agent-training-worker"
test_endpoint \
    "GET /api" \
    "GET" \
    "$TRAINING_URL/api" \
    "" \
    "success"

echo ""

# Teste 3: Login
echo "3️⃣  Login (Endpoint de Autenticação)"
login_response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"dev@oconnector.tech","senha":"Rsg4dr3g44@"}' \
    -w "\n%{http_code}" 2>/dev/null)

login_http=$(echo "$login_response" | tail -n1)
login_body=$(echo "$login_response" | sed '$d')

TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ "$login_http" -eq 200 ]; then
    if echo "$login_body" | grep -q "\"success\":true"; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        TOKEN=$(echo "$login_body" | jq -r '.data.token // empty' 2>/dev/null || echo "")
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FALHOU${NC}"
        echo "   Resposta: $login_body" | head -5
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo -e "${RED}❌ FALHOU${NC}"
    echo "   HTTP: $login_http"
    echo "   Resposta: $login_body" | head -3
    echo -e "${YELLOW}   ⚠️  Endpoint de auth não implementado ainda${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""

# Teste 4: Verify Token (se login passou)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "4️⃣  Verify Token"
    test_endpoint \
        "GET /api/auth/verify" \
        "GET" \
        "$API_URL/api/auth/verify" \
        "" \
        "success" \
        "$TOKEN"
    echo ""
fi

# Teste 5: Prospecção
echo "5️⃣  Prospecção Google Places"
test_endpoint \
    "POST /api/prospectar" \
    "POST" \
    "$API_URL/api/prospectar" \
    '{"nicho":"imobiliária","cidade":"Iguaba Grande"}' \
    "success"

echo ""

# Teste 6: Training (se token disponível)
echo "6️⃣  Training Agent"
training_response=$(curl -s -X POST "$TRAINING_URL/api/train" \
    -H "Content-Type: application/json" \
    -d '{
      "cliente_id": 3,
      "nome_empresa": "Imobiliária Silva Teste",
      "whatsapp": "(22) 99999-9999",
      "endereco": "Rua XV, 100, Iguaba Grande - RJ",
      "horario": "Seg-Sex: 8h-18h",
      "diferenciais": "20 anos no mercado",
      "corretor_nome": ["Carlos Silva"],
      "corretor_especialidade": ["Vendas"],
      "faq_pergunta": ["Vocês trabalham com financiamento?"],
      "faq_resposta": ["Sim, parceria com bancos"],
      "tom_voz": "amigavel",
      "usar_emojis": "moderado"
    }' \
    -w "\n%{http_code}" 2>/dev/null)

training_http=$(echo "$training_response" | tail -n1)
training_body=$(echo "$training_response" | sed '$d')

TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ "$training_http" -eq 200 ]; then
    documentos=$(echo "$training_body" | jq -r '.documentos_processados // 0' 2>/dev/null || echo "0")
    if [ "$documentos" -gt 0 ]; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        echo "   Documentos processados: $documentos"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️  PARCIAL${NC}"
        echo "   Documentos processados: $documentos"
        echo "   Possível bug: env.VECTORIZE não configurado"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo -e "${RED}❌ FALHOU${NC}"
    echo "   HTTP: $training_http"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DOS TESTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total de testes: $TOTAL_TESTS"
echo -e "${GREEN}Passou: $PASSED_TESTS${NC}"
echo -e "${RED}Falhou: $FAILED_TESTS${NC}"
echo ""

# Calcular porcentagem
if [ $TOTAL_TESTS -gt 0 ]; then
    PERCENT=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Taxa de sucesso: ${PERCENT}%"
    
    if [ $PERCENT -ge 90 ]; then
        echo -e "${GREEN}✅ Sistema pronto para produção!${NC}"
    elif [ $PERCENT -ge 70 ]; then
        echo -e "${YELLOW}⚠️  Sistema quase pronto, alguns ajustes necessários${NC}"
    else
        echo -e "${RED}❌ Sistema precisa de correções${NC}"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

