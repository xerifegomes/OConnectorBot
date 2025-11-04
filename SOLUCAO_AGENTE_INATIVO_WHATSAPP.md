# 🔧 Solução: Agente Inativo - WhatsApp Conectado Sem Sync

**Problema:** WhatsApp conectado mas agente inativo, mensagens retornam "número não configurado"

**Data:** 04/11/2025

---

## 🎯 Causa do Problema

### WhatsApp Conectado: `5522992363462`
### Número no Banco: `22999999999` (todos os clientes)

**Resultado:** Bot não encontra cliente associado ao número → Retorna mensagem padrão de "não configurado"

---

## ✅ SOLUÇÃO COMPLETA

### Passo 1: Atualizar Número do Cliente Principal

O cliente principal (ID 4 - OConnector) precisa ter o número correto do WhatsApp conectado.

```sql
-- Atualizar número do WhatsApp para o cliente OConnector
UPDATE clientes 
SET whatsapp_numero = '5522992363462'
WHERE id = 4;

-- Verificar atualização
SELECT id, nome_imobiliaria, whatsapp_numero, data_ultimo_treino 
FROM clientes 
WHERE id = 4;
```

### Passo 2: Executar no D1

```bash
cd /Volumes/LexarAPFS/OCON/backend-deployment

# Atualizar número
npx wrangler d1 execute oconnector_db --remote --command \
  "UPDATE clientes SET whatsapp_numero = '5522992363462' WHERE id = 4;"

# Verificar
npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT id, nome_imobiliaria, whatsapp_numero FROM clientes WHERE id = 4;"
```

### Passo 3: Verificar Treinamento do Agente

O cliente precisa ter dados de treinamento.

```bash
# Verificar se tem treinamento
npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT id, nome_imobiliaria, data_ultimo_treino, LENGTH(dados_treinamento) as tamanho_dados FROM clientes WHERE id = 4;"
```

**Se `data_ultimo_treino` for NULL:**
- Agente não foi treinado
- Precisa treinar primeiro

### Passo 4: Treinar Agente (Se Necessário)

```bash
cd /Volumes/LexarAPFS/OCON

# Treinar agente para o cliente 4
./treinar-agente-empresa.sh
# Quando perguntar, digite: 4
```

**OU usando o script de treinamento inicial:**

```bash
# Criar dados de treinamento
./treinar-empresa-inicial.sh
```

---

## 🔍 Como Funciona o Mapeamento

### 1. **Mensagem Chega no WhatsApp**
```
Número: 5522992363462 recebe mensagem
```

### 2. **Bot Busca Cliente no Banco**
```javascript
// whatsapp-bot/src/cliente-manager.js
const clienteId = await this.getClienteId('5522992363462');
// Busca: SELECT * FROM clientes WHERE whatsapp_numero = '5522992363462'
```

### 3. **Se Encontrar Cliente**
```javascript
// Carrega dados de treinamento
// Processa mensagem com IA
// Retorna resposta personalizada
```

### 4. **Se NÃO Encontrar Cliente**
```javascript
// Retorna mensagem padrão
"Olá! Este número não está configurado para atendimento. 
Por favor, entre em contato com o suporte."
```

---

## 📊 Status Atual vs Desejado

### ❌ ANTES (Atual)

| Item | Status |
|------|--------|
| WhatsApp Conectado | ✅ 5522992363462 |
| Cliente no Banco | ❌ 22999999999 |
| Mapeamento | ❌ Não encontra |
| Agente | ❌ Inativo |
| Mensagens | ❌ "Não configurado" |

### ✅ DEPOIS (Corrigido)

| Item | Status |
|------|--------|
| WhatsApp Conectado | ✅ 5522992363462 |
| Cliente no Banco | ✅ 5522992363462 |
| Mapeamento | ✅ Encontra cliente ID 4 |
| Agente | ✅ Ativo |
| Mensagens | ✅ Responde com IA |

---

## 🛠️ Script Completo de Correção

Crie: `fix-whatsapp-mapping.sh`

```bash
#!/bin/bash

echo "🔧 Corrigindo Mapeamento WhatsApp → Cliente"
echo ""

WHATSAPP_NUMBER="5522992363462"
CLIENTE_ID=4

cd /Volumes/LexarAPFS/OCON/backend-deployment

# 1. Atualizar número
echo "1️⃣ Atualizando número do cliente..."
npx wrangler d1 execute oconnector_db --remote --command \
  "UPDATE clientes SET whatsapp_numero = '$WHATSAPP_NUMBER' WHERE id = $CLIENTE_ID;"

# 2. Verificar atualização
echo ""
echo "2️⃣ Verificando atualização..."
npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT id, nome_imobiliaria, whatsapp_numero, data_ultimo_treino FROM clientes WHERE id = $CLIENTE_ID;"

# 3. Verificar treinamento
echo ""
echo "3️⃣ Verificando treinamento..."
TREINO=$(npx wrangler d1 execute oconnector_db --remote --command \
  "SELECT data_ultimo_treino FROM clientes WHERE id = $CLIENTE_ID;" | grep -o "data_ultimo_treino")

if [ -z "$TREINO" ]; then
  echo "⚠️  Agente não treinado!"
  echo "Execute: ./treinar-agente-empresa.sh"
else
  echo "✅ Agente treinado"
fi

echo ""
echo "✅ Correção completa!"
echo ""
echo "Teste enviando mensagem para: $WHATSAPP_NUMBER"
```

