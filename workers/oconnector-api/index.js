/**
 * oConnector API Worker - Versão Completa
 * Com: Auth + IA + WhatsApp
 */

// Importar handlers do WhatsApp bot
import { handleGetQR, handleGetBotStatus, handleRestartBot } from './whatsapp-bot-handler.js';

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
    // Verificar status real do bot server
    let botStatus = 'disconnected';
    let qrCode = null;
    let botInfo = null;
    
    // Tentar conectar ao bot server
    const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/status`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'oConnector-Worker/1.0',
        },
      });
      
      if (response.ok) {
        const botData = await response.json();
        botStatus = botData.status || 'disconnected';
        qrCode = botData.qr || null;
        botInfo = botData.info || null;
        
        // Se tiver KV, armazenar status
        if (env.WHATSAPP_KV) {
          await env.WHATSAPP_KV.put('bot_status', botStatus);
          if (qrCode) {
            await env.WHATSAPP_KV.put('qr_code', qrCode);
          }
          if (botInfo) {
            await env.WHATSAPP_KV.put('bot_info', JSON.stringify(botInfo));
          }
        }
      } else {
        // Bot server não respondeu corretamente
        botStatus = 'disconnected';
      }
    } catch (error) {
      // Bot server não acessível - verificar KV como fallback
      console.log('Bot server não acessível:', error.message);
      
      if (env.WHATSAPP_KV) {
        const kvStatus = await env.WHATSAPP_KV.get('bot_status');
        const kvQR = await env.WHATSAPP_KV.get('qr_code');
        const kvInfo = await env.WHATSAPP_KV.get('bot_info');
        
        if (kvStatus) {
          botStatus = kvStatus;
        }
        if (kvQR) {
          qrCode = kvQR;
        }
        if (kvInfo) {
          try {
            botInfo = JSON.parse(kvInfo);
          } catch (e) {
            // Ignorar erro de parse
          }
        }
      }
    }
    
    // Buscar estatísticas de leads
    const status = await env.DB.prepare(`
      SELECT COUNT(*) as total_leads
      FROM leads
      WHERE origem = 'whatsapp'
      AND created_at > datetime('now', '-24 hours')
    `).first().catch(() => ({ total_leads: 0 }));

    return jsonResponse({
      success: true,
      data: {
        status: botStatus, // Status real do bot
        totalLeads: status?.total_leads || 0,
        qr: qrCode, // QR Code se disponível
        info: botInfo, // Informações do bot
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
 * GET /api/clientes?whatsapp=...
 * Busca cliente por número WhatsApp (usado pelo bot)
 * Aceita autenticação via API key (bot interno)
 */
async function handleGetClienteByWhatsApp(request, env) {
  try {
    const url = new URL(request.url);
    const whatsappParam = url.searchParams.get('whatsapp');
    
    if (!whatsappParam) {
      return jsonResponse(
        { success: false, error: 'Parâmetro whatsapp é obrigatório' },
        400
      );
    }
    
    // Limpar número (remover caracteres não numéricos)
    const cleanNumber = whatsappParam.replace(/\D/g, '');
    
    if (!cleanNumber) {
      return jsonResponse(
        { success: false, error: 'Número WhatsApp inválido' },
        400
      );
    }
    
    // Buscar cliente por número WhatsApp
    // Nota: Este endpoint é usado pelo bot interno, não requer autenticação rigorosa
    const cliente = await env.DB.prepare(
      'SELECT * FROM clientes WHERE whatsapp_numero = ? AND status = ?'
    )
      .bind(cleanNumber, 'ativo')
      .first();
    
    if (!cliente) {
      return jsonResponse({
        success: true,
        data: [], // Retornar array vazio se não encontrar
      });
    }
    
    return jsonResponse({
      success: true,
      data: [{
        id: cliente.id,
        nome_imobiliaria: cliente.nome_imobiliaria,
        whatsapp_numero: cliente.whatsapp_numero,
        plano: cliente.plano,
        valor_mensal: cliente.valor_mensal,
        status: cliente.status,
        data_ultimo_treino: cliente.data_ultimo_treino,
        created_at: cliente.created_at,
      }],
    });
  } catch (error) {
    console.error('Erro ao buscar cliente por WhatsApp:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao buscar cliente', details: error.message },
      500
    );
  }
}

/**
 * GET /api/clientes/me
 * Retorna os dados do cliente do usuário autenticado
 */
async function handleGetMyData(request, env) {
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

      // Buscar usuário (usar userId ou id para compatibilidade)
      const userId = payload.userId || payload.id;
      if (!userId) {
        return jsonResponse(
          { success: false, error: 'Token inválido: userId não encontrado' },
          401
        );
      }
      
      const user = await env.DB.prepare(
        'SELECT id, email, nome, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      // Se o usuário tem cliente_id, buscar dados do cliente
      if (user.cliente_id) {
        const cliente = await env.DB.prepare(
          'SELECT * FROM clientes WHERE id = ?'
        )
          .bind(user.cliente_id)
          .first();

        if (cliente) {
          return jsonResponse({
            success: true,
            data: {
              id: cliente.id,
              nome_imobiliaria: cliente.nome_imobiliaria,
              whatsapp_numero: cliente.whatsapp_numero,
              plano: cliente.plano,
              valor_mensal: cliente.valor_mensal,
              created_at: cliente.created_at,
              updated_at: cliente.updated_at,
              dados_treinamento: cliente.dados_treinamento,
              data_ultimo_treino: cliente.data_ultimo_treino,
            },
          });
        }
      }

      // Se não tem cliente_id ou cliente não encontrado, retornar dados do usuário
      // Isso permite que usuários sem cliente ainda possam usar o sistema
      return jsonResponse({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: user.role,
          cliente_id: user.cliente_id || null,
        },
      });
    } catch (tokenError) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao buscar dados', details: error.message },
      500
    );
  }
}

/**
 * GET /api/leads
 * Retorna lista de leads filtrados por cliente_id
 * Aceita autenticação via Bearer token (usuário) ou API key (bot)
 */
async function handleGetLeads(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    const url = new URL(request.url);
    const clienteIdParam = url.searchParams.get('cliente_id');
    const telefoneParam = url.searchParams.get('telefone');
    let clienteId = null;
    let isAuthenticated = false;
    let userRole = null;
    
    // Tentar autenticação via Bearer token (usuário)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(atob(token));
        
        if (payload && payload.exp && payload.exp >= Date.now()) {
          const userId = payload.userId || payload.id;
          if (userId) {
            const user = await env.DB.prepare(
              'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
            ).bind(userId).first();

            if (user) {
              isAuthenticated = true;
              userRole = user.role;
              // Determinar cliente_id a usar
              clienteId = clienteIdParam ? parseInt(clienteIdParam) : user.cliente_id;
              // Se for admin/superadmin, pode ver todos os leads
              // Se for usuário normal, só pode ver seus próprios leads
              if (user.role !== 'admin' && user.role !== 'superadmin') {
                clienteId = user.cliente_id;
              }
            }
          }
        }
      } catch (tokenError) {
        // Token inválido, tentar API key
      }
    }

    // Tentar autenticação via API key (bot interno)
    if (!isAuthenticated && authHeader && authHeader.startsWith('X-API-Key ')) {
      const apiKey = authHeader.substring(10);
      const validApiKey = env.BOT_API_KEY || 'oconnector-bot-internal';
      if (apiKey === validApiKey) {
        isAuthenticated = true;
        clienteId = clienteIdParam ? parseInt(clienteIdParam) : null;
      }
    }

    // Se não autenticado, retornar erro
    if (!isAuthenticated) {
      return jsonResponse(
        { success: false, error: 'Token ou API key não fornecido ou inválido' },
        401
      );
    }

    // Buscar leads
    let query;
    let params;
    
    if (clienteId) {
      if (telefoneParam) {
        // Buscar lead específico por cliente_id e telefone
        query = `
          SELECT 
            id,
            cliente_id,
            nome,
            telefone,
            observacoes,
            origem,
            status,
            created_at,
            updated_at
          FROM leads
          WHERE cliente_id = ? AND telefone = ?
          ORDER BY created_at DESC
          LIMIT 1
        `;
        params = [clienteId, telefoneParam];
      } else {
        query = `
          SELECT 
            id,
            cliente_id,
            nome,
            telefone,
            observacoes,
            origem,
            status,
            created_at,
            updated_at
          FROM leads
          WHERE cliente_id = ?
          ORDER BY created_at DESC
          LIMIT 100
        `;
        params = [clienteId];
      }
    } else {
      // Se não tem cliente_id e não é admin, retornar vazio
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        return jsonResponse({
          success: true,
          data: [],
        });
      }
      
      // Admin pode ver todos
        query = `
          SELECT 
            id,
            cliente_id,
            nome,
            telefone,
            observacoes,
            origem,
            status,
            created_at,
            updated_at
          FROM leads
          ORDER BY created_at DESC
          LIMIT 100
        `;
      params = [];
    }

    const leads = await env.DB.prepare(query)
      .bind(...params)
      .all();

    return jsonResponse({
      success: true,
      data: leads.results || [],
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao buscar leads', details: error.message },
      500
    );
  }
}

/**
 * POST /api/leads
 * Cria um novo lead
 * Aceita autenticação via Bearer token (usuário) ou API key (bot)
 */
async function handlePostLead(request, env) {
  try {
    const body = await request.json();
    const { cliente_id, nome, telefone, whatsapp, email, observacoes, origem, status, mensagem_inicial } = body;

    if (!cliente_id || !telefone) {
      return jsonResponse(
        { success: false, error: 'cliente_id e telefone são obrigatórios' },
        400
      );
    }

    // Verificar autenticação
    const authHeader = request.headers.get('Authorization');
    let isAuthenticated = false;
    let clienteIdFromAuth = null;

    // Tentar autenticação via Bearer token (usuário)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(atob(token));
        
        if (payload.exp && payload.exp < Date.now()) {
          return jsonResponse(
            { success: false, error: 'Token expirado' },
            401
          );
        }

        const userId = payload.userId || payload.id;
        if (userId) {
          const user = await env.DB.prepare(
            'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
          ).bind(userId).first();

          if (user) {
            isAuthenticated = true;
            // Se for admin/superadmin, pode criar lead para qualquer cliente
            // Se for usuário normal, só pode criar para seu próprio cliente
            if (user.role === 'admin' || user.role === 'superadmin') {
              clienteIdFromAuth = cliente_id;
            } else {
              clienteIdFromAuth = user.cliente_id;
              // Verificar se está tentando criar para outro cliente
              if (cliente_id !== user.cliente_id) {
                return jsonResponse(
                  { success: false, error: 'Não autorizado para criar lead para este cliente' },
                  403
                );
              }
            }
          }
        }
      } catch (tokenError) {
        // Token inválido, tentar API key
      }
    }

    // Tentar autenticação via API key (bot interno)
    if (!isAuthenticated && authHeader && authHeader.startsWith('X-API-Key ')) {
      const apiKey = authHeader.substring(10);
      // API key simples: "oconnector-bot-internal" (em produção, usar env var)
      const validApiKey = env.BOT_API_KEY || 'oconnector-bot-internal';
      if (apiKey === validApiKey) {
        isAuthenticated = true;
        clienteIdFromAuth = cliente_id;
      }
    }

    // Se não autenticado, retornar erro
    if (!isAuthenticated) {
      return jsonResponse(
        { success: false, error: 'Token ou API key não fornecido ou inválido' },
        401
      );
    }

    // Verificar se cliente existe
    const cliente = await env.DB.prepare(
      'SELECT id FROM clientes WHERE id = ?'
    ).bind(clienteIdFromAuth).first();

    if (!cliente) {
      return jsonResponse(
        { success: false, error: 'Cliente não encontrado' },
        404
      );
    }

    // Verificar se já existe lead com mesmo telefone para este cliente
    const existingLead = await env.DB.prepare(`
      SELECT id FROM leads 
      WHERE cliente_id = ? AND telefone = ?
      LIMIT 1
    `).bind(clienteIdFromAuth, telefone).first();

    if (existingLead) {
      // Atualizar lead existente
      await env.DB.prepare(`
        UPDATE leads SET
          nome = ?,
          observacoes = ?,
          origem = ?,
          status = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        nome || 'Não informado',
        observacoes || null,
        origem || 'whatsapp',
        status || 'novo',
        existingLead.id
      ).run();

      return jsonResponse({
        success: true,
        message: 'Lead atualizado',
        data: { id: existingLead.id },
      });
    }

    // Criar novo lead
    const result = await env.DB.prepare(`
      INSERT INTO leads (
        cliente_id,
        nome,
        telefone,
        email,
        observacoes,
        origem,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      clienteIdFromAuth,
      nome || 'Não informado',
      telefone,
      email || null,
      observacoes || mensagem_inicial || null,
      origem || 'whatsapp',
      status || 'novo'
    ).run();

    return jsonResponse({
      success: true,
      message: 'Lead criado com sucesso',
      data: { id: result.meta.last_row_id },
    });
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao criar lead', details: error.message },
      500
    );
  }
}

/**
 * GET /api/leads/stats
 * Retorna estatísticas de leads para um cliente
 */
async function handleGetLeadsStats(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Token não fornecido' },
        401
      );
    }

    const token = authHeader.substring(7);
    const url = new URL(request.url);
    const clienteIdParam = url.searchParams.get('cliente_id');
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      // Buscar usuário (usar userId ou id para compatibilidade)
      const userId = payload.userId || payload.id;
      if (!userId) {
        return jsonResponse(
          { success: false, error: 'Token inválido: userId não encontrado' },
          401
        );
      }
      
      const user = await env.DB.prepare(
        'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      // Determinar cliente_id a usar
      let clienteId = clienteIdParam ? parseInt(clienteIdParam) : user.cliente_id;
      
      // Se for admin/superadmin, pode ver todas as stats
      // Se for usuário normal, só pode ver suas próprias stats
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        clienteId = user.cliente_id;
      }

      if (!clienteId) {
        return jsonResponse({
          success: true,
          data: {
            leadsHoje: 0,
            taxaConversao: 0,
            mensagensBot: 0,
            statusBot: 'Inativo',
          },
        });
      }

      // Leads hoje (últimas 24 horas)
      const leadsHoje = await env.DB.prepare(`
        SELECT COUNT(*) as total
        FROM leads
        WHERE cliente_id = ?
        AND created_at > datetime('now', '-24 hours')
      `).bind(clienteId).first();

      // Total de leads
      const totalLeads = await env.DB.prepare(`
        SELECT COUNT(*) as total
        FROM leads
        WHERE cliente_id = ?
      `).bind(clienteId).first();

      // Leads convertidos (status = 'convertido' ou similar)
      const leadsConvertidos = await env.DB.prepare(`
        SELECT COUNT(*) as total
        FROM leads
        WHERE cliente_id = ?
        AND (status = 'convertido' OR status = 'vendido' OR status = 'fechado')
      `).bind(clienteId).first();

      // Mensagens do bot (leads originados do bot)
      const mensagensBot = await env.DB.prepare(`
        SELECT COUNT(*) as total
        FROM leads
        WHERE cliente_id = ?
        AND origem LIKE '%whatsapp%'
        AND created_at > datetime('now', '-24 hours')
      `).bind(clienteId).first();

      // Calcular taxa de conversão
      const total = totalLeads?.total || 0;
      const convertidos = leadsConvertidos?.total || 0;
      const taxaConversao = total > 0 ? Math.round((convertidos / total) * 100) : 0;

      return jsonResponse({
        success: true,
        data: {
          leadsHoje: leadsHoje?.total || 0,
          taxaConversao: taxaConversao,
          mensagensBot: mensagensBot?.total || 0,
          statusBot: mensagensBot?.total > 0 ? 'Ativo' : 'Inativo',
        },
      });
    } catch (tokenError) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    return jsonResponse(
      { success: false, error: 'Erro ao buscar estatísticas', details: error.message },
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
        clientes: {
          me: 'GET /api/clientes/me',
          create: 'POST /api/clientes',
        },
        leads: {
          list: 'GET /api/leads?cliente_id=...',
          stats: 'GET /api/leads/stats?cliente_id=...',
        },
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
 * Rate Limiting - Google Places API
 * Limite: 300 requisições por dia
 */
const RATE_LIMIT_MAX = 300; // Limite diário do Google Places API (Text Search)

// Obter chave do contador baseada na data atual
function getRateLimitKey() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `places_api:${today}`;
}

// Verificar se pode fazer requisição (não excedeu limite)
async function checkRateLimit(kv) {
  // Se KV não estiver configurado, permitir requisição
  if (!kv) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX,
      used: 0,
      limit: RATE_LIMIT_MAX,
    };
  }
  
  try {
    const key = getRateLimitKey();
    const countStr = await kv.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    
    return {
      allowed: count < RATE_LIMIT_MAX,
      remaining: Math.max(0, RATE_LIMIT_MAX - count),
      used: count,
      limit: RATE_LIMIT_MAX,
    };
  } catch (error) {
    console.error('Erro ao verificar rate limit:', error);
    // Em caso de erro, permitir requisição mas logar o erro
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX,
      used: 0,
      limit: RATE_LIMIT_MAX,
      error: true,
    };
  }
}

// Incrementar contador de requisições
async function incrementRateLimit(kv) {
  // Se KV não estiver configurado, retornar 0
  if (!kv) {
    return 0;
  }
  
  try {
    const key = getRateLimitKey();
    const countStr = await kv.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    const newCount = count + 1;
    
    // Salvar com expiração de 25 horas (para garantir reset diário)
    await kv.put(key, newCount.toString(), { expirationTtl: 25 * 60 * 60 });
    
    return newCount;
  } catch (error) {
    console.error('Erro ao incrementar rate limit:', error);
    // Não bloquear requisição em caso de erro no contador
    return 0;
  }
}

/**
 * POST /api/prospectar
 * Busca prospects usando Google Places API com rate limiting
 */
async function handleProspectar(request, env) {
  try {
    // Verificar rate limit ANTES de fazer requisição
    const rateLimit = await checkRateLimit(env.RATE_LIMIT);
    
    if (!rateLimit.allowed) {
      return jsonResponse({
        success: false,
        error: 'Limite diário de requisições atingido',
        message: `Limite de ${RATE_LIMIT_MAX} requisições/dia foi atingido. Tente novamente amanhã.`,
        rateLimit: {
          used: rateLimit.used,
          limit: rateLimit.limit,
          remaining: 0,
          resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }, 429); // HTTP 429 Too Many Requests
    }

    // Verificar Google Places API Key
    const apiKey = env.GOOGLE_PLACES_KEY || env.GOOGLE_API_KEY;
    if (!apiKey) {
      return jsonResponse({
        success: false,
        error: 'Google Places API Key não configurada',
        message: 'Configure GOOGLE_PLACES_KEY nas variáveis de ambiente',
      }, 500);
    }

    // Parse do body
    const body = await request.json();
    const { nicho, cidade } = body;

    if (!nicho || !cidade) {
      return jsonResponse({
        success: false,
        error: 'Parâmetros obrigatórios faltando',
        message: 'Os campos "nicho" e "cidade" são obrigatórios',
      }, 400);
    }

    // Importar mapeamento de nichos e cliente Google Places
    const { getPlaceTypeForNicho } = await import('./place-types-mapping.js');
    const { GooglePlacesClient } = await import('./google-places-client.js');
    const { GoogleAuth } = await import('./google-auth.js');
    
    // Criar autenticação Google (padrão google-auth-library)
    const auth = new GoogleAuth({ apiKey });
    await auth.getClient(); // Validar credenciais
    
    // Criar cliente Google Places (padrão @googleapis)
    const placesClient = new GooglePlacesClient(apiKey, {
      version: 'v1',
    });
    
    // Obter tipo de lugar correspondente ao nicho
    const placeType = getPlaceTypeForNicho(nicho);
    
    // Buscar prospects usando a biblioteca Google Places (aumentar para 60 resultados)
    const resultados = await placesClient.searchProspects({
      nicho,
      cidade,
      type: placeType,
      maxResults: 60, // Aumentar número de resultados
    });

    // Incrementar contador APÓS requisição bem-sucedida
    const newCount = await incrementRateLimit(env.RATE_LIMIT);
    const remaining = Math.max(0, RATE_LIMIT_MAX - newCount);

    return jsonResponse({
      success: true,
      resultados,
      total: resultados.length,
      rateLimit: {
        used: newCount,
        limit: RATE_LIMIT_MAX,
        remaining,
        warning: remaining < 50 ? 'Limite diário próximo' : null,
      },
      query: `${nicho} em ${cidade}, Brasil`,
    }, 200);

  } catch (error) {
    console.error('Erro ao prospectar:', error);
    
    // Tratamento de erros específicos
    if (error.message && (error.message.includes('REQUEST_DENIED') || error.message.includes('disabled') || error.message.includes('not enabled'))) {
      return jsonResponse({
        success: false,
        error: 'Erro na Google Places API',
        message: 'As APIs do Google não estão habilitadas neste projeto. Acesse o Google Cloud Console e habilite: Places API e Geocoding API. Verifique também se o billing está ativado.',
        details: {
          troubleshooting: 'Verifique: 1) APIs habilitadas no Console, 2) Billing ativado, 3) Restrições da API Key',
        },
      }, 403);
    }

    if (error.message && (error.message.includes('OVER_QUERY_LIMIT') || error.message.includes('quota'))) {
      return jsonResponse({
        success: false,
        error: 'Limite de quota excedido no Google',
        message: 'Limite de requisições excedido na Google Places API',
      }, 429);
    }

    return jsonResponse({
      success: false,
      error: 'Erro interno ao prospectar',
      message: error.message || 'Erro desconhecido',
    }, 500);
  }
}

/**
 * GET /api/prospects
 * Lista prospects salvos pelo cliente
 */
async function handleGetProspects(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Token não fornecido' },
        401
      );
    }

    const token = authHeader.substring(7);
    const url = new URL(request.url);
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      // Buscar usuário (usar userId ou id para compatibilidade)
      const userId = payload.userId || payload.id;
      if (!userId) {
        return jsonResponse(
          { success: false, error: 'Token inválido: userId não encontrado' },
          401
        );
      }
      
      const user = await env.DB.prepare(
        'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      // Buscar prospects salvos
      const prospects = await env.DB.prepare(`
        SELECT 
          id,
          cliente_id,
          google_place_id,
          nome,
          endereco,
          telefone,
          website,
          rating,
          total_avaliacoes,
          nicho,
          cidade,
          distancia,
          localizacao_lat,
          localizacao_lng,
          status,
          contactado,
          created_at,
          updated_at
        FROM prospects_salvos
        WHERE cliente_id = ?
        ORDER BY created_at DESC
      `)
        .bind(user.cliente_id)
        .all();
      
      // Adicionar campos formatados para compatibilidade com frontend
      const formattedProspects = (prospects.results || []).map(p => ({
        ...p,
        localizacao: p.localizacao_lat && p.localizacao_lng ? {
          lat: p.localizacao_lat,
          lng: p.localizacao_lng,
        } : null,
      }));

      return jsonResponse({
        success: true,
        data: formattedProspects,
      });
    } catch (tokenError) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    console.error('Erro ao buscar prospects:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao buscar prospects', details: error.message },
      500
    );
  }
}

/**
 * POST /api/prospects
 * Salvar um prospect na lista
 */
async function handleSaveProspect(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Token não fornecido' },
        401
      );
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      // Buscar usuário (usar userId ou id para compatibilidade)
      const userId = payload.userId || payload.id;
      if (!userId) {
        return jsonResponse(
          { success: false, error: 'Token inválido: userId não encontrado' },
          401
        );
      }
      
      const user = await env.DB.prepare(
        'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      // Verificar se já existe
      const existing = await env.DB.prepare(`
        SELECT id FROM prospects_salvos 
        WHERE google_place_id = ? AND cliente_id = ?
      `)
        .bind(body.google_place_id || body.id, user.cliente_id)
        .first();

      if (existing) {
        return jsonResponse({
          success: true,
          message: 'Prospect já está salvo',
          data: { id: existing.id },
        });
      }

      // Salvar prospect (incluindo website e redes sociais)
      const result = await env.DB.prepare(`
        INSERT INTO prospects_salvos (
          cliente_id,
          google_place_id,
          nome,
          endereco,
          telefone,
          website,
          rating,
          total_avaliacoes,
          nicho,
          cidade,
          distancia,
          localizacao_lat,
          localizacao_lng,
          status,
          contactado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.cliente_id,
        body.google_place_id || body.id,
        body.nome || body.name,
        body.endereco || body.formatted_address,
        body.telefone || body.formatted_phone_number,
        body.website || null,
        body.rating || null,
        body.total_avaliacoes || body.user_ratings_total || 0,
        body.nicho,
        body.cidade,
        body.distancia || null,
        body.localizacao?.lat || body.geometry?.location?.lat || null,
        body.localizacao?.lng || body.geometry?.location?.lng || null,
        'novo',
        0
      ).run();

      return jsonResponse({
        success: true,
        message: 'Prospect salvo com sucesso',
        data: { id: result.meta.last_row_id },
      }, 201);
    } catch (tokenError) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    console.error('Erro ao salvar prospect:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao salvar prospect', details: error.message },
      500
    );
  }
}

