/**
 * Integração com Google Services
 * 
 * Bibliotecas instaladas:
 * - google-auth-library: Autenticação OAuth2 do Google
 * - @google-cloud/storage: Google Cloud Storage
 * - next-auth: Autenticação para Next.js (já inclui suporte ao Google)
 */

import { OAuth2Client } from 'google-auth-library';

// Configuração do cliente OAuth2 do Google
export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados');
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });
}

// Verificar token do Google
export async function verifyGoogleToken(token: string) {
  const client = getGoogleOAuthClient();
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    return ticket.getPayload();
  } catch (error) {
    console.error('Erro ao verificar token do Google:', error);
    return null;
  }
}

