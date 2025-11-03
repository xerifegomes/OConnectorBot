/**
 * oConnector API Worker - Versão Completa
 * Com: Auth + IA + WhatsApp
 */

// Helper para resposta JSON com CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Hash de senha com Web Crypto API (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verificar senha
async function verifyPassword(password, storedHash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === storedHash;
}

// Gerar token simples
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
  };
  return btoa(JSON.stringify(payload));
}

/**
 * POST /api/auth/login
 */
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return jsonResponse(
        { success: false, error: 'Email e senha são obrigatórios' },
        400
      );
    }

    const user = await env.DB.prepare(
      'SELECT id, email, senha, nome, role, ativo FROM usuarios WHERE email = ? AND ativo = 1'
    )
      .bind(email)
      .first();

    if (!user) {
      return jsonResponse(
        { success: false, error: 'Credenciais inválidas' },
        401
      );
    }

    let passwordValid = false;
    
    if (user.senha.startsWith('$2b$') || user.senha.startsWith('$2a$')) {
      return jsonResponse(
        { success: false, error: 'Senha em formato bcrypt. Use SHA-256' },
        500
      );
    } else {
      passwordValid = await verifyPassword(senha, user.senha);
    }

    if (!passwordValid) {
      return jsonResponse(
        { success: false, error: 'Credenciais inválidas' },
        401
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await env.DB.prepare(
      'UPDATE usuarios SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(user.id)
      .run();

    return jsonResponse({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: user.role,
        },
        userId: user.id,
      },
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao processar login', details: error.message },
      500
    );
  }
}

/**
 * POST /api/auth/register
 */
async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { email, senha, nome, role = 'user' } = body;

    if (!email || !senha || !nome) {
      return jsonResponse(
        { success: false, error: 'Email, senha e nome são obrigatórios' },
        400
      );
    }

    const existing = await env.DB.prepare(
      'SELECT id FROM usuarios WHERE email = ?'
    )
      .bind(email)
      .first();

    if (existing) {
      return jsonResponse(
        { success: false, error: 'Email já cadastrado' },
        409
      );
    }

    const senhaHash = await hashPassword(senha);

    const result = await env.DB.prepare(
      `INSERT INTO usuarios (email, senha, nome, role, ativo) 
       VALUES (?, ?, ?, ?, 1) 
       RETURNING id, email, nome, role`
    )
      .bind(email, senhaHash, nome, role)
      .first();

    if (!result) {
      return jsonResponse(
        { success: false, error: 'Erro ao criar usuário' },
        500
      );
    }

    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role,
    });

    return jsonResponse({
      success: true,
      data: {
        token,
        user: {
          id: result.id,
          email: result.email,
          nome: result.nome,
          role: result.role,
        },
        userId: result.id,
      },
    }, 201);
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao processar registro', details: error.message },
      500
    );
  }
}

/**
 * GET /api/auth/verify
 */
async function handleVerify(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Token não fornecido' },
        401
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      const user = await env.DB.prepare(
        'SELECT id, email, nome, role FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(payload.userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      return jsonResponse({
        success: true,
        data: {
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            nome: user.nome,
            role: user.role,
          },
        },
      });
    } catch (error) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao verificar token', details: error.message },
      500
    );
  }
}

/**
 * POST /api/ai/chat
 * Handler de IA usando Workers AI
 */
async function handleAIChat(request, env) {
  try {
    const body = await request.json();
    const { message, context, prompt } = body;

    if (!message && !prompt) {
      return jsonResponse(
        { success: false, error: 'Mensagem ou prompt é obrigatório' },
        400
      );
    }

    const finalPrompt = prompt || `
Você é o oConnector, especialista em tecnologia e soluções para empresas.
Você é profissional, consultivo e humanizado.
Seu objetivo é identificar necessidades e oferecer soluções tecnológicas.

${context ? `Contexto: ${JSON.stringify(context)}` : ''}

Mensagem: ${message}

Responda de forma natural, consultiva e humanizada. Identifique necessidades e ofereça soluções tecnológicas.
    `.trim();

    // Chamar Workers AI
    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `Você é o oConnector, especialista em tecnologia e soluções para empresas. 
Você é profissional, consultivo e humanizado. Seu objetivo é identificar necessidades 
e oferecer soluções tecnológicas personalizadas.`
        },
        {
          role: 'user',
          content: finalPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return jsonResponse({
      success: true,
      response: response.response || response,
      message: response.response || response,
    });
  } catch (error) {
    console.error('Erro no Workers AI:', error);
    return jsonResponse(
      { 
        success: false, 
        error: 'Erro ao processar com IA',
        details: error.message 
      },
      500
    );
  }
}

