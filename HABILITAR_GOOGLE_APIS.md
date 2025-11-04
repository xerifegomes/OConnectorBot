# 🔧 Como Habilitar APIs do Google - Resolver Erro "APIs Disabled"

## ⚠️ Problema
Erro: **"Google has disabled the use of APIs from this API project"**

Isso significa que as APIs necessárias não estão habilitadas no projeto do Google Cloud.

---

## ✅ Solução Passo a Passo

### 1. Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto que contém sua API Key:
   - Projeto associado à chave: `AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4`
   - Ou crie um novo projeto se necessário

### 2. Habilitar APIs Necessárias

Você precisa habilitar **2 APIs essenciais**:

#### A) Places API (Text Search)
1. Vá em: **APIs & Services** → **Library**
2. Procure por: **"Places API"** ou **"Places API (New)"**
3. Clique em **"Enable"**
4. ⚠️ **IMPORTANTE**: Se aparecer "Places API (New)", use essa versão
   - A versão antiga (Places API) está sendo descontinuada
   - A nova versão usa um endpoint diferente

#### B) Geocoding API
1. Na mesma página **Library**
2. Procure por: **"Geocoding API"**
3. Clique em **"Enable"**

### 3. Verificar Billing (OBRIGATÓRIO)

**As APIs do Google Places requerem billing ativado!**

1. Vá em: **Billing** → **Link a billing account**
2. Adicione um método de pagamento (cartão de crédito)
3. ⚠️ **Nota**: Google oferece $200 de crédito grátis por mês
   - Isso cobre aproximadamente 28.500 requisições de Places API
   - Geocoding API também tem créditos gratuitos

### 4. Verificar Restrições da API Key

1. Vá em: **APIs & Services** → **Credentials**
2. Clique na sua API Key: `AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4`
3. Verifique:
   - ✅ **API restrictions**: Se tiver restrições, certifique-se que inclui:
     - Places API
     - Geocoding API
   - ✅ **Application restrictions**: Pode deixar "None" para testes ou configurar:
     - **HTTP referrers** (se usar no frontend)
     - **IP addresses** (se usar apenas no backend)

### 5. Verificar Quotas e Limites

1. Vá em: **APIs & Services** → **Dashboard**
2. Verifique se há limites ou quotas configuradas
3. Para desenvolvimento, você pode aumentar quotas temporariamente

---

## 📋 APIs Necessárias para o Projeto

### APIs Obrigatórias:
1. ✅ **Places API (New)** ou **Places API**
   - Usado para: Busca de lugares por texto (`/api/place/textsearch`)
   
2. ✅ **Geocoding API**
   - Usado para: Converter endereços em coordenadas (calcular distância)

### APIs Opcionais (para futuro):
- Maps JavaScript API (se quiser mapas no frontend)
- Directions API (se quiser rotas)
- Distance Matrix API (para calcular distâncias mais precisas)

---

## 🔍 Verificar se APIs Estão Habilitadas

### Método 1: Via Console
1. Vá em: **APIs & Services** → **Enabled APIs**
2. Você deve ver listado:
   - Places API (ou Places API (New))
   - Geocoding API

### Método 2: Via API
```bash
# Verificar Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurante+em+São+Paulo&key=AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4"

# Se funcionar, retornará JSON com resultados
# Se não funcionar, retornará erro com status específico
```

---

## 🚨 Erros Comuns e Soluções

### Erro: "API key not valid"
- ✅ Verifique se a chave está correta
- ✅ Verifique se a chave não expirou
- ✅ Verifique restrições de API

### Erro: "This API project is not authorized to use this API"
- ✅ A API não está habilitada → Siga o passo 2 acima
- ✅ Billing não está ativado → Siga o passo 3 acima

### Erro: "REQUEST_DENIED"
- ✅ Verifique se a API está habilitada
- ✅ Verifique se a chave tem permissão para a API
- ✅ Verifique restrições de aplicação (IP/Referrer)

### Erro: "OVER_QUERY_LIMIT"
- ✅ Você excedeu o limite de requisições
- ✅ Verifique quotas no Console
- ✅ Aguarde reset (geralmente diário)

---

## ✅ Checklist Rápido

- [ ] Acessou Google Cloud Console
- [ ] Selecionou o projeto correto
- [ ] Habilitou Places API (ou Places API (New))
- [ ] Habilitou Geocoding API
- [ ] Ativou billing (método de pagamento)
- [ ] Verificou restrições da API Key
- [ ] Testou a API Key

---

## 🔗 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [Habilitar Places API](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
- [Habilitar Geocoding API](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com)
- [Documentação Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Documentação Geocoding API](https://developers.google.com/maps/documentation/geocoding)

---

## 💡 Dica: Usar Places API (New)

Google está migrando para a nova versão da Places API. Se possível, use:

**Endpoint antigo** (será descontinuado):
```
https://maps.googleapis.com/maps/api/place/textsearch/json
```

**Endpoint novo** (recomendado):
```
https://places.googleapis.com/v1/places:searchText
```

**Migração futura**: Considere atualizar o código para usar a nova API quando estiver estável.

---

## 📞 Suporte

Se após seguir todos os passos ainda houver erro:
1. Verifique os logs do Google Cloud Console
2. Verifique se há notificações no Console
3. Entre em contato com suporte do Google Cloud (se tiver suporte)

