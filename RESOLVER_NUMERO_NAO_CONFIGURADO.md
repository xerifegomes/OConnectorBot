# 🔧 Resolver: "Este número não está configurado para atendimento"

## 📋 Problema

Quando você recebe esta mensagem, significa que o número WhatsApp que está enviando mensagens **não está cadastrado** na tabela `clientes` do banco de dados, ou o cliente não está com status `ativo`.

## 🔍 Como Funciona a Verificação

O bot WhatsApp faz o seguinte quando recebe uma mensagem:

1. **Recebe a mensagem** do número: `5522999999999@c.us`
2. **Limpa o número**: Remove `@c.us` e caracteres não numéricos → `5522999999999`
3. **Busca na API**: `GET /api/clientes?whatsapp=5522999999999`
4. **Verifica no banco**: Procura na tabela `clientes` onde:
   - `whatsapp_numero = '5522999999999'` (exatamente igual, após limpar)
   - `status = 'ativo'`
5. **Se não encontrar**: Envia a mensagem de erro

## ✅ Solução Rápida

### Opção 1: Usar Script de Diagnóstico

```bash
./diagnosticar-numero-whatsapp.sh
```

Este script vai:
- ✅ Identificar o número conectado
- ✅ Testar a busca na API
- ✅ Verificar no banco de dados
- ✅ Criar cliente automaticamente (se desejar)

### Opção 2: Verificação Manual

#### 1. Descobrir o número conectado

Verifique os logs do bot:
```bash
tail -f whatsapp-bot/logs/whatsapp-bot.log
```

Procure por mensagens como:
```
📨 Mensagem de Nome: ...
⚠️ Número 5522999999999 não está associado a nenhum cliente
```

#### 2. Verificar no banco de dados

```bash
cd backend-deployment

# Verificar se existe cliente com este número
wrangler d1 execute oconnector_db --remote --command "
  SELECT id, nome_imobiliaria, whatsapp_numero, status 
  FROM clientes 
  WHERE whatsapp_numero LIKE '%5522999999999%';
"
```

#### 3. Criar ou atualizar cliente

**Criar novo cliente:**
```bash
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome_imobiliaria": "Nome da Sua Imobiliária",
    "whatsapp_numero": "5522999999999",
    "plano": "STARTER",
    "valor_mensal": 500
  }'
```

**Atualizar cliente existente:**
```bash
# Primeiro, descubra o ID do cliente
wrangler d1 execute oconnector_db --remote --command "
  SELECT id FROM clientes WHERE nome_imobiliaria = 'Nome da Imobiliária';
"

# Depois, atualize o número e status
wrangler d1 execute oconnector_db --remote --command "
  UPDATE clientes 
  SET whatsapp_numero = '5522999999999', 
      status = 'ativo' 
  WHERE id = 1;
"
```

#### 4. Testar a busca na API

```bash
curl "https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes?whatsapp=5522999999999"
```

Deve retornar:
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "nome_imobiliaria": "Nome da Imobiliária",
    "whatsapp_numero": "5522999999999",
    "status": "ativo"
  }]
}
```

#### 5. Treinar o cliente (se necessário)

```bash
cd backend-deployment
./test-treinar.sh 1  # Substitua 1 pelo ID do cliente
```

## ⚠️ Problemas Comuns

### 1. Número com formato diferente

O bot limpa o número (remove caracteres não numéricos), mas você precisa garantir que:
- O número no banco está **apenas com dígitos** (sem espaços, parênteses, hífens)
- O número pode estar com ou sem código do país (55)

**Exemplo:**
- ✅ `5522999999999` (funciona)
- ✅ `22999999999` (funciona se o bot estiver no Brasil)
- ❌ `(22) 99999-9999` (não funciona - tem caracteres)
- ❌ `55 22 99999 9999` (não funciona - tem espaços)

### 2. Cliente com status diferente de 'ativo'

A API só retorna clientes com `status = 'ativo'`. Verifique:

```sql
SELECT id, nome_imobiliaria, status FROM clientes WHERE id = 1;
```

Se estiver `inativo`, atualize:
```sql
UPDATE clientes SET status = 'ativo' WHERE id = 1;
```

### 3. Cache do bot

O bot mantém cache por 5 minutos. Se você acabou de criar/atualizar o cliente:
- Aguarde 5 minutos, OU
- Reinicie o bot

### 4. Número conectado diferente do cadastrado

O número que está **conectado ao WhatsApp** precisa ser o mesmo que está **cadastrado no banco**.

Verifique qual número está conectado:
- Veja os logs do bot quando ele inicia
- Ou verifique no WhatsApp Web: Menu → Aparelhos conectados

## 🔄 Fluxo Completo de Configuração

```bash
# 1. Verificar número conectado
tail -f whatsapp-bot/logs/whatsapp-bot.log

# 2. Criar cliente (se não existir)
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome_imobiliaria": "Minha Imobiliária",
    "whatsapp_numero": "5522999999999",
    "plano": "STARTER",
    "valor_mensal": 500
  }'

# 3. Verificar se foi criado
curl "https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes?whatsapp=5522999999999"

# 4. Treinar o cliente
cd backend-deployment
./test-treinar.sh 1

# 5. Reiniciar o bot (se necessário)
cd whatsapp-bot
npm start
```

## 📊 Verificação Final

Após configurar, teste enviando uma mensagem para o número conectado. O bot deve:

1. ✅ Reconhecer o número
2. ✅ Buscar o cliente
3. ✅ Salvar como lead (se for primeira mensagem)
4. ✅ Responder com saudação personalizada
5. ✅ Processar mensagens com IA

Se ainda não funcionar, verifique os logs:
```bash
tail -f whatsapp-bot/logs/whatsapp-bot.log
```

## 🆘 Ainda com Problemas?

1. Verifique os logs do bot para mensagens de erro
2. Teste a API diretamente com curl
3. Verifique se o banco de dados está acessível
4. Confirme que o número está exatamente igual (apenas dígitos)
5. Verifique se o cliente tem status 'ativo'

## 📝 Notas Importantes

- O número deve estar **apenas com dígitos** no banco
- O cliente deve ter `status = 'ativo'`
- O cache do bot expira em 5 minutos
- O número conectado ao WhatsApp deve ser o mesmo cadastrado
- Após criar o cliente, é necessário treiná-lo

