#!/bin/bash

# Script para liberar porta 3001

PORT=3001

echo "🔍 Verificando processos na porta $PORT..."

PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ Porta $PORT está livre!"
  exit 0
fi

echo "⚠️  Processo encontrado na porta $PORT:"
ps -p $PID -o pid,command 2>/dev/null

read -p "Deseja encerrar o processo $PID? (s/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[SsYy]$ ]]; then
  kill -9 $PID 2>/dev/null
  sleep 1
  
  # Verificar se foi encerrado
  if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "❌ Erro ao encerrar processo"
    exit 1
  else
    echo "✅ Processo encerrado! Porta $PORT liberada."
    exit 0
  fi
else
  echo "❌ Operação cancelada"
  exit 1
fi

