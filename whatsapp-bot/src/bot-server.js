/**
 * Bot WhatsApp Server - Expõe QR Code e status via HTTP/WebSocket
 * Permite que o dashboard acesse o QR Code e status do bot
 */

import express from 'express';
import { WhatsAppBot } from './bot.js';
import { config } from './config.js';

const app = express();

// CORS - Permitir requisições do frontend
app.use((req, res, next) => {
  // Permitir todas as origens (desenvolvimento)
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas
  
  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

let botInstance = null;
let qrCodeData = null;
let botStatus = 'disconnected';
let botInfo = null;

/**
 * Inicializar bot
 */
async function initializeBot() {
  if (botInstance) {
    return botInstance;
  }

  botInstance = new WhatsAppBot({
    agentAPIUrl: process.env.AGENT_TRAINING_API_URL,
    oconnectorAPIUrl: process.env.OCONNECTOR_API_URL,
    sessionPath: process.env.WHATSAPP_SESSION_PATH,
    // Callbacks para eventos
    onQRGenerated: (qr) => {
      qrCodeData = qr;
      botStatus = 'waiting_qr';
      console.log('📱 QR Code gerado e armazenado');
    },
    onReady: (info) => {
      botStatus = 'connected';
      qrCodeData = null;
      botInfo = info;
      console.log('✅ Bot conectado:', botInfo);
    },
    onDisconnected: (reason) => {
      botStatus = 'disconnected';
      qrCodeData = null;
      botInfo = null;
      console.log('⚠️ Bot desconectado:', reason);
    },
  });

  try {
    await botInstance.initialize();
    console.log('✅ Bot inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar bot:', error);
    botStatus = 'disconnected';
    throw error;
  }
  return botInstance;
}

// Inicializar bot ao iniciar servidor
initializeBot().catch((error) => {
  console.error('❌ Erro fatal ao inicializar bot:', error);
  botStatus = 'disconnected';
});

/**
 * GET /status
 * Retornar status do bot
 */
app.get('/status', (req, res) => {
  res.json({
    status: botStatus,
    qr: qrCodeData,
    info: botInfo,
    ready: botInstance?.isReady || false,
  });
});

/**
 * GET /qr
 * Retornar QR Code atual
 */
app.get('/qr', (req, res) => {
  if (qrCodeData) {
    res.json({
      success: true,
      qr: qrCodeData,
      status: botStatus,
    });
  } else {
    res.json({
      success: false,
      message: 'QR Code não disponível',
      status: botStatus,
    });
  }
});

/**
 * POST /restart
 * Reiniciar bot (desconectar e reconectar)
 */
app.post('/restart', async (req, res) => {
  try {
    if (botInstance) {
      await botInstance.destroy();
      botInstance = null;
      qrCodeData = null;
      botStatus = 'disconnected';
    }
    
    await initializeBot();
    
    res.json({
      success: true,
      message: 'Bot reiniciado',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /info
 * Informações do bot
 */
app.get('/info', (req, res) => {
  res.json({
    status: botStatus,
    ready: botInstance?.isReady || false,
    info: botInfo,
    agentAPI: process.env.AGENT_TRAINING_API_URL,
    oconnectorAPI: process.env.OCONNECTOR_API_URL,
  });
});

/**
 * GET /conversations
 * Obter conversas do WhatsApp
 */
app.get('/conversations', async (req, res) => {
  try {
    if (!botInstance || !botInstance.isReady) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const conversations = await botInstance.getConversations();
    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /messages/:contact
 * Obter mensagens de uma conversa
 */
app.get('/messages/:contact', async (req, res) => {
  try {
    const { contact } = req.params;
    
    if (!botInstance || !botInstance.isReady) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const messages = await botInstance.getMessages(contact);
    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /sync
 * Forçar sincronização de conversas
 */
app.post('/sync', async (req, res) => {
  try {
    if (!botInstance || !botInstance.isReady) {
      return res.status(400).json({
        success: false,
        error: 'Bot não está conectado',
      });
    }

    await botInstance.syncConversations();
    res.json({
      success: true,
      message: 'Conversas sincronizadas',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Bot Server rodando na porta ${PORT}`);
  console.log(`📱 QR Code disponível em: http://localhost:${PORT}/qr`);
  console.log(`📊 Status disponível em: http://localhost:${PORT}/status`);
});

