#!/bin/bash

# Script para facilitar o deploy da autenticação
# Este script prepara tudo, mas o deploy final precisa ser feito no Cloudflare Dashboard

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PREPARAÇÃO PARA DEPLOY DE AUTENTICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se o código existe
if [ ! -f "index.js" ]; then
    echo -e "${YELLOW}⚠️  Arquivo index.js não encontrado${NC}"
    echo "Copiando código completo..."
    cp ../worker-completo-exemplo.js index.js 2>/dev/null || {
        echo "Arquivo worker-completo-exemplo.js não encontrado"
        exit 1
    }
fi

echo -e "${GREEN}✅ Código do worker preparado${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Abra o Cloudflare Dashboard:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "2. Navegue: Workers & Pages → oconnector-api"
echo ""
echo "3. Clique em 'Edit code'"
echo ""
echo "4. Copie o conteúdo do arquivo:"
echo "   $(pwd)/index.js"
echo ""
echo "5. Cole no editor do Cloudflare"
echo ""
echo "6. Clique em 'Save and Deploy'"
echo ""
echo "7. Teste com:"
echo "   curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"email\":\"dev@oconnector.tech\",\"senha\":\"Rsg4dr3g44@\"}'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

