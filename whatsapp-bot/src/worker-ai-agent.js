/**
 * Agente IA usando Workers AI diretamente (Cloudflare)
 * Integração direta com Workers AI sem agent-training-worker
 */

export class WorkerAIAgent {
  constructor(apiUrl, aiEnv = null) {
    this.apiUrl = apiUrl; // URL do worker que tem acesso ao Workers AI
    this.aiEnv = aiEnv; // Se chamado dentro de um worker, recebe env.AI
  }

  /**
   * Obter resposta do Workers AI (Llama 3)
   */
  async getResponse(mensagem, contexto = {}) {
    try {
      // Se estamos dentro de um Cloudflare Worker (aiEnv disponível)
      if (this.aiEnv) {
        return await this.getResponseDirect(mensagem, contexto);
      }
      
      // Se estamos em Node.js, chamar via API
      return await this.getResponseViaAPI(mensagem, contexto);
    } catch (error) {
      console.error('Erro ao obter resposta do Workers AI:', error);
      return null;
    }
  }

  /**
   * Resposta direta via Workers AI (dentro de Cloudflare Worker)
   */
  async getResponseDirect(mensagem, contexto) {
    const prompt = this.buildPrompt(mensagem, contexto);
    
    const response = await this.aiEnv.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `Você é o oConnector, especialista em tecnologia e soluções para empresas. 
Você é profissional, consultivo e humanizado. Seu objetivo é identificar necessidades 
e oferecer soluções tecnológicas personalizadas.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.response || response;
  }

  /**
   * Resposta via API (chama worker que tem acesso ao Workers AI)
   */
  async getResponseViaAPI(mensagem, contexto) {
    const prompt = this.buildPrompt(mensagem, contexto);
    
    const response = await fetch(`${this.apiUrl}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: mensagem,
        context: contexto,
        prompt: prompt,
      }),
      signal: AbortSignal.timeout(15000), // 15 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || data.message;
  }

  /**
   * Construir prompt personalizado
   */
  buildPrompt(mensagem, contexto) {
    let prompt = `Como o oConnector, especialista em tecnologia, responda de forma profissional e humanizada:\n\n`;
    
    // Adicionar contexto se disponível
    if (contexto.empresa) {
      prompt += `Empresa: ${contexto.empresa.nome}\n`;
      if (contexto.empresa.cidade) {
        prompt += `Localização: ${contexto.empresa.cidade}\n`;
      }
      if (contexto.empresa.rating) {
        prompt += `Rating: ${contexto.empresa.rating} ⭐\n`;
      }
      if (contexto.empresa.temSite === false) {
        prompt += `Oportunidade: Esta empresa não tem site. Identifique essa necessidade e ofereça soluções.\n`;
      }
      prompt += '\n';
    }

    if (contexto.historico && contexto.historico.length > 0) {
      prompt += `Histórico da conversa:\n`;
      contexto.historico.slice(-3).forEach((msg, idx) => {
        prompt += `${msg.remetente === 'cliente' ? 'Cliente' : 'Você'}: ${msg.texto}\n`;
      });
      prompt += '\n';
    }

    prompt += `Mensagem do cliente: ${mensagem}\n\n`;
    prompt += `Responda de forma natural, consultiva e humanizada. Identifique necessidades e ofereça soluções tecnológicas.`;

    return prompt;
  }

  /**
   * Gerar abordagem inicial personalizada
   */
  async gerarAbordagemInicial(empresa) {
    const contexto = {
      empresa: {
        nome: empresa.nome,
        cidade: empresa.cidade || empresa.endereco,
        rating: empresa.rating,
        temSite: empresa.website ? true : false,
      }
    };

    const mensagem = empresa.temSite 
      ? `Olá! Sou o oConnector, especialista em tecnologia e soluções para empresas. Gostaria de conversar sobre como podemos ajudar a ${empresa.nome} a crescer através da tecnologia.`
      : `Olá! Sou o oConnector, especialista em tecnologia. Notei que a ${empresa.nome} tem ótima reputação (${empresa.rating}⭐) mas ainda não tem presença digital. Gostaria de conversar sobre como podemos ajudar?`;

    const resposta = await this.getResponse(mensagem, contexto);
    
    // Se a resposta for muito longa, usar uma versão mais curta
    if (resposta && resposta.length > 300) {
      return this.resumirResposta(resposta);
    }

    return resposta || mensagem;
  }

  /**
   * Resumir resposta muito longa
   */
  async resumirResposta(resposta) {
    const prompt = `Resuma esta mensagem em no máximo 250 caracteres, mantendo o tom profissional e consultivo:\n\n${resposta}`;
    return await this.getResponse(prompt, {});
  }
}

