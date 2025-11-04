/**
 * Google Auth Helper para Cloudflare Workers
 * Implementação simplificada compatível com google-auth-library
 * Usa API Key para Places API (não requer Service Account)
 */

/**
 * Classe de autenticação Google (simplificada para Workers)
 * Compatível com padrão google-auth-library
 */
export class GoogleAuth {
  constructor(options = {}) {
    this.apiKey = options.apiKey || options.key || null;
    this.scopes = options.scopes || [];
  }

  /**
   * Obter cliente autenticado
   * Para API Key, retorna a própria instância
   */
  async getClient() {
    if (!this.apiKey) {
      throw new Error('API Key não fornecida. Configure apiKey ou key nas opções.');
    }
    return {
      apiKey: this.apiKey,
      type: 'apiKey',
    };
  }

  /**
   * Obter credenciais (compatível com google-auth-library)
   */
  async getCredentials() {
    return {
      apiKey: this.apiKey,
    };
  }
}

/**
 * Factory function similar ao padrão google-auth-library
 */
export function getGoogleAuth(options = {}) {
  return new GoogleAuth(options);
}

