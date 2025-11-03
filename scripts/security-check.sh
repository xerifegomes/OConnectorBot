#!/bin/bash

# Script de Verificação de Segurança
# Verifica credenciais expostas e vulnerabilidades

set -e

echo "🔒 Executando verificação de segurança..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# 1. Verificar se há credenciais hardcoded
echo "🔍 Verificando credenciais hardcoded..."
if grep -r "sk_live_" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next 2>/dev/null; then
    echo -e "${RED}❌ Stripe Live Key encontrado no código!${NC}"
    ISSUES=$((ISSUES + 1))
fi

if grep -r "ghp_" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next 2>/dev/null; then
    echo -e "${RED}❌ GitHub Token encontrado no código!${NC}"
    ISSUES=$((ISSUES + 1))
fi

if grep -r "CLOUDFLARE_API_TOKEN" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next | grep -v ".env.example" | grep -v "ENV.md" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Verificar se tokens não estão hardcoded${NC}"
fi

# 2. Verificar se .env.local existe e não está no git
if [ -f ".env.local" ] && git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo -e "${RED}❌ .env.local está sendo rastreado pelo git!${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 3. Verificar se .gitignore inclui .env*
if ! grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "${YELLOW}⚠️  .env* não está no .gitignore${NC}"
fi

# 4. Verificar dependências com vulnerabilidades
echo "🔍 Verificando vulnerabilidades em dependências..."
cd oconnector-frontend
if npm audit --audit-level=moderate 2>/dev/null; then
    echo -e "${GREEN}✅ Nenhuma vulnerabilidade moderada ou alta encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  Vulnerabilidades encontradas. Execute: npm audit fix${NC}"
    ISSUES=$((ISSUES + 1))
fi
cd ..

# 5. Verificar uso de localStorage para tokens
echo "🔍 Verificando uso de localStorage para tokens..."
if grep -r "localStorage.getItem.*token" oconnector-frontend --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${YELLOW}⚠️  JWT ainda está em localStorage. Considere usar httpOnly cookies${NC}"
fi

# Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Verificação de segurança concluída sem problemas críticos${NC}"
else
    echo -e "${RED}❌ Encontrados $ISSUES problema(s) de segurança${NC}"
    exit 1
fi

