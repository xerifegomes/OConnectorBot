#!/bin/bash

# =============================================================================
# Corrigir Mapeamento WhatsApp → Cliente
# =============================================================================

set -e

echo "======================================"
echo "🔧 Corrigindo Mapeamento WhatsApp"
echo "======================================"
echo ""

# Configurações
WHATSAPP_NUMBER="5522992363462"
CLIENTE_ID=4

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd /Volumes/LexarAPFS/OCON/backend-deployment

# 1. Mostrar situação atual
echo -e "${BLUE}📊 Situação Atual:${NC}"
echo "  WhatsApp Conectado: $WHATSAPP_NUMBER"
echo "  Cliente ID: $CLIENTE_ID"
echo ""

# 2. Verificar cliente atual
echo -e "${BLUE}1️⃣ Verificando cliente atual...${NC}"
npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT id, nome_imobiliaria, whatsapp_numero, data_ultimo_treino FROM clientes WHERE id = $CLIENTE_ID;" 2>&1 | grep -A 20 "results"

echo ""

# 3. Atualizar número
echo -e "${YELLOW}2️⃣ Atualizando número do WhatsApp...${NC}"
npx wrangler d1 execute oconnector_db --remote --command \
  "UPDATE clientes SET whatsapp_numero = '$WHATSAPP_NUMBER' WHERE id = $CLIENTE_ID;"

echo ""

# 4. Verificar atualização
echo -e "${BLUE}3️⃣ Verificando atualização...${NC}"
RESULT=$(npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT id, nome_imobiliaria, whatsapp_numero, data_ultimo_treino FROM clientes WHERE id = $CLIENTE_ID;" 2>&1)

echo "$RESULT" | grep -A 20 "results"

# Verificar se número foi atualizado
if echo "$RESULT" | grep -q "$WHATSAPP_NUMBER"; then
  echo ""
  echo -e "${GREEN}✅ Número atualizado com sucesso!${NC}"
else
  echo ""
  echo -e "${RED}❌ Erro ao atualizar número${NC}"
  exit 1
fi

echo ""

# 5. Verificar treinamento
echo -e "${BLUE}4️⃣ Verificando treinamento do agente...${NC}"
TREINO_RESULT=$(npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT data_ultimo_treino FROM clientes WHERE id = $CLIENTE_ID;" 2>&1)

if echo "$TREINO_RESULT" | grep -q "null"; then
  echo -e "${YELLOW}⚠️  Agente não foi treinado!${NC}"
  echo ""
  echo "Execute o treinamento:"
  echo "  cd /Volumes/LexarAPFS/OCON"
  echo "  ./treinar-agente-empresa.sh"
  echo "  (Digite: $CLIENTE_ID quando solicitado)"
  echo ""
  AGENTE_TREINADO=false
else
  echo -e "${GREEN}✅ Agente já foi treinado${NC}"
  echo ""
  AGENTE_TREINADO=true
fi

# 6. Verificar se bot está rodando
echo -e "${BLUE}5️⃣ Verificando bot WhatsApp...${NC}"
if curl -s http://localhost:3001/status > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Bot WhatsApp está rodando${NC}"
  echo ""
  echo "Reiniciando bot para limpar cache..."
  curl -s -X POST http://localhost:3001/restart > /dev/null 2>&1 || true
  sleep 2
  echo -e "${GREEN}✅ Bot reiniciado${NC}"
else
  echo -e "${YELLOW}⚠️  Bot WhatsApp não está rodando${NC}"
  echo ""
  echo "Inicie o bot:"
  echo "  cd /Volumes/LexarAPFS/OCON/whatsapp-bot"
  echo "  npm run server"
  echo ""
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Correção Completa!${NC}"
echo "======================================"
echo ""

if [ "$AGENTE_TREINADO" = true ]; then
  echo -e "${GREEN}✅ Status Final:${NC}"
  echo "  • Número WhatsApp: $WHATSAPP_NUMBER"
  echo "  • Cliente ID: $CLIENTE_ID"
  echo "  • Mapeamento: Corrigido"
  echo "  • Agente: Treinado"
  echo "  • Bot: Reiniciado"
  echo ""
  echo -e "${GREEN}🧪 Teste Agora:${NC}"
  echo "  1. Envie mensagem WhatsApp para: $WHATSAPP_NUMBER"
  echo "  2. Aguarde resposta do bot com IA"
  echo "  3. Verifique frontend: Badge deve mostrar 'Agente Ativo'"
  echo ""
else
  echo -e "${YELLOW}⚠️  Ação Necessária:${NC}"
  echo "  • Mapeamento: ✅ Corrigido"
  echo "  • Agente: ❌ Precisa treinar"
  echo ""
  echo "Próximo passo:"
  echo "  cd /Volumes/LexarAPFS/OCON"
  echo "  ./treinar-agente-empresa.sh"
  echo ""
fi

echo -e "${BLUE}📝 Logs do bot:${NC}"
echo "  tail -f /Volumes/LexarAPFS/OCON/whatsapp-bot/bot-debug.log"
echo ""

