# 🔧 Como Evitar URLs Temporárias no Deploy

## ⚠️ Problema

Quando você faz deploy com `wrangler pages deploy`, o Cloudflare sempre cria uma URL temporária como:
- `https://ba49606d.oconnector-frontend.pages.dev`

Essa URL temporária é criada **automaticamente** para cada deployment.

## ✅ Solução

O frontend oficial é **`https://oconnector.xerifegomes-e71.workers.dev`** e está conectado ao GitHub para deploy automático.

Se você fez deploy manual via CLI, pode precisar promover para produção.

## 📋 Passos

### 1. Fazer o Deploy

```bash
cd oconnector-frontend
./deploy.sh
```

Isso criará uma URL temporária (normal).

### 2. Promover para Produção (IMPORTANTE)

**No Cloudflare Dashboard:**

1. Acesse: https://dash.cloudflare.com
2. Vá em **Workers & Pages** → **oconnector-frontend**
3. Clique na aba **Deployments**
4. Encontre o deployment mais recente (o que você acabou de fazer)
5. Clique nos **três pontos (...)** ao lado do deployment
6. Selecione **"Promote to production"**
7. Confirme

### 3. Deletar Deployments Temporários Antigos

Após promover para produção:

1. Na mesma página de Deployments
2. Encontre deployments antigos que não são mais necessários
3. Para cada um:
   - Clique nos três pontos (...)
   - Selecione **"Delete deployment"**
   - Confirme

### 4. Verificar

Após promover, verifique:

```bash
curl -I https://oconnector.xerifegomes-e71.workers.dev/prospects
```

Deve retornar `200 OK`.

## 🔄 Workflow Recomendado

```bash
# 1. Fazer deploy
./deploy.sh

# 2. Ir para o Dashboard e promover para produção
# (não tem como fazer via CLI ainda)

# 3. Deletar deployments temporários antigos
# (no Dashboard também)
```

## 📝 Notas

- **URLs temporárias são normais** - O Cloudflare as cria automaticamente
- **A URL principal** (`oconnector.xerifegomes-e71.workers.dev`) está conectada ao GitHub
- **Deploy automático** - Quando conectado ao GitHub, o deploy é automático
- **Deploy manual** - Se fizer deploy via CLI, pode precisar promover para produção

## 🎯 Alternativa: Deploy via Git

Se você conectar o repositório Git ao Cloudflare Pages:

1. O Cloudflare faz deploy automaticamente a cada push
2. Você pode configurar uma **branch de produção**
3. A URL principal será atualizada automaticamente

**Como configurar:**

1. Dashboard → Pages → oconnector-frontend → **Settings**
2. Vá em **Builds & deployments**
3. Configure **Production branch**: `main` ou `master`
4. Agora cada push na branch de produção atualiza automaticamente `oconnector.xerifegomes-e71.workers.dev`

## ✅ Resultado Esperado

URL oficial do frontend:
- ✅ `https://oconnector.xerifegomes-e71.workers.dev` funciona (URL principal)
- ✅ Conectado ao GitHub para deploy automático
- ✅ URLs temporárias antigas podem ser deletadas
- ✅ Novo deploy via GitHub é automático

