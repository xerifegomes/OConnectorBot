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
        return {
          success: false,
          message: data.message || data.error || 'Erro na requisição',
          error: data.error,
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
    // PRODUÇÃO: Sempre usar API do Cloudflare em produção
    // Só tentar localhost se estiver EXATAMENTE em localhost
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (!isLocalDev) {
      // Qualquer ambiente que não seja localhost = usar apenas Cloudflare API
      return this.request<{ status: string; qr?: string }>('/api/whatsapp/status');
    }
    
    // Só tenta localhost se for realmente localhost
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
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
      // Silenciosamente fallback para API do Cloudflare
    }
    
    // Fallback para API do Cloudflare
    return this.request<{ status: string; qr?: string }>('/api/whatsapp/status');
  }

  async getWhatsAppQR() {
    // PRODUÇÃO: Sempre usar API do Cloudflare em produção
    // Só tentar localhost se estiver EXATAMENTE em localhost
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (!isLocalDev) {
      // Qualquer ambiente que não seja localhost = usar apenas Cloudflare API
      return this.request<{ success: boolean; qr?: string; status: string }>('/api/whatsapp/qr');
    }
    
    // Só tenta localhost se for realmente localhost
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/qr`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
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
      // Silenciosamente fallback para API do Cloudflare
    }
    
    // Fallback para API do Cloudflare
    return this.request<{ success: boolean; qr?: string; status: string }>('/api/whatsapp/qr');
  }

  async getWhatsAppBotStatus() {
    // PRODUÇÃO: Sempre usar API do Cloudflare em produção
    // Só tentar localhost se estiver EXATAMENTE em localhost
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (!isLocalDev) {
      // Qualquer ambiente que não seja localhost = usar apenas Cloudflare API
      return this.request<{ status: string; ready: boolean; info: any }>('/api/whatsapp/bot-status');
    }
    
    // Só tenta localhost se for realmente localhost
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
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
      // Silenciosamente fallback para API do Cloudflare
    }
    
    // Fallback para API do Cloudflare
    return this.request<{ status: string; ready: boolean; info: any }>('/api/whatsapp/bot-status');
  }

  async restartWhatsAppBot() {
    // PRODUÇÃO: Sempre usar API do Cloudflare em produção
    // Só tentar localhost se estiver EXATAMENTE em localhost
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (!isLocalDev) {
      // Qualquer ambiente que não seja localhost = usar apenas Cloudflare API
      return this.request<any>('/api/whatsapp/bot/restart', {
        method: 'POST',
      });
    }
    
    // Só tenta localhost se for realmente localhost
    const botServerUrl = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${botServerUrl}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success || true,
          data: data,
        };
      }
    } catch (e) {
      // Silenciosamente fallback para API do Cloudflare
    }
    
    // Fallback para API do Cloudflare
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

