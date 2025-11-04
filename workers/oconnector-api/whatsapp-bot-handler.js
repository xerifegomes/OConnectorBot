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
    const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
    
    // Tentar obter do bot server primeiro
    try {
      const response = await fetch(`${botServerUrl}/qr`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'oConnector-Worker/1.0',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Se obteve QR Code, armazenar no KV se disponível
        if (data.qr && env.WHATSAPP_KV) {
          await env.WHATSAPP_KV.put('qr_code', data.qr);
          await env.WHATSAPP_KV.put('bot_status', data.status || 'waiting_qr');
        }
        
        return jsonResponse({
          success: data.success !== false,
          qr: data.qr || null,
          status: data.status || 'disconnected',
          data: {
            qr: data.qr || null,
            status: data.status || 'disconnected',
          },
        });
      }
    } catch (error) {
      // Bot server não disponível - tentar KV como fallback
      console.log('Bot server não acessível via Worker:', error.message);
    }
    
    // Fallback: Verificar KV
    if (env.WHATSAPP_KV) {
      const qrCode = await env.WHATSAPP_KV.get('qr_code');
      const botStatus = await env.WHATSAPP_KV.get('bot_status') || 'disconnected';
      
      if (qrCode) {
        return jsonResponse({
          success: true,
          qr: qrCode,
          status: botStatus,
          data: {
            qr: qrCode,
            status: botStatus,
          },
        });
      }
    }

    return jsonResponse({
      success: false,
      message: 'QR Code não disponível. Inicie o bot WhatsApp primeiro.',
      status: 'disconnected',
      data: {
        qr: null,
        status: 'disconnected',
      },
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
    
    // Tentar conectar ao bot server primeiro
    try {
      const response = await fetch(`${botServerUrl}/info`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'oConnector-Worker/1.0',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Atualizar KV se disponível
        if (env.WHATSAPP_KV) {
          await env.WHATSAPP_KV.put('bot_status', data.status || 'disconnected');
          if (data.info) {
            await env.WHATSAPP_KV.put('bot_info', JSON.stringify(data.info));
          }
        }
        
        return jsonResponse({
          success: true,
          data: {
            status: data.status || 'disconnected',
            ready: data.ready || false,
            info: data.info || null,
            agentAPI: data.agentAPI || null,
            oconnectorAPI: data.oconnectorAPI || null,
          },
        });
      }
    } catch (error) {
      // Bot server não disponível - usar KV como fallback
      console.log('Bot server não acessível:', error.message);
    }

    // Fallback: Verificar no KV
    let status = 'disconnected';
    let info = null;
    
    if (env.WHATSAPP_KV) {
      status = await env.WHATSAPP_KV.get('bot_status') || 'disconnected';
      const infoStr = await env.WHATSAPP_KV.get('bot_info');
      if (infoStr) {
        try {
          info = JSON.parse(infoStr);
        } catch (e) {
          // Ignorar erro de parse
        }
      }
    }

    return jsonResponse({
      success: true,
      data: {
        status: status,
        ready: status === 'connected',
        info: info,
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
    // Verificar se o método é POST
    if (request.method !== 'POST') {
      return jsonResponse(
        { 
          success: false, 
          error: 'Método não permitido',
          message: `Método ${request.method} não é permitido. Use POST.`,
        },
        405
      );
    }

    const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/restart`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'oConnector-Worker/1.0',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Limpar KV se disponível (status será atualizado após restart)
        if (env.WHATSAPP_KV) {
          await env.WHATSAPP_KV.delete('bot_status');
          await env.WHATSAPP_KV.delete('qr_code');
          await env.WHATSAPP_KV.delete('bot_info');
        }
        
        return jsonResponse({
          success: data.success !== false,
          message: data.message || 'Bot reiniciado com sucesso',
          data: data,
        });
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        return jsonResponse(
          { 
            success: false, 
            error: 'Erro ao reiniciar bot no servidor',
            message: `HTTP ${response.status}: ${errorText}`,
          },
          response.status || 500
        );
      }
    } catch (error) {
      // Verificar se é erro de ngrok offline
      const errorMsg = error.message || '';
      const isNgrokOffline = errorMsg.includes('ngrok') || errorMsg.includes('ERR_NGROK') || botServerUrl.includes('ngrok');
      
      let userMessage = `Não foi possível conectar ao bot server em ${botServerUrl}.`;
      
      if (isNgrokOffline || botServerUrl.includes('ngrok')) {
        userMessage = `O bot server precisa estar acessível publicamente. ` +
          `O ngrok não está rodando ou a URL está desatualizada. ` +
          `Para reiniciar o bot localmente, use: cd whatsapp-bot && npm start`;
      } else {
        userMessage += ` Verifique se o servidor está rodando. Para reiniciar localmente: cd whatsapp-bot && npm start`;
      }
      
      return jsonResponse(
        { 
          success: false, 
          error: 'Erro ao conectar com bot server',
          message: userMessage,
          details: error.message,
          botServerUrl: botServerUrl,
          hint: 'O bot está rodando localmente. Para reiniciar, use o terminal: cd whatsapp-bot && npm start'
        },
        503 // Service Unavailable - mais apropriado que 500
      );
    }
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao reiniciar bot', details: error.message },
      500
    );
  }
}

export { handleGetQR, handleGetBotStatus, handleRestartBot };

