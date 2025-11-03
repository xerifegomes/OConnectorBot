#!/bin/bash

# Script para automatizar o máximo possível do processo de deploy
# Nota: O deploy final ainda precisa ser feito no Cloudflare Dashboard

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PREPARAÇÃO AUTOMÁTICA PARA DEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se wrangler está instalado
if command -v wrangler &> /dev/null; then
    echo -e "${GREEN}✅ Wrangler CLI instalado${NC}"
    WRANGLER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Wrangler CLI não encontrado${NC}"
    echo "   Instale com: npm install -g wrangler"
    WRANGLER_AVAILABLE=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  PREPARANDO CÓDIGO DE AUTENTICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Criar diretório workers se não existir
mkdir -p workers/oconnector-api
cd workers/oconnector-api

# Verificar se código já existe
if [ -f "index.js" ]; then
    echo -e "${YELLOW}⚠️  index.js já existe${NC}"
    read -p "Substituir? (s/N): " replace
    if [ "$replace" != "s" ] && [ "$replace" != "S" ]; then
        echo "Mantendo arquivo existente"
        cd ../..
    else
        echo "Substituindo..."
        cp ../../EXECUTAR_CODIGO_AUTH.txt index.js
        echo -e "${GREEN}✅ Código copiado${NC}"
        cd ../..
    fi
else
    cp ../../EXECUTAR_CODIGO_AUTH.txt index.js
    echo -e "${GREEN}✅ Código copiado para workers/oconnector-api/index.js${NC}"
    cd ../..
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  OPÇÕES DE DEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$WRANGLER_AVAILABLE" = true ]; then
    echo "Opção A: Deploy via Wrangler CLI"
    echo "  Execute: cd workers/oconnector-api && wrangler deploy"
    echo ""
    read -p "Fazer deploy via Wrangler agora? (s/N): " deploy_wrangler
    if [ "$deploy_wrangler" = "s" ] || [ "$deploy_wrangler" = "S" ]; then
        echo ""
        echo "Fazendo deploy..."
        cd workers/oconnector-api
        wrangler deploy
        cd ../..
        echo -e "${GREEN}✅ Deploy concluído!${NC}"
        echo ""
        echo "Testando..."
        sleep 2
        ./backend-deployment/test-completo.sh
    fi
fi

echo ""
echo "Opção B: Deploy via Cloudflare Dashboard"
echo ""
echo "1. Acesse: https://dash.cloudflare.com/"
echo "2. Workers & Pages → oconnector-api → Edit code"
echo "3. Copie o conteúdo de: $(pwd)/workers/oconnector-api/index.js"
echo "4. Cole no editor"
echo "5. Save and Deploy"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  PRÓXIMOS PASSOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Após deploy do auth:"
echo "  ./backend-deployment/test-completo.sh"
echo ""
echo "Depois corrija o training (ver DEPLOY_COMPLETO.md)"
echo ""

