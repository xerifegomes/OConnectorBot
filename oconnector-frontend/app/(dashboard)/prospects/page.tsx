"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api, prospectar } from "@/lib/api";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prospectando, setProspectando] = useState(false);
  const [formData, setFormData] = useState({
    nicho: "",
    cidade: "",
  });

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    try {
      const response = await api.getProspects();
      if (response.success && response.data) {
        setProspects(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProspectar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProspectando(true);

    try {
      const response = await prospectar(formData.nicho, formData.cidade);
      if (response.success) {
        await loadProspects();
        setFormData({ nicho: "", cidade: "" });
      }
    } catch (error) {
      console.error("Erro ao prospectar:", error);
    } finally {
      setProspectando(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Prospects</h1>
        <p className="text-muted-foreground">
          Gerencie e encontre novos prospects para seu negócio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Prospects</CardTitle>
          <CardDescription>
            Digite o nicho e cidade para encontrar novos prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProspectar} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nicho">Nicho</Label>
                <Select
                  value={formData.nicho}
                  onValueChange={(value) =>
                    setFormData({ ...formData, nicho: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Imobiliária">Imobiliária</SelectItem>
                    <SelectItem value="Clínica/Consultório">Clínica/Consultório</SelectItem>
                    <SelectItem value="Salão de Beleza/Estética">Salão de Beleza/Estética</SelectItem>
                    <SelectItem value="Restaurante">Restaurante</SelectItem>
                    <SelectItem value="Academia">Academia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) =>
                    setFormData({ ...formData, cidade: e.target.value })
                  }
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={prospectando}>
              {prospectando ? "Prospectando..." : "Buscar Prospects"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prospects Encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          {prospects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum prospect encontrado. Use o formulário acima para buscar.
            </p>
          ) : (
            <div className="grid gap-4">
              {prospects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{prospect.nome || prospect.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {prospect.cidade || prospect.city} - {prospect.nicho || prospect.niche}
                    </p>
                  </div>
                  <Badge>{prospect.status || "Novo"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

