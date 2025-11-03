# ⚙️ PM2 Ecosystem - Configuração para Produção

## ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'oconnector-whatsapp-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      AGENT_TRAINING_API_URL: 'https://agent-training-worker.xerifegomes-e71.workers.dev',
      OCONNECTOR_API_URL: 'https://oconnector-api.xerifegomes-e71.workers.dev',
      AUTO_REPLY: 'true',
      ENABLE_AI_RESPONSES: 'true',
      LOG_LEVEL: 'info',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }],
};
```

## Comandos PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar bot
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs oconnector-whatsapp-bot

# Reiniciar
pm2 restart oconnector-whatsapp-bot

# Parar
pm2 stop oconnector-whatsapp-bot

# Salvar configuração
pm2 save

# Configurar startup
pm2 startup
```

