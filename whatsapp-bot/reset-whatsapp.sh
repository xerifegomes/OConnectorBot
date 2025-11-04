#!/bin/bash

# =============================================================================
# Reset Completo do WhatsApp Bot - Solução para Loop Infinito
# =============================================================================

set -e

echo "======================================"
echo "🔄 Reset Completo WhatsApp Bot"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Parar todos os processos
echo -e "${YELLOW}1️⃣ Parando processos...${NC}"
pkill -f "node.*bot-server" 2>/dev/null || true
pkill -f "node.*whatsapp-bot" 2>/dev/null || true
pkill -f "node.*src/index" 2>/dev/null || true
pkill -f ngrok 2>/dev/null || true
pkill -f chromium 2>/dev/null || true
pkill -f chrome 2>/dev/null || true

sleep 3

# Verificar se pararam
RUNNING=$(ps aux | grep -E "node.*(bot|whatsapp)" | grep -v grep | wc -l)
if [ "$RUNNING" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Ainda há processos rodando. Forçando parada...${NC}"
  pkill -9 -f "node.*bot" 2>/dev/null || true
  sleep 2
fi

echo -e "${GREEN}✅ Processos parados!${NC}"
echo ""

# 2. Limpar sessão
echo -e "${YELLOW}2️⃣ Limpando sessão...${NC}"

if [ -d ".wwebjs_auth" ]; then
  rm -rf .wwebjs_auth/
  echo -e "${GREEN}✅ Sessão .wwebjs_auth/ removida${NC}"
else
  echo -e "${YELLOW}⏭️  Pasta .wwebjs_auth/ não existe${NC}"
fi

if [ -d "$HOME/.cache/puppeteer" ]; then
  rm -rf $HOME/.cache/puppeteer
  echo -e "${GREEN}✅ Cache do Puppeteer limpo${NC}"
else
  echo -e "${YELLOW}⏭️  Cache do Puppeteer não encontrado${NC}"
fi

# Limpar logs antigos
if [ -f "bot-debug.log" ]; then
  rm bot-debug.log
  echo -e "${GREEN}✅ Logs antigos removidos${NC}"
fi

echo ""

# 3. Verificar se limpou
if [ -d ".wwebjs_auth" ]; then
  echo -e "${RED}❌ ERRO: Não conseguiu remover .wwebjs_auth${NC}"
  echo "Tente manualmente: sudo rm -rf .wwebjs_auth/"
  exit 1
fi

echo -e "${GREEN}✅ Limpeza completa!${NC}"
echo ""

# 4. Atualizar dependências
echo -e "${YELLOW}3️⃣ Verificando whatsapp-web.js...${NC}"

CURRENT_VERSION=$(npm list whatsapp-web.js 2>/dev/null | grep whatsapp-web.js | sed 's/.*@//' | sed 's/ .*//')

if [ -z "$CURRENT_VERSION" ]; then
  echo -e "${RED}❌ whatsapp-web.js não encontrado!${NC}"
  echo "Instalando..."
  npm install whatsapp-web.js@latest
else
  echo "Versão atual: $CURRENT_VERSION"
  echo "Atualizando para última versão..."
  npm update whatsapp-web.js
fi

UPDATED_VERSION=$(npm list whatsapp-web.js 2>/dev/null | grep whatsapp-web.js | sed 's/.*@//' | sed 's/ .*//')
echo -e "${GREEN}✅ whatsapp-web.js versão: $UPDATED_VERSION${NC}"
echo ""

# 5. Verificar node_modules
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules não encontrado. Instalando dependências...${NC}"
  npm install
  echo ""
fi

# 6. Reiniciar bot
echo -e "${YELLOW}4️⃣ Reiniciando bot...${NC}"
echo ""

# Verificar qual script usar
if grep -q "\"server\"" package.json; then
  echo "Iniciando com: npm run server"
  npm run server > bot-debug.log 2>&1 &
elif grep -q "\"start\"" package.json; then
  echo "Iniciando com: npm start"
  npm start > bot-debug.log 2>&1 &
else
  echo "Iniciando com: node src/index.js"
  node src/index.js > bot-debug.log 2>&1 &
fi

BOT_PID=$!

sleep 8

# Verificar se iniciou
if ps -p $BOT_PID > /dev/null; then
  echo -e "${GREEN}✅ Bot iniciado! (PID: $BOT_PID)${NC}"
else
  echo -e "${RED}❌ Bot falhou ao iniciar${NC}"
  echo "Verifique os logs: tail -f bot-debug.log"
  exit 1
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Reset Completo!${NC}"
echo "======================================"
echo ""
echo "📊 Status:"
echo "  - Processos antigos: Parados"
echo "  - Sessão: Limpa"
echo "  - whatsapp-web.js: $UPDATED_VERSION"
echo "  - Bot: Rodando (PID: $BOT_PID)"
echo ""
echo "📱 Próximos passos:"
echo "  1. Aguarde 10-15 segundos para bot inicializar"
echo "  2. Acesse: http://localhost:3001/qr"
echo "  3. Escaneie o QR Code com WhatsApp (< 60 segundos)"
echo "  4. Aguarde mensagem: ✅ WhatsApp Bot conectado"
echo ""
echo "📝 Ver logs em tempo real:"
echo "  tail -f bot-debug.log"
echo ""
echo "🔍 Verificar status:"
echo "  curl http://localhost:3001/info"
echo ""

