# 🔒 Corrigir Erro SSL no Cloudflare Pages

## ⚠️ Erro: `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`

Este erro geralmente acontece porque o SSL ainda está sendo provisionado ou há problema de configuração.

---

## ✅ SOLUÇÕES

### **1. Aguardar (Mais Comum)**

O SSL do Cloudflare pode levar **5-15 minutos** para ser provisionado após o primeiro deploy.

**Aguarde e tente novamente.**

---

### **2. Verificar no Cloudflare Dashboard**

1. Acesse: https://dash.cloudflare.com
2. Vá em **Pages** → **oconnector-frontend**
3. Vá em **Settings** → **Custom domains**
4. Verifique se há domínios configurados
5. Se não houver, o domínio `.pages.dev` já deve ter SSL automático

---

### **3. Verificar Configuração SSL**

1. No dashboard do Cloudflare
2. Vá em **Pages** → **oconnector-frontend** → **Settings**
3. Procure por **SSL/TLS** ou **Security**
4. Certifique-se que está **"Flexible"** ou **"Full"**

---

### **4. Tentar URLs Alternativas**

Se a URL com hash não funciona, tente:

```
https://oconnector-frontend.pages.dev
```

Ou verifique no dashboard qual é a URL principal do projeto.

---

### **5. Limpar Cache do Navegador**

- **Chrome/Edge**: Ctrl+Shift+Delete → Limpar cache e cookies
- **Firefox**: Ctrl+Shift+Delete → Limpar dados
- Ou usar **modo anônimo/privado**

---

### **6. Verificar DNS**

O domínio pode ainda estar propagando. Aguarde alguns minutos.

---

### **7. Verificar via Terminal**

```bash
# Testar HTTP (pode redirecionar para HTTPS)
curl -I http://13a1b704.oconnector-frontend.pages.dev

# Testar HTTPS
curl -I https://13a1b704.oconnector-frontend.pages.dev

# Testar sem verificar certificado
curl -k -I https://13a1b704.oconnector-frontend.pages.dev
```

---

### **8. Redeploy (Se persistir)**

```bash
cd oconnector-frontend
npx wrangler pages deploy out --project-name=oconnector-frontend
```

---

## 🔍 Diagnóstico

### **Se o erro persistir após 15 minutos:**

1. **Verificar logs no Cloudflare:**
   - Pages → oconnector-frontend → Deployments
   - Ver se há erros no deploy

2. **Verificar SSL/TLS:**
   - Cloudflare Dashboard → Domain → SSL/TLS
   - Verificar se está em modo "Flexible" ou "Full"

3. **Tentar outro navegador:**
   - Chrome, Firefox, Safari
   - Modo anônimo

---

## 📞 Suporte Cloudflare

Se nada funcionar:
- Cloudflare Community: https://community.cloudflare.com
- Cloudflare Support (se tiver plano pago)

---

## ⏱️ Normalmente Resolve

Na maioria dos casos, é apenas questão de **aguardar 5-15 minutos** para o SSL ser provisionado.

Tente novamente em alguns minutos!

