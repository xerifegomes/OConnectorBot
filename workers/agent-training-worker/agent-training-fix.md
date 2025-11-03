# 🔧 Fix para agent-training-worker

## Problema

```
TypeError: Cannot read properties of undefined (reading 'insert')
Causa: env.VECTORIZE não existe, mas código tenta usar
```

## Solução

### Antes (Código com bug):

```javascript
// ❌ Erro: env.VECTORIZE é undefined
if (env.VECTORIZE) {
  await env.VECTORIZE.insert(...);
} else {
  // fallback D1
}
```

### Depois (Código corrigido):

```javascript
// ✅ Verificar se VECTORIZE existe ANTES de usar
if (env.VECTORIZE && typeof env.VECTORIZE.insert === 'function') {
  try {
    await env.VECTORIZE.insert(...);
  } catch (error) {
    console.warn('Vectorize error, using D1 fallback:', error);
    // Usar fallback D1
  }
}

// Sempre usar D1 como fallback
await env.DB.prepare(
  `INSERT INTO conhecimento (cliente_id, tipo, conteudo) 
   VALUES (?, ?, ?)`
).bind(clienteId, tipo, conteudo).run();
```

## Onde Aplicar

No arquivo do worker `agent-training-worker`, procure por:

1. `env.VECTORIZE.insert`
2. `env.VECTORIZE.upsert`
3. `env.VECTORIZE.query`

**Substitua por:**

```javascript
// Verificar VECTORIZE existe
if (env.VECTORIZE && typeof env.VECTORIZE.insert === 'function') {
  try {
    // Usar Vectorize
    await env.VECTORIZE.insert(...);
  } catch (error) {
    // Fallback para D1
  }
}

// SEMPRE usar D1 (principal)
await env.DB.prepare('INSERT INTO conhecimento...').bind(...).run();
```

## Estrutura Final

```javascript
async function salvarConhecimento(env, clienteId, tipo, conteudo) {
  // Tentar Vectorize (se existir)
  if (env.VECTORIZE && typeof env.VECTORIZE.insert === 'function') {
    try {
      await env.VECTORIZE.insert({
        id: `${clienteId}_${Date.now()}`,
        values: [/* embeddings */],
        metadata: { clienteId, tipo, conteudo }
      });
    } catch (error) {
      console.warn('Vectorize falhou, usando D1:', error);
    }
  }

  // SEMPRE salvar no D1 (fallback principal)
  await env.DB.prepare(
    `INSERT INTO conhecimento (cliente_id, tipo, conteudo) 
     VALUES (?, ?, ?)`
  )
    .bind(clienteId, tipo, conteudo)
    .run();
  
  return { metodo: env.VECTORIZE ? 'Vectorize + D1' : 'D1 Fallback' };
}
```

