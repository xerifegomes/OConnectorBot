#!/bin/bash

echo "🚀 Iniciando WhatsApp Bot Server..."
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
  echo ""
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo "⚠️  Arquivo .env não encontrado!"
  echo "📝 Criando .env..."
  
  cat > .env << EOFENV
AGENT_TRAINING_API_URL=https://agent-training-worker.xerifegomes-e71.workers.dev
OCONNECTOR_API_URL=https://oconnector-api.xerifegomes-e71.workers.dev
WHATSAPP_SESSION_PATH=./.wwebjs_auth
PORT=3001
EOFENV
  
  echo "✅ Arquivo .env criado."
  echo ""
fi

echo "🚀 Iniciando bot server na porta 3001..."
echo "📱 QR Code estará disponível em: http://localhost:3001/qr"
echo "📊 Status estará disponível em: http://localhost:3001/status"
echo ""
echo "💡 Para expor via ngrok: ngrok http 3001"
echo ""

# Iniciar bot server
npm run server
