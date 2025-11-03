-- =============================================================================
-- oConnector - Criar SuperAdmin Diretamente no D1
-- Data: 2025-11-03
-- Email: dev@oconnector.tech
-- Senha: Rsg4dr3g44@
-- =============================================================================

-- IMPORTANTE: A senha será hasheada pelo backend no primeiro login
-- Ou você pode gerar o hash bcrypt manualmente e substituir abaixo

-- Hash bcrypt de 'Rsg4dr3g44@' (gerado com salt rounds 10)
-- Para gerar: node -e "require('bcryptjs').hash('Rsg4dr3g44@', 10).then(console.log)"
-- Ou usar ferramenta online: https://bcrypt-generator.com/

-- Inserir superadmin
INSERT OR REPLACE INTO usuarios (
  email,
  senha,
  nome,
  role,
  ativo,
  cliente_id,
  created_at
) VALUES (
  'dev@oconnector.tech',
  -- Hash bcrypt de 'Rsg4dr3g44@'
  -- Este hash precisa ser gerado. Execute primeiro o script create-superadmin-hash.js
  -- Ou use: node -e "require('bcryptjs').hash('Rsg4dr3g44@', 10).then(console.log)"
  '$2b$10$EXAMPLE_HASH_REPLACE_WITH_REAL_HASH',
  'Super Admin oConnector',
  'superadmin',
  1,
  NULL,
  CURRENT_TIMESTAMP
);

-- Verificar criação
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  created_at
FROM usuarios
WHERE email = 'dev@oconnector.tech';

