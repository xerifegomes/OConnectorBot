# 🧪 SCRIPTS DE TESTE - Guia de Uso

**Data:** 02/11/2024  
**Versão:** 1.0

---

## 📋 SCRIPTS DISPONÍVEIS

Todos os scripts estão localizados em `/scripts/` e podem ser executados diretamente.

---

## 1. 🧪 Testes Unitários

### `scripts/test-unit.sh`

Executa testes unitários do projeto Next.js com cobertura.

**Uso:**
```bash
cd /Volumes/LexarAPFS/OCON
./scripts/test-unit.sh
```

**O que faz:**
- Verifica se npm está instalado
- Instala dependências se necessário
- Executa testes com Jest
- Gera relatório de cobertura

**Requisitos:**
- Node.js instalado
- npm disponível

**Nota:** Este script requer que os testes estejam configurados. Configure Jest primeiro seguindo o Action Plan.

---

## 2. 🔗 Testes de Integração

### `scripts/test-integration.sh`

Testa integração entre componentes e API.

**Uso:**
```bash
cd /Volumes/LexarAPFS/OCON
./scripts/test-integration.sh
```

**O que faz:**
- Verifica/cria arquivo `.env.local`
- Instala dependências se necessário
- Executa testes de integração
- Gera relatório de cobertura

**Requisitos:**
- Node.js instalado
- Arquivo `.env.local` configurado (ou será criado template)

---

## 3. 🌐 Testes End-to-End

### `scripts/test-e2e.sh`

Executa testes E2E com Playwright.

**Uso:**
```bash
cd /Volumes/LexarAPFS/OCON
./scripts/test-e2e.sh
```

**O que faz:**
- Instala Playwright se necessário
- Inicia servidor de desenvolvimento
- Executa testes E2E
- Para servidor automaticamente

**Requisitos:**
- Node.js instalado
- Porta 3000 disponível
- Servidor de desenvolvimento funcional

**Nota:** Este script requer que os testes E2E estejam configurados. Configure Playwright primeiro.

---

## 4. 🔒 Verificação de Segurança

### `scripts/security-check.sh`

Verifica credenciais expostas e problemas de segurança.

**Uso:**
```bash
cd /Volumes/LexarAPFS/OCON
./scripts/security-check.sh
```

**O que faz:**
- Verifica credenciais hardcoded (Stripe, GitHub, etc.)
- Verifica se `.env.local` está no git
- Verifica `.gitignore` para arquivos sensíveis
- Verifica vulnerabilidades em dependências
- Verifica uso de localStorage para tokens

**Requisitos:**
- Git instalado (opcional)
- npm disponível

**Saída:**
- ✅ Verde: Sem problemas
- ⚠️ Amarelo: Avisos
- ❌ Vermelho: Problemas críticos

---

## 5. 📦 Auditoria de Dependências

### `scripts/audit-dependencies.sh`

Audita dependências: vulnerabilidades, versões, deprecated.

**Uso:**
```bash
cd /Volumes/LexarAPFS/OCON
./scripts/audit-dependencies.sh
```

**O que faz:**
- Verifica vulnerabilidades conhecidas
- Lista dependências desatualizadas
- Verifica dependências deprecated
- Mostra versões de dependências principais
- Mostra tamanho do node_modules

**Requisitos:**
- npm disponível

---

## 🚀 EXECUTAR TODOS OS SCRIPTS

### Script Master

Você pode criar um script que executa todos:

```bash
#!/bin/bash
# scripts/run-all-tests.sh

set -e

echo "🚀 Executando todos os scripts de teste..."
echo ""

./scripts/security-check.sh
echo ""

./scripts/audit-dependencies.sh
echo ""

# Apenas se testes estiverem configurados
# ./scripts/test-unit.sh
# ./scripts/test-integration.sh
# ./scripts/test-e2e.sh

echo "✅ Todos os scripts executados!"
```

**Uso:**
```bash
chmod +x scripts/run-all-tests.sh
./scripts/run-all-tests.sh
```

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

Antes de executar os scripts de teste, configure:

### Para Testes Unitários
- [ ] Instalar Jest: `npm install -D jest @testing-library/react @testing-library/jest-dom`
- [ ] Criar `jest.config.js`
- [ ] Criar `setupTests.ts`
- [ ] Escrever primeiros testes

### Para Testes E2E
- [ ] Instalar Playwright: `npm install -D @playwright/test`
- [ ] Executar: `npx playwright install`
- [ ] Criar `playwright.config.ts`
- [ ] Escrever testes E2E

### Para Segurança
- [ ] Configurar `.env.local`
- [ ] Adicionar `.env*` ao `.gitignore`
- [ ] Verificar que não há credenciais no código

---

## 🔧 TROUBLESHOOTING

### Erro: "npm não encontrado"
```bash
# Instalar Node.js
# macOS:
brew install node

# ou baixar de: https://nodejs.org/
```

### Erro: "Permission denied"
```bash
chmod +x scripts/*.sh
```

### Erro: "Jest não encontrado"
```bash
cd oconnector-frontend
npm install -D jest
```

### Erro: "Playwright não encontrado"
```bash
cd oconnector-frontend
npm install -D @playwright/test
npx playwright install
```

---

## 📊 INTERPRETAÇÃO DOS RESULTADOS

### Testes Unitários
- **Cobertura > 80%:** ✅ Excelente
- **Cobertura 50-80%:** ⚠️ Bom, mas pode melhorar
- **Cobertura < 50%:** ❌ Insuficiente

### Segurança
- **0 issues:** ✅ Seguro
- **1-2 issues:** ⚠️ Revisar
- **3+ issues:** ❌ Corrigir imediatamente

### Dependências
- **0 vulnerabilidades:** ✅ Atualizado
- **Vulnerabilidades low:** ⚠️ Atualizar quando possível
- **Vulnerabilidades moderate/high:** ❌ Atualizar urgente

---

## 🔄 INTEGRAÇÃO COM CI/CD

Estes scripts podem ser integrados em pipelines CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: ./scripts/security-check.sh
      - run: ./scripts/audit-dependencies.sh
      - run: ./scripts/test-unit.sh
      - run: ./scripts/test-integration.sh
```

---

**Última atualização:** 02/11/2024

