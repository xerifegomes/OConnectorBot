/**
 * Módulo de Autenticação
 * Gerencia login, logout, registro e verificação de autenticação
 */

const auth = {
    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    },

    /**
     * Obtém o token JWT
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Obtém dados do usuário do localStorage
     */
    getUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Salva dados do usuário no localStorage
     */
    setUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    },

    /**
     * Faz login
     */
    async login(email, password) {
        try {
            const response = await authAPI.login(email, password);
            
            if (response.success && response.data) {
                const { token, user } = response.data;
                
                // Salvar token e dados do usuário
                api.setToken(token);
                this.setUser(user);
                
                return { success: true, user };
            }
            
            return { success: false, message: 'Credenciais inválidas' };
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.status === 401) {
                return { success: false, message: 'Email ou senha incorretos' };
            }
            
            if (error.network) {
                return { success: false, message: 'Erro ao conectar com o servidor' };
            }
            
            return { 
                success: false, 
                message: error.message || 'Erro ao fazer login. Tente novamente.' 
            };
        }
    },

    /**
     * Registra novo usuário
     */
    async register(data) {
        try {
            // Mapear campos do formulário para o formato da API
            const registerData = {
                nome: data.nome,
                email: data.email,
                whatsapp: data.whatsapp,
                empresa: data.empresa,
                nicho: data.nicho,
                senha: data.senha
            };

            const response = await authAPI.register(registerData);
            
            if (response.success && response.data) {
                const { token, user, userId } = response.data;
                
                // Salvar token e dados do usuário
                api.setToken(token);
                this.setUser(user || { id: userId, email: data.email, nome: data.nome });
                
                // Criar registro do cliente se necessário
                if (data.plano) {
                    try {
                        const planoValues = {
                            'STARTER': { valor: 500, plano: 'STARTER' },
                            'PROFESSIONAL': { valor: 600, plano: 'PROFESSIONAL' },
                            'PREMIUM': { valor: 900, plano: 'PREMIUM' }
                        };
                        
                        const planoData = planoValues[data.plano] || planoValues['STARTER'];
                        
                        await clientesAPI.create({
                            nome_imobiliaria: data.empresa,
                            whatsapp_numero: data.whatsapp,
                            plano: planoData.plano,
                            valor_mensal: planoData.valor
                        });
                    } catch (error) {
                        console.warn('Erro ao criar cliente:', error);
                        // Não bloquear o registro se falhar
                    }
                }
                
                return { success: true, user };
            }
            
            return { success: false, message: 'Erro ao criar conta' };
        } catch (error) {
            console.error('Register error:', error);
            
            if (error.status === 400 || error.status === 409) {
                const errorData = error.data || {};
                return { 
                    success: false, 
                    message: error.message || 'Dados inválidos',
                    errors: errorData.errors || {}
                };
            }
            
            if (error.network) {
                return { success: false, message: 'Erro ao conectar com o servidor' };
            }
            
            return { 
                success: false, 
                message: error.message || 'Erro ao criar conta. Tente novamente.' 
            };
        }
    },

    /**
     * Verifica se o token ainda é válido
     */
    async verify() {
        try {
            const response = await authAPI.verify();
            if (response.success && response.data) {
                return { valid: true, user: response.data.user };
            }
            return { valid: false };
        } catch (error) {
            if (error.status === 401) {
                // Token inválido ou expirado
                this.logout();
                return { valid: false };
            }
            return { valid: false, error: error.message };
        }
    },

    /**
     * Faz logout
     */
    logout() {
        authAPI.logout();
        window.location.href = '/login.html';
    },

    /**
     * Protege uma rota, redirecionando para login se não autenticado
     */
    protectRoute() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
};

// Verificar autenticação ao carregar a página
if (typeof window !== 'undefined') {
    // Verificar se o token expirou (básico)
    const token = auth.getToken();
    if (token) {
        try {
            // Decodificar JWT (sem verificar assinatura, apenas para pegar exp)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < now) {
                // Token expirado
                auth.logout();
            }
        } catch (e) {
            // Token inválido
            console.warn('Token inválido:', e);
            auth.logout();
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.auth = auth;
}

