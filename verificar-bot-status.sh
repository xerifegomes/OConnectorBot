#!/bin/bash

# Script para verificar status do bot WhatsApp

echo "🔍 VERIFICAÇÃO DO STATUS DO BOT"
echo "================================"
echo ""

# Verificar se o bot está rodando
echo "📊 Processos do Bot:"
echo "--------------------"
BOT_PROCESS=$(ps aux | grep -E "bot-server\.js|src/index\.js|src/bot\.js" | grep -v grep)

if [ -z "$BOT_PROCESS" ]; then
    echo "❌ Bot NÃO está rodando!"
    echo ""
    echo "Para iniciar o bot:"
    echo "  cd whatsapp-bot"
    echo "  npm start"
    echo ""
else
    echo "✅ Bot está rodando!"
    echo ""
    echo "$BOT_PROCESS"
    echo ""
fi

# Verificar processos Chromium (WhatsApp Web)
echo ""
echo "🌐 Processos WhatsApp Web (Chromium):"
echo "-------------------------------------"
CHROMIUM_PROCESS=$(ps aux | grep -i "chromium\|puppeteer" | grep -v grep | wc -l | tr -d ' ')
if [ "$CHROMIUM_PROCESS" -gt 0 ]; then
    echo "✅ WhatsApp Web está ativo ($CHROMIUM_PROCESS processos)"
else
    echo "⚠️  WhatsApp Web não está ativo"
fi

# Verificar diretório de sessão
echo ""
echo "📁 Sessão WhatsApp:"
echo "-------------------"
if [ -d "whatsapp-bot/.wwebjs_auth" ]; then
    SESSION_SIZE=$(du -sh whatsapp-bot/.wwebjs_auth 2>/dev/null | cut -f1)
    echo "✅ Sessão encontrada (tamanho: $SESSION_SIZE)"
    
    # Verificar se há arquivos de sessão
    SESSION_FILES=$(find whatsapp-bot/.wwebjs_auth -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "   Arquivos: $SESSION_FILES"
else
    echo "⚠️  Sessão não encontrada (bot precisa escanear QR Code)"
fi

# Verificar logs
echo ""
echo "📝 Logs:"
echo "--------"
if [ -f "whatsapp-bot/bot-debug.log" ]; then
    echo "✅ Log encontrado: bot-debug.log"
    echo ""
    echo "Últimas 10 linhas:"
    tail -10 whatsapp-bot/bot-debug.log 2>/dev/null || echo "   (vazio)"
else
    echo "⚠️  Arquivo de log não encontrado"
    echo "   Os logs estão sendo exibidos no console do processo"
fi

# Verificar conexão com APIs
echo ""
echo "🔗 Testando APIs:"
echo "-----------------"
echo -n "  oConnector API: "
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oconnector-api.xerifegomes-e71.workers.dev/api 2>/dev/null)
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "404" ]; then
    echo "✅ Acessível"
else
    echo "❌ Não acessível (HTTP $API_RESPONSE)"
fi

echo -n "  Agent Training API: "
AGENT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/1 2>/dev/null)
if [ "$AGENT_RESPONSE" = "200" ] || [ "$AGENT_RESPONSE" = "404" ] || [ "$AGENT_RESPONSE" = "400" ]; then
    echo "✅ Acessível"
else
    echo "❌ Não acessível (HTTP $AGENT_RESPONSE)"
fi

# Verificar cliente
echo ""
echo "👤 Cliente OConnector:"
echo "----------------------"
CLIENTE_RESPONSE=$(curl -s "https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes?whatsapp=5522992363462" 2>/dev/null)
if echo "$CLIENTE_RESPONSE" | jq -e '.data | length > 0' > /dev/null 2>&1; then
    echo "✅ Cliente encontrado!"
    echo "$CLIENTE_RESPONSE" | jq '.data[0] | {id, nome_imobiliaria, whatsapp_numero, status}'
else
    echo "❌ Cliente não encontrado"
fi

echo ""
echo "================================================"
echo "💡 PRÓXIMOS PASSOS:"
echo ""
echo "Para ver logs em tempo real (se o bot estiver rodando):"
echo "  - Verifique o terminal onde o bot foi iniciado"
echo "  - Ou use: ps aux | grep bot-server"
echo ""
echo "Para reiniciar o bot:"
echo "  cd whatsapp-bot"
echo "  pkill -f bot-server.js  # Parar bot atual"
echo "  npm start                # Iniciar novamente"
echo ""

