#!/bin/bash

# Script para promover o último deployment para produção
# Uso: ./promover-producao.sh

set -e

echo "🔍 Listando deployments disponíveis..."
echo ""

# Listar deployments
npx wrangler pages deployment list --project-name=oconnector-frontend

echo ""
echo "⚠️  IMPORTANTE:"
echo "   O Wrangler CLI não tem comando direto para promover deployments."
echo "   Você precisa fazer isso manualmente no Dashboard:"
echo ""
echo "   1. Acesse: https://dash.cloudflare.com"
echo "   2. Vá em Workers & Pages → oconnector-frontend → Deployments"
echo "   3. Encontre o deployment mais recente (o último que você acabou de fazer)"
echo "   4. Clique nos três pontos (...) → 'Promote to production'"
echo "   5. Após promover, DELETE os deployments temporários antigos"
echo ""
echo "🌐 URL de Produção: https://oconnector.xerifegomes-e71.workers.dev"
echo ""

