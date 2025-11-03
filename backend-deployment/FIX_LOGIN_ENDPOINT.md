# 🔧 Solução: Endpoint de Login Não Encontrado

## ❌ Problema

O endpoint `/api/auth/login` retorna:
```json
{
  "error": "Endpoint não encontrado"
}
```

## ✅ Solução

Implementar os endpoints de autenticação no worker `oconnector-api`.

---

## 📋 Passos

### 1. Acessar Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com/
2. Navegue: **Workers & Pages** → **oconnector-api**
3. Clique em **Edit code**

### 2. Adicionar Código de Autenticação

Copie o código de: **`backend-deployment/worker-auth-simple.js`**

E adicione ao worker principal.

### 3. Exemplo de Integração

No seu worker principal (`index.js` ou `src/index.js`):

```javascript
import { handleAuthRoutes } from './worker-auth-simple.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Rotas de autenticação
    if (path.startsWith('/api/auth/')) {
      return handleAuthRoutes(url, request, env);
    }

    // Suas rotas existentes (prospects, clientes, leads, etc.)
    if (path === '/api') {
      return jsonResponse({
        success: true,
        message: "oConnector API v1.0",
        database: "Conectado",
        // ...
      });
    }

    // ... outras rotas ...

    return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
  },
};
```

---

## ⚠️ IMPORTANTE: Hash da Senha

### Problema Atual

O superadmin foi criado com senha em formato **bcrypt**:
```
$2b$10$kR1AKS6vtiLkaOcAf50K3OS/AjLswW1qSCDVJA/liWjhcnmxQye.K
```

### Solução 1: Usar SHA-256 (Mais Simples)

Atualizar a senha do superadmin para SHA-256:

```sql
-- Gerar hash SHA-256 da senha
UPDATE usuarios 
SET senha = (SELECT lower(hex(sha256('Rsg4dr3g44@'))))
WHERE email = 'dev@oconnector.tech';
```

**OU usar Node.js:**
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('Rsg4dr3g44@').digest('hex'));"
```

### Solução 2: Implementar Verificação bcrypt

Se quiser manter bcrypt, você precisa de uma biblioteca compatível com Workers:

- Usar `@noble/hashes` (compatível com Workers)
- Ou usar um serviço externo para verificar bcrypt

**Recomendado:** Usar SHA-256 para simplicidade inicial, depois migrar para bcrypt se necessário.

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

### 2. Resposta Esperada

```json
{
  "success": true,
  "data": {
    "token": "eyJ1c2VySWQiOjEsImVtYWlsIjoiZGV2QG9jb25uZWN0b3IudGVjaCIsInJvbGUiOiJzdXBlcmFkbWluIiwiZXhwIjoxNzM2NDk2NDAwMDAwfQ==",
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

---

## 📝 Arquivos Criados

1. **`worker-auth-simple.js`** - Código completo dos endpoints (usando SHA-256)
2. **`worker-auth-endpoints.js`** - Versão com bcrypt (requer biblioteca)
3. **`IMPLEMENTAR_AUTH_ENDPOINTS.md`** - Documentação completa
4. **`FIX_LOGIN_ENDPOINT.md`** - Este arquivo (guia rápido)

---

## ✅ Checklist

- [ ] Adicionar código de autenticação ao worker
- [ ] Atualizar senha do superadmin para SHA-256 (ou implementar bcrypt)
- [ ] Salvar e fazer deploy do worker
- [ ] Testar endpoint de login
- [ ] Testar endpoint de registro
- [ ] Testar endpoint de verificação
- [ ] Testar login no frontend

---

**Status:** ⏳ Aguardando implementação no worker

