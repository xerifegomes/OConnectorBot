/**
 * API Client para oConnector
 * Gerencia todas as requisições HTTP para o backend Cloudflare Workers
 */

const API_CONFIG = {
    baseURL: 'https://oconnector-api.xerifegomes-e71.workers.dev',
    timeout: 30000
};

/**
 * Classe para gerenciar requisições à API
 */
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Obtém o token JWT do localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Define o token JWT no localStorage
     */
    setToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    /**
     * Faz uma requisição HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Tentar parsear JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    data: data,
                    message: data?.message || data?.error || 'Erro na requisição'
                };
            }

            return { success: true, data };
        } catch (error) {
            if (error.name === 'AbortError') {
                throw {
                    message: 'Timeout: A requisição demorou muito para responder',
                    timeout: true
                };
            }

            if (error.status) {
                throw error;
            }

            throw {
                message: 'Erro ao conectar com o servidor. Verifique sua conexão.',
                network: true
            };
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Instância global do cliente API
const api = new APIClient(API_CONFIG.baseURL);

/**
 * API de Autenticação
 */
const authAPI = {
    /**
     * Faz login
     */
    async login(email, password) {
        return api.post('/api/auth/login', { email, password });
    },

    /**
     * Registra novo usuário
     */
    async register(data) {
        return api.post('/api/auth/register', data);
    },

    /**
     * Verifica se o token é válido
     */
    async verify() {
        return api.get('/api/auth/verify');
    },

    /**
     * Logout (apenas remove o token local)
     */
    logout() {
        api.setToken(null);
        localStorage.removeItem('user');
    }
};

/**
 * API de Clientes
 */
const clientesAPI = {
    /**
     * Cria um novo cliente
     */
    async create(data) {
        return api.post('/api/clientes', data);
    },

    /**
     * Obtém dados do cliente logado
     */
    async getMyData() {
        return api.get('/api/clientes/me');
    }
};

/**
 * API de Leads
 */
const leadsAPI = {
    /**
     * Lista leads de um cliente
     */
    async list(clienteId) {
        const endpoint = clienteId ? `/api/leads?cliente_id=${clienteId}` : '/api/leads';
        return api.get(endpoint);
    },

    /**
     * Obtém estatísticas de leads
     */
    async stats(clienteId) {
        const endpoint = clienteId ? `/api/leads/stats?cliente_id=${clienteId}` : '/api/leads/stats';
        return api.get(endpoint);
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.api = api;
    window.authAPI = authAPI;
    window.clientesAPI = clientesAPI;
    window.leadsAPI = leadsAPI;
}

