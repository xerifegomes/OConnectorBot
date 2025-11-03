-- =============================================================================
-- oConnector - Criar Tabela de Usuários e SuperAdmin
-- Data: 2025-11-03
-- =============================================================================

-- 1. Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  -- roles: 'superadmin', 'admin', 'user', 'cliente'
  ativo INTEGER DEFAULT 1,
  -- 1 = ativo, 0 = inativo
  cliente_id INTEGER,
  -- NULL para superadmin/admin, ou ID do cliente para usuários
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_cliente ON usuarios(cliente_id);

-- 3. Criar usuário superadmin
-- Hash da senha: Rsg4dr3g44@
-- Usaremos bcrypt hash (normalmente gerado no backend, mas aqui está o hash)
-- Para simplicidade, vamos usar uma senha hasheada com bcrypt
-- Nota: Em produção, o hash deve ser gerado no backend antes de inserir
INSERT OR REPLACE INTO usuarios (
  email,
  senha,
  nome,
  role,
  ativo,
  cliente_id
) VALUES (
  'dev@oconnector.tech',
  -- Hash bcrypt de 'Rsg4dr3g44@' (gerado no backend normalmente)
  -- Para este caso, vamos usar um placeholder que será substituído pelo backend
  '$2b$10$PLACEHOLDER_PASSWORD_HASH',
  'Super Admin oConnector',
  'superadmin',
  1,
  NULL
);

-- 4. Verificar usuário criado
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  created_at
FROM usuarios
WHERE email = 'dev@oconnector.tech';

