#!/bin/bash

# Script de deploy do frontend para Cloudflare Pages
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy do Frontend para Cloudflare Pages..."

# Navegar para o diretório do frontend
cd "$(dirname "$0")"

# Verificar se o build já existe
if [ -d "out" ]; then
  echo "📦 Pasta 'out' encontrada."
  read -p "Rebuild? (s/n): " rebuild
  if [[ $rebuild =~ ^[Ss]$ ]]; then
    echo "🔨 Fazendo build..."
    npm run build
  fi
else
  echo "🔨 Fazendo build..."
  npm run build
fi

# Verificar se wrangler está instalado
if ! command -v npx &> /dev/null; then
  echo "❌ Erro: npx não encontrado. Instale Node.js 18+."
  exit 1
fi

# Fazer deploy
echo "📤 Fazendo deploy para Cloudflare Pages..."
npx wrangler pages deploy out --project-name=oconnector --commit-dirty=true

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "⚠️  IMPORTANTE: O Cloudflare criou uma URL temporária (ex: https://xxxxx.oconnector-frontend.pages.dev)"
echo "    Esta URL é temporária e deve ser promovida para produção."
echo ""
echo "📍 PRÓXIMOS PASSOS (OBRIGATÓRIO):"
echo "   1. Acesse: https://dash.cloudflare.com"
echo "   2. Vá em Workers & Pages → oconnector → Deployments"
echo "   3. Encontre o deployment mais recente (o que você acabou de fazer)"
echo "   4. Clique nos três pontos (...) → 'Promote to production'"
echo "   5. Após promover, DELETE deployments temporários antigos"
echo ""
echo "🌐 URL de Produção: https://oconnector.pages.dev"
echo "   (Frontend deployado no Cloudflare Pages)"
echo ""
echo "📚 Nota: Se o deploy foi feito via CLI, promova no Dashboard."
echo "   Se está conectado ao GitHub, o deploy é automático."

