#!/bin/bash

# =============================================================================
# Script para Testar Login no oConnector API
# =============================================================================

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔐 Teste de Login - oConnector API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Credenciais
EMAIL="dev@oconnector.tech"
SENHA="Rsg4dr3g44@"

echo -e "${YELLOW}📤 Enviando requisição de login...${NC}"
echo ""
echo "Endpoint: ${API_URL}/api/auth/login"
echo "Email: ${EMAIL}"
echo "Senha: ${SENHA}"
echo ""

# Fazer requisição
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"senha\":\"${SENHA}\"}")

# Separar body e status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resposta:"
echo ""

# Verificar status code
if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: 200 OK${NC}"
    echo ""
    echo "Corpo da resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    
    # Extrair token se houver
    token=$(echo "$body" | jq -r '.data.token' 2>/dev/null)
    if [ "$token" != "null" ] && [ -n "$token" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${GREEN}🎉 Login bem-sucedido!${NC}"
        echo ""
        echo "Token gerado:"
        echo "${token:0:50}..."
        echo ""
        echo "Usuário:"
        echo "$body" | jq '.data.user' 2>/dev/null
    fi
elif [ "$http_code" -eq 401 ]; then
    echo -e "${RED}❌ Status: 401 Unauthorized${NC}"
    echo ""
    echo "Corpo da resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    echo -e "${YELLOW}⚠️  Possíveis causas:${NC}"
    echo "1. Usuário não existe no banco D1"
    echo "2. Senha incorreta"
    echo "3. Senha em formato bcrypt (deve ser SHA-256)"
    echo ""
    echo -e "${BLUE}💡 Solução:${NC}"
    echo "Execute o SQL no D1 Console:"
    echo ""
    echo "cat backend-deployment/create-superadmin-sha256.sql"
elif [ "$http_code" -eq 500 ]; then
    echo -e "${RED}❌ Status: 500 Internal Server Error${NC}"
    echo ""
    echo "Corpo da resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    echo -e "${YELLOW}⚠️  Erro no servidor${NC}"
    echo "Verifique os logs do Worker no Cloudflare Dashboard"
else
    echo -e "${RED}❌ Status: ${http_code}${NC}"
    echo ""
    echo "Corpo da resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

