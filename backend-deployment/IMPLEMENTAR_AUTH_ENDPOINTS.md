# 🔐 Implementar Endpoints de Autenticação

**Problema:** O endpoint `/api/auth/login` não existe no worker oconnector-api.

**Solução:** Adicionar os endpoints de autenticação ao worker.

---

## 📋 Endpoints Necessários

1. **POST /api/auth/login** - Login de usuário
2. **POST /api/auth/register** - Registro de novo usuário
3. **GET /api/auth/verify** - Verificar token JWT

---

## 🔧 Como Implementar

### Opção 1: Cloudflare Dashboard (Recomendado)

1. **Acesse:** [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Navegue:** Workers & Pages → oconnector-api → Settings → Triggers
3. **Edite o código** do worker
4. **Adicione o código** de `worker-auth-endpoints.js`

### Opção 2: Via Wrangler CLI

Se você tem o código do worker localmente:

```bash
cd oconnector-api  # diretório do worker
# Adicione o código de autenticação
wrangler deploy
```

---

## 📝 Código para Adicionar

Veja o arquivo: **`backend-deployment/worker-auth-endpoints.js`**

### Exemplo de Integração no Worker Principal

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Rotas de autenticação
    if (path.startsWith('/api/auth/')) {
      return handleAuthRoutes(url, request, env);
    }

    // Outras rotas existentes...
    // ...
  }
};
```

---

## 🔑 Dependências Necessárias

### bcryptjs

Para hashear e verificar senhas, você precisa de `bcryptjs` ou usar Workers AI/outra solução.

**Opção 1: Usar Web Crypto API (nativo)**

```javascript
// Hash com Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Opção 2: Usar bcryptjs (se disponível no Cloudflare Workers)**

### JWT

Para tokens JWT, use uma biblioteca compatível com Workers ou implemente uma simples.

**Opção 1: Bibliotecas compatíveis:**
- `jose` - Biblioteca JWT para Edge Runtime
- Implementação própria com Web Crypto API

---

## 🧪 Testar Após Implementar

### 1. Testar Login

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
    }
  }
}
```

### 2. Testar Verificar Token

```bash
curl -X GET https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/verify \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## 📊 Estrutura do Banco

A tabela `usuarios` já está criada com:

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  ativo INTEGER DEFAULT 1,
  cliente_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

---

## ✅ Checklist

- [ ] Adicionar código de autenticação ao worker
- [ ] Configurar bcryptjs ou usar Web Crypto API
- [ ] Configurar JWT ou implementar token simples
- [ ] Testar endpoint de login
- [ ] Testar endpoint de registro
- [ ] Testar endpoint de verificação
- [ ] Configurar CORS (já incluído no código)

---

## 🚨 Notas Importantes

1. **Segurança:**
   - Sempre use HTTPS em produção
   - Hash de senha deve usar bcrypt com salt rounds >= 10
   - Tokens devem expirar (recomendado: 24 horas)
   - Valide inputs antes de processar

2. **Performance:**
   - Use índices no banco (já criados: `idx_usuarios_email`)
   - Cache tokens válidos se necessário
   - Limite tentativas de login (rate limiting)

3. **CORS:**
   - Configure origins permitidas em produção
   - Não use `*` em produção, especifique domínios

---

**Status:** ⏳ Aguardando implementação no worker

