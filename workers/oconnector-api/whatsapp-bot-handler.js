/**
 * Handler para gerenciar bot WhatsApp
 * Endpoints para QR Code e status
 */

// Helper para resposta JSON
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * GET /api/whatsapp/qr
 * Obter QR Code atual
 */
async function handleGetQR(request, env) {
  try {
    // Em produção, isso deve conectar com o bot server
    // Por enquanto, retornar mock ou conectar via KV
    
    // Opção 1: Usar KV para armazenar QR Code
    const qrCode = await env.WHATSAPP_KV?.get('qr_code');
    const botStatus = await env.WHATSAPP_KV?.get('bot_status') || 'disconnected';
    
    if (qrCode) {
      return jsonResponse({
        success: true,
        qr: qrCode,
        status: botStatus,
      });
    }

    // Opção 2: Se bot server estiver rodando (local ou via ngrok)
    // Fazer fetch para bot server
    const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/qr`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'oConnector-Worker/1.0',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return jsonResponse(data);
      }
    } catch (error) {
      // Bot server não disponível (pode estar local sem ngrok)
      console.log('Bot server não acessível via Worker:', error.message);
    }

    return jsonResponse({
      success: false,
      message: 'QR Code não disponível. Inicie o bot WhatsApp primeiro.',
      status: 'disconnected',
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao obter QR Code', details: error.message },
      500
    );
  }
}

/**
 * GET /api/whatsapp/bot-status
 * Obter status detalhado do bot
 */
async function handleGetBotStatus(request, env) {
  try {
    const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/status`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const data = await response.json();
        return jsonResponse({
          success: true,
          data: data,
        });
      }
    } catch (error) {
      // Bot server não disponível
    }

    // Verificar no KV
    const status = await env.WHATSAPP_KV?.get('bot_status') || 'disconnected';
    const info = await env.WHATSAPP_KV?.get('bot_info') || null;

    return jsonResponse({
      success: true,
      data: {
        status: status,
        ready: status === 'connected',
        info: info ? JSON.parse(info) : null,
      },
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao verificar status', details: error.message },
      500
    );
  }
}

/**
 * POST /api/whatsapp/bot/restart
 * Reiniciar bot
 */
async function handleRestartBot(request, env) {
  try {
    const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/restart`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data = await response.json();
        return jsonResponse(data);
      }
    } catch (error) {
      return jsonResponse(
        { success: false, error: 'Erro ao conectar com bot server', details: error.message },
        500
      );
    }

    return jsonResponse({
      success: false,
      message: 'Bot server não disponível',
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao reiniciar bot', details: error.message },
      500
    );
  }
}

export { handleGetQR, handleGetBotStatus, handleRestartBot };