/**
 * GET /api/whatsapp/conversations
 */
async function handleGetConversations(request, env) {
  try {
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

    const messages = leads.results.flatMap(lead => {
      const msgs = [];
      
      if (lead.observacoes) {
        msgs.push({
          id: `lead_${lead.id}_1`,
          text: lead.observacoes,
          fromMe: false,
          timestamp: new Date(lead.created_at).toISOString(),
          contact: contact,
        });
      }

      msgs.push({
        id: `lead_${lead.id}_system`,
        text: `Lead capturado: ${lead.nome || 'Cliente'}`,
        fromMe: true,
        timestamp: new Date(lead.created_at).toISOString(),
        contact: contact,
      });

      return msgs;
    });

    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
      1,
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
 */
async function handleGetStatus(request, env) {
  try {
    const status = await env.DB.prepare(`
      SELECT COUNT(*) as total_leads
      FROM leads
      WHERE origem = 'whatsapp'
      AND created_at > datetime('now', '-24 hours')
    `).first();

    return jsonResponse({
      success: true,
      data: {
        status: 'connected',
        totalLeads: status?.total_leads || 0,
        qr: null,
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
 * GET /api - Health check
 */
async function handleHealthCheck(env) {
  try {
    const test = await env.DB.prepare('SELECT 1 as test').first();
    
    return jsonResponse({
      success: true,
      message: 'oConnector API v1.0 - Plataforma de Automação para Negócios Locais',
      database: test ? 'Conectado' : 'Desconectado',
      ai: 'Disponível',
      endpoints: {
        auth: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          verify: 'GET /api/auth/verify',
        },
        ai: {
          chat: 'POST /api/ai/chat',
        },
        whatsapp: {
          conversations: 'GET /api/whatsapp/conversations',
          messages: 'GET /api/whatsapp/messages?contact=...',
          send: 'POST /api/whatsapp/send',
          status: 'GET /api/whatsapp/status',
        },
        prospects: 'GET/POST /api/prospects',
        clientes: 'GET/POST /api/clientes',
        leads: 'GET/POST /api/leads',
        prospectar: 'POST /api/prospectar (Google Places)',
      },
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Erro ao verificar saúde da API',
      details: error.message,
    }, 500);
  }
}

/**
 * Worker principal
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return jsonResponse({}, 200);
    }

    // Rotas de autenticação
    if (path.startsWith('/api/auth/')) {
      if (path === '/api/auth/login' && request.method === 'POST') {
        return handleLogin(request, env);
      }
      if (path === '/api/auth/register' && request.method === 'POST') {
        return handleRegister(request, env);
      }
      if (path === '/api/auth/verify' && request.method === 'GET') {
        return handleVerify(request, env);
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Rotas de IA (Workers AI)
    if (path.startsWith('/api/ai/')) {
      if (path === '/api/ai/chat' && request.method === 'POST') {
        return handleAIChat(request, env);
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Rotas de WhatsApp
    if (path.startsWith('/api/whatsapp/')) {
      const { 
        handleGetQR, 
        handleGetBotStatus, 
        handleRestartBot 
      } = await import('./whatsapp-bot-handler.js');
      
      if (path === '/api/whatsapp/conversations' && request.method === 'GET') {
        return handleGetConversations(request, env);
      }
      if (path === '/api/whatsapp/messages' && request.method === 'GET') {
        return handleGetMessages(request, env);
      }
      if (path === '/api/whatsapp/send' && request.method === 'POST') {
        return handleSendMessage(request, env);
      }
      if (path === '/api/whatsapp/status' && request.method === 'GET') {
        return handleGetStatus(request, env);
      }
      if (path === '/api/whatsapp/qr' && request.method === 'GET') {
        return handleGetQR(request, env);
      }
      if (path === '/api/whatsapp/bot-status' && request.method === 'GET') {
        return handleGetBotStatus(request, env);
      }
      if (path === '/api/whatsapp/bot/restart' && request.method === 'POST') {
        return handleRestartBot(request, env);
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Health check
    if (path === '/api' && request.method === 'GET') {
      return handleHealthCheck(env);
    }

    // Outras rotas existentes (prospects, clientes, leads, etc.)
    // Adicione aqui suas rotas existentes...

    // Default
    return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
  },
};

