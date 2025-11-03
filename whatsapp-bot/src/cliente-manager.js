/**
 * Gerenciador de Clientes e Mapeamento WhatsApp
 */

// fetch está disponível globalmente no Node.js 18+

export class ClienteManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obter cliente_id a partir do número WhatsApp
   */
  async getClienteId(whatsappNumber) {
    // Limpar número (remover caracteres não numéricos)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    // Verificar cache
    const cached = this.cache.get(cleanNumber);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.clienteId;
    }

    try {
      // Buscar no banco via API
      const response = await fetch(`${this.apiUrl}/api/clientes?whatsapp=${cleanNumber}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const cliente = data.data?.[0] || data?.cliente || null;

      if (cliente && cliente.id) {
        // Atualizar cache
        this.cache.set(cleanNumber, {
          clienteId: cliente.id,
          cliente,
          timestamp: Date.now(),
        });

        return cliente.id;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  /**
   * Obter dados completos do cliente
   */
  async getCliente(whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const cached = this.cache.get(cleanNumber);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.cliente;
    }

    const clienteId = await this.getClienteId(cleanNumber);
    if (!clienteId) return null;

    const cachedData = this.cache.get(cleanNumber);
    return cachedData?.cliente || null;
  }

  /**
   * Adicionar mapeamento manual
   */
  addMapping(whatsappNumber, clienteId, clienteData = null) {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    this.cache.set(cleanNumber, {
      clienteId,
      cliente: clienteData,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpar cache
   */
  clearCache() {
    this.cache.clear();
  }
}

