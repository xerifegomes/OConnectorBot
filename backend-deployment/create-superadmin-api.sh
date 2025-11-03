#!/bin/bash

# Script para criar superadmin via API de registro (se o endpoint existir)
# Ou atualizar senha via endpoint específico

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔐 Criando usuário superadmin via API..."
echo ""

# Dados do superadmin
EMAIL="dev@oconnector.tech"
SENHA="Rsg4dr3g44@"
NOME="Super Admin oConnector"

# Tentar criar via registro normal primeiro
echo "📤 Tentando registrar via /api/auth/register..."
payload=$(cat <<EOF
{
  "email": "$EMAIL",
  "senha": "$SENHA",
  "nome": "$NOME"
}
EOF
)

response=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "$payload" 2>&1)

echo "Resposta do registro:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Se funcionou, atualizar role para superadmin via SQL
if echo "$response" | grep -q "\"success\":true"; then
    echo ""
    echo -e "${GREEN}✅ Usuário criado! Agora atualize a role para superadmin via SQL:${NC}"
    echo ""
    echo "UPDATE usuarios SET role = 'superadmin' WHERE email = '$EMAIL';"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Alternativa: Execute o SQL direto no D1:"
echo ""
echo "UPDATE usuarios SET role = 'superadmin' WHERE email = '$EMAIL';"

