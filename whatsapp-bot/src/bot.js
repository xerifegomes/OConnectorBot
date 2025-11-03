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
  }

  /**
   * Inicializar bot
   */
  async initialize() {
    console.log('🚀 Inicializando oConnector WhatsApp Bot...\n');

    // Criar diretório de sessão se não existir
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }

    // Criar cliente WhatsApp
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: this.sessionPath,
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
    this.client.on('qr', (qr) => {
      console.log('\n📱 Escaneie o QR Code abaixo com o WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n');
      
      // Emitir evento para armazenar QR Code (se estiver em modo server)
      if (this.onQRGenerated) {
        this.onQRGenerated(qr);
      }
      
      // Armazenar QR Code localmente
      this.currentQR = qr;
      this.status = 'waiting_qr';
    });

    // Autenticação pronta
    this.client.on('ready', () => {
      console.log('✅ WhatsApp Bot conectado e pronto!');
      console.log('🤖 Bot oConnector está ativo e aguardando mensagens...\n');
      this.isReady = true;
      this.status = 'connected';
      this.currentQR = null;
      
      // Emitir evento de ready
      if (this.onReady) {
        this.onReady({
          whatsappNumber: this.client.info?.wid?.user || null,
          name: this.client.info?.pushname || null,
        });
      }
    });

    // Autenticação falhou
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação do WhatsApp:', msg);
      console.error('Por favor, remova a pasta .wwebjs_auth e tente novamente.');
    });

    // Desconectado
    this.client.on('disconnected', (reason) => {
      console.log('⚠️ Bot desconectado:', reason);
      this.isReady = false;
      this.status = 'disconnected';
      this.currentQR = null;
      
      // Emitir evento de desconexão
      if (this.onDisconnected) {
        this.onDisconnected(reason);
      }
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
    });
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
    console.log('🛑 Encerrando bot...');
    if (this.client) {
      await this.client.destroy();
    }
    this.isReady = false;
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