/**
 * DELETE /api/prospects/:id
 * Deletar um prospect da lista
 */
async function handleDeleteProspect(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Token não fornecido' },
        401
      );
    }

    const token = authHeader.substring(7);
    const url = new URL(request.url);
    const prospectId = url.pathname.split('/').pop();
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      // Buscar usuário (usar userId ou id para compatibilidade)
      const userId = payload.userId || payload.id;
      if (!userId) {
        return jsonResponse(
          { success: false, error: 'Token inválido: userId não encontrado' },
          401
        );
      }
      
      const user = await env.DB.prepare(
        'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      // Verificar se o prospect pertence ao cliente
      const prospect = await env.DB.prepare(`
        SELECT id FROM prospects_salvos 
        WHERE id = ? AND cliente_id = ?
      `)
        .bind(prospectId, user.cliente_id)
        .first();

      if (!prospect) {
        return jsonResponse(
          { success: false, error: 'Prospect não encontrado' },
          404
        );
      }

      // Deletar
      await env.DB.prepare(`
        DELETE FROM prospects_salvos 
        WHERE id = ? AND cliente_id = ?
      `)
        .bind(prospectId, user.cliente_id)
        .run();

      return jsonResponse({
        success: true,
        message: 'Prospect deletado com sucesso',
      });
    } catch (tokenError) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    console.error('Erro ao deletar prospect:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao deletar prospect', details: error.message },
      500
    );
  }
}

