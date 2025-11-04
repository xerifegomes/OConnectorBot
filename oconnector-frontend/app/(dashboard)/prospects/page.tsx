"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api, prospectar } from "@/lib/api";
import { useBrasilLocation } from "@/lib/useBrasilLocation";
import { NICHOS_CATEGORIAS } from "@/lib/nichos";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<any[]>([]); // Prospects da busca atual
  const [prospectsSalvos, setProspectsSalvos] = useState<Set<string>>(new Set()); // IDs dos prospects salvos
  const [prospectsSalvosLista, setProspectsSalvosLista] = useState<any[]>([]); // Lista completa de prospects salvos
  const [loading, setLoading] = useState(false); // Não precisa de loading inicial
  const [loadingSalvos, setLoadingSalvos] = useState(false); // Loading para carregar salvos
  const [prospectando, setProspectando] = useState(false);
  const [salvando, setSalvando] = useState<string | null>(null); // ID do prospect sendo salvo
  const [enviando, setEnviando] = useState<string | null>(null); // ID do prospect sendo enviado
  const [deletando, setDeletando] = useState<string | null>(null); // ID do prospect sendo deletado
  const [abaAtiva, setAbaAtiva] = useState<"busca" | "historico">("busca"); // Aba ativa
  const [formData, setFormData] = useState({
    nicho: "",
    estado: "",
    cidade: "",
    bairro: "",
  });
  

  // Hook para gerenciar estados, cidades e bairros
  const {
    estados,
    cidades,
    bairros,
    distritos,
    estadoSelecionado,
    cidadeSelecionada,
    cidadeIdSelecionada,
    loadingEstados,
    loadingCidades,
    loadingBairros,
    loadingDistritos,
    setEstadoSelecionado,
    setCidadeId, // Usar ID da cidade
  } = useBrasilLocation();

  // Carregar prospects salvos ao montar
  useEffect(() => {
    loadProspectsSalvos();
  }, []);

  const loadProspectsSalvos = async () => {
    try {
      setLoadingSalvos(true);
      const response = await api.getProspects();
      
      // Se for erro 401, não fazer nada - o layout vai redirecionar
      if (!response.success && (response.error === "HTTP 401" || response.message?.includes("Token"))) {
        setLoadingSalvos(false);
        return;
      }
      
      if (response.success && response.data) {
        const prospectsData = Array.isArray(response.data) ? response.data : [];
        
        // Formatar os dados para o formato esperado pelo frontend
        const formattedProspects = prospectsData.map((p: any) => ({
          id: p.google_place_id || p.id,
          nome: p.nome,
          endereco: p.endereco,
          telefone: p.telefone,
          website: p.website,
          rating: p.rating,
          total_avaliacoes: p.total_avaliacoes,
          nicho: p.nicho,
          cidade: p.cidade,
          distancia: p.distancia,
          localizacao: p.localizacao || (p.localizacao_lat && p.localizacao_lng ? {
            lat: p.localizacao_lat,
            lng: p.localizacao_lng,
          } : null),
          contactado: p.contactado,
          status: p.status,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
        
        setProspectsSalvosLista(formattedProspects);
        
        const savedIds = new Set(
          prospectsData.map((p: any) => p.google_place_id || p.id)
        );
        setProspectsSalvos(savedIds);
        
        // Atualizar status dos prospects na lista atual se já foram contactados
        setProspects(prev => prev.map(prospect => {
          const saved = prospectsData.find((p: any) => (p.google_place_id || p.id) === prospect.id);
          if (saved) {
            return { ...prospect, contactado: saved.contactado, status: saved.status };
          }
          return prospect;
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar prospects salvos:", error);
    } finally {
      setLoadingSalvos(false);
    }
  };

  const handleSaveProspect = async (prospect: any) => {
    setSalvando(prospect.id);
    try {
      const response = await api.saveProspect(prospect);
      if (response.success) {
        setProspectsSalvos(prev => new Set([...prev, prospect.id]));
        alert("Prospect salvo com sucesso!");
      } else {
        alert(response.message || "Erro ao salvar prospect");
      }
    } catch (error) {
      console.error("Erro ao salvar prospect:", error);
      alert("Erro ao salvar prospect");
    } finally {
      setSalvando(null);
    }
  };

  const handleDeleteProspect = async (prospectId: string, isSaved: boolean) => {
    if (!confirm("Tem certeza que deseja deletar este prospect?")) {
      return;
    }

    setDeletando(prospectId);
    try {
      if (isSaved) {
        // Se está salvo, buscar o ID do banco e deletar
        const savedProspects = await api.getProspects();
        const savedProspect = Array.isArray(savedProspects.data) 
          ? savedProspects.data.find((p: any) => (p.google_place_id || p.id) === prospectId)
          : null;

        if (savedProspect) {
          const response = await api.deleteProspect(savedProspect.id);
          if (response.success) {
            setProspectsSalvos(prev => {
              const newSet = new Set(prev);
              newSet.delete(prospectId);
              return newSet;
            });
            // Também remover da lista local se estiver lá
            setProspects(prev => prev.filter(p => p.id !== prospectId));
            alert("Prospect deletado com sucesso!");
          } else {
            alert(response.message || "Erro ao deletar prospect");
          }
        } else {
          alert("Prospect não encontrado na lista salva");
        }
      } else {
        // Se não está salvo, apenas remover da lista local
        setProspects(prev => prev.filter(p => p.id !== prospectId));
        alert("Prospect removido da lista!");
      }
    } catch (error) {
      console.error("Erro ao deletar prospect:", error);
      alert("Erro ao deletar prospect");
    } finally {
      setDeletando(null);
    }
  };

  const handleSendToBot = async (prospect: any) => {
    if (!prospect.telefone) {
      alert("Este prospect não tem telefone cadastrado.");
      return;
    }

    setEnviando(prospect.id);
    try {
      // Primeiro salvar se ainda não estiver salvo
      if (!prospectsSalvos.has(prospect.id)) {
        await handleSaveProspect(prospect);
      }

      // Buscar o ID do prospect salvo
      const savedProspects = await api.getProspects();
      const savedProspect = Array.isArray(savedProspects.data) 
        ? savedProspects.data.find((p: any) => (p.google_place_id || p.id) === prospect.id)
        : null;

      if (savedProspect) {
        const response = await api.sendProspectToBot(savedProspect.id);
        if (response.success) {
          alert("Prospect enviado para o bot com sucesso!");
          // Recarregar lista de salvos para atualizar status
          await loadProspectsSalvos();
        } else {
          alert(response.message || "Erro ao enviar prospect");
        }
      } else {
        alert("Erro: Prospect não encontrado na lista salva");
      }
    } catch (error) {
      console.error("Erro ao enviar prospect:", error);
      alert("Erro ao enviar prospect para o bot");
    } finally {
      setEnviando(null);
    }
  };

  const [errorProspectar, setErrorProspectar] = useState("");

  const handleProspectar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProspectando(true);
    setErrorProspectar("");

    // Validação
    if (!formData.nicho) {
      setErrorProspectar("Selecione um nicho");
      setProspectando(false);
      return;
    }

    if (!cidadeSelecionada) {
      setErrorProspectar("Selecione uma cidade");
      setProspectando(false);
      return;
    }

    try {
      // Montar a string de localização completa
      const localizacao = [
        formData.bairro && formData.bairro.trim() ? formData.bairro : null,
        cidadeSelecionada,
        estadoSelecionado ? estados.find(e => e.sigla === estadoSelecionado)?.nome : null,
      ]
        .filter(Boolean)
        .join(", ");

      const cidadeFinal = localizacao || cidadeSelecionada;
      
      if (!cidadeFinal) {
        setErrorProspectar("Localização inválida");
        setProspectando(false);
        return;
      }

      console.log("Prospectando:", { nicho: formData.nicho, cidade: cidadeFinal });
      const response = await prospectar(formData.nicho, cidadeFinal);
      
      console.log("Resposta da API:", response);
      
      if (response.success) {
        // Adicionar novos resultados à lista existente (evitar duplicatas)
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setProspects(prev => {
            const existingIds = new Set(prev.map((p: any) => p.id));
            const newProspects = response.data.filter((p: any) => !existingIds.has(p.id));
            
            if (newProspects.length === 0) {
              setErrorProspectar("Todos os resultados já estão na lista.");
              return prev;
            }
            
            // Combinar lista anterior com novos (sem duplicatas)
            const combined = [...prev, ...newProspects];
            setErrorProspectar(""); // Limpar erro se houver sucesso
            return combined;
          });
        } else {
          // Se não há resultados novos, verificar se já temos resultados
          if (prospects.length === 0) {
            setErrorProspectar("Nenhum prospect encontrado para os critérios selecionados.");
          } else {
            setErrorProspectar("Nenhum prospect novo encontrado. Todos já estão na lista.");
          }
        }
        // NÃO resetar o formulário - deixar o usuário ajustar os filtros se necessário
      } else {
        setErrorProspectar(response.message || response.error || "Erro ao buscar prospects");
        // NÃO limpar lista em caso de erro - manter resultados anteriores
      }
    } catch (error: any) {
      console.error("Erro ao prospectar:", error);
      setErrorProspectar(error.message || "Erro ao conectar com o servidor");
    } finally {
      setProspectando(false);
    }
  };

  // Sincronizar estado selecionado com formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, estado: estadoSelecionado }));
  }, [estadoSelecionado]);

  // Sincronizar cidade selecionada com formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, cidade: cidadeSelecionada }));
  }, [cidadeSelecionada]);
  
  // Usar distritos como bairros (mais completo)
  const bairrosParaExibir = distritos && distritos.length > 0 ? distritos : bairros;

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

      {/* Tabs para alternar entre busca e histórico */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setAbaAtiva("busca")}
          className={`px-4 py-2 font-medium transition-colors ${
            abaAtiva === "busca"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🔍 Buscar Prospects
        </button>
        <button
          onClick={() => {
            setAbaAtiva("historico");
            loadProspectsSalvos(); // Recarregar ao clicar
          }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            abaAtiva === "historico"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📋 Histórico de Prospects ({prospectsSalvosLista.length})
        </button>
      </div>

      {/* Conteúdo da aba de busca */}
      {abaAtiva === "busca" && (
        <>
      <Card>
        <CardHeader>
          <CardTitle>Buscar Prospects</CardTitle>
          <CardDescription>
            Selecione o nicho e a localização (estado, cidade e bairro/distrito) para encontrar novos prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProspectar} className="space-y-4">
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
                  <SelectContent className="max-h-[400px] overflow-y-auto">
                    {Object.entries(NICHOS_CATEGORIAS).map(([categoria, nichos], index) => (
                      <div key={categoria}>
                        {index > 0 && <div className="border-t my-1" />}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-background">
                          {categoria}
                        </div>
                        {nichos.map((nicho) => (
                          <SelectItem key={nicho.value} value={nicho.value}>
                            {nicho.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={estadoSelecionado}
                  onValueChange={setEstadoSelecionado}
                  disabled={loadingEstados}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.sigla}>
                        {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Select
                  value={cidadeIdSelecionada ? String(cidadeIdSelecionada) : ""}
                  onValueChange={(cidadeId) => setCidadeId(Number(cidadeId))}
                  disabled={!estadoSelecionado || loadingCidades}
                  required
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !estadoSelecionado 
                          ? "Selecione primeiro o estado" 
                          : loadingCidades 
                          ? "Carregando..." 
                          : "Selecione a cidade"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade.id} value={String(cidade.id)}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro/Distrito (Opcional)</Label>
                {bairrosParaExibir && bairrosParaExibir.length > 0 ? (
                  <Select
                    value={formData.bairro || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bairro: value === "__all__" ? "" : value })
                    }
                    disabled={!cidadeSelecionada || loadingBairros || loadingDistritos}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !cidadeSelecionada 
                            ? "Selecione primeiro a cidade" 
                            : (loadingBairros || loadingDistritos)
                            ? "Carregando..." 
                            : "Selecione o bairro/distrito (opcional)"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos os bairros/distritos</SelectItem>
                      {bairrosParaExibir.map((bairro: any) => (
                        <SelectItem key={bairro.id} value={bairro.nome}>
                          {bairro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) =>
                      setFormData({ ...formData, bairro: e.target.value })
                    }
                    placeholder="Digite o bairro (opcional)"
                    disabled={!cidadeSelecionada || loadingBairros || loadingDistritos}
                  />
                )}
              </div>
            </div>

            {errorProspectar && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {errorProspectar}
              </div>
            )}
            <Button type="submit" disabled={prospectando || !estadoSelecionado || !cidadeSelecionada}>
              {prospectando ? "Prospectando..." : "Buscar Prospects"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prospects Encontrados ({prospects.length})</CardTitle>
          <CardDescription>
            Resultados da busca no Google Places
          </CardDescription>
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
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{prospect.nome || prospect.name}</h3>
                      {prospect.endereco && (
                        <p className="text-sm text-muted-foreground mt-1">
                          📍 {prospect.endereco}
                        </p>
                      )}
                    </div>
                    {prospect.distancia !== null && (
                      <Badge variant="outline" className="ml-2">
                        {prospect.distancia} km
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-2 mt-3 text-sm">
                    {prospect.telefone && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">📞</span>
                        <a 
                          href={`tel:${prospect.telefone}`}
                          className="text-primary hover:underline"
                        >
                          {prospect.telefone}
                        </a>
                      </div>
                    )}
                    
                    {prospect.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">🌐</span>
                        <a 
                          href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                          title={prospect.website}
                        >
                          {prospect.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                        </a>
                      </div>
                    )}
                    
                    {prospect.redes_sociais && Array.isArray(prospect.redes_sociais) && prospect.redes_sociais.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap col-span-2">
                        <span className="text-muted-foreground">📱</span>
                        <span className="text-xs text-muted-foreground">Redes:</span>
                        {prospect.redes_sociais.slice(0, 3).map((url: string, idx: number) => (
                          <a 
                            key={idx}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs"
                            title={url}
                          >
                            {url.includes('instagram') ? '📷 Instagram' : 
                             url.includes('facebook') ? '👥 Facebook' :
                             url.includes('whatsapp') ? '💬 WhatsApp' :
                             url.includes('linkedin') ? '💼 LinkedIn' : '🔗 Link'}
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {prospect.rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">⭐</span>
                        <span>
                          {prospect.rating.toFixed(1)}
                          {prospect.total_avaliacoes > 0 && (
                            <span className="text-muted-foreground">
                              {' '}({prospect.total_avaliacoes} avaliações)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {prospect.nicho && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">🏷️</span>
                        <Badge variant="secondary">{prospect.nicho}</Badge>
                      </div>
                    )}
                  </div>
                  
                  {prospect.localizacao && (
                    <div className="mt-3">
                      <a
                        href={`https://www.google.com/maps?q=${prospect.localizacao.lat},${prospect.localizacao.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Ver no Google Maps
                      </a>
                    </div>
                  )}
                  
                  {/* Botões de ação */}
                  <div className="mt-4 flex gap-2 flex-wrap items-center">
                    {prospectsSalvos.has(prospect.id) ? (
                      <div className="flex gap-2 items-center">
                        <Badge variant="secondary">
                          ✅ Salvo
                        </Badge>
                        {prospect.contactado && (
                          <Badge variant="default" className="bg-green-600">
                            📞 Contactado
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveProspect(prospect)}
                        disabled={salvando === prospect.id}
                      >
                        {salvando === prospect.id ? "Salvando..." : "💾 Salvar na Lista"}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleSendToBot(prospect)}
                      disabled={enviando === prospect.id || !prospect.telefone || prospect.contactado}
                      title={!prospect.telefone ? "Este prospect não tem telefone cadastrado" : prospect.contactado ? "Já foi contactado" : ""}
                    >
                      {enviando === prospect.id ? "Enviando..." : prospect.contactado ? "✅ Já Contactado" : "📤 Enviar para Bot"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProspect(prospect.id, prospectsSalvos.has(prospect.id))}
                      disabled={deletando === prospect.id}
                    >
                      {deletando === prospect.id ? "Deletando..." : "🗑️ Remover"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}

      {/* Conteúdo da aba de histórico */}
      {abaAtiva === "historico" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Histórico de Prospects Salvos</CardTitle>
                <CardDescription>
                  Todos os prospects que você salvou anteriormente ({prospectsSalvosLista.length} total)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProspectsSalvos}
                disabled={loadingSalvos}
              >
                {loadingSalvos ? "Atualizando..." : "🔄 Atualizar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSalvos ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : prospectsSalvosLista.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum prospect salvo ainda. Use a aba "Buscar Prospects" para encontrar e salvar prospects.
              </p>
            ) : (
              <div className="grid gap-4">
                {prospectsSalvosLista.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{prospect.nome}</h3>
                        {prospect.endereco && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📍 {prospect.endereco}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        {prospect.distancia !== null && (
                          <Badge variant="outline" className="ml-2">
                            {prospect.distancia} km
                          </Badge>
                        )}
                        {prospect.contactado && (
                          <Badge variant="default" className="bg-green-600">
                            📞 Contactado
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          ✅ Salvo
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-2 mt-3 text-sm">
                      {prospect.telefone && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">📞</span>
                          <a 
                            href={`tel:${prospect.telefone}`}
                            className="text-primary hover:underline"
                          >
                            {prospect.telefone}
                          </a>
                        </div>
                      )}
                      
                      {prospect.website && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">🌐</span>
                          <a 
                            href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                            title={prospect.website}
                          >
                            {prospect.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                          </a>
                        </div>
                      )}
                      
                      {prospect.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">⭐</span>
                          <span>
                            {prospect.rating.toFixed(1)}
                            {prospect.total_avaliacoes > 0 && (
                              <span className="text-muted-foreground">
                                {' '}({prospect.total_avaliacoes} avaliações)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {prospect.nicho && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">🏷️</span>
                          <Badge variant="secondary">{prospect.nicho}</Badge>
                        </div>
                      )}

                      {prospect.created_at && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">📅</span>
                          <span className="text-xs text-muted-foreground">
                            Salvo em: {new Date(prospect.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {prospect.localizacao && (
                      <div className="mt-3">
                        <a
                          href={`https://www.google.com/maps?q=${prospect.localizacao.lat},${prospect.localizacao.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Ver no Google Maps
                        </a>
                      </div>
                    )}
                    
                    {/* Botões de ação */}
                    <div className="mt-4 flex gap-2 flex-wrap items-center">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleSendToBot(prospect)}
                        disabled={enviando === prospect.id || !prospect.telefone || prospect.contactado}
                        title={!prospect.telefone ? "Este prospect não tem telefone cadastrado" : prospect.contactado ? "Já foi contactado" : ""}
                      >
                        {enviando === prospect.id ? "Enviando..." : prospect.contactado ? "✅ Já Contactado" : "📤 Enviar para Bot"}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProspect(prospect.id, true)}
                        disabled={deletando === prospect.id}
                      >
                        {deletando === prospect.id ? "Deletando..." : "🗑️ Deletar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

