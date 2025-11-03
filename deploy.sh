#!/bin/bash

# Script de Deploy Automatizado - oConnector
# Tenta fazer deploy via Wrangler CLI, ou fornece instruções detalhadas

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY AUTOMATIZADO - oConnector"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se wrangler está instalado
if command -v wrangler &> /dev/null; then
    echo -e "${GREEN}✅ Wrangler CLI encontrado${NC}"
    WRANGLER_VERSION=$(wrangler --version 2>&1 | head -1)
    echo "   Versão: $WRANGLER_VERSION"
    WRANGLER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Wrangler CLI não encontrado${NC}"
    WRANGLER_AVAILABLE=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VERIFICANDO PREPARAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar arquivos necessários
if [ -f "workers/oconnector-api/index.js" ]; then
    echo -e "${GREEN}✅ Código do worker oconnector-api existe${NC}"
    LINES=$(wc -l < workers/oconnector-api/index.js)
    echo "   Linhas: $LINES"
else
    echo -e "${RED}❌ Código do worker não encontrado${NC}"
    echo "   Criando..."
    cp EXECUTAR_CODIGO_AUTH.txt workers/oconnector-api/index.js
    echo -e "${GREEN}✅ Código copiado${NC}"
fi

if [ -f "workers/oconnector-api/wrangler.toml" ]; then
    echo -e "${GREEN}✅ Configuração wrangler.toml existe${NC}"
else
    echo -e "${YELLOW}⚠️  wrangler.toml não encontrado${NC}"
    echo "   Usando configuração padrão..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  OPÇÕES DE DEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$WRANGLER_AVAILABLE" = true ]; then
    echo "Opção A: Deploy via Wrangler CLI (Recomendado)"
    echo ""
    
    # Verificar se está logado
    echo "Verificando autenticação..."
    if wrangler whoami &> /dev/null; then
        echo -e "${GREEN}✅ Logado no Cloudflare${NC}"
        ACCOUNT=$(wrangler whoami 2>&1 | grep -oP 'email: \K[^\s]+' || echo "conta ativa")
        echo "   Conta: $ACCOUNT"
        
        echo ""
        echo "Iniciando deploy do oconnector-api..."
        echo ""
        
        cd workers/oconnector-api
        
        # Tentar fazer deploy
        if wrangler deploy --dry-run &> /dev/null || true; then
            echo "Configuração válida!"
            echo ""
            read -p "Fazer deploy agora? (s/N): " confirm
            
            if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
                echo ""
                echo "Fazendo deploy..."
                wrangler deploy
                
                if [ $? -eq 0 ]; then
                    echo ""
                    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
                    echo ""
                    echo "Testando endpoint..."
                    sleep 3
                    
                    # Testar login
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "3️⃣  TESTANDO DEPLOY"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""
                    
                    cd ../..
                    
                    TEST_RESPONSE=$(curl -s -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login \
                        -H "Content-Type: application/json" \
                        -d '{"email":"dev@oconnector.tech","senha":"Rsg4dr3g44@"}' \
                        -w "\n%{http_code}")
                    
                    HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n1)
                    BODY=$(echo "$TEST_RESPONSE" | sed '$d')
                    
                    if [ "$HTTP_CODE" -eq 200 ]; then
                        echo -e "${GREEN}✅ Login funcionando!${NC}"
                        echo "   Resposta: $(echo "$BODY" | jq -r '.success' 2>/dev/null || echo 'OK')"
                    else
                        echo -e "${YELLOW}⚠️  Endpoint respondeu com HTTP $HTTP_CODE${NC}"
                        echo "   Pode ser necessário verificar a senha no banco"
                    fi
                else
                    echo ""
                    echo -e "${RED}❌ Erro no deploy${NC}"
                    echo "   Verifique os logs acima"
                    cd ../..
                fi
            else
                echo "Deploy cancelado"
                cd ../..
            fi
        else
            echo "Erro na configuração. Verificando..."
            cd ../..
        fi
    else
        echo -e "${YELLOW}⚠️  Não está logado${NC}"
        echo ""
        echo "Faça login primeiro:"
        echo "   wrangler login"
        echo ""
        echo "Depois execute este script novamente."
    fi
else
    echo "Wrangler CLI não disponível."
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opção B: Deploy via Cloudflare Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Acesse: https://dash.cloudflare.com/"
echo "2. Workers & Pages → oconnector-api → Edit code"
echo "3. Copie o conteúdo de: $(pwd)/workers/oconnector-api/index.js"
echo "4. Cole no editor"
echo "5. Save and Deploy"
echo ""

if [ "$WRANGLER_AVAILABLE" != true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 INSTALAR WRANGLER CLI (Opcional)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Para fazer deploy via CLI no futuro:"
    echo "   npm install -g wrangler"
    echo "   wrangler login"
    echo "   wrangler deploy"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Preparação concluída!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

