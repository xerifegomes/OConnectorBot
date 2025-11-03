/**
 * Handlers para WhatsApp
 * Endpoints para gerenciar conversas e mensagens
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
 * GET /api/whatsapp/conversations
 * Listar todas as conversas
 */
async function handleGetConversations(request, env) {
  try {
    // Buscar conversas do banco (tabela de leads ou conversas)
    const conversations = await env.DB.prepare(`
      SELECT DISTINCT 
        telefone as contact,
        nome as contactName,
        MAX(created_at) as lastMessageTime,
        COUNT(*) as messageCount
      FROM leads
      WHERE origem = 'whatsapp'
      GROUP BY telefone, nome
      ORDER BY lastMessageTime DESC
      LIMIT 50
    `).all();

    const formatted = conversations.results.map(conv => ({
      id: conv.contact,
      contact: conv.contact,
      contactName: conv.contactName || conv.contact,
      lastMessage: 'Última interação',
      lastMessageTime: conv.lastMessageTime,
      unread: 0,
    }));

    return jsonResponse({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao buscar conversas', details: error.message },
      500
    );
  }
}

/**
 * GET /api/whatsapp/messages?contact=...
 * Obter mensagens de uma conversa
 */
async function handleGetMessages(request, env) {
  try {
    const url = new URL(request.url);
    const contact = url.searchParams.get('contact');

    if (!contact) {
      return jsonResponse(
        { success: false, error: 'Parâmetro contact é obrigatório' },
        400
      );
    }

    // Buscar mensagens do banco
    // Por enquanto, retornar histórico de leads/interações
    const leads = await env.DB.prepare(`
      SELECT 
        id,
        nome,
        telefone,
        observacoes,
        created_at
      FROM leads
      WHERE telefone = ? AND origem = 'whatsapp'
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(contact).all();

    // Formatar como mensagens
    const messages = leads.results.flatMap(lead => {
      const msgs = [];
      
      if (lead.observacoes) {
        msgs.push({
          id: `lead_${lead.id}_1`,
          text: lead.observacoes,
          fromMe: false,
          timestamp: new Date(lead.created_at),
          contact: contact,
        });
      }

      // Mensagem automática do sistema
      msgs.push({
        id: `lead_${lead.id}_system`,
        text: `Lead capturado: ${lead.nome || 'Cliente'}`,
        fromMe: true,
        timestamp: new Date(lead.created_at),
        contact: contact,
      });

      return msgs;
    });

    // Ordenar por timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);

    return jsonResponse({
      success: true,
      data: messages,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao buscar mensagens', details: error.message },
      500
    );
  }
}

/**
 * POST /api/whatsapp/send
 * Enviar mensagem via WhatsApp (via bot)
 */
async function handleSendMessage(request, env) {
  try {
    const body = await request.json();
    const { contact, message } = body;

    if (!contact || !message) {
      return jsonResponse(
        { success: false, error: 'contact e message são obrigatórios' },
        400
      );
    }

    // Nota: Este endpoint precisa estar conectado ao bot WhatsApp
    // Por enquanto, apenas salvar no banco como mensagem pendente
    // O bot deve ler e enviar

    // Salvar como lead/interação
    await env.DB.prepare(`
      INSERT INTO leads (
        cliente_id,
        nome,
        telefone,
        observacoes,
        origem,
        status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      1, // cliente_id (ajustar conforme necessário)
      'Mensagem do sistema',
      contact,
      `Mensagem enviada: ${message}`,
      'whatsapp_system',
      'enviado'
    ).run();

    return jsonResponse({
      success: true,
      message: 'Mensagem agendada para envio',
      data: {
        contact,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao enviar mensagem', details: error.message },
      500
    );
  }
}

/**
 * GET /api/whatsapp/status
 * Obter status do bot WhatsApp
 */
async function handleGetStatus(request, env) {
  try {
    // Verificar status do bot
    // Por enquanto, retornar status simulado
    // Em produção, conectar com bot real via KV ou D1

    const status = await env.DB.prepare(`
      SELECT COUNT(*) as total_leads
      FROM leads
      WHERE origem = 'whatsapp'
      AND created_at > datetime('now', '-24 hours')
    `).first();

    return jsonResponse({
      success: true,
      data: {
        status: 'connected', // connected, disconnected, connecting
        totalLeads: status?.total_leads || 0,
        qr: null, // QR code se necessário reconectar
      },
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao verificar status', details: error.message },
      500
    );
  }
}

export { handleGetConversations, handleGetMessages, handleSendMessage, handleGetStatus };

