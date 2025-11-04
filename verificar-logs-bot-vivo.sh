#!/bin/bash

# Script para verificar logs do bot em execução
# Captura mensagens do processo do bot

echo "📋 LOGS DO BOT EM EXECUÇÃO"
echo "=========================="
echo ""

BOT_PID=$(ps aux | grep "bot-server.js" | grep -v grep | awk '{print $2}')

if [ -z "$BOT_PID" ]; then
    echo "❌ Bot não está rodando!"
    echo ""
    echo "Para iniciar o bot:"
    echo "  cd whatsapp-bot && npm start"
    exit 1
fi

echo "✅ Bot está rodando (PID: $BOT_PID)"
echo ""
echo "📝 Para ver logs em tempo real, você precisa:"
echo ""
echo "1. Encontrar o terminal onde o bot foi iniciado, OU"
echo ""
echo "2. Usar o lsof para ver o arquivo de log (se houver), OU"
echo ""
echo "3. Reiniciar o bot com redirecionamento de output:"
echo ""
echo "   cd whatsapp-bot"
echo "   pkill -f bot-server.js"
echo "   npm start 2>&1 | tee bot-console.log"
echo ""
echo "4. Depois, você pode ver os logs em tempo real:"
echo "   tail -f whatsapp-bot/bot-console.log"
echo ""

# Tentar verificar se há algum arquivo de log sendo escrito
echo "🔍 Verificando arquivos de log..."
echo ""

# Verificar se há redirecionamento de log
if lsof -p "$BOT_PID" 2>/dev/null | grep -q "\.log"; then
    echo "✅ Bot está escrevendo em arquivo de log:"
    lsof -p "$BOT_PID" 2>/dev/null | grep "\.log" | awk '{print "   " $9}'
else
    echo "⚠️  Bot não está escrevendo em arquivo de log"
    echo "   Os logs estão apenas no console do processo"
fi

echo ""
echo "================================================"
echo "💡 SOLUÇÃO: Para ver mensagens de erro"
echo ""
echo "Quando alguém enviar mensagem para o bot, verifique:"
echo ""
echo "1. O terminal onde o bot foi iniciado mostrará:"
echo "   '⚠️ Número X não está associado a nenhum cliente'"
echo ""
echo "2. Esse número (X) é de QUEM ENVIOU a mensagem"
echo "   NÃO é o número do bot (5522992363462)"
echo ""
echo "3. Para resolver, cadastre esse número como cliente:"
echo "   ./verificar-numero-whatsapp.sh <numero_que_enviou>"
echo ""

