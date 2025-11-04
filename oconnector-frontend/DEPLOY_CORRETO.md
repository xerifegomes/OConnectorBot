# 🚀 Deploy Correto - Frontend oConnector

## ✅ URL Correta

**URL de Produção:** `https://oconnector.xerifegomes-e71.workers.dev`

**Status:** ✅ Conectado ao GitHub para deploy automático

## ❌ URLs Antigas (NÃO USAR)

- `ba49606d.oconnector-frontend.pages.dev` - **DELETAR**
- Qualquer URL temporária do Cloudflare Pages (ex: `xxxxx.oconnector-frontend.pages.dev`)

## 📋 Como Fazer Deploy Corretamente

### 1. Build do Projeto

```bash
cd oconnector-frontend
npm run build
```

### 2. Deploy para Cloudflare Pages

```bash
# Usando wrangler
npx wrangler pages deploy out --project-name=oconnector-frontend

# OU usando o script
./deploy.sh
```

### 3. Configurar Domínio Principal no Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com
2. Vá em **Workers & Pages** → **oconnector-frontend**
3. Vá em **Custom domains**
4. O domínio já está configurado: `oconnector.xerifegomes-e71.workers.dev`
5. Certifique-se de que este domínio está marcado como **Production**

### 4. Limpar Deployments Antigos

No Cloudflare Dashboard:

1. Vá em **Workers & Pages** → **oconnector-frontend** → **Deployments**
2. Encontre deployments antigos ou temporários
3. Delete deployments que não são mais necessários
4. **IMPORTANTE:** O frontend está conectado ao GitHub e faz deploy automático

## 🔍 Verificar Deploy

Após o deploy, verifique:

```bash
# Verificar se a página está funcionando
curl -I https://oconnector.xerifegomes-e71.workers.dev/prospects

# Deve retornar 200 OK
```

## ⚠️ Importante

- **NÃO** use URLs temporárias do Cloudflare Pages
- **SEMPRE** use `oconnector.pages.dev` como URL principal
- **DELETE** deployments antigos que não são mais necessários
- **LIMPE** o cache do navegador após deploy (Ctrl+Shift+R)

## 📝 Configuração Atual

- **URL de Produção:** `https://oconnector.xerifegomes-e71.workers.dev`
- **URL da API:** `https://oconnector-api.xerifegomes-e71.workers.dev`
- **Build Command:** `npm run build`
- **Output Directory:** `out`

