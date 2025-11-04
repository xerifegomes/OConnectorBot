"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { api } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false); // Garantir que só verifica uma vez

  useEffect(() => {
    // Se já verificou, não verificar novamente
    if (hasChecked.current) {
      return;
    }
    
    hasChecked.current = true;
    
    const checkAuth = () => {
      try {
        // Verificar se há token
        const token = localStorage.getItem("token");
        if (!token) {
          setIsChecking(false);
          router.replace("/login");
          return;
        }

        // Verificar se o token é válido localmente
        try {
          const payload = JSON.parse(atob(token));
          // Verificar expiração
          if (payload.exp && payload.exp < Date.now()) {
            // Token expirado
            api.clearToken();
            setIsChecking(false);
            router.replace("/login");
            return;
          }
        } catch (e) {
          // Token inválido (formato incorreto)
          api.clearToken();
          setIsChecking(false);
          router.replace("/login");
          return;
        }

        // Token parece válido localmente - permitir renderização
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        api.clearToken();
        setIsChecking(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}


