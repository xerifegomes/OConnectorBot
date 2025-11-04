/**
 * Bot WhatsApp oConnector
 * Bot principal integrado com agent-training-worker
 */

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { MessageHandler } from './message-handler.js';
import { config } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Classe principal do Bot
 */
export class WhatsAppBot {
  constructor(options = {}) {
    this.agentAPIUrl = options.agentAPIUrl || config.agentTrainingAPI;
    this.oconnectorAPIUrl = options.oconnectorAPIUrl || config.oconnectorAPI;
    this.sessionPath = options.sessionPath || config.sessionPath;
    this.client = null;
    this.messageHandler = null;
    this.isReady = false;
    this.currentQR = null;
    this.status = 'disconnected';
    this.onQRGenerated = options.onQRGenerated || null;
    this.onReady = options.onReady || null;
    this.onDisconnected = options.onDisconnected || null;
    
    // Proteção contra loop infinito
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 30000; // 30 segundos
    this.qrGenerationCount = 0;
    this.maxQRGenerations = 3; // Reduzido para 3 para evitar loops
    this.qrTimeout = null;
    this.isInitializing = false;
    this.isDestroyed = false; // Flag para evitar inicializações múltiplas
  }

  /**
   * Inicializar bot
   */
  async initialize() {
    // Prevenir múltiplas inicializações simultâneas
    if (this.isInitializing) {
      console.log('⚠️ Bot já está sendo inicializado, aguarde...');
      return;
    }
    
    // Prevenir inicialização se já foi destruído
    if (this.isDestroyed) {
      console.error('❌ Bot foi destruído. Crie uma nova instância.');
      return;
    }
    
    this.isInitializing = true;
    console.log('🚀 Inicializando oConnector WhatsApp Bot...\n');

    // Criar diretório de sessão se não existir
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }

