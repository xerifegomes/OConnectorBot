# 📦 COMPONENTES FALTANTES - Priorizados

**Data:** 02/11/2024  
**Versão:** 1.0

---

## 🔴 PRIORIDADE CRÍTICA

### 1. Middleware de Autenticação
- **Arquivo:** `app/middleware.ts`
- **Prioridade:** 🔴 CRÍTICA
- **Status:** ❌ Não existe
- **Descrição:** Verificação server-side de autenticação antes de servir páginas
- **Impacto:** Sem proteção real de rotas protegidas
- **Código Base:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/leads', '/prospects'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*', '/prospects/:path*'],
};
```
- **Prazo:** Dia 1-2
- **Dificuldade:** ⭐⭐ (Média)

---

### 2. Error Boundaries
- **Arquivos:** 
  - `app/error.tsx`
  - `app/global-error.tsx`
- **Prioridade:** 🔴 CRÍTICA
- **Status:** ❌ Não existe
- **Descrição:** Captura de erros React para prevenir crashes
- **Impacto:** Erros não tratados quebram toda a aplicação
- **Código Base para `error.tsx`:**
```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
```
- **Prazo:** Dia 3-4
- **Dificuldade:** ⭐ (Baixa)

---

### 3. Validação Zod Completa
- **Arquivos:** 
  - `lib/validations/auth.ts`
  - `lib/validations/forms.ts`
- **Prioridade:** 🔴 CRÍTICA
- **Status:** ⚠️ Zod instalado mas não usado
- **Descrição:** Schemas de validação com Zod para formulários
- **Impacto:** Dados inválidos podem ser enviados
- **Código Base para `lib/validations/auth.ts`:**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().regex(/^\d{10,11}$/, 'WhatsApp inválido'),
  empresa: z.string().min(2, 'Nome da empresa inválido'),
  nicho: z.string().min(2, 'Nicho inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```
- **Prazo:** Dia 1-2
- **Dificuldade:** ⭐⭐ (Média)

---

## 🟡 PRIORIDADE ALTA

### 4. Loading States
- **Arquivos:**
  - `app/(dashboard)/loading.tsx`
  - `app/(dashboard)/dashboard/loading.tsx`
  - `app/(dashboard)/leads/loading.tsx`
- **Prioridade:** 🟡 ALTA
- **Status:** ⚠️ Parcial (alguns componentes têm, outros não)
- **Descrição:** Estados de carregamento para melhorar UX
- **Impacto:** Usuário não sabe quando algo está carregando
- **Código Base:**
```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```
- **Prazo:** Dia 5-6
- **Dificuldade:** ⭐ (Baixa)

---

### 5. Types TypeScript Globais
- **Arquivos:**
  - `types/api.ts`
  - `types/user.ts`
  - `types/lead.ts`
  - `types/index.ts`
- **Prioridade:** 🟡 ALTA
- **Status:** ❌ Não existe (uso excessivo de `any`)
- **Descrição:** Interfaces e tipos globais para type safety
- **Impacto:** Perda de type safety e autocomplete
- **Código Base para `types/api.ts`:**
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  empresa: string;
  nicho: string;
}

export interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  status: string;
  data_criacao: string;
}
```
- **Prazo:** Dia 5-6
- **Dificuldade:** ⭐ (Baixa)

---

### 6. Not Found Page
- **Arquivo:** `app/not-found.tsx`
- **Prioridade:** 🟡 ALTA
- **Status:** ❌ Não existe
- **Descrição:** Página 404 customizada
- **Impacto:** 404 padrão não é informativo
- **Código Base:**
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">Página não encontrada</p>
      <Link href="/">
        <Button>Voltar para home</Button>
      </Link>
    </div>
  );
}
```
- **Prazo:** Dia 5-6
- **Dificuldade:** ⭐ (Baixa)

---

## 🟢 PRIORIDADE MÉDIA

### 7. Custom Hooks
- **Pasta:** `hooks/`
- **Arquivos:**
  - `hooks/useAuth.ts`
  - `hooks/useApi.ts`
  - `hooks/useLocalStorage.ts`
- **Prioridade:** 🟢 MÉDIA
- **Status:** ❌ Não existe
- **Descrição:** Hooks reutilizáveis para lógica comum
- **Impacto:** Código duplicado e menos reutilizável
- **Código Base para `hooks/useAuth.ts`:**
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const response = await api.verify();
      if (response.success) {
        setUser(response.data.user);
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  return { user, loading };
}
```
- **Prazo:** Semana 2
- **Dificuldade:** ⭐⭐ (Média)

---

### 8. Test Utilities
- **Arquivo:** `lib/test-utils.tsx`
- **Prioridade:** 🟢 MÉDIA
- **Status:** ❌ Não existe
- **Descrição:** Utilitários para facilitar testes
- **Impacto:** Testes mais difíceis de escrever
- **Código Base:**
```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```
- **Prazo:** Semana 2
- **Dificuldade:** ⭐ (Baixa)

---

### 9. Loading Skeleton Components
- **Arquivos:**
  - `components/ui/skeleton.tsx`
- **Prioridade:** 🟢 MÉDIA
- **Status:** ❌ Não existe
- **Descrição:** Componentes skeleton para loading states
- **Impacto:** UX melhorável
- **Prazo:** Semana 2
- **Dificuldade:** ⭐ (Baixa)

---

### 10. Toast/Notification System
- **Arquivos:**
  - `components/ui/toast.tsx`
  - `components/ui/toaster.tsx`
- **Prioridade:** 🟢 MÉDIA
- **Status:** ❌ Não existe
- **Descrição:** Sistema de notificações para feedback ao usuário
- **Impacto:** Melhor feedback visual
- **Prazo:** Semana 2
- **Dificuldade:** ⭐⭐ (Média)

---

## 📊 RESUMO

| Prioridade | Quantidade | Implementados | Faltantes |
|-----------|------------|---------------|-----------|
| 🔴 Crítica | 3 | 0 | 3 |
| 🟡 Alta | 3 | 0 | 3 |
| 🟢 Média | 4 | 0 | 4 |
| **TOTAL** | **10** | **0** | **10** |

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Segurança (Dias 1-2)
1. ✅ Middleware de Autenticação
2. ✅ Validação Zod Completa

### Fase 2: Robustez (Dias 3-4)
3. ✅ Error Boundaries

### Fase 3: Qualidade (Dias 5-6)
4. ✅ Loading States
5. ✅ Types TypeScript
6. ✅ Not Found Page

### Fase 4: Melhorias (Semana 2)
7. Custom Hooks
8. Test Utilities
9. Loading Skeletons
10. Toast System

---

**Última atualização:** 02/11/2024

