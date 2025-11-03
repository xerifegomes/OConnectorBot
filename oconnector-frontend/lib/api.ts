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
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error || 'Erro na requisição',
          error: data.error,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
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
    });
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

  async prospectar(nicho: string, cidade: string) {
    return this.request<any>('/api/prospectar', {
      method: 'POST',
      body: JSON.stringify({ nicho, cidade }),
    });
  }

  // ==================== WHATSAPP ====================
  async getWhatsAppConversations() {
    return this.request<any[]>('/api/whatsapp/conversations');
  }

  async getWhatsAppMessages(contact: string) {
    return this.request<any[]>(`/api/whatsapp/messages?contact=${contact}`);
  }

  async sendWhatsAppMessage(contact: string, message: string) {
    return this.request<any>('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ contact, message }),
    });
  }

  async getWhatsAppStatus() {
    // Tentar primeiro bot server local (se disponível)
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/status`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: {
            status: data.status,
            qr: data.qr,
            info: data.info,
            ready: data.ready,
          },
        };
      }
    } catch (e) {
      // Fallback para API do Cloudflare
    }
    
    return this.request<{ status: string; qr?: string }>('/api/whatsapp/status');
  }

  async getWhatsAppQR() {
    // Tentar primeiro bot server local
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/qr`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success || !!data.qr,
          data: {
            qr: data.qr,
            status: data.status,
          },
        };
      }
    } catch (e) {
      // Fallback para API do Cloudflare
    }
    
    return this.request<{ success: boolean; qr?: string; status: string }>('/api/whatsapp/qr');
  }

  async getWhatsAppBotStatus() {
    // Tentar primeiro bot server local
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/info`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: {
            status: data.status,
            ready: data.ready || false,
            info: data.info,
          },
        };
      }
    } catch (e) {
      // Fallback para API do Cloudflare
    }
    
    return this.request<{ status: string; ready: boolean; info: any }>('/api/whatsapp/bot-status');
  }

  async restartWhatsAppBot() {
    // Tentar primeiro bot server local
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success || true,
          data: data,
        };
      }
    } catch (e) {
      // Fallback para API do Cloudflare
    }
    
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

