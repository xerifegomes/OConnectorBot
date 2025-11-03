/**
 * Configurações do Bot WhatsApp
 */

export const config = {
  // URLs das APIs
  agentTrainingAPI: process.env.AGENT_TRAINING_API_URL || 'https://agent-training-worker.xerifegomes-e71.workers.dev',
  oconnectorAPI: process.env.OCONNECTOR_API_URL || 'https://oconnector-api.xerifegomes-e71.workers.dev',

  // WhatsApp
  sessionPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth',

  // Configurações do bot
  autoReply: process.env.AUTO_REPLY !== 'false',
  enableAIResponses: process.env.ENABLE_AI_RESPONSES !== 'false',

  // Respostas padrão
  defaultResponses: {
    greeting: 'Olá! 👋 Bem-vindo à *oConnector*!\n\nComo posso ajudá-lo hoje?',
    notConfigured: 'Olá! Este número não está configurado para atendimento. Por favor, entre em contato com o suporte.',
    processing: 'Processando sua mensagem...',
    error: 'Desculpe, não consegui processar sua mensagem no momento. Nossa equipe será notificada e entrará em contato em breve.',
    goodbye: 'Obrigado por entrar em contato! Tenha um ótimo dia! 👋',
  },

  // Configurações de timeout
  messageTimeout: 30000, // 30 segundos
  apiTimeout: 10000, // 10 segundos

  // Limites
  maxMessageLength: 4096,
  maxRetries: 3,
};

