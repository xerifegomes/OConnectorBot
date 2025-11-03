#!/bin/bash

# Script de Auditoria de Dependências
# Verifica versões, vulnerabilidades e dependências deprecated

set -e

echo "📦 Executando auditoria de dependências..."

cd oconnector-frontend

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar vulnerabilidades
echo "🔍 Verificando vulnerabilidades..."
npm audit --audit-level=moderate

# 2. Verificar dependências desatualizadas
echo ""
echo "🔍 Verificando dependências desatualizadas..."
npm outdated || true

# 3. Verificar dependências deprecated
echo ""
echo "🔍 Verificando dependências deprecated..."
npm ls --depth=0 | grep -i "deprecated" || echo -e "${GREEN}✅ Nenhuma dependência deprecated encontrada${NC}"

# 4. Listar dependências críticas
echo ""
echo "📋 Dependências principais:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm list --depth=0 | grep -E "next@|react@|typescript@" || true

# 5. Verificar tamanho do node_modules
echo ""
echo "💾 Tamanho do node_modules:"
du -sh node_modules 2>/dev/null || echo "node_modules não encontrado"

echo ""
echo "✅ Auditoria de dependências concluída!"

