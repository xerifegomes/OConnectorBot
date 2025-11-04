# 🧪 Como Testar a Correção da Tabela Leads

**Correção:** Adição da coluna `updated_at` na tabela `leads`  
**Data:** 04/11/2025

---

## 🌐 Teste 1: Frontend Dashboard

### Passo a Passo

1. **Acessar o Dashboard**
   ```
   URL: https://oconnector-frontend.pages.dev/dashboard/leads
   ```
   (Substitua pela URL correta do seu frontend)

2. **Fazer Login**
   - Use suas credenciais de superadmin ou admin
   - Aguarde redirecionamento para o dashboard

3. **Verificar Lista de Leads**
   - A página deve carregar **SEM erro 500**
   - Mesmo que esteja vazia, não deve haver erro
   - Console do navegador deve estar limpo (sem erros HTTP 500)

### ✅ Resultado Esperado

**Antes da Correção:**
```
[Error] Failed to load resource: the server responded with a status of 500 () (leads, line 0)
[Error] Erro HTTP 500: D1_ERROR: no such column: updated_at
```

**Depois da Correção:**
```
[Success] Lista de leads carregada (pode estar vazia)
OU
[Success] Leads exibidos com sucesso
```

---

## 🔧 Teste 2: API Direta via cURL

### 1. Obter Token de Autenticação

```bash
# Fazer login e obter token
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "senha": "sua-senha"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "seu-email@exemplo.com",
    "role": "superadmin"
  }
}
```

### 2. Testar Endpoint GET /api/leads

```bash
# Substituir SEU_TOKEN pelo token obtido acima
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: Bearer $TOKEN" \
  "https://oconnector-api.xerifegomes-e71.workers.dev/api/leads?cliente_id=1"
```

**Resposta esperada (sucesso):**
```json
{
  "success": true,
  "data": []
}
```

OU (se houver leads):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cliente_id": 1,
      "nome": "João Silva",
      "telefone": "5511999999999",
      "email": "joao@example.com",
      "observacoes": null,
      "origem": "whatsapp",
      "status": "novo",
      "created_at": "2025-11-04 12:00:00",
      "updated_at": "2025-11-04 12:00:00"  // ✅ Campo presente!
    }
  ]
}
```

### 3. Testar Criação de Lead

```bash
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Lead de Teste",
    "telefone": "5511987654321",
    "email": "teste@example.com",
    "origem": "teste-manual",
    "status": "novo"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Lead criado com sucesso",
  "data": {
    "id": 2
  }
}
```

### 4. Verificar Lead Criado

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://oconnector-api.xerifegomes-e71.workers.dev/api/leads?cliente_id=1"
```

Deve exibir o lead criado com os campos `created_at` e `updated_at` preenchidos.

---

## 📱 Teste 3: Integração WhatsApp

### Pré-requisitos
- WhatsApp bot configurado e rodando
- Conexão ativa com o banco de dados

### Passo a Passo

1. **Enviar Mensagem para o Bot**
   - Use o número configurado para o bot
   - Envie uma mensagem simples: "Olá"

2. **Bot Deve Responder**
   - Aguarde resposta do bot
   - Conversação deve ser gravada

3. **Verificar Lead Criado**
   ```bash
   # Via API
   curl -H "Authorization: Bearer $TOKEN" \
     "https://oconnector-api.xerifegomes-e71.workers.dev/api/leads?cliente_id=1"
   ```

4. **Verificar Campos**
   - `telefone`: deve conter o número do WhatsApp
   - `origem`: deve ser "whatsapp"
   - `created_at`: data/hora da primeira mensagem
   - `updated_at`: mesma data/hora (ou data da última interação)

---

## 🗄️ Teste 4: Banco de Dados Direto

### Verificar Estrutura

```bash
cd /Volumes/LexarAPFS/OCON/backend-deployment
npx wrangler d1 execute oconnector_db --remote --command "PRAGMA table_info(leads);"
```

**Deve exibir:**
```json
{
  "cid": 13,
  "name": "updated_at",
  "type": "DATETIME",
  "notnull": 0,
  "dflt_value": "CURRENT_TIMESTAMP",
  "pk": 0
}
```

### Verificar Dados

```bash
npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT id, nome, telefone, created_at, updated_at FROM leads LIMIT 5;"
```

---

## 🎯 Checklist de Validação

### ✅ Checklist Completo

- [ ] Dashboard carrega sem erro 500
- [ ] GET /api/leads retorna success: true
- [ ] Campo `updated_at` presente na resposta da API
- [ ] POST /api/leads cria lead com sucesso
- [ ] Lead criado tem `created_at` e `updated_at` preenchidos
- [ ] WhatsApp bot cria leads corretamente
- [ ] Banco de dados tem coluna `updated_at` (PRAGMA table_info)
- [ ] Não há erros no console do navegador
- [ ] Não há erros nos logs do Cloudflare Workers

### 🎉 Critério de Sucesso

**A correção é considerada 100% validada quando:**
1. Todos os itens do checklist estão marcados ✅
2. Nenhum erro 500 relacionado a `updated_at` aparece
3. Leads podem ser criados, lidos e atualizados normalmente

---

## 🐛 Solução de Problemas

### Problema: Ainda recebo erro 500

**Possíveis causas:**
1. Worker não foi reiniciado (espere 1-2 minutos)
2. Cache do navegador (limpe cache ou use modo anônimo)
3. Token expirado (faça login novamente)

**Solução:**
```bash
# Limpar cache do navegador
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Ou use modo anônimo/privado
```

### Problema: Campo updated_at retorna null

**Causa:** Lead criado antes da correção

**Solução:**
```bash
# Atualizar todos os leads antigos
npx wrangler d1 execute oconnector_db --remote --command \
  "UPDATE leads SET updated_at = created_at WHERE updated_at IS NULL;"
```

### Problema: Erro "duplicate column name"

**Causa:** Coluna já foi adicionada anteriormente

**Solução:** Esse erro pode ser ignorado. A coluna já existe e está funcionando.

---

## 📞 Suporte

Se após todos os testes o problema persistir:

1. Verifique os logs do Cloudflare Workers
2. Confira se o banco correto está sendo usado (oconnector_db)
3. Consulte os arquivos de documentação:
   - `CORRECAO_ERRO_LEADS_UPDATED_AT.md`
   - `VALIDACAO_CORRECAO_LEADS.md`
   - `RESUMO_CORRECAO_LEADS.md`

---

**Boa sorte com os testes! 🚀**

