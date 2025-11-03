# 🔧 Instruções: Configurar Deploy no Cloudflare Dashboard

**Data:** 03/11/2024  
**Problema:** URL principal ainda mostra conteúdo antigo após deploy

---

## 📋 PASSO A PASSO

### **1. Acesse o Cloudflare Dashboard**
```
https://dash.cloudflare.com
```

### **2. Navegue até Pages**
1. No menu lateral, clique em **Workers & Pages**
2. Clique em **Pages**
3. Encontre o projeto **oconnector-frontend**

### **3. Veja os Deployments**
1. Clique no projeto **oconnector-frontend**
2. Vá para a aba **Deployments** ou **Deploys**
3. Você verá uma lista de todos os deploys

### **4. Identifique o Deploy Correto**
Procure pelo deploy mais recente que tem:
- **Título:** "oConnector - IA e Automação para seu Negócio"
- **Data:** Mais recente (hoje)
- **Status:** ✅ Sucesso

### **5. Configure como Produção**
1. Clique nos **três pontos (...)** ao lado do deploy correto
2. Selecione **"Retry deployment"** ou **"Promote to production"**
3. Ou clique em **"Set as production"**

### **6. Aguarde e Teste**
1. Aguarde 1-2 minutos
2. Limpe o cache do navegador
3. Acesse: `https://oconnector-frontend.pages.dev`
4. Deve mostrar o conteúdo correto agora!

---

## 🔍 ALTERNATIVA: Deletar e Recriar

Se não conseguir configurar, podemos deletar o projeto e recriar:

### **Via Dashboard:**
1. Vá em **Pages** → **oconnector-frontend**
2. Clique em **Settings** (Configurações)
3. Role até o final
4. Clique em **"Delete project"** ou **"Delete"**
5. Confirme a exclusão

### **Depois recriar:**
```bash
cd /Volumes/LexarAPFS/OCON/oconnector-frontend
npx wrangler pages project create oconnector-frontend
npx wrangler pages deploy out --project-name=oconnector-frontend
```

---

## ✅ VERIFICAÇÃO

Após configurar, teste:
```bash
curl -s https://oconnector-frontend.pages.dev/ | grep -o "<title>.*</title>"
```

**Deve mostrar:**
```html
<title>oConnector - IA e Automação para seu Negócio</title>
```

**Se ainda mostrar:**
```html
<title>CJ Dropshipping Dashboard</title>
```

Então o cache ainda não expirou ou o deploy errado está ativo.

---

## 🎯 RECOMENDAÇÃO

**Acesse o Cloudflare Dashboard e configure o deploy mais recente como produção!**

Isso deve resolver o problema imediatamente.

