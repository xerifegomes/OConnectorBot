# oConnector Frontend

Frontend do oConnector construído com Next.js 14, shadcn/ui e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - Componentes UI
- **Radix UI** - Componentes primitivos acessíveis

## 📁 Estrutura do Projeto

```
oconnector-frontend/
├── app/
│   ├── (marketing)/     # Landing page
│   ├── (auth)/          # Login e Cadastro
│   ├── (dashboard)/     # Dashboard e páginas internas
│   ├── layout.tsx       # Layout raiz
│   └── globals.css      # Estilos globais
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   └── dashboard/       # Componentes do dashboard
├── lib/
│   ├── api.ts           # Cliente API
│   └── utils.ts         # Utilitários
└── public/              # Arquivos estáticos
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start
```

## 📦 Bibliotecas Instaladas

### Cloudflare
- `@cloudflare/next-on-pages` - Adapter para Next.js no Cloudflare Pages
- `wrangler` - CLI do Cloudflare Workers

**Nota**: `@cloudflare/next-on-pages` está deprecated. Para Next.js 16+, considere usar [OpenNext adapter](https://opennext.js.org/cloudflare).

### Google
- `google-auth-library` - Autenticação OAuth2 do Google
- `@google-cloud/storage` - Google Cloud Storage
- `next-auth` - Autenticação para Next.js (suporta Google OAuth)

## 📦 Deploy no Cloudflare Pages

### Via Wrangler CLI

```bash
# Login
npx wrangler login

# Build para Cloudflare
npm run build:cloudflare

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=oconnector-frontend
```

### Via Dashboard do Cloudflare

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Pages** → **Create a project**
3. Conecte seu repositório Git ou faça upload dos arquivos
4. Configure:
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `.vercel/output/static`
   - **Node version**: 18 ou superior

### Variáveis de Ambiente

Configure no Cloudflare Pages:

- `NEXT_PUBLIC_API_URL` (opcional, padrão já configurado no código)

## 🔧 Configuração

### API Backend

O projeto está configurado para se conectar ao backend em:
```
https://oconnector-api.xerifegomes-e71.workers.dev
```

Para alterar, edite `lib/api.ts`.

### Tema

O tema dark está habilitado por padrão no `app/layout.tsx`. Para mudar:

```tsx
<html lang="pt-BR" className="dark">  {/* ou remover "dark" */}
```

## 📄 Páginas

- `/` - Landing page
- `/login` - Login
- `/cadastro` - Registro
- `/dashboard` - Dashboard principal
- `/leads` - Gerenciamento de leads
- `/prospects` - Busca e gerenciamento de prospects

## 🔐 Autenticação

O sistema de autenticação usa JWT armazenado no `localStorage`. O token é verificado automaticamente nas páginas protegidas.

## 📝 Licença

Privado e proprietário da oConnector.
