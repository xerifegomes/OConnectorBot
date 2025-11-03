# 🚀 Deploy no Cloudflare Pages - Next.js 16

## ⚠️ Importante

O `@cloudflare/next-on-pages` foi removido porque:
- ❌ Não é compatível com Next.js 16
- ❌ Está deprecated
- ✅ Next.js 16 tem melhor suporte nativo

## 📦 Opções de Deploy

### Opção 1: Export Estático (Recomendado)

Para projetos que não precisam de Server Components dinâmicos:

```bash
# 1. Atualizar next.config.ts
output: 'export'

# 2. Build
npm run build

# 3. Deploy
npx wrangler pages deploy out --project-name=oconnector-frontend
```

### Opção 2: OpenNext Adapter (Recomendado para Next.js 16+)

```bash
# 1. Instalar OpenNext
npm install -D open-next

# 2. Build com OpenNext
npx open-next@latest build

# 3. Deploy
npx wrangler pages deploy .open-next/cloudflare-pages --project-name=oconnector-frontend
```

### Opção 3: Vercel (Alternativa)

Next.js funciona melhor nativamente no Vercel:

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

## 🔧 Configuração Cloudflare Pages

### Via Dashboard

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Pages** → **Create a project**
3. Conecte repositório Git ou faça upload
4. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `out` (para export estático) ou `.open-next/cloudflare-pages`
   - **Node version**: 18 ou superior

### Via Wrangler CLI

```bash
# Login
npx wrangler login

# Deploy (export estático)
npm run build
npx wrangler pages deploy out --project-name=oconnector-frontend

# Ou com OpenNext
npx open-next@latest build
npx wrangler pages deploy .open-next/cloudflare-pages --project-name=oconnector-frontend
```

## 📝 Notas

- **Server Components**: Se usar Server Components dinâmicos, use OpenNext
- **API Routes**: Não funcionam em export estático
- **Middleware**: Requer configuração especial no Cloudflare

## 🔗 Recursos

- [OpenNext Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

