#!/bin/bash

# Script para criar usuário superadmin via API
# A API deve fazer o hash da senha antes de salvar

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api"

echo "🔐 Criando usuário superadmin..."
echo ""

# Tentar criar via endpoint de registro (se existir endpoint admin)
# Ou vamos usar SQL direto com hash gerado

# Primeiro, vamos usar curl para registrar (se endpoint existir)
# Caso contrário, usaremos SQL direto

payload=$(cat <<EOF
{
  "email": "dev@oconnector.tech",
  "senha": "Rsg4dr3g44@",
  "nome": "Super Admin oConnector",
  "role": "superadmin"
}
EOF
)

echo "📤 Tentando criar via API..."
response=$(curl -s -X POST "${API_URL}/auth/register-admin" \
  -H "Content-Type: application/json" \
  -d "$payload" 2>&1)

echo "Resposta:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Se não funcionar, criar via SQL direto (hash será gerado pelo backend no próximo login)
echo ""
echo "💡 Se a API não funcionar, use o SQL direto (veja create-superadmin.sql)"

