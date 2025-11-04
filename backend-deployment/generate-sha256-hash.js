/**
 * Script para gerar hash SHA-256 de senha
 * Compatível com o formato usado pelo oConnector API Worker
 */

import crypto from 'crypto';

// Senha do superadmin
const senha = 'Rsg4dr3g44@';

// Gerar hash SHA-256
const hash = crypto.createHash('sha256').update(senha).digest('hex');

console.log('');
console.log('='.repeat(60));
console.log('🔐 Hash SHA-256 Gerado');
console.log('='.repeat(60));
console.log('');
console.log('Senha original:', senha);
console.log('Hash SHA-256:  ', hash);
console.log('');
console.log('='.repeat(60));
console.log('');
console.log('📋 SQL para criar superadmin:');
console.log('');
console.log(`DELETE FROM usuarios WHERE email = 'dev@oconnector.tech';`);
console.log('');
console.log(`INSERT INTO usuarios (email, senha, nome, role, ativo, cliente_id)`);
console.log(`VALUES (`);
console.log(`  'dev@oconnector.tech',`);
console.log(`  '${hash}',`);
console.log(`  'Super Admin oConnector',`);
console.log(`  'superadmin',`);
console.log(`  1,`);
console.log(`  NULL`);
console.log(`);`);
console.log('');
console.log('='.repeat(60));
console.log('');

