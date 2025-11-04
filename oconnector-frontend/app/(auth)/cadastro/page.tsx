"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    empresa: "",
    nicho: "",
    senha: "",
    confirmarSenha: "",
    plano: searchParams.get("plano")?.toUpperCase() || "STARTER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.senha.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        empresa: formData.empresa,
        nicho: formData.nicho,
        senha: formData.senha,
      });

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        router.push("/dashboard");
      } else {
        setError(response.message || "Erro ao criar conta");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">oConnector</CardTitle>
        <CardDescription className="text-center">
          Criar conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp: formatWhatsApp(e.target.value),
                  })
                }
                maxLength={15}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Nome da Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) =>
                  setFormData({ ...formData, empresa: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nicho">Nicho de Atuação</Label>
            <Select
              value={formData.nicho || undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, nicho: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nicho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Imobiliária">Imobiliária</SelectItem>
                <SelectItem value="Clínica/Consultório">Clínica/Consultório</SelectItem>
                <SelectItem value="Salão de Beleza/Estética">Salão de Beleza/Estética</SelectItem>
                <SelectItem value="Estética">Estética</SelectItem>
                <SelectItem value="Design de Sobrancelhas">Design de Sobrancelhas</SelectItem>
                <SelectItem value="Restaurante">Restaurante</SelectItem>
                <SelectItem value="Academia">Academia</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                minLength={8}
                value={formData.senha}
                onChange={(e) =>
                  setFormData({ ...formData, senha: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) =>
                  setFormData({ ...formData, confirmarSenha: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select
              value={formData.plano}
              onValueChange={(value) =>
                setFormData({ ...formData, plano: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STARTER">Starter - R$ 2.500 + R$ 500/mês</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional - R$ 4.500 + R$ 600/mês</SelectItem>
                <SelectItem value="PREMIUM">Premium - R$ 7.500 + R$ 900/mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Já tem uma conta? Fazer login
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          <Link href="/" className="text-muted-foreground hover:underline">
            ← Voltar para o site
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">oConnector</CardTitle>
          <CardDescription className="text-center">Carregando...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <RegisterForm />
    </Suspense>
  );
}

