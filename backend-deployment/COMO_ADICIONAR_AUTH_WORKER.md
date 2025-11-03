# 🚀 Como Adicionar Endpoints de Autenticação ao Worker

## ⚠️ Problema

O frontend está tentando fazer login mas recebe:
```json
{
  "error": "Endpoint não encontrado"
}
```

## ✅ Solução Rápida

### Passo 1: Acessar Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com/
2. Faça login na sua conta
3. Vá em: **Workers & Pages**
4. Clique em: **oconnector-api**
5. Clique em: **Edit code** (ou "Quick Edit")

### Passo 2: Adicionar Código de Autenticação

**Opção A: Se você tem um worker simples**

Copie TODO o código de: **`backend-deployment/worker-completo-exemplo.js`**

E substitua o conteúdo atual do worker.

**Opção B: Se você já tem rotas existentes**

1. Copie as funções de autenticação de: **`backend-deployment/worker-auth-simple.js`**
2. Adicione ao seu worker existente
3. Adicione o roteamento:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // ✅ ADICIONAR ESTA PARTE - Rotas de autenticação
    if (path.startsWith('/api/auth/')) {
      if (path === '/api/auth/login' && request.method === 'POST') {
        return handleLogin(request, env);
      }
      if (path === '/api/auth/register' && request.method === 'POST') {
        return handleRegister(request, env);
      }
      if (path === '/api/auth/verify' && request.method === 'GET') {
        return handleVerify(request, env);
      }
      return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
    }

    // Suas rotas existentes aqui...
    if (path === '/api' && request.method === 'GET') {
      // Health check existente...
    }

    // ... outras rotas ...
  },
};
```

### Passo 3: Salvar e Deploy

1. Clique em **Save and Deploy**
2. Aguarde o deploy (alguns segundos)
3. Teste o login novamente!

---

## 🧪 Testar Após Deploy

### 1. Testar Login via curl

```bash
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@oconnector.tech",
    "senha": "Rsg4dr3g44@"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "id": 1,
      "email": "dev@oconnector.tech",
      "nome": "Super Admin oConnector",
      "role": "superadmin"
    },
    "userId": 1
  }
}
```

### 2. Testar no Frontend

1. Acesse a página de login
2. Use:
   - Email: `dev@oconnector.tech`
   - Senha: `Rsg4dr3g44@`
3. Clique em "Entrar"
4. Deve redirecionar para `/dashboard`

---

## 📋 Endpoints Implementados

✅ **POST /api/auth/login** - Login de usuário
✅ **POST /api/auth/register** - Registro de novo usuário  
✅ **GET /api/auth/verify** - Verificar token JWT

---

## 🔧 Configuração do Banco

O worker precisa ter o binding do D1 Database configurado:

**No Cloudflare Dashboard:**
1. Workers & Pages → oconnector-api → Settings
2. Seção **Variables**
3. Verifique se existe **DB** (D1 Database binding)
4. Deve estar vinculado a: **oconnector_db**

**Se não estiver configurado:**
1. Vá em **Settings** → **Bindings**
2. Clique em **Add binding**
3. Tipo: **D1 Database**
4. Variable name: **DB**
5. Database: **oconnector_db**
6. Save

---

## ✅ Checklist

- [ ] Código de autenticação adicionado ao worker
- [ ] Binding do D1 Database configurado (DB)
- [ ] Deploy feito com sucesso
- [ ] Teste de login via curl funcionando
- [ ] Teste de login no frontend funcionando

---

## 🐛 Troubleshooting

### Erro: "Database binding not found"

**Solução:** Configure o binding do D1 Database como descrito acima.

### Erro: "Credenciais inválidas"

**Verificar:**
1. Senha do superadmin está em SHA-256 no banco
2. Email está correto: `dev@oconnector.tech`
3. Usuário está ativo (`ativo = 1`)

**Verificar senha no banco:**
```sql
SELECT email, substr(senha, 1, 10) || '...' as hash_preview, ativo 
FROM usuarios 
WHERE email = 'dev@oconnector.tech';
```

### Erro: CORS

O código já inclui headers CORS. Se ainda houver problema, verifique se o OPTIONS está configurado.

---

**Status:** ⏳ Aguardando adicionar código ao worker e fazer deploy

