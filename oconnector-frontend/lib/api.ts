const API_URL = 'https://oconnector-api.xerifegomes-e71.workers.dev';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Cliente API para comunicação com o backend
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('token');
      } catch (error) {
        console.error('Erro ao acessar localStorage:', error);
        return null;
      }
    }
    return null;
  }
  
  /**
   * Limpar token (usado quando detectamos que está inválido)
   */
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Verificar se o token está válido (apenas verifica se existe)
   */
  isTokenValid(): boolean {
    return this.getToken() !== null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Endpoints que não precisam de autenticação
    const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/cadastro'];
    const isPublicEndpoint = publicEndpoints.some(ep => endpoint.includes(ep));
    
    // Se é endpoint público, não requer autenticação
    if (isPublicEndpoint) {
      requireAuth = false;
    }

    // Adicionar token se necessário e disponível
    if (requireAuth) {
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Se requer autenticação mas não tem token, retornar erro
        return {
          success: false,
          message: 'Token não disponível',
          error: 'No token',
        };
      }
    } else if (token) {
      // Se não requer autenticação mas tem token, enviar mesmo assim (pode ser útil)
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors', // Garantir CORS
        credentials: 'omit', // Não enviar cookies
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Se não for JSON válido, retornar erro
        const text = await response.text();
        console.error("Erro ao parsear JSON:", text);
        return {
          success: false,
          message: 'Resposta inválida do servidor',
          error: 'Invalid JSON response',
        };
      }

      if (!response.ok) {
        // Se for 401, verificar a causa (apenas se não for endpoint público)
        if (response.status === 401 && requireAuth) {
          console.error(`Erro 401 em ${url}:`, data);
          const token = this.getToken();
          console.error('Token atual:', token ? 'existe' : 'não existe');
          if (token) {
            try {
              const payload = JSON.parse(atob(token));
              console.error('Token payload:', {
                hasId: !!payload.id,
                hasUserId: !!payload.userId,
                hasExp: !!payload.exp,
                exp: payload.exp,
                now: Date.now(),
                expired: payload.exp ? payload.exp < Date.now() : 'N/A'
              });
            } catch (e) {
              console.error('Erro ao decodificar token:', e);
            }
          }
          // Limpar token apenas se realmente for erro de autenticação
          if (data.error === 'Token não fornecido' || data.error === 'Token inválido' || data.error === 'Token expirado' || data.error?.includes('Token')) {
            this.clearToken();
          }
        }
        
        console.error(`Erro HTTP ${response.status} em ${url}:`, data);
        return {
          success: false,
          message: data.message || data.error || `Erro na requisição (${response.status})`,
          error: data.error || `HTTP ${response.status}`,
          data: Array.isArray(data) ? data : (data.data || []), // Garantir array mesmo em erro
        };
      }

      // Se data já é um array, retornar diretamente
      // Se data tem propriedade data que é array, usar ela
      // Caso contrário, retornar data como está
      let finalData = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const dataObj = data as any;
        if (Array.isArray(dataObj.data)) {
          finalData = dataObj.data;
        } else if (dataObj.data !== undefined) {
          finalData = dataObj.data;
        } else if (Array.isArray(dataObj)) {
          // Se data em si é um array (caso especial)
          finalData = dataObj;
        }
      }

      // Garantir que finalData é sempre o que esperamos
      // Se for endpoint que retorna array, garantir que seja array
      return {
        success: true,
        data: finalData,
      };
    } catch (error) {
      console.error(`Erro ao fazer requisição para ${url}:`, error);
      return {
        success: false,
        message: 'Erro ao conectar com o servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== AUTH ====================
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha: password }), // Backend espera "senha"
    }, false); // Login não requer autenticação
  }

  async register(data: {
    nome: string;
    email: string;
    whatsapp: string;
    empresa: string;
    nicho: string;
    senha: string;
  }) {
    return this.request<{ userId: number; token: string; user: any }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async verify() {
    return this.request<{ valid: boolean; user: any }>('/api/auth/verify');
  }

  // ==================== CLIENTES ====================
  async getMyData() {
    return this.request<any>('/api/clientes/me');
  }

  async createCliente(data: {
    nome_imobiliaria: string;
    whatsapp_numero: string;
    plano: 'STARTER' | 'PROFESSIONAL' | 'PREMIUM';
    valor_mensal: number;
  }) {
    return this.request<any>('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== LEADS ====================
  async getLeads(clienteId?: number) {
    const endpoint = clienteId
      ? `/api/leads?cliente_id=${clienteId}`
      : '/api/leads';
    return this.request<any[]>(endpoint);
  }

  async getLeadsStats(clienteId?: number) {
    const endpoint = clienteId
      ? `/api/leads/stats?cliente_id=${clienteId}`
      : '/api/leads/stats';
    return this.request<{
      leadsHoje?: number;
      taxaConversao?: number;
      mensagensBot?: number;
      statusBot?: string;
    }>(endpoint);
  }

  // ==================== PROSPECTS ====================
  async getProspects() {
    return this.request<any[]>('/api/prospects');
  }

  async saveProspect(prospect: any) {
    return this.request<any>('/api/prospects', {
      method: 'POST',
      body: JSON.stringify(prospect),
    });
  }

  async deleteProspect(prospectId: number | string) {
    return this.request<any>(`/api/prospects/${prospectId}`, {
      method: 'DELETE',
    });
  }

  async sendProspectToBot(prospectId: number | string, message?: string) {
    return this.request<any>(`/api/prospects/${prospectId}/enviar`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async prospectar(nicho: string, cidade: string) {
    const response = await this.request<any>('/api/prospectar', {
      method: 'POST',
      body: JSON.stringify({ nicho, cidade }),
    });
    
    // O endpoint /api/prospectar retorna { success: true, resultados: [...], total: ... }
    // O método request() já transforma isso em { success: true, data: { success: true, resultados: [...], total: ... } }
    // Precisamos extrair os resultados corretamente
    if (response.success && response.data) {
      // Se response.data tem a propriedade resultados, usar ela
      if (response.data.resultados && Array.isArray(response.data.resultados)) {
        return {
          success: true,
          data: response.data.resultados,
        };
      }
      // Se response.data já é um array (caso especial)
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
    }
    
    return response;
  }

  // ==================== WHATSAPP ====================
  async getWhatsAppConversations() {
    try {
      const response = await this.request<any[]>('/api/whatsapp/conversations');
      // Garantir que sempre retorna um array
      if (response.success && response.data) {
        return {
          ...response,
          data: Array.isArray(response.data) ? response.data : [],
        };
      }
      return { ...response, data: [] };
    } catch (error) {
      return { success: false, data: [], error: 'Erro ao buscar conversas' };
    }
  }

  async getWhatsAppMessages(contact: string) {
    try {
      const response = await this.request<any[]>(`/api/whatsapp/messages?contact=${contact}`);
      // Garantir que sempre retorna um array
      if (response.success && response.data) {
        return {
          ...response,
          data: Array.isArray(response.data) ? response.data : [],
        };
      }
      return { ...response, data: [] };
    } catch (error) {
      return { success: false, data: [], error: 'Erro ao buscar mensagens' };
    }
  }

  async sendWhatsAppMessage(contact: string, message: string) {
    return this.request<any>('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ contact, message }),
    });
  }

  async getWhatsAppStatus() {
    // SEMPRE usar API do Cloudflare (mesmo em dev)
    // Isso evita erros de CORS no console quando bot local não está rodando
    return this.request<{ status: string; qr?: string }>('/api/whatsapp/status');
  }

  async getWhatsAppQR() {
    // SEMPRE usar API do Cloudflare (mesmo em dev)
    // Isso evita erros de CORS no console quando bot local não está rodando
    return this.request<{ success: boolean; qr?: string; status: string }>('/api/whatsapp/qr');
  }

  async getWhatsAppBotStatus() {
    // SEMPRE usar API do Cloudflare (mesmo em dev)
    // Isso evita erros de CORS no console quando bot local não está rodando
    return this.request<{ status: string; ready: boolean; info: any }>('/api/whatsapp/bot-status');
  }

  async syncWhatsAppConversations() {
    // SEMPRE usar API do Cloudflare (mesmo em dev)
    // Isso evita erros de CORS no console quando bot local não está rodando
    return this.request<any>('/api/whatsapp/sync', {
      method: 'POST',
    });
  }

  async restartWhatsAppBot() {
    // SEMPRE usar API do Cloudflare (mesmo em dev)
    // Isso evita erros de CORS no console quando bot local não está rodando
    return this.request<any>('/api/whatsapp/bot/restart', {
      method: 'POST',
    });
  }

  // ==================== IA ====================
  async chatWithAI(message: string, context?: any) {
    return this.request<{ response: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }
}

export const api = new ApiClient(API_URL);

// Funções auxiliares exportadas
export async function getProspects() {
  return api.getProspects();
}

export async function prospectar(nicho: string, cidade: string) {
  return api.prospectar(nicho, cidade);
}

