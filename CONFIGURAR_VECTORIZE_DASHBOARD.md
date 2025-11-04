# ⚙️ Configurar Vectorize no Dashboard do Cloudflare

Como o `agent-training-worker` foi deployado via dashboard e não temos código local, você precisa configurar o binding do Vectorize manualmente no dashboard.

## 📋 Passo a Passo

### 1. Acesse o Dashboard

1. Vá para: https://dash.cloudflare.com
2. Faça login com: **xerifegomes@gmail.com**
3. Account ID: `e71984852bedaf5f21cef5d949948498`

### 2. Acesse o Worker

1. No menu lateral, clique em **Workers & Pages**
2. Clique em **agent-training-worker**

### 3. Configurar Vectorize Binding

1. Vá em **Settings** (Configurações)
2. Role até **Variables and Secrets**
3. Em **Vectorize Bindings**, clique em **Add binding** ou **Edit**
4. Configure:
   - **Variable name:** `VECTORIZE`
   - **Vectorize Index:** Selecione `oconnector-knowledge` (ou digite o nome)
5. Clique em **Save**

### 4. Verificar Outros Bindings

Certifique-se de que os seguintes bindings estão configurados:

- ✅ **D1 Database:**
  - Variable name: `DB`
  - Database: `oconnector_db`
  - Database ID: `33ba528b-382b-46da-bc26-8bb4fbc8d994`

- ✅ **Workers AI:**
  - Automático (não precisa configurar)

- ⚠️ **Vectorize:**
  - Variable name: `VECTORIZE`
  - Index: `oconnector-knowledge`

### 5. Salvar e Deploy

Após adicionar o binding:
1. Clique em **Save** ou **Deploy**
2. O worker será redeployado automaticamente

### 6. Verificar Deploy

Após salvar, você verá uma mensagem de confirmação. O deploy geralmente leva alguns segundos.

---

## 🧪 Testar Após Configurar

Após configurar o Vectorize e fazer deploy:

```bash
# 1. Re-treinar o agente
./treinar-agente-empresa.sh 4

# 2. Verificar se funcionou (deve retornar documentos_processados > 0)
# 3. Testar query
curl -X POST https://agent-training-worker.xerifegomes-e71.workers.dev/api/query \
  -H "Content-Type: application/json" \
  -d '{"cliente_id": 4, "pergunta": "O que é o OConnector Tech?"}'
```

---

## 📝 Nota Importante

O código do worker está sendo editado diretamente no dashboard do Cloudflare. O arquivo `wrangler.toml` que criamos serve como referência para os bindings, mas a configuração precisa ser feita no dashboard.

---

## 🔗 Links Úteis

- **Dashboard:** https://dash.cloudflare.com
- **Vectorize Index:** `oconnector-knowledge` (já criado)
- **Worker:** `agent-training-worker`
- **Account ID:** `e71984852bedaf5f21cef5d949948498`

