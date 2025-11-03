"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    leadsHoje: 0,
    taxaConversao: 0,
    mensagensBot: 0,
    statusBot: "Desconhecido",
  });
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Obter dados do cliente
      const clienteResponse = await api.getMyData();
      const clienteId = clienteResponse.data?.id;

      if (clienteId) {
        // Carregar estatísticas
        const statsResponse = await api.getLeadsStats(clienteId);
        if (statsResponse.success && statsResponse.data) {
          setStats({
            leadsHoje: statsResponse.data.leadsHoje || 0,
            taxaConversao: statsResponse.data.taxaConversao || 0,
            mensagensBot: statsResponse.data.mensagensBot || 0,
            statusBot: statsResponse.data.statusBot || "Inativo",
          });
        }

        // Carregar leads recentes
        const leadsResponse = await api.getLeads(clienteId);
        if (leadsResponse.success && leadsResponse.data) {
          const leadsData = Array.isArray(leadsResponse.data)
            ? leadsResponse.data
            : (leadsResponse.data as any)?.leads || [];
          setLeads(leadsData.slice(0, 10));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground">
          Acompanhe suas métricas e leads em tempo real
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Hoje</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsHoje}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaConversao}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Bot</CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mensagensBot}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Bot</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <Badge variant={stats.statusBot === "Ativo" ? "default" : "secondary"}>
              {stats.statusBot}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Leads Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.nome || "-"}</TableCell>
                    <TableCell>{lead.whatsapp || lead.telefone || "-"}</TableCell>
                    <TableCell>
                      {new Date(lead.data_criacao || lead.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge>{lead.status || "Novo"}</Badge>
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

