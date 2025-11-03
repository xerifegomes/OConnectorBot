/**
 * Endpoints de Autenticação para oConnector API Worker
 * Adicione este código ao seu worker oconnector-api
 */

import bcrypt from 'bcryptjs';

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

// Helper para verificar senha bcrypt
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

// Helper para gerar JWT simples (ou use uma biblioteca)
function generateToken(user) {
  // Em produção, use uma biblioteca JWT real
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  };
  
  // Por enquanto, retornamos um token simples
  // Em produção, use: const token = jwt.sign(payload, SECRET_KEY);
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * POST /api/auth/login
 */
async function handleLogin(request, env) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return jsonResponse(
        { success: false, error: 'Email e senha são obrigatórios' },
        400
      );
    }

    // Buscar usuário no banco
    const result = await env.DB.prepare(
      'SELECT id, email, senha, nome, role, ativo FROM usuarios WHERE email = ? AND ativo = 1'
    )
      .bind(email)
      .first();

    if (!result) {
      return jsonResponse(
        { success: false, error: 'Credenciais inválidas' },
        401
      );
    }

    // Verificar senha
    const passwordValid = await verifyPassword(senha, result.senha);

    if (!passwordValid) {
      return jsonResponse(
        { success: false, error: 'Credenciais inválidas' },
        401
      );
    }

    // Gerar token
    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role,
    });

    // Atualizar last_login
    await env.DB.prepare(
      'UPDATE usuarios SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(result.id)
      .run();

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
    const { email, senha, nome, role = 'user' } = await request.json();

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

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = await env.DB.prepare(
      'INSERT INTO usuarios (email, senha, nome, role, ativo) VALUES (?, ?, ?, ?, 1) RETURNING id, email, nome, role'
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
    
    // Decodificar token (simplificado - use JWT real em produção)
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Verificar expiração
      if (payload.exp && payload.exp < Date.now()) {
        return jsonResponse(
          { success: false, error: 'Token expirado' },
          401
        );
      }

      // Buscar usuário
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
 * Router para endpoints de autenticação
 */
export async function handleAuthRoutes(url, request, env) {
  const path = new URL(url).pathname;

  // OPTIONS para CORS
  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 200);
  }

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

