/**
 * Módulo do Dashboard
 * Gerencia todas as funcionalidades do dashboard
 */

const dashboard = {
    currentSection: 'overview',
    clienteId: null,
    leads: [],

    /**
     * Inicializa o dashboard
     */
    async init() {
        // Configurar navegação
        this.setupNavigation();
        
        // Carregar dados do usuário
        await this.loadUserData();
        
        // Carregar dados iniciais
        await this.loadDashboardData();
        
        // Configurar eventos
        this.setupEvents();
        
        // Mostrar seção inicial
        this.showSection('overview');
    },

    /**
     * Configura navegação entre seções
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showSection(section);
                
                // Atualizar classe ativa
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    /**
     * Mostra uma seção específica
     */
    showSection(sectionName) {
        // Esconder todas as seções
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar seção selecionada
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
            this.currentSection = sectionName;
            
            // Atualizar título
            const titles = {
                'overview': 'Visão Geral',
                'leads': 'Leads Capturados',
                'bot': 'Configurar Bot',
                'site': 'Meu Site'
            };
            
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = titles[sectionName] || 'Dashboard';
            }
            
            // Carregar dados específicos da seção
            if (sectionName === 'leads') {
                this.loadLeads();
            } else if (sectionName === 'bot') {
                this.loadBotConfig();
            } else if (sectionName === 'site') {
                this.loadSiteInfo();
            }
        }
    },

    /**
     * Carrega dados do usuário
     */
    async loadUserData() {
        const user = auth.getUser();
        const userNameEl = document.getElementById('userName');
        
        if (user && userNameEl) {
            userNameEl.textContent = user.nome || user.email || 'Usuário';
        }
        
        // Obter ID do cliente
        try {
            const response = await clientesAPI.getMyData();
            if (response.success && response.data) {
                this.clienteId = response.data.id;
                
                // Salvar dados do cliente
                localStorage.setItem('cliente', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Erro ao carregar dados do cliente:', error);
        }
    },

    /**
     * Carrega dados gerais do dashboard
     */
    async loadDashboardData() {
        await this.loadOverviewStats();
        await this.loadRecentActivity();
    },

    /**
     * Carrega estatísticas da visão geral
     */
    async loadOverviewStats() {
        try {
            if (!this.clienteId) {
                // Tentar obter do localStorage
                const cliente = localStorage.getItem('cliente');
                if (cliente) {
                    const clienteData = JSON.parse(cliente);
                    this.clienteId = clienteData.id;
                }
            }
            
            if (this.clienteId) {
                const statsResponse = await leadsAPI.stats(this.clienteId);
                
                if (statsResponse.success && statsResponse.data) {
                    const stats = statsResponse.data;
                    
                    // Atualizar estatísticas
                    const leadsTodayEl = document.getElementById('leadsToday');
                    const conversionRateEl = document.getElementById('conversionRate');
                    const botMessagesEl = document.getElementById('botMessages');
                    const botStatusEl = document.getElementById('botStatus');
                    
                    if (leadsTodayEl) {
                        leadsTodayEl.textContent = stats.leadsHoje || stats.leads_today || 0;
                    }
                    
                    if (conversionRateEl) {
                        const rate = stats.taxaConversao || stats.conversion_rate || 0;
                        conversionRateEl.textContent = `${rate}%`;
                    }
                    
                    if (botMessagesEl) {
                        botMessagesEl.textContent = stats.mensagensBot || stats.bot_messages || 0;
                    }
                    
                    if (botStatusEl) {
                        const status = stats.statusBot || stats.bot_status || 'Desconhecido';
                        botStatusEl.textContent = status;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            
            // Valores padrão
            document.getElementById('leadsToday').textContent = '0';
            document.getElementById('conversionRate').textContent = '0%';
            document.getElementById('botMessages').textContent = '0';
            document.getElementById('botStatus').textContent = 'Inativo';
        }
    },

    /**
     * Carrega atividade recente
     */
    async loadRecentActivity() {
        const activityEl = document.getElementById('recentActivity');
        if (!activityEl) return;
        
        try {
            if (this.clienteId) {
                const leadsResponse = await leadsAPI.list(this.clienteId);
                
                if (leadsResponse.success && leadsResponse.data) {
                    const leads = Array.isArray(leadsResponse.data) 
                        ? leadsResponse.data 
                        : (leadsResponse.data.leads || []);
                    
                    this.leads = leads.slice(0, 5); // Últimos 5
                    
                    if (leads.length === 0) {
                        activityEl.innerHTML = '<p class="loading-text">Nenhuma atividade recente</p>';
                    } else {
                        activityEl.innerHTML = leads.slice(0, 5).map(lead => `
                            <div style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                                <strong>${lead.nome || 'Lead sem nome'}</strong>
                                <span style="color: #666; margin-left: 8px;">${lead.whatsapp || ''}</span>
                                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                                    ${new Date(lead.data_criacao || lead.created_at).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        `).join('');
                    }
                } else {
                    activityEl.innerHTML = '<p class="loading-text">Nenhuma atividade recente</p>';
                }
            } else {
                activityEl.innerHTML = '<p class="loading-text">Carregando...</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar atividade:', error);
            activityEl.innerHTML = '<p class="loading-text">Erro ao carregar atividade</p>';
        }
    },

    /**
     * Carrega lista de leads
     */
    async loadLeads() {
        const tableBody = document.getElementById('leadsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';
        
        try {
            if (!this.clienteId) {
                const cliente = localStorage.getItem('cliente');
                if (cliente) {
                    const clienteData = JSON.parse(cliente);
                    this.clienteId = clienteData.id;
                }
            }
            
            if (this.clienteId) {
                const response = await leadsAPI.list(this.clienteId);
                
                if (response.success && response.data) {
                    const leads = Array.isArray(response.data) 
                        ? response.data 
                        : (response.data.leads || []);
                    
                    this.leads = leads;
                    
                    if (leads.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum lead encontrado</td></tr>';
                    } else {
                        tableBody.innerHTML = leads.map(lead => `
                            <tr>
                                <td>${lead.nome || '-'}</td>
                                <td>${lead.whatsapp || lead.telefone || '-'}</td>
                                <td>${new Date(lead.data_criacao || lead.created_at).toLocaleDateString('pt-BR')}</td>
                                <td><span class="badge">${lead.status || 'Novo'}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="dashboard.viewLead(${lead.id})">
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        `).join('');
                    }
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Erro ao carregar leads</td></tr>';
            }
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Erro ao carregar leads</td></tr>';
        }
    },

    /**
     * Exporta leads para CSV
     */
    exportLeadsToCSV() {
        if (this.leads.length === 0) {
            alert('Nenhum lead para exportar');
            return;
        }
        
        const headers = ['Nome', 'WhatsApp', 'Data', 'Status'];
        const rows = this.leads.map(lead => [
            lead.nome || '',
            lead.whatsapp || lead.telefone || '',
            new Date(lead.data_criacao || lead.created_at).toLocaleDateString('pt-BR'),
            lead.status || 'Novo'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Carrega configuração do bot
     */
    async loadBotConfig() {
        // Carregar configurações salvas do localStorage ou backend
        const botConfig = localStorage.getItem('botConfig');
        
        if (botConfig) {
            try {
                const config = JSON.parse(botConfig);
                document.getElementById('botEnabled').checked = config.enabled || false;
                document.getElementById('botGreeting').value = config.greeting || '';
                document.getElementById('botQualification').value = config.qualification || '';
                document.getElementById('botStartTime').value = config.startTime || '08:00';
                document.getElementById('botEndTime').value = config.endTime || '18:00';
            } catch (e) {
                console.error('Erro ao carregar configuração do bot:', e);
            }
        }
    },

    /**
     * Salva configuração do bot
     */
    async saveBotConfig() {
        const config = {
            enabled: document.getElementById('botEnabled').checked,
            greeting: document.getElementById('botGreeting').value,
            qualification: document.getElementById('botQualification').value,
            startTime: document.getElementById('botStartTime').value,
            endTime: document.getElementById('botEndTime').value
        };
        
        // Salvar no localStorage (por enquanto)
        localStorage.setItem('botConfig', JSON.stringify(config));
        
        alert('Configurações salvas com sucesso!');
    },

    /**
     * Carrega informações do site
     */
    async loadSiteInfo() {
        try {
            const cliente = localStorage.getItem('cliente');
            if (cliente) {
                const clienteData = JSON.parse(cliente);
                const siteUrl = `https://${clienteData.domain || 'site-' + this.clienteId}.oconnector.tech`;
                
                const siteUrlEl = document.getElementById('siteUrl');
                const viewSiteBtn = document.getElementById('viewSiteBtn');
                
                if (siteUrlEl) {
                    siteUrlEl.textContent = siteUrl;
                }
                
                if (viewSiteBtn) {
                    viewSiteBtn.href = siteUrl;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar informações do site:', error);
        }
    },

    /**
     * Visualiza detalhes de um lead
     */
    viewLead(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (lead) {
            alert(`Lead: ${lead.nome}\nWhatsApp: ${lead.whatsapp || lead.telefone}\nData: ${new Date(lead.data_criacao || lead.created_at).toLocaleDateString('pt-BR')}`);
        }
    },

    /**
     * Configura eventos do dashboard
     */
    setupEvents() {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Deseja realmente sair?')) {
                    auth.logout();
                }
            });
        }
        
        // Exportar CSV
        const exportBtn = document.getElementById('exportCSVBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLeadsToCSV();
            });
        }
        
        // Buscar leads
        const searchInput = document.getElementById('leadsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#leadsTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
        
        // Salvar configuração do bot
        const botForm = document.getElementById('botConfigForm');
        if (botForm) {
            botForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveBotConfig();
            });
        }
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.dashboard = dashboard;
}

