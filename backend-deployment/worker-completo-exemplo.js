/**
 * Worker Completo oConnector API - Exemplo
 * Copie este código para o seu worker no Cloudflare Dashboard
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

    // Buscar usuário no banco
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

    // Verificar senha
    let passwordValid = false;
    
    if (user.senha.startsWith('$2b$') || user.senha.startsWith('$2a$')) {
      // Hash bcrypt - não podemos verificar sem biblioteca
      return jsonResponse(
        { 
          success: false, 
          error: 'Senha em formato bcrypt. Use SHA-256 ou implemente verificação bcrypt',
        },
        500
      );
    } else {
      // SHA-256 hash
      passwordValid = await verifyPassword(senha, user.senha);
    }

    if (!passwordValid) {
      return jsonResponse(
        { success: false, error: 'Credenciais inválidas' },
        401
      );
    }

    // Gerar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Atualizar last_login
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

    // Verificar se email já existe
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

    // Hash da senha com SHA-256
    const senhaHash = await hashPassword(senha);

    // Inserir usuário
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

    // Gerar token
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
 * GET /api - Health check
 */
async function handleHealthCheck(env) {
  try {
    // Verificar conexão com banco
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
        prospects: 'GET/POST /api/prospects',
        clientes: 'GET/POST /api/clientes',
        leads: 'GET/POST /api/leads',
        prospectar: 'POST /api/prospectar (Google Places)',
        mensagem: 'POST /api/gerar-mensagem (Workers AI)',
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