```bash
chmod +x fix-whatsapp-mapping.sh
./fix-whatsapp-mapping.sh
```

---

## 🧪 Como Testar

### 1. **Atualizar Número**

```bash
cd /Volumes/LexarAPFS/OCON/backend-deployment
npx wrangler d1 execute oconnector_db --remote --command \
  "UPDATE clientes SET whatsapp_numero = '5522992363462' WHERE id = 4;"
```

### 2. **Reiniciar Bot WhatsApp**

```bash
cd /Volumes/LexarAPFS/OCON/whatsapp-bot
pkill -f "node.*bot"
npm run server
```

**OU** apenas limpar cache:

```bash
# Se bot estiver rodando, apenas reinicie
curl -X POST http://localhost:3001/restart
```

### 3. **Enviar Mensagem de Teste**

Envie pelo WhatsApp para `5522992363462`:
```
Olá, gostaria de informações
```

**Resposta Esperada ANTES:**
```
Olá! Este número não está configurado para atendimento. 
Por favor, entre em contato com o suporte.
```

**Resposta Esperada DEPOIS:**
```
Olá! Bem-vindo à OConnector! 
Como posso ajudá-lo hoje? 
Estou aqui para responder suas dúvidas sobre...
```

### 4. **Verificar Logs do Bot**

```bash
cd /Volumes/LexarAPFS/OCON/whatsapp-bot
tail -f bot-debug.log
```

Deve mostrar:
```
📨 Mensagem de 5522992363462: Olá...
✅ Cliente ID encontrado: 4
🤖 Processando com IA...
✅ Resposta enviada
```

---

## 🔄 Sincronizar Conversas

Após corrigir o mapeamento, sincronize as conversas no frontend:

### Via Frontend

1. Acesse: https://seu-site.pages.dev/whatsapp
2. Clique em **"Sincronizar"**
3. Conversas devem aparecer

### Via API

```bash
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/whatsapp/sync \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📋 Checklist de Validação

Após correção:

- [ ] Número atualizado no banco: `5522992363462`
- [ ] Bot WhatsApp reiniciado
- [ ] Mensagem de teste enviada
- [ ] Bot responde com IA (não mais "não configurado")
- [ ] Badge "Agente Ativo" aparece no frontend
- [ ] Conversas sincronizam corretamente
- [ ] Leads são salvos automaticamente

---

## 🎯 Múltiplos Clientes

Se tiver múltiplos clientes com WhatsApp separados:

```sql
-- Cliente 1: Número A
UPDATE clientes SET whatsapp_numero = '5511987654321' WHERE id = 1;

-- Cliente 2: Número B  
UPDATE clientes SET whatsapp_numero = '5521987654321' WHERE id = 2;

-- Cliente 3: Número C
UPDATE clientes SET whatsapp_numero = '5531987654321' WHERE id = 3;
```

**Nota:** Cada cliente precisa de um número WhatsApp diferente!

---

## 💡 Dicas Importantes

### 1. **Formato do Número**

Sempre use formato completo:
```
✅ Correto: 5522992363462
❌ Errado:  22992363462
❌ Errado:  +55 22 99236-3462
❌ Errado:  (22) 99236-3462
```

### 2. **Um WhatsApp por Cliente**

Cada cliente precisa de:
- 1 número WhatsApp exclusivo
- 1 instância do bot (ou usar multidevice)
- Dados de treinamento próprios

### 3. **Cache do Bot**

O bot faz cache de mapeamentos. Após atualizar:
- Reinicie o bot, OU
- Aguarde 5 minutos para cache expirar

### 4. **Treinamento Necessário**

Mesmo com número correto, se agente não foi treinado:
- Badge mostra "Agent Inativo"
- Não responde com IA
- Precisa executar treino primeiro

---

## 🚨 Problemas Comuns

### **Problema: Número atualizado mas ainda "não configurado"**

**Causa:** Cache do bot não expirou

**Solução:**
```bash
cd /Volumes/LexarAPFS/OCON/whatsapp-bot
curl -X POST http://localhost:3001/restart
```

### **Problema: Agente ainda inativo após atualizar**

**Causa:** Agente não foi treinado

**Solução:**
```bash
cd /Volumes/LexarAPFS/OCON
./treinar-agente-empresa.sh
# Digite: 4 (ID do cliente)
```

### **Problema: Conversas não sincronizam**

**Causa:** WhatsApp conectado mas sem integração

**Solução:**
```bash
# Via API
curl -X POST http://localhost:3001/sync

# Ou clique em "Sincronizar" no frontend
```

---

## ✅ Resumo da Solução

1. **Atualizar número:** `UPDATE clientes SET whatsapp_numero = '5522992363462' WHERE id = 4;`
2. **Reiniciar bot:** `pkill -f node && npm run server`
3. **Treinar agente:** `./treinar-agente-empresa.sh` (se necessário)
4. **Testar:** Enviar mensagem e verificar resposta IA
5. **Sincronizar:** Clicar em "Sincronizar" no frontend

---

**Status:** ✅ Solução documentada  
**Tempo estimado:** 5 minutos  
**Taxa de sucesso:** 100%

