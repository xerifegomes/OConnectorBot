# 🔧 Como Habilitar APIs do Google - Passo a Passo Completo

## ⚠️ Erro Atual
**"As APIs do Google não estão habilitadas neste projeto"**

Este erro ocorre porque as APIs necessárias não estão habilitadas no Google Cloud Console.

---

## 📋 Checklist Rápido

- [ ] Acessar Google Cloud Console
- [ ] Selecionar projeto correto
- [ ] Habilitar Places API
- [ ] Habilitar Geocoding API
- [ ] Ativar billing (obrigatório)
- [ ] Verificar restrições da API Key
- [ ] Testar novamente

---

## 🚀 Passo a Passo Detalhado

### **PASSO 1: Acessar Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Verifique se está na conta correta (a que criou a API Key)

### **PASSO 2: Selecionar o Projeto**

1. No topo da página, clique no **seletor de projeto** (ao lado do logo do Google Cloud)
2. Procure pelo projeto que contém sua API Key:
   - A API Key que você está usando: `AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4`
   - Se não souber qual projeto, você pode:
     - Verificar em **APIs & Services** → **Credentials**
     - Ou criar um novo projeto

**Se não encontrar o projeto:**
- Crie um novo projeto:
  1. Clique em **"New Project"** (Novo Projeto)
  2. Nome: `oConnector` ou `oconnector-places`
  3. Clique em **"Create"**
  4. Aguarde alguns segundos

### **PASSO 3: Habilitar Places API**

1. No menu lateral esquerdo, vá em:
   **APIs & Services** → **Library** (Biblioteca)

2. Na barra de pesquisa, digite: **"Places API"**

3. Você verá duas opções:
   - **Places API** (versão antiga, ainda funciona)
   - **Places API (New)** (versão nova, recomendada)

4. **Recomendação**: Clique em **"Places API (New)"** se disponível
   - Se não aparecer, use **"Places API"**

5. Na página da API, clique no botão azul **"Enable"** (Ativar)

6. Aguarde alguns segundos até ver a mensagem de sucesso

### **PASSO 4: Habilitar Geocoding API**

1. Na mesma página **Library** (ou volte para ela)

2. Na barra de pesquisa, digite: **"Geocoding API"**

3. Clique em **"Geocoding API"**

4. Clique no botão azul **"Enable"** (Ativar)

5. Aguarde confirmação

### **PASSO 5: Ativar Billing (OBRIGATÓRIO)**

⚠️ **IMPORTANTE**: As APIs do Google Places **REQUEREM** billing ativado!

1. No menu lateral, vá em: **Billing** (Faturamento)

2. Você verá uma das seguintes situações:

   **A) Se não tem billing account:**
   - Clique em **"Link a billing account"** (Vincular conta de faturamento)
   - Clique em **"Create billing account"** (Criar conta de faturamento)
   - Preencha os dados:
     - Nome da conta
     - País/região
     - Informações de pagamento (cartão de crédito)
   - Clique em **"Submit"** (Enviar)

   **B) Se já tem billing account:**
   - Clique em **"Link a billing account"**
   - Selecione a conta existente
   - Clique em **"Set account"**

3. ⚠️ **IMPORTANTE**: Google oferece $200 de crédito grátis por mês!
   - Isso cobre aproximadamente **28.500 requisições** de Places API
   - Geocoding API também tem créditos gratuitos
   - Você só paga se ultrapassar os créditos grátis

### **PASSO 6: Verificar APIs Habilitadas**

1. No menu lateral, vá em: **APIs & Services** → **Enabled APIs** (APIs Habilitadas)

2. Você deve ver listado:
   - ✅ **Places API** ou **Places API (New)**
   - ✅ **Geocoding API**

3. Se não aparecer, volte ao Passo 3 e 4

### **PASSO 7: Verificar Restrições da API Key**

1. Vá em: **APIs & Services** → **Credentials**

2. Encontre sua API Key: `AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4`
   - Se não encontrar, clique em **"Create Credentials"** → **"API Key"**
   - Copie a nova chave e atualize no Cloudflare

3. Clique na API Key para editar

4. Verifique **"API restrictions"**:
   - **Opção 1**: Selecione **"Restrict key"**
     - Adicione: **Places API**
     - Adicione: **Geocoding API**
   - **Opção 2**: Deixe **"Don't restrict key"** (para testes)

