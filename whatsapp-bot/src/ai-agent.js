/**
 * Agente IA especializado - Integração com agent-training-worker
 */

// fetch está disponível globalmente no Node.js 18+

export class AIAgent {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cache = new Map(); // Cache de respostas frequentes
  }

  /**
   * Obter resposta contextualizada do agente IA
   */
  async getResponse(clienteId, pergunta, context = {}) {
    try {
      // Normalizar pergunta para cache
      const cacheKey = `${clienteId}_${pergunta.toLowerCase().trim()}`;
      
      // Verificar cache (apenas para perguntas exatas)
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hora
        return cached.resposta;
      }

      // Fazer query no agent-training-worker
      const response = await fetch(`${this.apiUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          pergunta: pergunta,
          contexto: context,
        }),
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.resposta) {
        // Atualizar cache
        this.cache.set(cacheKey, {
          resposta: data.resposta,
          timestamp: Date.now(),
        });

        return data.resposta;
      }

      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Timeout ao fazer query no agente IA');
      } else {
        console.error('Erro ao obter resposta do agente IA:', error);
      }
      return null;
    }
  }

  /**
   * Verificar se cliente está treinado
   */
  async isClienteTrained(clienteId) {
    try {
      const response = await fetch(`${this.apiUrl}/api/status/${clienteId}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success && data.dados_treinamento;
    } catch (error) {
      console.error('Erro ao verificar treinamento:', error);
      return false;
    }
  }

  /**
   * Processar mensagem com contexto
   */
  async processMessage(clienteId, mensagem, historico = []) {
    // Adicionar contexto do histórico se disponível
    const context = {
      historico_mensagens: historico.slice(-5), // Últimas 5 mensagens
      timestamp: new Date().toISOString(),
    };

    return await this.getResponse(clienteId, mensagem, context);
  }

  /**
   * Limpar cache
   */
  clearCache() {
    this.cache.clear();
  }
}

