#!/bin/bash

# Script para verificar logs do bot e identificar números que estão enviando mensagens

echo "🔍 VERIFICAÇÃO DE LOGS DO BOT"
echo "=============================="
echo ""

LOG_FILE="whatsapp-bot/logs/whatsapp-bot.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️  Arquivo de log não encontrado: $LOG_FILE"
    echo ""
    echo "Verifique se o bot está rodando e gerando logs."
    exit 1
fi

echo "📋 Últimas 50 linhas do log:"
echo "----------------------------"
tail -n 50 "$LOG_FILE"
echo ""

echo "🔍 Procurando por números que não estão associados a clientes:"
echo "---------------------------------------------------------------"
grep -i "não está associado" "$LOG_FILE" | tail -10 || echo "Nenhuma mensagem encontrada"
echo ""

echo "📨 Últimas mensagens recebidas:"
echo "-------------------------------"
grep "📨 Mensagem de" "$LOG_FILE" | tail -10 || echo "Nenhuma mensagem encontrada"
echo ""

echo "⚠️  Avisos e erros:"
echo "------------------"
grep -E "(⚠️|❌|ERROR|ERRO)" "$LOG_FILE" | tail -10 || echo "Nenhum erro encontrado"
echo ""

echo "💡 DICA:"
echo "O bot mostra erro quando ALGUÉM (não o bot) envia mensagem"
echo "mas esse número não está cadastrado como cliente."
echo ""
echo "Para resolver:"
echo "1. Identifique qual número está enviando mensagem (veja logs acima)"
echo "2. Verifique se esse número está cadastrado:"
echo "   ./verificar-numero-whatsapp.sh <numero>"
echo ""