    // Criar cliente WhatsApp com LocalAuth para persistência
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: this.sessionPath,
        clientId: 'oconnector-bot', // ID único para manter sessão consistente
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
      // Usar versão local do WhatsApp Web (mais estável)
      webVersionCache: {
        type: 'local',
      },
    });

    // Inicializar handler de mensagens
    // useWorkerAI = true para usar Workers AI diretamente via oconnector-api
    this.messageHandler = new MessageHandler(
      this.client,
      this.agentAPIUrl,
      this.oconnectorAPIUrl,
      true // Usar Worker AI diretamente
    );

    // Configurar eventos
    this.setupEvents();

    // Inicializar cliente
    await this.client.initialize();

    // Limpeza periódica de conversas antigas (a cada hora)
    setInterval(() => {
      if (this.messageHandler) {
        this.messageHandler.cleanupOldConversations();
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Configurar eventos do cliente
   */
  setupEvents() {
    // QR Code gerado
    this.client.on('qr', async (qr) => {
      this.qrGenerationCount++;
      
      // Proteção contra loop infinito de QR codes
      if (this.qrGenerationCount > this.maxQRGenerations) {
        console.error(`\n❌ LOOP INFINITO DETECTADO: ${this.qrGenerationCount} QR codes gerados!`);
        console.error('🛑 PARANDO BOT IMEDIATAMENTE para evitar loop infinito.');
        console.error('💡 Possíveis causas:');
        console.error('   - Sessão corrompida');
        console.error('   - Conflito com outro dispositivo conectado');
        console.error('   - WhatsApp detectou atividade suspeita');
        console.error('\n💡 SOLUÇÃO:');
        console.error('   1. Pare o bot (Ctrl+C)');
        console.error('   2. Execute: cd whatsapp-bot && ./reset-whatsapp.sh');
        console.error('   3. Ou delete manualmente: rm -rf .wwebjs_auth/');
        console.error('   4. Reinicie o bot\n');
        this.isDestroyed = true;
        await this.destroy();
        process.exit(1);
      }
      
      console.log(`\n📱 QR Code #${this.qrGenerationCount}/${this.maxQRGenerations} - Escaneie com WhatsApp:\n`);
      qrcode.generate(qr, { small: true });
      console.log('\n⏰ QR Code expira em 60 segundos\n');
      
      // Limpar timeout anterior
      if (this.qrTimeout) clearTimeout(this.qrTimeout);
      
      // Timeout de 60 segundos para cada QR code
      this.qrTimeout = setTimeout(() => {
        console.log('⏰ QR Code expirou. Aguardando novo QR...');
      }, 60000);
      
      // Emitir evento para armazenar QR Code (se estiver em modo server)
      if (this.onQRGenerated) {
        this.onQRGenerated(qr);
      }
      
      // Armazenar QR Code localmente
      this.currentQR = qr;
      this.status = 'waiting_qr';
    });

    // Autenticação pronta
    this.client.on('ready', async () => {
      // Prevenir múltiplas execuções do evento ready
      if (this.isReady) {
        console.log('⚠️ Evento ready já foi processado, ignorando...');
        return;
      }
      
      // Limpar timeout de QR code
      if (this.qrTimeout) clearTimeout(this.qrTimeout);
      
      // Resetar contadores de proteção
      this.reconnectAttempts = 0;
      this.qrGenerationCount = 0;
      this.isInitializing = false;
      
      console.log('✅ WhatsApp Bot conectado e pronto!');
      console.log('🤖 Bot oConnector está ativo e aguardando mensagens...\n');
      this.isReady = true;
      this.status = 'connected';
      this.currentQR = null;
      
      // Obter número do bot e configurar no message handler
      const botNumber = this.client.info?.wid?.user || null;
      if (botNumber && this.messageHandler) {
        await this.messageHandler.setBotNumber(botNumber);
      }
      
      // Sincronizar conversas existentes
      try {
        await this.syncConversations();
      } catch (error) {
        console.error('❌ Erro ao sincronizar conversas:', error);
      }
      
      // Emitir evento de ready
      if (this.onReady) {
        this.onReady({
          whatsappNumber: botNumber,
          name: this.client.info?.pushname || null,
        });
      }
    });

    // Autenticação falhou
    this.client.on('auth_failure', async (msg) => {
      console.error('❌ Falha na autenticação do WhatsApp:', msg);
      console.error('🔄 Sessão pode estar corrompida.');
      
      // Tentar limpar sessão automaticamente
      try {
        console.log('🗑️ Removendo sessão corrompida...');
        await this.destroy();
        
        if (fs.existsSync(this.sessionPath)) {
          fs.rmSync(this.sessionPath, { recursive: true, force: true });
          console.log('✅ Sessão removida com sucesso.');
        }
        
        console.log('💡 Reinicie o bot para gerar novo QR Code.');
        console.log('💡 Ou execute: ./reset-whatsapp.sh');
      } catch (error) {
        console.error('❌ Erro ao limpar sessão:', error.message);
        console.error('💡 Execute manualmente: rm -rf .wwebjs_auth/');
      }
      
      process.exit(1);
    });

    // Desconectado
    this.client.on('disconnected', async (reason) => {
      // Prevenir múltiplas execuções
      if (!this.isReady && this.status === 'disconnected') {
        return; // Já processou desconexão
      }
      
      console.log('⚠️ Bot desconectado:', reason);
      this.isReady = false;
      this.status = 'disconnected';
      this.currentQR = null;
      this.isInitializing = false;
      
      // IMPORTANTE: NÃO tentar reconectar automaticamente
      // WhatsApp Web.js pode gerar QR codes infinitos se tentar reconectar
      // O usuário deve reiniciar o bot manualmente
      
      if (reason === 'LOGGED_OUT') {
        console.log('\nℹ️  LOGOUT detectado pelo WhatsApp.');
        console.log('💡 Possíveis causas:');
        console.log('   - Você deslogou do WhatsApp Web no celular');
        console.log('   - WhatsApp detectou atividade suspeita');
        console.log('   - Outro dispositivo conectado');
        console.log('\n💡 SOLUÇÃO:');
        console.log('   1. Verifique WhatsApp no celular (Aparelhos conectados)');
        console.log('   2. Desconecte todos os dispositivos');
        console.log('   3. Reinicie o bot: npm start');
        console.log('   4. Escaneie o QR Code novamente\n');
      } else {
        console.log('\n💡 Bot desconectado. Reinicie manualmente:');
        console.log('   npm start\n');
      }
      
      // Emitir evento de desconexão
      if (this.onDisconnected) {
        this.onDisconnected(reason);
      }
      
      // NÃO tentar reconectar - isso causa loops infinitos
      // O usuário deve reiniciar manualmente
    });

    // Mensagem recebida
    this.client.on('message', async (message) => {
      if (config.autoReply && this.isReady) {
        await this.messageHandler.handleMessage(message);
      }
    });

    // Mensagem criada (quando enviamos)
    this.client.on('message_create', async (message) => {
      if (message.fromMe) {
        console.log(`📤 Mensagem enviada para ${message.to.substring(0, 10)}...`);
      }
    });

    // Erro
    this.client.on('error', (error) => {
      console.error('❌ Erro no cliente WhatsApp:', error);
      this.isReady = false;
      this.status = 'disconnected';
      if (this.onDisconnected) {
        this.onDisconnected(`Erro: ${error.message}`);
      }
    });

    // Evento de loading
    this.client.on('loading_screen', (percent, message) => {
      console.log(`⏳ Carregando: ${percent}% - ${message}`);
    });

    // Evento de remote_session
    this.client.on('remote_session_saved', () => {
      console.log('💾 Sessão remota salva');
    });
  }

  /**
   * Sincronizar conversas existentes do WhatsApp
   */
  async syncConversations() {
    if (!this.isReady || !this.client) {
      return;
    }

    try {
      console.log('🔄 Sincronizando conversas do WhatsApp...');
      
      // Verificar se o cliente ainda está conectado
      if (!this.client.info || this.client.info.wid === undefined) {
        console.log('⚠️ Cliente não está conectado, pulando sincronização');
        return;
      }

      const chats = await this.client.getChats();
      let syncedCount = 0;
      let errorCount = 0;

      // Processar em lotes com delay para evitar sobrecarga
      for (let i = 0; i < chats.length; i++) {
        const chat = chats[i];
        
        // Delay entre processamentos para evitar sobrecarga
        if (i > 0 && i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          // Ignorar grupos e status
          if (chat.isGroup || chat.id._serialized === 'status@broadcast') {
            continue;
          }

          // Extrair número do contato diretamente do ID do chat (evita chamar getContact)
          let contactNumber = null;
          let contactName = null;
          
          try {
            // Tentar extrair número do ID do chat primeiro (mais seguro)
            const chatId = chat.id?._serialized || chat.id || '';
            // Formato: "5522999999999@c.us"
            const match = chatId.match(/^(\d+)@c\.us$/);
            if (match) {
              contactNumber = match[1];
            } else {
              // Fallback: tentar obter contato (pode falhar)
              const contact = await chat.getContact();
              contactNumber = contact?.id?.user || null;
              contactName = contact?.pushname || contact?.name || contactNumber;
            }
          } catch (contactError) {
            // Se falhar ao obter contato, tentar extrair do ID
            const chatId = chat.id?._serialized || chat.id || '';
            const match = chatId.match(/^(\d+)@c\.us$/);
            if (match) {
              contactNumber = match[1];
            } else {
              // Pular se não conseguir obter o número
              errorCount++;
              continue;
            }
          }

          if (!contactNumber) {
            errorCount++;
            continue;
          }

          // Usar nome do chat se não tiver nome do contato
          if (!contactName) {
            contactName = chat.name || contactNumber;
          }

          // Obter última mensagem (com timeout)
          let lastMessage = null;
          try {
            const messages = await Promise.race([
              chat.fetchMessages({ limit: 1 }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            lastMessage = messages.length > 0 ? messages[0] : null;
          } catch (messageError) {
            // Se falhar ao obter mensagens, continuar mesmo assim
            console.log(`⚠️ Não foi possível obter mensagens para ${contactNumber}, continuando...`);
          }

          // Buscar cliente_id pelo número do BOT
          try {
            const botNumber = this.client.info?.wid?.user || null;
            if (!botNumber) {
              errorCount++;
              continue;
            }

            const clienteId = await this.messageHandler?.clienteManager?.getClienteId(botNumber);
            
            if (clienteId) {
              // Verificar se já existe lead para evitar duplicatas
              const leadExists = await this.messageHandler?.leadManager?.leadExists(clienteId, contactNumber);
              
              if (!leadExists) {
                // Salvar no banco via API com API key
                const botApiKey = process.env.BOT_API_KEY || 'oconnector-bot-internal';
                const response = await fetch(`${this.oconnectorAPIUrl}/api/leads`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `X-API-Key ${botApiKey}`
                  },
                  body: JSON.stringify({
                    cliente_id: clienteId,
                    nome: contactName,
                    telefone: contactNumber,
                    observacoes: lastMessage 
                      ? `Conversa sincronizada: ${lastMessage.body?.substring(0, 100) || 'Sem mensagem'}`
                      : 'Conversa sincronizada (sem mensagem)',
                    origem: 'whatsapp',
                    status: 'novo',
                  }),
                });

                if (response.ok) {
                  syncedCount++;
                }
              } else {
                syncedCount++; // Já existe, contar como sincronizado
              }
            } else {
              // Silenciosamente ignorar números não associados a clientes
            }
          } catch (apiError) {
            errorCount++;
            // Não logar todos os erros para evitar spam
            if (errorCount <= 5) {
              console.error(`Erro ao salvar conversa ${contactNumber}:`, apiError.message);
            }
          }
        } catch (chatError) {
          errorCount++;
          // Só logar alguns erros para evitar spam
          if (errorCount <= 5) {
            const errorMsg = chatError.message || chatError.toString();
            // Ignorar erros de contexto destruído
            if (!errorMsg.includes('Execution context') && !errorMsg.includes('destroyed')) {
              console.error(`Erro ao processar chat:`, errorMsg);
            }
          }
        }
      }

      if (syncedCount > 0 || errorCount === 0) {
        console.log(`✅ ${syncedCount} conversas sincronizadas`);
      } else {
        console.log(`⚠️ Sincronização concluída com ${errorCount} erros`);
      }
    } catch (error) {
      const errorMsg = error.message || error.toString();
      // Ignorar erros de contexto destruído (WhatsApp Web pode estar recarregando)
      if (!errorMsg.includes('Execution context') && !errorMsg.includes('destroyed')) {
        console.error('❌ Erro ao sincronizar conversas:', errorMsg);
      }
    }
  }

  /**
   * Obter conversas do WhatsApp
   */
  async getConversations() {
    if (!this.isReady || !this.client) {
      return [];
    }

    try {
      const chats = await this.client.getChats();
      const conversations = [];

      for (const chat of chats) {
        // Ignorar grupos e status
        if (chat.isGroup || chat.id._serialized === 'status@broadcast') {
          continue;
        }

        try {
          const contact = await chat.getContact();
          const contactNumber = contact.id.user;
          const contactName = contact.pushname || contact.name || contactNumber;

          // Obter última mensagem
          const messages = await chat.fetchMessages({ limit: 1 });
          const lastMessage = messages.length > 0 ? messages[0] : null;

          conversations.push({
            id: contactNumber,
            contact: contactNumber,
            contactName: contactName,
            lastMessage: lastMessage?.body || 'Sem mensagens',
            lastMessageTime: lastMessage?.timestamp ? new Date(lastMessage.timestamp * 1000) : new Date(),
            unread: chat.unreadCount || 0,
          });
        } catch (error) {
          console.error(`Erro ao processar chat:`, error);
        }
      }

      return conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    } catch (error) {
      console.error('❌ Erro ao obter conversas:', error);
      return [];
    }
  }

  /**
   * Obter mensagens de uma conversa
   */
  async getMessages(contactNumber) {
    if (!this.isReady || !this.client) {
      return [];
    }

    try {
      const chatId = `${contactNumber}@c.us`;
      const chat = await this.client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 100 });

      return messages.map(msg => ({
        id: msg.id._serialized,
        text: msg.body || '',
        fromMe: msg.fromMe,
        timestamp: new Date(msg.timestamp * 1000),
        contact: contactNumber,
      }));
    } catch (error) {
      console.error(`❌ Erro ao obter mensagens de ${contactNumber}:`, error);
      return [];
    }
  }

  /**
   * Obter status do bot
   */
  getStatus() {
    return {
      ready: this.isReady,
      agentAPI: this.agentAPIUrl,
      oconnectorAPI: this.oconnectorAPIUrl,
    };
  }

  /**
   * Desligar bot
   */
  async destroy() {
    if (this.isDestroyed) {
      return; // Já foi destruído
    }
    
    console.log('🛑 Encerrando bot...');
    this.isDestroyed = true;
    this.isReady = false;
    this.isInitializing = false;
    
    // Limpar timeouts
    if (this.qrTimeout) {
      clearTimeout(this.qrTimeout);
      this.qrTimeout = null;
    }
    
    // Destruir cliente
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (error) {
        console.error('Erro ao destruir cliente:', error.message);
      }
      this.client = null;
    }
    
    console.log('✅ Bot encerrado.');
  }
}

// Executar se for o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new WhatsAppBot();
  
  bot.initialize().catch((error) => {
    console.error('❌ Erro fatal ao inicializar bot:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await bot.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await bot.destroy();
    process.exit(0);
  });
}

