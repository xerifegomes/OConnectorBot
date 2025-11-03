/**
 * Script para criar usuário superadmin
 * Executa hash da senha antes de inserir no banco
 */

import bcrypt from 'bcryptjs';

const email = 'dev@oconnector.tech';
const senha = 'Rsg4dr3g44@';

// Gerar hash da senha
const senhaHash = await bcrypt.hash(senha, 10);

console.log('Email:', email);
console.log('Senha (hash):', senhaHash);

// SQL para inserir
const sql = `
INSERT OR REPLACE INTO usuarios (
  email,
  senha,
  nome,
  role,
  ativo,
  cliente_id
) VALUES (
  '${email}',
  '${senhaHash}',
  'Super Admin oConnector',
  'superadmin',
  1,
  NULL
);
`;

console.log('\nSQL para executar:');
console.log(sql);