5. **Application restrictions** (Opcional):
   - Para desenvolvimento: **"None"**
   - Para produção: Configure **HTTP referrers** ou **IP addresses**

6. Clique em **"Save"** (Salvar)

### **PASSO 8: Verificar Quotas**

1. Vá em: **APIs & Services** → **Dashboard**

2. Clique em **Places API** ou **Geocoding API**

3. Verifique as quotas:
   - **Requests per day**: Verifique se há limite
   - **Requests per minute**: Verifique se há limite

4. Se necessário, aumente as quotas temporariamente

---

## ✅ Verificar se Funcionou

### Teste 1: Via Console

1. Acesse: **APIs & Services** → **Enabled APIs**
2. Você deve ver:
   - ✅ Places API (ou Places API (New))
   - ✅ Geocoding API

### Teste 2: Via API (curl)

```bash
# Testar Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurante+em+São+Paulo&key=AIzaSyDbk7xICKFAKG2pkGTTFpcvb0Pf8E_vLt4"

# Se funcionar, retornará JSON com resultados
# Se não funcionar, retornará erro
```

### Teste 3: Via Aplicação

1. Acesse a página de Prospects no frontend
2. Tente buscar prospects
3. Se funcionar, você verá os resultados!

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: "Billing account not found"
**Solução**: 
- Vá em **Billing** → **Link a billing account**
- Crie ou vincule uma conta de faturamento

### Problema 2: "API not enabled"
**Solução**:
- Vá em **APIs & Services** → **Library**
- Procure pela API e clique em **"Enable"**

### Problema 3: "API key not valid"
**Solução**:
- Verifique se a API Key está correta
- Verifique se a API Key não expirou
- Verifique restrições de API (Passo 7)

### Problema 4: "Quota exceeded"
**Solução**:
- Aguarde o reset (geralmente diário)
- Verifique quotas em **APIs & Services** → **Dashboard**
- Considere aumentar quotas se necessário

### Problema 5: "REQUEST_DENIED"
**Solução**:
- Verifique se as APIs estão habilitadas
- Verifique se o billing está ativado
- Verifique restrições da API Key

---

## 📞 Links Diretos

### Habilitar APIs:
- [Places API (New)](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
- [Places API (Antiga)](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
- [Geocoding API](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com)

### Gerenciar Credenciais:
- [Credentials (Credenciais)](https://console.cloud.google.com/apis/credentials)

### Gerenciar Billing:
- [Billing (Faturamento)](https://console.cloud.google.com/billing)

### Ver APIs Habilitadas:
- [Enabled APIs (APIs Habilitadas)](https://console.cloud.google.com/apis/dashboard)

---

## 💰 Informações sobre Custos

### Créditos Grátis do Google:
- **$200 de crédito grátis por mês**
- Isso cobre aproximadamente:
  - **28.500 requisições** de Places API Text Search
  - **40.000 requisições** de Geocoding API

### Preços (após créditos grátis):
- **Places API Text Search**: $32 por 1.000 requisições
- **Geocoding API**: $5 por 1.000 requisições

### Exemplo de Uso:
- 100 buscas por dia = 3.000 por mês
- Custo: **GRÁTIS** (dentro do crédito de $200)

---

## ✅ Checklist Final

Após seguir todos os passos:

- [ ] Places API habilitada
- [ ] Geocoding API habilitada
- [ ] Billing ativado
- [ ] API Key configurada corretamente
- [ ] Restrições verificadas
- [ ] Teste realizado com sucesso

---

## 🎯 Próximos Passos

Após habilitar as APIs:

1. **Teste a funcionalidade**:
   - Acesse a página de Prospects
   - Busque por um nicho e cidade
   - Verifique se os resultados aparecem

2. **Se ainda houver erro**:
   - Verifique o console do navegador (F12)
   - Verifique os logs do Cloudflare Worker
   - Verifique se a API Key está correta

3. **Monitorar uso**:
   - Vá em **APIs & Services** → **Dashboard**
   - Monitore o uso das APIs
   - Configure alertas se necessário

---

## 📚 Documentação Adicional

- [Documentação Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Documentação Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Preços e Quotas](https://developers.google.com/maps/billing-and-pricing/pricing)

---

**Tempo estimado**: 10-15 minutos

**Dificuldade**: Fácil

**Custo**: Grátis (dentro do crédito de $200/mês)

