/**
 * Handler de Mensagens WhatsApp
 */

import { AIAgent } from './ai-agent.js';
import { WorkerAIAgent } from './worker-ai-agent.js';
import { ClienteManager } from './cliente-manager.js';
import { LeadManager } from './lead-manager.js';
import { config } from './config.js';

export class MessageHandler {
  constructor(client, agentAPIUrl, oconnectorAPIUrl, useWorkerAI = true) {
    this.client = client;
    // Usar Worker AI diretamente ou agent-training-worker
    if (useWorkerAI) {
      this.aiAgent = new WorkerAIAgent(oconnectorAPIUrl);
    } else {
      this.aiAgent = new AIAgent(agentAPIUrl);
    }
    this.clienteManager = new ClienteManager(oconnectorAPIUrl);
    this.leadManager = new LeadManager(oconnectorAPIUrl);
    this.conversations = new Map(); // Armazena conversas ativas
    this.isProcessing = new Set(); // Controla mensagens sendo processadas
  }

  /**
   * Processar mensagem recebida
   */
  async handleMessage(message) {
    // Ignorar mensagens de grupos e status
    if (message.from === 'status@broadcast' || message.isGroupMsg) {
      return;
    }

    // Evitar processamento duplicado
    const messageId = message.id._serialized;
    if (this.isProcessing.has(messageId)) {
      return;
    }

    this.isProcessing.add(messageId);

    try {
      const from = message.from.replace('@c.us', '');
      const body = message.body.trim();
      const contact = await message.getContact();
      const contactName = contact.pushname || contact.number || from;

      console.log(`📨 Mensagem de ${contactName}: ${body.substring(0, 50)}`);

      // Obter cliente_id
      const clienteId = await this.clienteManager.getClienteId(from);

      if (!clienteId) {
        console.warn(`⚠️ Número ${from} não está associado a nenhum cliente`);
        await this.sendMessage(message.from, config.defaultResponses.notConfigured);
        return;
      }

      // Gerenciar conversa
      const conversation = this.getOrCreateConversation(message.from, clienteId);
      
      // Verificar se é primeira mensagem (novo lead)
      if (conversation.messageCount === 0) {
        // Salvar lead
        await this.leadManager.saveLead(clienteId, {
          nome: contactName,
          telefone: from,
          origem: 'whatsapp_bot',
          mensagem_inicial: body,
          status: 'novo',
        });

        // Enviar saudação inicial
        const greeting = await this.getGreeting(clienteId);
        if (greeting) {
          await this.sendMessage(message.from, greeting);
        }
      }

      // Adicionar mensagem ao histórico
      conversation.historico.push({
        tipo: 'recebida',
        mensagem: body,
        timestamp: new Date().toISOString(),
      });

      // Obter resposta do agente IA
      const resposta = await this.getAIResponse(
        clienteId,
        body,
        conversation.historico
      );

      if (resposta) {
        await this.sendMessage(message.from, resposta);
        
        // Adicionar resposta ao histórico
        conversation.historico.push({
          tipo: 'enviada',
          mensagem: resposta,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Resposta padrão se IA falhar
        await this.sendMessage(message.from, config.defaultResponses.error);
      }

      // Atualizar contador
      conversation.messageCount++;
      conversation.lastMessage = new Date();

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      await this.sendMessage(
        message.from,
        config.defaultResponses.error
      );
    } finally {
      this.isProcessing.delete(messageId);
    }
  }

  /**
   * Obter ou criar conversa
   */
  getOrCreateConversation(from, clienteId) {
    if (!this.conversations.has(from)) {
      this.conversations.set(from, {
        clienteId,
        startTime: new Date(),
        lastMessage: new Date(),
        messageCount: 0,
        historico: [],
      });
    }
    return this.conversations.get(from);
  }

  /**
   * Obter saudação personalizada
   */
  async getGreeting(clienteId) {
    try {
      // Se for WorkerAIAgent
      if (this.aiAgent.constructor.name === 'WorkerAIAgent') {
        const resposta = await this.aiAgent.getResponse(
          'Olá! Boa tarde!',
          {}
        );
        
        if (resposta) {
          return resposta;
        }
      } else {
        // AIAgent tradicional
        const resposta = await this.aiAgent.getResponse(
          clienteId,
          'Olá, boa tarde!'
        );
        
        if (resposta) {
          return resposta;
        }
      }

      // Fallback para saudação padrão
      const cliente = await this.clienteManager.getCliente(clienteId);
      if (cliente && cliente.nome_imobiliaria) {
        return `Olá! 👋 Bem-vindo à *${cliente.nome_imobiliaria}*!\n\nComo posso ajudá-lo hoje?`;
      }

      return config.defaultResponses.greeting;
    } catch (error) {
      console.error('Erro ao obter saudação:', error);
      return config.defaultResponses.greeting;
    }
  }

  /**
   * Obter resposta do agente IA
   */
  async getAIResponse(clienteId, mensagem, historico = []) {
    try {
      // Se for WorkerAIAgent (usando Workers AI diretamente)
      if (this.aiAgent.constructor.name === 'WorkerAIAgent') {
        // Construir contexto com histórico
        const contexto = {
          historico: historico.map(msg => ({
            remetente: msg.tipo === 'recebida' ? 'cliente' : 'agente',
            texto: msg.mensagem || msg.body,
          })),
        };

        // Obter resposta do Worker AI
        const resposta = await this.aiAgent.getResponse(mensagem, contexto);
        return resposta || 'Desculpe, não consegui processar sua mensagem no momento.';
      }

      // Se for AIAgent tradicional (agent-training-worker)
      const isTrained = await this.aiAgent.isClienteTrained?.(clienteId);
      
      if (!isTrained) {
        console.warn(`⚠️ Cliente ${clienteId} não está treinado`);
        return 'Olá! Nossa equipe está configurando o atendimento automatizado. Em breve você receberá respostas personalizadas.';
      }

      // Obter resposta do agente
      const resposta = await this.aiAgent.processMessage(
        clienteId,
        mensagem,
        historico
      );

      return resposta;
    } catch (error) {
      console.error('Erro ao obter resposta do agente:', error);
      return null;
    }
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(to, message) {
    try {
      // Limitar tamanho da mensagem
      if (message.length > config.maxMessageLength) {
        message = message.substring(0, config.maxMessageLength - 3) + '...';
      }

      await this.client.sendMessage(to, message);
      console.log(`✅ Mensagem enviada para ${to.substring(0, 10)}...`);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Limpar conversas antigas (mais de 24 horas sem mensagens)
   */
  cleanupOldConversations() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [from, conversation] of this.conversations.entries()) {
      const age = now - conversation.lastMessage;
      if (age > maxAge) {
        this.conversations.delete(from);
        console.log(`🧹 Conversa removida: ${from}`);
      }
    }
  }
}

