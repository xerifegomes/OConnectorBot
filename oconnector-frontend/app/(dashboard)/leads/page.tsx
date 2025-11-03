"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const clienteResponse = await api.getMyData();
      const clienteId = clienteResponse.data?.id;

      if (clienteId) {
        const response = await api.getLeads(clienteId);
        if (response.success && response.data) {
          const leadsData = Array.isArray(response.data)
            ? response.data
            : (response.data as any)?.leads || [];
          setLeads(leadsData);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Nome", "WhatsApp", "Data", "Status"];
    const rows = filteredLeads.map((lead) => [
      lead.nome || "",
      lead.whatsapp || lead.telefone || "",
      new Date(lead.data_criacao || lead.created_at).toLocaleDateString("pt-BR"),
      lead.status || "Novo",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (lead.nome || "").toLowerCase().includes(searchLower) ||
      (lead.whatsapp || "").includes(search) ||
      (lead.telefone || "").includes(search)
    );
  });

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Leads Capturados</h1>
        <p className="text-muted-foreground">
          Gerencie todos os leads capturados pelo seu bot
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Leads</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button onClick={exportCSV} variant="outline">
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.nome || "-"}</TableCell>
                    <TableCell>{lead.whatsapp || lead.telefone || "-"}</TableCell>
                    <TableCell>
                      {new Date(lead.data_criacao || lead.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge>{lead.status || "Novo"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

