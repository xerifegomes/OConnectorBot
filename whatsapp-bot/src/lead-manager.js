/**
 * Gerenciador de Leads
 */

// fetch está disponível globalmente no Node.js 18+

export class LeadManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.leadsCache = new Map(); // Cache de leads já salvos
  }

  /**
   * Salvar lead capturado
   */
  async saveLead(clienteId, leadData) {
    try {
      const leadKey = `${clienteId}_${leadData.telefone}`;
      
      // Verificar se já salvamos este lead hoje
      const cached = this.leadsCache.get(leadKey);
      if (cached && this.isSameDay(cached.date, new Date())) {
        return cached.leadId;
      }

      // Usar API key do bot para autenticação
      const botApiKey = process.env.BOT_API_KEY || 'oconnector-bot-internal';
      const response = await fetch(`${this.apiUrl}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `X-API-Key ${botApiKey}`
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          nome: leadData.nome || 'Não informado',
          telefone: leadData.telefone,
          email: leadData.email || null,
          origem: leadData.origem || 'whatsapp_bot',
          mensagem_inicial: leadData.mensagem_inicial || null,
          status: leadData.status || 'novo',
          data_criacao: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.id) {
        // Atualizar cache
        this.leadsCache.set(leadKey, {
          leadId: result.data.id,
          date: new Date(),
        });

        return result.data.id;
      }

      return null;
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      return null;
    }
  }

  /**
   * Verificar se duas datas são do mesmo dia
   */
  isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Verificar se lead já existe
   */
  async leadExists(clienteId, telefone) {
    try {
      // Usar API key do bot para autenticação
      const botApiKey = process.env.BOT_API_KEY || 'oconnector-bot-internal';
      const response = await fetch(`${this.apiUrl}/api/leads?cliente_id=${clienteId}&telefone=${telefone}`, {
        headers: {
          'Authorization': `X-API-Key ${botApiKey}`
        }
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.data && data.data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar lead:', error);
      return false;
    }
  }
}

