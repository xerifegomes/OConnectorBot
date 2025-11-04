-- =============================================================================
-- oConnector - Criar SuperAdmin com SHA-256
-- Data: 2025-11-04
-- Email: dev@oconnector.tech
-- Senha: Rsg4dr3g44@
-- =============================================================================

-- IMPORTANTE: O worker usa SHA-256 para hash de senha, NÃO bcrypt!
-- Hash SHA-256 de 'Rsg4dr3g44@':
-- 535c0bf15a7efc87cf7f27062f98e675708988a381d40db71dad3b46b337c16a

-- 1. Deletar usuário existente se tiver formato errado
DELETE FROM usuarios WHERE email = 'dev@oconnector.tech';

-- 2. Inserir superadmin com senha SHA-256
INSERT INTO usuarios (
  email,
  senha,
  nome,
  role,
  ativo,
  cliente_id,
  created_at
) VALUES (
  'dev@oconnector.tech',
  -- Hash SHA-256 de 'Rsg4dr3g44@'
  '535c0bf15a7efc87cf7f27062f98e675708988a381d40db71dad3b46b337c16a',
  'Super Admin oConnector',
  'superadmin',
  1,
  NULL,
  CURRENT_TIMESTAMP
);

-- 3. Verificar criação
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  substr(senha, 1, 20) || '...' as senha_preview,
  created_at
FROM usuarios
WHERE email = 'dev@oconnector.tech';

-- =============================================================================
-- INSTRUÇÕES
-- =============================================================================
-- 1. Acesse: https://dash.cloudflare.com
-- 2. Workers & Pages → D1 → oconnector_db
-- 3. Aba "Console"
-- 4. Cole este SQL e execute
-- 5. Verifique a resposta
-- 
-- Credenciais de login:
-- Email: dev@oconnector.tech
-- Senha: Rsg4dr3g44@
-- =============================================================================

