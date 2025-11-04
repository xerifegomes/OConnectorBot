#!/bin/bash

# =============================================================================
# Teste de Conexão WhatsApp - Validação Completa
# =============================================================================

echo "======================================"
echo "🧪 Teste de Conexão WhatsApp"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar bot rodando
echo -e "${BLUE}1️⃣ Verificando bot server...${NC}"
RESPONSE=$(curl -s http://localhost:3001/status 2>/dev/null)

if [ -z "$RESPONSE" ]; then
  echo -e "${RED}❌ Bot server não está rodando${NC}"
  echo ""
  echo "Solução:"
  echo "  cd /Volumes/LexarAPFS/OCON/whatsapp-bot"
  echo "  npm run server"
  echo ""
  echo "Ou use o reset:"
  echo "  ./reset-whatsapp.sh"
  exit 1
fi

echo -e "${GREEN}✅ Bot server rodando${NC}"
echo ""

# 2. Verificar status
echo -e "${BLUE}2️⃣ Verificando status...${NC}"
STATUS=$(echo $RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ -z "$STATUS" ]; then
  STATUS="unknown"
fi

echo "Status atual: $STATUS"
echo ""

# 3. Verificar QR code e tomar ação
if [ "$STATUS" = "waiting_qr" ]; then
  echo -e "${YELLOW}3️⃣ QR Code disponível! ⏰${NC}"
  echo ""
  echo "QR Code está esperando para ser escaneado."
  echo ""
  echo -e "${GREEN}Próximos passos:${NC}"
  echo "  1. Abra: http://localhost:3001/qr"
  echo "  2. Ou execute: open http://localhost:3001/qr"
  echo "  3. Escaneie com WhatsApp (< 60 segundos!)"
  echo ""
  
  # Tentar abrir automaticamente
  if command -v open &> /dev/null; then
    read -p "Abrir QR code no navegador agora? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
      open http://localhost:3001/qr
      echo -e "${GREEN}✅ QR code aberto no navegador${NC}"
    fi
  fi
  
elif [ "$STATUS" = "connected" ] || [ "$STATUS" = "ready" ]; then
  echo -e "${GREEN}3️⃣ ✅ Já conectado!${NC}"
  echo ""
  
  # Obter informações do bot
  INFO=$(curl -s http://localhost:3001/info 2>/dev/null)
  WHATSAPP_NUMBER=$(echo $INFO | grep -o '"whatsappNumber":"[^"]*"' | cut -d'"' -f4)
  
  if [ ! -z "$WHATSAPP_NUMBER" ]; then
    echo "Número WhatsApp: $WHATSAPP_NUMBER"
  fi
  
  echo ""
  echo -e "${GREEN}Acesse o frontend:${NC}"
  echo "  http://localhost:3000/whatsapp  (desenvolvimento)"
  echo "  https://seu-site.pages.dev/whatsapp  (produção)"
  
elif [ "$STATUS" = "disconnected" ]; then
  echo -e "${RED}3️⃣ ❌ Bot desconectado${NC}"
  echo ""
  echo "Bot não está conectado ao WhatsApp."
  echo ""
  echo -e "${YELLOW}Solução:${NC}"
  echo "  ./reset-whatsapp.sh"
  
elif [ "$STATUS" = "connecting" ]; then
  echo -e "${YELLOW}3️⃣ ⏳ Bot está conectando...${NC}"
  echo ""
  echo "Aguarde alguns segundos e verifique novamente:"
  echo "  ./test-whatsapp-connection.sh"
  
else
  echo -e "${YELLOW}3️⃣ ⚠️  Status desconhecido: $STATUS${NC}"
  echo ""
  echo "Tente reiniciar o bot:"
  echo "  ./reset-whatsapp.sh"
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎯 Teste Completo!${NC}"
echo "======================================"
echo ""

# 4. Verificar porta
echo -e "${BLUE}4️⃣ Informações adicionais:${NC}"
PORT_IN_USE=$(lsof -i :3001 2>/dev/null | grep LISTEN | wc -l | xargs)

if [ "$PORT_IN_USE" -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} Porta 3001: Em uso (bot rodando)"
else
  echo -e "  ${RED}✗${NC} Porta 3001: Livre (bot não está rodando)"
fi

# 5. Verificar logs
if [ -f "bot-debug.log" ]; then
  LAST_LOG=$(tail -n 1 bot-debug.log 2>/dev/null)
  if [ ! -z "$LAST_LOG" ]; then
    echo -e "  ${GREEN}✓${NC} Logs disponíveis: bot-debug.log"
  fi
else
  echo -e "  ${YELLOW}⚠${NC}  Logs: Não encontrado"
fi

echo ""
echo -e "${BLUE}📝 Comandos úteis:${NC}"
echo "  Ver logs:        tail -f bot-debug.log"
echo "  Ver status:      curl http://localhost:3001/status | jq '.'"
echo "  Ver QR:          curl http://localhost:3001/qr | jq '.qr'"
echo "  Reiniciar bot:   ./reset-whatsapp.sh"
echo ""

