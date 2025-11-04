import { useState, useEffect, useCallback } from 'react';

interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

interface Cidade {
  id: number;
  nome: string;
  estado_id: number;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

interface Distrito {
  id: number;
  nome: string;
  municipio: {
    id: number;
    nome: string;
  };
}

/**
 * Hook customizado para gerenciar estados, cidades e bairros do Brasil
 * Usa a API oficial do IBGE (servicodados.ibge.gov.br) para buscar dados atualizados
 * Referência: https://servicodados.ibge.gov.br/api/docs/localidades
 */
export function useBrasilLocation() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [loadingDistritos, setLoadingDistritos] = useState(false);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>(''); // Sigla do estado
  const [estadoIdSelecionado, setEstadoIdSelecionado] = useState<number | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>(''); // Nome da cidade
  const [cidadeIdSelecionada, setCidadeIdSelecionada] = useState<number | null>(null);

  // Carregar estados ao montar o componente
  useEffect(() => {
    loadEstados();
  }, []);

  // Carregar cidades quando estado for selecionado
  useEffect(() => {
    if (estadoIdSelecionado) {
      loadCidades(estadoIdSelecionado);
    } else {
      setCidades([]);
      setDistritos([]);
      setCidadeSelecionada('');
      setCidadeIdSelecionada(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoIdSelecionado]);

  // Carregar distritos (bairros) quando cidade for selecionada
  useEffect(() => {
    if (cidadeIdSelecionada) {
      loadDistritos(cidadeIdSelecionada);
    } else {
      setDistritos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeIdSelecionada]);

  const loadEstados = async () => {
    setLoadingEstados(true);
    try {
      // Usar API oficial do IBGE
      const response = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
      );
      if (response.ok) {
        const data = await response.json();
        setEstados(data);
      } else {
        // Fallback: usar dados estáticos dos 27 estados
        setEstados(getEstadosFallback());
      }
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      // Fallback: usar dados estáticos
      setEstados(getEstadosFallback());
    } finally {
      setLoadingEstados(false);
    }
  };

  const loadCidades = async (estadoId: number) => {
    setLoadingCidades(true);
    setCidades([]);
    setDistritos([]);
    setCidadeSelecionada('');
    setCidadeIdSelecionada(null);
    
    try {
      // Usar API oficial do IBGE - Municípios por UF
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`
      );
      if (response.ok) {
        const data = await response.json();
        setCidades(data);
      } else {
        // Fallback: tentar buscar por sigla se disponível
        const estado = estados.find(e => e.id === estadoId);
        if (estado) {
          const cidadesFallback = getCidadesFallback(estado.sigla);
          setCidades(cidadesFallback as any);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      // Fallback: usar dados estáticos
      const estado = estados.find(e => e.id === estadoId);
      if (estado) {
        const cidadesFallback = getCidadesFallback(estado.sigla);
        setCidades(cidadesFallback as any);
      }
    } finally {
      setLoadingCidades(false);
    }
  };

  const loadDistritos = async (municipioId: number) => {
    setLoadingDistritos(true);
    setDistritos([]);
    
    try {
      // Usar API oficial do IBGE - Distritos por município
      // Os distritos são a subdivisão administrativa mais próxima de "bairros"
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${municipioId}/distritos?orderBy=nome`
      );
      if (response.ok) {
        const data = await response.json();
        setDistritos(data);
      } else {
        // Se não houver distritos na API, retornar array vazio
        // O usuário poderá digitar o bairro manualmente
        setDistritos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar distritos:', error);
      setDistritos([]);
    } finally {
      setLoadingDistritos(false);
    }
  };

  const handleEstadoChange = useCallback((sigla: string) => {
    if (!sigla || sigla === '') {
      // Reset completo
      setEstadoSelecionado('');
      setEstadoIdSelecionado(null);
      setCidadeSelecionada('');
      setCidadeIdSelecionada(null);
      setCidades([]);
      setDistritos([]);
      return;
    }
    
    const estado = estados.find(e => e.sigla === sigla);
    if (estado) {
      setEstadoSelecionado(sigla);
      setEstadoIdSelecionado(estado.id);
      setCidadeSelecionada('');
      setCidadeIdSelecionada(null);
      setCidades([]);
      setDistritos([]);
    }
  }, [estados]);

  const handleCidadeChange = useCallback((cidadeId: number) => {
    const cidade = cidades.find(c => c.id === cidadeId);
    if (cidade) {
      setCidadeSelecionada(cidade.nome);
      setCidadeIdSelecionada(cidade.id);
      setDistritos([]);
    }
  }, [cidades]);

  return {
    estados,
    cidades,
    distritos, // Retornamos distritos como "bairros"
    bairros: distritos, // Alias para compatibilidade
    estadoSelecionado,
    estadoIdSelecionado,
    cidadeSelecionada,
    cidadeIdSelecionada,
    loadingEstados,
    loadingCidades,
    loadingBairros: loadingDistritos, // Alias para compatibilidade
    loadingDistritos,
    setEstadoSelecionado: handleEstadoChange,
    setCidadeSelecionada: handleCidadeChange,
    setCidadeId: handleCidadeChange,
  };
}

// Dados estáticos de fallback para estados (com IDs do IBGE)
function getEstadosFallback(): Estado[] {
  return [
    { id: 12, nome: 'Acre', sigla: 'AC' },
    { id: 27, nome: 'Alagoas', sigla: 'AL' },
    { id: 16, nome: 'Amapá', sigla: 'AP' },
    { id: 13, nome: 'Amazonas', sigla: 'AM' },
    { id: 29, nome: 'Bahia', sigla: 'BA' },
    { id: 23, nome: 'Ceará', sigla: 'CE' },
    { id: 53, nome: 'Distrito Federal', sigla: 'DF' },
    { id: 32, nome: 'Espírito Santo', sigla: 'ES' },
    { id: 52, nome: 'Goiás', sigla: 'GO' },
    { id: 21, nome: 'Maranhão', sigla: 'MA' },
    { id: 51, nome: 'Mato Grosso', sigla: 'MT' },
    { id: 50, nome: 'Mato Grosso do Sul', sigla: 'MS' },
    { id: 31, nome: 'Minas Gerais', sigla: 'MG' },
    { id: 15, nome: 'Pará', sigla: 'PA' },
    { id: 25, nome: 'Paraíba', sigla: 'PB' },
    { id: 41, nome: 'Paraná', sigla: 'PR' },
    { id: 26, nome: 'Pernambuco', sigla: 'PE' },
    { id: 22, nome: 'Piauí', sigla: 'PI' },
    { id: 33, nome: 'Rio de Janeiro', sigla: 'RJ' },
    { id: 24, nome: 'Rio Grande do Norte', sigla: 'RN' },
    { id: 43, nome: 'Rio Grande do Sul', sigla: 'RS' },
    { id: 11, nome: 'Rondônia', sigla: 'RO' },
    { id: 14, nome: 'Roraima', sigla: 'RR' },
    { id: 42, nome: 'Santa Catarina', sigla: 'SC' },
    { id: 35, nome: 'São Paulo', sigla: 'SP' },
    { id: 28, nome: 'Sergipe', sigla: 'SE' },
    { id: 17, nome: 'Tocantins', sigla: 'TO' },
  ];
}

// Dados estáticos de fallback para cidades principais
function getCidadesFallback(estadoSigla: string): Cidade[] {
  const cidadesPorEstado: Record<string, string[]> = {
    'SP': ['São Paulo', 'Campinas', 'Guarulhos', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'Mauá'],
    'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Campos dos Goytacazes', 'Belford Roxo', 'São João de Meriti', 'Petrópolis', 'Volta Redonda'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Jequié', 'Alagoinhas', 'Barreiras'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'],
    'PA': ['Belém', 'Ananindeua', 'Marituba', 'Paragominas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Bragança', 'Altamira', 'Santarém'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga', 'Maués', 'Humaitá', 'São Gabriel da Cachoeira'],
    'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Monteiro', 'Guarabira', 'Cabedelo'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Açu', 'Currais Novos', 'Nova Cruz', 'Apodi'],
    'AL': ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'Santana do Ipanema', 'Penedo', 'Coruripe', 'São Miguel dos Campos', 'Marechal Deodoro'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças', 'Primavera do Leste'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Paranaíba', 'Aquidauana', 'Sidrolândia'],
    'MA': ['São Luís', 'Imperatriz', 'Caxias', 'Timon', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Buritis'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Formoso do Araguaia', 'Dianópolis', 'Taguatinga'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'União', 'Pedro II', 'São Raimundo Nonato'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Propriá', 'Tobias Barreto', 'Simão Dias', 'Barra dos Coqueiros'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Pacaraima', 'Bonfim', 'Mucajaí', 'Cantá', 'Normandia', 'Iracema'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Vitória do Jari', 'Ferreira Gomes', 'Tartarugalzinho', 'Porto Grande', 'Calçoene'],
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasiléia', 'Xapuri', 'Plácido de Castro', 'Epitaciolândia', 'Mâncio Lima'],
    'DF': ['Brasília', 'Ceilândia', 'Taguatinga', 'Sobradinho', 'Planaltina', 'Gama', 'Santa Maria', 'São Sebastião', 'Samambaia', 'Guará'],
  };

  const cidades = cidadesPorEstado[estadoSigla] || [];
  // Encontrar o ID do estado para usar no estado_id
  const estadoId = getEstadoIdBySigla(estadoSigla);
  
  return cidades.map((nome, index) => ({
    id: estadoId * 10000 + index, // IDs únicos baseados no estado
    nome,
    estado_id: estadoId,
    microrregiao: {
      id: 0,
      nome: '',
      mesorregiao: {
        id: 0,
        nome: '',
        UF: {
          id: estadoId,
          sigla: estadoSigla,
          nome: getEstadoNomeBySigla(estadoSigla),
        },
      },
    },
  }));
}

// Helper para obter ID do estado por sigla
function getEstadoIdBySigla(sigla: string): number {
  const estadosMap: Record<string, number> = {
    'AC': 12, 'AL': 27, 'AP': 16, 'AM': 13, 'BA': 29, 'CE': 23, 'DF': 53,
    'ES': 32, 'GO': 52, 'MA': 21, 'MT': 51, 'MS': 50, 'MG': 31, 'PA': 15,
    'PB': 25, 'PR': 41, 'PE': 26, 'PI': 22, 'RJ': 33, 'RN': 24, 'RS': 43,
    'RO': 11, 'RR': 14, 'SC': 42, 'SP': 35, 'SE': 28, 'TO': 17,
  };
  return estadosMap[sigla] || 0;
}

// Helper para obter nome do estado por sigla
function getEstadoNomeBySigla(sigla: string): string {
  const estadosMap: Record<string, string> = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
    'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
    'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
    'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
    'SE': 'Sergipe', 'TO': 'Tocantins',
  };
  return estadosMap[sigla] || '';
}

// Dados estáticos de fallback para bairros das principais cidades
function getBairrosFallback(cidadeNome: string, estadoSigla: string): Distrito[] {
  // Dados de bairros para as principais cidades
  const bairrosPorCidade: Record<string, string[]> = {
    'São Paulo-SP': ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Vila Mariana', 'Pinheiros', 'Moema', 'Jardins', 'Bela Vista', 'Liberdade', 'Consolação'],
    'Rio de Janeiro-RJ': ['Centro', 'Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Tijuca', 'Botafogo', 'Flamengo', 'Laranjeiras', 'Santa Teresa', 'Lapa', 'Gloria'],
    'Belo Horizonte-MG': ['Centro', 'Savassi', 'Funcionários', 'Lourdes', 'São Pedro', 'Pampulha', 'Santa Tereza', 'Barro Preto', 'Cruzeiro', 'Santo Antônio', 'Lagoinha', 'Cidade Nova'],
    'Porto Alegre-RS': ['Centro Histórico', 'Moinhos de Vento', 'Bom Fim', 'Cidade Baixa', 'Tristeza', 'Ipanema', 'Jardim do Salso', 'Partenon', 'Restinga', 'Belém Novo', 'Cristal', 'Partenon'],
    'Curitiba-PR': ['Centro', 'Batel', 'Água Verde', 'Boa Vista', 'Bom Retiro', 'Bigorrilho', 'Campina do Siqueira', 'Cristo Rei', 'Hugo Lange', 'Jardim Botânico', 'Mercês', 'Prado Velho'],
    'Salvador-BA': ['Centro Histórico', 'Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itaigara', 'Caminho das Árvores', 'Graça', 'Garcia', 'Federação', 'Pernambués', 'Stella Maris'],
    'Florianópolis-SC': ['Centro', 'Trindade', 'Lagoa da Conceição', 'Jurerê Internacional', 'Canasvieiras', 'Ingleses', 'Carvoeira', 'Agronômica', 'Itacorubi', 'Saco dos Limões', 'Carvoeira', 'João Paulo'],
    'Brasília-DF': ['Asa Norte', 'Asa Sul', 'Taguatinga', 'Ceilândia', 'Gama', 'Guará', 'Sobradinho', 'Planaltina', 'Santa Maria', 'Samambaia', 'Águas Claras', 'Arniqueiras'],
  };

  const chave = `${cidadeNome}-${estadoSigla}`;
  const bairrosNomes = bairrosPorCidade[chave] || [];
  
  return bairrosNomes.map((nome, index) => ({
    id: index + 1,
    nome,
    municipio: {
      id: 0,
      nome: cidadeNome,
    },
  }));
}

