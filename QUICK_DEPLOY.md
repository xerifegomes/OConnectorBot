# ⚡ QUICK DEPLOY - 10 Minutos

## 🔴 PASSO 1: Auth (5 min)

### Via Dashboard (Mais Fácil):

1. **Abrir:** https://dash.cloudflare.com/ → Workers & Pages → **oconnector-api**

2. **Clicar:** Edit code

3. **Copiar:** Todo o conteúdo de `EXECUTAR_CODIGO_AUTH.txt`

4. **Colar** no editor (substituindo tudo)

5. **Verificar Bindings:** Settings → Variables → Deve ter **DB** (D1 Database)

6. **Save and Deploy**

7. **Testar:**
```bash
curl -X POST https://oconnector-api.xerifegomes-e71.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@oconnector.tech","senha":"Rsg4dr3g44@"}'
```

✅ **Esperado:** `{"success": true, "data": {...}}`

---

## 🔴 PASSO 2: Training Fix (5 min)

### Via Dashboard:

1. **Abrir:** Workers & Pages → **agent-training-worker** → Edit code

2. **Buscar:** `env.VECTORIZE.insert` (Ctrl+F)

3. **Substituir por:**
```javascript
// Antes (com bug):
if (env.VECTORIZE) {
  await env.VECTORIZE.insert(...);
}

// Depois (corrigido):
if (env.VECTORIZE && typeof env.VECTORIZE.insert === 'function') {
  try {
    await env.VECTORIZE.insert(...);
  } catch (error) {
    console.warn('Vectorize error, using D1 fallback:', error);
  }
}

// SEMPRE salvar no D1
await env.DB.prepare(
  `INSERT INTO conhecimento (cliente_id, tipo, conteudo) 
   VALUES (?, ?, ?)`
)
  .bind(clienteId, tipo, conteudo)
  .run();
```

4. **Buscar TODOS** os usos de `VECTORIZE` e aplicar fix

5. **Save and Deploy**

6. **Testar:**
```bash
./backend-deployment/test-treinar.sh 3
```

✅ **Esperado:** `documentos_processados > 0`

---

## ✅ PASSO 3: Validar (1 min)

```bash
./backend-deployment/test-completo.sh
```

✅ **Esperado:** 5/5 testes passando

---

**Tempo total:** ~10 minutos  
**Resultado:** Sistema 90% funcional 🚀

