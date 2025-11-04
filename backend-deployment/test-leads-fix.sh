#!/bin/bash

# =============================================================================
# Teste de Validação - Correção da Tabela Leads
# Verifica se a coluna updated_at foi adicionada com sucesso
# =============================================================================

set -e

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev"

echo "======================================"
echo "🧪 TESTE: Validação Correção Leads"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar estrutura da tabela via wrangler
echo "📊 1. Verificando estrutura da tabela leads..."
echo ""

cd /Volumes/LexarAPFS/OCON/backend-deployment

STRUCTURE=$(npx wrangler d1 execute oconnector_db --remote --command "PRAGMA table_info(leads);" 2>/dev/null | grep -i "updated_at" || echo "")

if [ -z "$STRUCTURE" ]; then
  echo -e "${RED}❌ ERRO: Coluna updated_at NÃO encontrada!${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Coluna updated_at encontrada!${NC}"
  echo ""
fi

# 2. Testar endpoint GET /api/leads com autenticação
echo "🌐 2. Testando endpoint GET /api/leads..."
echo ""
echo "${YELLOW}⚠️  NOTA: Este teste requer token de autenticação válido${NC}"
echo ""

# Você precisa substituir SEU_TOKEN_AQUI por um token válido
# Para gerar token, faça login no frontend ou use o endpoint /api/auth/login

TOKEN="${BEARER_TOKEN:-SEU_TOKEN_AQUI}"

if [ "$TOKEN" = "SEU_TOKEN_AQUI" ]; then
  echo -e "${YELLOW}⏭️  Pulando teste de API (token não configurado)${NC}"
  echo ""
  echo "Para testar a API, configure a variável BEARER_TOKEN:"
  echo "export BEARER_TOKEN='seu_token_jwt'"
  echo "./test-leads-fix.sh"
  echo ""
else
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/leads?cliente_id=1")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "Status HTTP: $HTTP_CODE"
  echo ""
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API respondeu com sucesso (200 OK)${NC}"
    echo ""
    
    # Verificar se response tem campo updated_at
    if echo "$BODY" | grep -q "updated_at"; then
      echo -e "${GREEN}✅ Campo updated_at presente na resposta!${NC}"
    else
      echo -e "${YELLOW}⚠️  Campo updated_at não encontrado na resposta (pode ser que não haja leads)${NC}"
    fi
  elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "${RED}❌ ERRO 500: Ainda há problema no servidor${NC}"
    echo ""
    echo "Detalhes da resposta:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
  elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}⚠️  Erro 401: Token inválido ou expirado${NC}"
  else
    echo -e "${YELLOW}⚠️  Status inesperado: $HTTP_CODE${NC}"
  fi
  
  echo ""
fi

# 3. Verificar dados de exemplo no banco
echo "📁 3. Verificando dados na tabela leads..."
echo ""

LEAD_DATA=$(npx wrangler d1 execute oconnector_db --remote --command "SELECT id, nome, created_at, updated_at FROM leads LIMIT 1;" 2>/dev/null)

if echo "$LEAD_DATA" | grep -q "updated_at"; then
  echo -e "${GREEN}✅ Coluna updated_at presente nos dados!${NC}"
  echo ""
  echo "Exemplo de registro:"
  echo "$LEAD_DATA" | grep -A 10 "results"
else
  echo -e "${YELLOW}⚠️  Não foi possível verificar dados (tabela pode estar vazia)${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎉 VALIDAÇÃO COMPLETA!${NC}"
echo "======================================"
echo ""
echo "Resumo:"
echo "✅ Estrutura da tabela: OK"
echo "✅ Coluna updated_at: PRESENTE"
echo ""
echo "Próximos passos:"
echo "1. Testar criação de novo lead via WhatsApp"
echo "2. Testar visualização de leads no dashboard"
echo "3. Testar atualização de lead existente"
echo ""

