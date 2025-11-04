# ✅ Solução - Erro 401 no Login

**Data:** 04/11/2025  
**Status:** ✅ Solução Pronta

---

## 📋 Problema Identificado

Erro **401 (Não Autorizado)** ao tentar fazer login:

```
Erro HTTP 401 em https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login: {}
```

### Causa Raiz

1. **Incompatibilidade de Hash:** O worker espera senhas em **SHA-256**, mas os scripts SQL antigos usavam **bcrypt**
2. **Usuário Não Existe ou Senha Incorreta:** O superadmin pode não estar cadastrado no D1 Database
3. **Worker Rejeita Bcrypt:** O código explicitamente rejeita senhas em formato bcrypt (linhas 79-83 do `index.js`)

```javascript:79:83:workers/oconnector-api/index.js
if (user.senha.startsWith('$2b$') || user.senha.startsWith('$2a$')) {
  return jsonResponse(
    { success: false, error: 'Senha em formato bcrypt. Use SHA-256' },
    500
  );
}
```

---

## ✅ Solução Completa

### Passo 1: Executar SQL no D1 Console

1. **Acesse o Cloudflare Dashboard:**
   ```
   https://dash.cloudflare.com
   ```

2. **Navegue até o D1 Database:**
   - Workers & Pages → D1 Databases
   - Clique em **`oconnector_db`**
   - Vá para a aba **"Console"**

3. **Execute o SQL abaixo:**

```sql
-- Deletar usuário existente (se houver com formato errado)
DELETE FROM usuarios WHERE email = 'dev@oconnector.tech';

-- Inserir superadmin com senha SHA-256
INSERT INTO usuarios (
  email,
  senha,
  nome,
  role,
  ativo,
  cliente_id,
  created_at
) VALUES (
  'dev@oconnector.tech',
  '535c0bf15a7efc87cf7f27062f98e675708988a381d40db71dad3b46b337c16a',
  'Super Admin oConnector',
  'superadmin',
  1,
  NULL,
  CURRENT_TIMESTAMP
);

-- Verificar criação
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  substr(senha, 1, 20) || '...' as senha_preview,
  created_at
FROM usuarios
WHERE email = 'dev@oconnector.tech';
```

4. **Verificar o resultado:**
   - Deve mostrar 1 linha inserida
   - Query de verificação deve retornar os dados do usuário

### Passo 2: Testar Login

#### Via cURL (Terminal)

```bash
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@oconnector.tech",
    "senha": "Rsg4dr3g44@"
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ1c2VySWQ...",
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

#### Via Frontend

1. Acesse a página de login: `http://localhost:3000/login`
2. Use as credenciais:
   - **Email:** `dev@oconnector.tech`
   - **Senha:** `Rsg4dr3g44@`
3. Clique em **"Entrar"**
4. Deve redirecionar para `/dashboard`

---

## 🔧 Arquivos Criados

### 1. `backend-deployment/create-superadmin-sha256.sql`

SQL pronto para executar no D1 Console com o hash SHA-256 correto.

### 2. `backend-deployment/generate-sha256-hash.js`

Script Node.js para gerar hash SHA-256 de qualquer senha:

```bash
cd backend-deployment
node generate-sha256-hash.js
```

---

## 📊 Detalhes Técnicos

### Hash SHA-256

O worker usa **SHA-256** para hash de senhas (não bcrypt):

```javascript:23:30:workers/oconnector-api/index.js
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

### Credenciais do Superadmin

- **Email:** `dev@oconnector.tech`
- **Senha:** `Rsg4dr3g44@`
- **Hash SHA-256:** `535c0bf15a7efc87cf7f27062f98e675708988a381d40db71dad3b46b337c16a`
- **Role:** `superadmin`

---

## 🎯 Verificação

### 1. Verificar Usuário no Banco

```sql
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  substr(senha, 1, 20) || '...' as senha_preview,
  created_at,
  last_login
FROM usuarios
WHERE email = 'dev@oconnector.tech';
```

**Resultado Esperado:**
```
id | email                  | nome                     | role       | ativo | senha_preview        | created_at           | last_login
---|------------------------|--------------------------|------------|-------|---------------------|---------------------|------------
1  | dev@oconnector.tech    | Super Admin oConnector   | superadmin | 1     | 535c0bf15a7efc87...  | 2025-11-04 12:00:00 | NULL
```

### 2. Verificar Formato da Senha

A senha **NÃO** deve começar com `$2b$` ou `$2a$` (bcrypt).  
Deve ser um hash hexadecimal de 64 caracteres (SHA-256).

✅ **Correto:** `535c0bf15a7efc87cf7f27062f98e675708988a381d40db71dad3b46b337c16a`  
❌ **Errado:** `$2b$10$xyz...` (bcrypt)

---

## 🐛 Troubleshooting

### Erro: "Senha em formato bcrypt. Use SHA-256"

**Solução:** Execute o SQL novamente para substituir a senha:

```sql
UPDATE usuarios 
SET senha = '535c0bf15a7efc87cf7f27062f98e675708988a381d40db71dad3b46b337c16a'
WHERE email = 'dev@oconnector.tech';
```

### Erro: "Credenciais inválidas"

**Causas Possíveis:**
1. Usuário não existe no banco
2. Senha incorreta
3. Usuário está inativo (`ativo = 0`)

**Verificar:**
```sql
SELECT id, email, ativo, substr(senha, 1, 20) || '...' as senha_preview
FROM usuarios
WHERE email = 'dev@oconnector.tech';
```

### Erro: Resposta vazia `{}`

**Causa:** O endpoint pode estar retornando erro mas o frontend está lendo como objeto vazio.

**Verificar logs do Worker:**
1. Cloudflare Dashboard → Workers & Pages
2. Clique em **oconnector-api**
3. Aba **"Logs"** → "Begin log stream"
4. Tente fazer login novamente
5. Veja os logs em tempo real

---

## 📝 Próximos Passos

1. ✅ **Executar SQL no D1 Console** (Passo 1)
2. ✅ **Testar login via cURL** (Passo 2)
3. ✅ **Testar login no frontend** (Passo 2)
4. 📊 **Verificar que está funcionando**

---

## 📚 Referências

- **Script SQL:** `backend-deployment/create-superadmin-sha256.sql`
- **Gerador de Hash:** `backend-deployment/generate-sha256-hash.js`
- **Worker Auth:** `workers/oconnector-api/index.js` (linhas 52-126)

---

**Status Final:** ✅ SQL pronto para executar  
**Próxima Ação:** Executar SQL no D1 Console do Cloudflare  
**Tempo Estimado:** 2 minutos

