/**
 * oConnector WhatsApp Bot - Entry Point
 * Bot inteligente integrado com agent-training-worker
 */

import { WhatsAppBot } from './bot.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar bot
const bot = new WhatsAppBot({
  agentAPIUrl: process.env.AGENT_TRAINING_API_URL,
  oconnectorAPIUrl: process.env.OCONNECTOR_API_URL,
  sessionPath: process.env.WHATSAPP_SESSION_PATH,
});

// Inicializar
bot.initialize().catch((error) => {
  console.error('❌ Erro fatal ao inicializar bot:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT, encerrando bot...');
  await bot.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM, encerrando bot...');
  await bot.destroy();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
