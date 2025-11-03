# 🐳 Docker Setup - WhatsApp Bot

## Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema para Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Variáveis de ambiente para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copiar arquivos
COPY package*.json ./
RUN npm install --production

COPY . .

# Criar diretórios
RUN mkdir -p logs .wwebjs_auth

VOLUME ["/app/.wwebjs_auth", "/app/logs"]

CMD ["node", "src/index.js"]
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    container_name: oconnector-whatsapp-bot
    restart: unless-stopped
    environment:
      - AGENT_TRAINING_API_URL=${AGENT_TRAINING_API_URL}
      - OCONNECTOR_API_URL=${OCONNECTOR_API_URL}
      - WHATSAPP_SESSION_PATH=/app/.wwebjs_auth
      - AUTO_REPLY=true
      - ENABLE_AI_RESPONSES=true
      - LOG_LEVEL=info
    volumes:
      - ./whatsapp-session:/app/.wwebjs_auth
      - ./logs:/app/logs
    networks:
      - oconnector-network

networks:
  oconnector-network:
    driver: bridge
```

## Uso

```bash
# Build
docker-compose build

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