/**
 * POST /api/prospects/:id/enviar
 * Enviar prospect para o bot (marcar como contactado)
 */
async function handleSendProspectToBot(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Token não fornecido' },
        401
      );
    }

    const token = authHeader.substring(7);
    const url = new URL(request.url);
    const prospectId = url.pathname.split('/').slice(0, -1).pop(); // Remove /enviar
    const body = await request.json().catch(() => ({}));
    
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      // Buscar usuário (usar userId ou id para compatibilidade)
      const userId = payload.userId || payload.id;
      if (!userId) {
        return jsonResponse(
          { success: false, error: 'Token inválido: userId não encontrado' },
          401
        );
      }
      
      const user = await env.DB.prepare(
        'SELECT id, role, cliente_id FROM usuarios WHERE id = ? AND ativo = 1'
      )
        .bind(userId)
        .first();

      if (!user) {
        return jsonResponse(
          { success: false, error: 'Usuário não encontrado' },
          401
        );
      }

      // Buscar prospect
      const prospect = await env.DB.prepare(`
        SELECT * FROM prospects_salvos 
        WHERE id = ? AND cliente_id = ?
      `)
        .bind(prospectId, user.cliente_id)
        .first();

      if (!prospect) {
        return jsonResponse(
          { success: false, error: 'Prospect não encontrado' },
          404
        );
      }

      // Se tem telefone, tentar enviar mensagem via bot
      if (prospect.telefone) {
        const whatsappNumber = prospect.telefone.replace(/\D/g, '');
        const message = body.message || `Olá! Vi seu negócio no Google e gostaria de conhecer mais sobre seus serviços.`;
        
        // Enviar mensagem via bot (usar o endpoint existente)
        try {
          const botResponse = await fetch(`${env.WHATSAPP_BOT_SERVER_URL}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contact: whatsappNumber,
              message: message,
            }),
          });
          
          // Marcar como contactado mesmo se o bot não responder
          await env.DB.prepare(`
            UPDATE prospects_salvos 
            SET contactado = 1, status = 'enviado', updated_at = datetime('now')
            WHERE id = ?
          `).bind(prospectId).run();
        } catch (botError) {
          // Ainda marca como enviado mesmo se houver erro no bot
          await env.DB.prepare(`
            UPDATE prospects_salvos 
            SET contactado = 1, status = 'enviado', updated_at = datetime('now')
            WHERE id = ?
          `).bind(prospectId).run();
        }
      } else {
        // Sem telefone, apenas marca como contactado
        await env.DB.prepare(`
          UPDATE prospects_salvos 
          SET contactado = 1, status = 'contactado', updated_at = datetime('now')
          WHERE id = ?
        `).bind(prospectId).run();
      }

      return jsonResponse({
        success: true,
        message: 'Prospect enviado para o bot com sucesso',
      });
    } catch (tokenError) {
      return jsonResponse(
        { success: false, error: 'Token inválido' },
        401
      );
    }
  } catch (error) {
    console.error('Erro ao enviar prospect:', error);
    return jsonResponse(
      { success: false, error: 'Erro ao enviar prospect', details: error.message },
      500
    );
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
      if (path === '/api/whatsapp/sync' && request.method === 'POST') {
        // Sincronizar conversas via bot server
        const botServerUrl = env.WHATSAPP_BOT_SERVER_URL || 'http://localhost:3001';
        try {
          const response = await fetch(`${botServerUrl}/sync`, {
            method: 'POST',
            signal: AbortSignal.timeout(10000),
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'oConnector-Worker/1.0',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return jsonResponse(data);
          }
        } catch (error) {
          return jsonResponse(
            { success: false, error: 'Erro ao sincronizar', details: error.message },
            500
          );
        }
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Rotas de clientes
    if (path.startsWith('/api/clientes')) {
      // GET /api/clientes?whatsapp=... (busca por WhatsApp - usado pelo bot)
      if (path === '/api/clientes' && request.method === 'GET') {
        const url = new URL(request.url);
        if (url.searchParams.has('whatsapp')) {
          return handleGetClienteByWhatsApp(request, env);
        }
      }
      // GET /api/clientes/me (dados do cliente do usuário autenticado)
      if (path === '/api/clientes/me' && request.method === 'GET') {
        return handleGetMyData(request, env);
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Rotas de leads (verificar /stats ANTES de /leads)
    if (path.startsWith('/api/leads')) {
      if (path === '/api/leads/stats' && request.method === 'GET') {
        return handleGetLeadsStats(request, env);
      }
      if (path === '/api/leads' && request.method === 'GET') {
        return handleGetLeads(request, env);
      }
      if (path === '/api/leads' && request.method === 'POST') {
        return handlePostLead(request, env);
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Health check
    if (path === '/api' && request.method === 'GET') {
      return handleHealthCheck(env);
    }

    // Rotas de prospects
    if (path === '/api/prospectar' && request.method === 'POST') {
      return handleProspectar(request, env);
    }
    if (path === '/api/prospects' && request.method === 'GET') {
      return handleGetProspects(request, env);
    }
    if (path === '/api/prospects' && request.method === 'POST') {
      return handleSaveProspect(request, env);
    }
    if (path.startsWith('/api/prospects/') && path.endsWith('/enviar') && request.method === 'POST') {
      return handleSendProspectToBot(request, env);
    }
    if (path.startsWith('/api/prospects/') && request.method === 'DELETE') {
      return handleDeleteProspect(request, env);
    }

    // GET /api/me - Informações do usuário logado
    if (path === '/api/me' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonResponse({ error: 'Token não fornecido' }, 401);
      }
      
      const token = authHeader.substring(7);
      
      try {
        const payload = JSON.parse(atob(token));
        
        // Verificar expiração
        if (payload.exp < Date.now()) {
          return jsonResponse({ error: 'Token expirado' }, 401);
        }
        
        // Buscar usuário completo
        const user = await env.DB.prepare(
          'SELECT id, email, nome, role FROM usuarios WHERE id = ?'
        ).bind(payload.userId || payload.id).first();
        
        if (!user) {
          return jsonResponse({ error: 'Usuário não encontrado' }, 404);
        }
        
        return jsonResponse({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            nome: user.nome,
            role: user.role
          }
        });
        
      } catch (error) {
        return jsonResponse({ error: 'Token inválido' }, 401);
      }
    }

    // Default
    return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
  },
};

