# 🚀 Deploy do Frontend - Landing Page

## 📋 Status

- ✅ Landing page implementada (`app/(marketing)/page.tsx`)
- ✅ Next.js 16 configurado
- ✅ Export estático habilitado
- ⏳ Deploy pendente

---

## 🚀 Deploy no Cloudflare Pages

### **Opção 1: Via Wrangler CLI (Recomendado)**

```bash
cd oconnector-frontend

# 1. Build
npm run build

# 2. Deploy
npx wrangler pages deploy out --project-name=oconnector-frontend

# Ou com nome customizado
npx wrangler pages deploy out --project-name=oconnector-frontend --compatibility-date=2024-01-01
```

### **Opção 2: Via Dashboard Cloudflare**

1. Acesse: https://dash.cloudflare.com
2. Vá em **Pages** → **Create a project**
3. Escolha:
   - **Upload assets** (para upload manual)
   - Ou **Connect to Git** (para deploy automático)
4. Configure:
   - **Project name**: `oconnector-frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/oconnector-frontend`
   - **Node version**: 18 ou superior

---

## 📦 Build Local

```bash
cd oconnector-frontend

# Instalar dependências (se necessário)
npm install

# Build
npm run build

# Verificar output
ls -la out/
```

O build gerará uma pasta `out/` com todos os arquivos estáticos.

---

## 🌐 URL após Deploy

Após o deploy, o frontend estará disponível em:
```
https://oconnector-frontend.pages.dev
```

Ou, se configurar domínio customizado:
```
https://oconnector.tech
```

---

## ⚙️ Configuração de Domínio

### **Adicionar Domínio Customizado (oconnector.tech)**

1. No Cloudflare Dashboard → Pages → oconnector-frontend
2. Vá em **Custom domains**
3. Clique em **Set up a custom domain**
4. Digite: `oconnector.tech`
5. Cloudflare configurará automaticamente o DNS

---

## 🔄 Deploy Automático via Git

### **1. Conectar Repositório**

1. Cloudflare Dashboard → Pages
2. Create project → Connect to Git
3. Autorize GitHub/GitLab
4. Selecione repositório
5. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `oconnector-frontend`

### **2. Variáveis de Ambiente (se necessário)**

No dashboard, configure:
- `NEXT_PUBLIC_API_URL` (opcional, já está hardcoded)

---

## 📝 Estrutura após Deploy

```
oconnector-frontend/
├── / (Landing page)
├── /login
├── /cadastro
├── /dashboard
├── /leads
├── /prospects
└── /whatsapp
```

---

## ✅ Checklist de Deploy

- [x] Landing page criada
- [x] Next.js configurado para export estático
- [ ] Build testado localmente
- [ ] Deploy no Cloudflare Pages
- [ ] Domínio configurado (opcional)
- [ ] Teste de todas as páginas

---

## 🐛 Troubleshooting

### **Erro: "output: 'export' requires static paths"**

- Algumas rotas dinâmicas não funcionam em export estático
- Verifique se não há `[id]` ou `[...slug]` em rotas que precisam ser estáticas

### **Imagens não aparecem**

- Verificar se `images: { unoptimized: true }` está no `next.config.ts`
- Imagens devem estar em `/public`

### **404 em rotas**

- Verificar se há arquivo `_redirects` na pasta `public/`
- Cloudflare Pages precisa de configuração especial para SPA

---

## 🔗 Links Úteis

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

