# 🗑️ Limpar Deployments Antigos - Cloudflare Pages

## ⚠️ Problema

O domínio temporário `ba49606d.oconnector-frontend.pages.dev` está ativo e deve ser deletado.

## ✅ URL Correta

**URL de Produção:** `https://oconnector.xerifegomes-e71.workers.dev`

**Status:** ✅ Conectado ao GitHub para deploy automático

## 📋 Passos para Deletar Deployments Antigos

### 1. Acessar Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com
2. Faça login na sua conta

### 2. Navegar para o Projeto

1. Vá em **Workers & Pages**
2. Clique em **oconnector-frontend**
3. Vá na aba **Deployments**

### 3. Identificar Deployments Antigos

Procure por deployments que:
- Têm URLs temporárias como `xxxxx.oconnector-frontend.pages.dev`
- Não estão marcados como **Production**
- São antigos e não são mais necessários

### 4. Deletar Deployments

Para cada deployment antigo:

1. Clique nos **três pontos (...)** ao lado do deployment
2. Selecione **Delete deployment**
3. Confirme a exclusão

### 5. Configurar Domínio Principal

1. Na mesma página, vá em **Custom domains**
2. O domínio está configurado: `oconnector.xerifegomes-e71.workers.dev`
3. Se não estiver, adicione o domínio
4. Marque como **Production**

### 6. Verificar

Após limpar, verifique:

```bash
# A URL principal deve funcionar
curl -I https://oconnector.xerifegomes-e71.workers.dev/prospects

# URLs temporárias não devem mais existir
# (ou retornar 404 se ainda existirem)
```

## 🔍 Comandos Úteis

### Listar Deployments (via CLI)

```bash
cd oconnector-frontend
npx wrangler pages deployment list
```

### Verificar Deployment Atual

```bash
npx wrangler pages deployment list --project-name=oconnector-frontend
```

## ✅ Checklist de Limpeza

- [ ] Acessou o Cloudflare Dashboard
- [ ] Navegou para Workers & Pages → oconnector-frontend → Deployments
- [ ] Identificou deployments com URLs temporárias
- [ ] Deletou deployments antigos/temporários
- [ ] Verificou que `oconnector.xerifegomes-e71.workers.dev` está funcionando
- [ ] Testou a URL: https://oconnector.xerifegomes-e71.workers.dev/prospects
- [ ] Confirmou que a página está funcionando corretamente

## 📝 Nota

- Deployments antigos não afetam o código, mas podem causar confusão
- A URL principal `oconnector.xerifegomes-e71.workers.dev` está conectada ao GitHub
- URLs temporárias são criadas automaticamente para cada deploy, mas podem ser deletadas

## 🚀 Próximo Deploy

Ao fazer um novo deploy, certifique-se de:

1. Fazer o build: `npm run build`
2. Fazer deploy: `npx wrangler pages deploy out --project-name=oconnector-frontend`
3. Verificar que o deployment aparece em `oconnector.xerifegomes-e71.workers.dev`
4. Deletar deployments temporários antigos se necessário

