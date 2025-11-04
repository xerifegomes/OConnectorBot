# 🔍 Verificar API Key do Google

## Problema Identificado

A API Key `AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4` ainda está retornando `REQUEST_DENIED` mesmo após habilitar as APIs.

## Possíveis Causas

1. **API Key associada a projeto diferente**: A API Key pode estar no projeto errado
2. **Restrições na API Key**: Pode ter restrições de HTTP referrer ou IP
3. **Propagação**: Pode levar alguns minutos para as mudanças propagarem

## Como Verificar e Corrigir

### Passo 1: Verificar qual projeto a API Key pertence

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique na sua API Key
3. Anote o **Nome do Projeto** mostrado no topo

### Passo 2: Verificar se as APIs estão habilitadas no MESMO projeto

1. Acesse: https://console.cloud.google.com/apis/dashboard
2. **IMPORTANTE**: Verifique que o projeto selecionado no topo é o MESMO da sua API Key
3. Procure por:
   - ✅ **Places API** (ou "Places API (New)")
   - ✅ **Geocoding API**

### Passo 3: Verificar e Remover Restrições da API Key

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique na sua API Key
3. Na seção **"Application restrictions"**:
   - Se estiver como **"HTTP referrers (web sites)"**, isso pode estar bloqueando requisições do Cloudflare Worker
   - Recomendação: Altere para **"None"** temporariamente para testar
   - Ou adicione `*` como referrer permitido

4. Na seção **"API restrictions"**:
   - Certifique-se de que está como **"Don't restrict key"** ou
   - Se estiver restrito, adicione:
     - ✅ Places API
     - ✅ Geocoding API

### Passo 4: Criar Nova API Key (se necessário)

Se o problema persistir, crie uma nova API Key:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique em **"+ CREATE CREDENTIALS"** → **"API key"**
3. Uma nova API Key será criada
4. Configure:
   - **Application restrictions**: None (ou adicione restrições depois)
   - **API restrictions**: 
     - ✅ Places API
     - ✅ Geocoding API
5. Copie a nova API Key
6. Configure no Cloudflare:
   ```bash
   cd workers/oconnector-api
   echo "SUA_NOVA_API_KEY" | npx wrangler secret put GOOGLE_PLACES_KEY --env=""
   echo "SUA_NOVA_API_KEY" | npx wrangler secret put GOOGLE_API_KEY --env=""
   ```

## Teste Rápido

Após fazer as alterações, teste a API Key diretamente:

```bash
# Teste Geocoding
curl "https://maps.googleapis.com/maps/api/geocode/json?address=São+Paulo,+Brasil&key=SUA_API_KEY"

# Teste Places
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurante+em+São+Paulo&key=SUA_API_KEY"
```

Ambos devem retornar `"status": "OK"` se estiverem funcionando.

## Checklist Final

- [ ] Verifiquei que a API Key está no projeto correto
- [ ] Verifiquei que as APIs estão habilitadas no MESMO projeto
- [ ] Removi ou ajustei as restrições de Application restrictions
- [ ] Verifiquei que as API restrictions incluem Places API e Geocoding API
- [ ] Testei a API Key diretamente e retornou `"status": "OK"`
- [ ] Configurei a API Key no Cloudflare Worker usando `wrangler secret put`

## Importante

- **Aguarde 5-10 minutos** após fazer alterações para as mudanças propagarem
- Se estiver usando **restrições de HTTP referrers**, pode ser necessário permitir requisições do Cloudflare Workers
- O projeto precisa ter **billing ativado** (você já confirmou isso ✅)

