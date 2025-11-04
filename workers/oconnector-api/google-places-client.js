/**
 * Cliente Google Places API para Cloudflare Workers
 * Implementação usando padrão das bibliotecas @googleapis
 * Compatível com Workers usando API Key authentication
 * 
 * Uso similar a: const places = google.places({ version: 'v1', auth: apiKey })
 */

export class GooglePlacesClient {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API Key é obrigatória para GooglePlacesClient');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://maps.googleapis.com/maps/api';
    this.version = options.version || 'v1';
  }

  /**
   * Autenticar com API Key (similar ao padrão googleapis)
   */
  getAuth() {
    return {
      type: 'apiKey',
      apiKey: this.apiKey,
    };
  }

  /**
   * Geocodificar endereço para coordenadas
   * @param {string} address - Endereço para geocodificar
   * @returns {Promise<{lat: number, lng: number} | null>}
   */
  async geocode(address) {
    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      // Log detalhado para debug
      if (data.status !== 'OK') {
        console.error('Geocoding API Error:', {
          status: data.status,
          error_message: data.error_message,
          url: url.replace(this.apiKey, 'API_KEY_HIDDEN'),
        });
      }

      if (data.status === 'REQUEST_DENIED') {
        const errorMsg = data.error_message || 'API Key inválida ou sem permissões';
        throw new Error(`Google Geocoding API: ${errorMsg}`);
      }

      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('Limite de quota excedido na Google Geocoding API');
      }

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formatted_address: data.results[0].formatted_address,
        };
      }

      throw new Error(`Geocoding API retornou status: ${data.status} - ${data.error_message || ''}`);
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      throw error;
    }
  }

  /**
   * Buscar lugares por texto (Text Search) com paginação
   * @param {Object} params - Parâmetros de busca
   * @param {string} params.query - Query de busca (ex: "restaurante em São Paulo")
   * @param {string} [params.type] - Tipo de lugar (opcional)
   * @param {string} [params.language] - Idioma (padrão: pt-BR)
   * @param {string} [params.region] - Região (padrão: br)
   * @param {string} [params.nextPageToken] - Token para próxima página (opcional)
   * @param {number} [params.maxResults] - Número máximo de resultados (padrão: 60)
   * @returns {Promise<{results: Array, nextPageToken: string|null}>}
   */
  async textSearch({ query, type = null, language = 'pt-BR', region = 'br', nextPageToken = null, maxResults = 60 }) {
    try {
      let allResults = [];
      let currentToken = nextPageToken;
      let pageCount = 0;
      const maxPages = Math.ceil(maxResults / 20); // Google retorna 20 por página

      do {
        let url;
        if (currentToken) {
          // Buscar próxima página
          url = `${this.baseUrl}/place/textsearch/json?pagetoken=${currentToken}&key=${this.apiKey}`;
        } else {
          // Primeira busca
          url = `${this.baseUrl}/place/textsearch/json?query=${encodeURIComponent(query)}&language=${language}&region=${region}&key=${this.apiKey}`;
          if (type) {
            url += `&type=${type}`;
          }
        }

        const response = await fetch(url);
        const data = await response.json();

        // Log detalhado para debug
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error('Places API Error:', {
            status: data.status,
            error_message: data.error_message,
            url: url.replace(this.apiKey, 'API_KEY_HIDDEN'),
          });
        }

        // Verificar erros
        if (data.status === 'REQUEST_DENIED') {
          const errorMsg = data.error_message || 'API Key inválida ou sem permissões';
          throw new Error(`Google Places API: ${errorMsg}`);
        }

        if (data.status === 'OVER_QUERY_LIMIT') {
          throw new Error('Limite de quota excedido na Google Places API');
        }

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          // Se não for primeira página e der erro, retornar o que já temos
          if (pageCount > 0) {
            break;
          }
          throw new Error(`Google Places API erro: ${data.status} - ${data.error_message || ''}`);
        }

        if (data.results && data.results.length > 0) {
          allResults.push(...data.results);
        }

        // Verificar se há próxima página
        currentToken = data.next_page_token || null;
        pageCount++;

        // Se não há próxima página ou já temos resultados suficientes, parar
        if (!currentToken || allResults.length >= maxResults) {
          break;
        }

        // Esperar um pouco antes de buscar próxima página (Google requer delay)
        if (currentToken && pageCount < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos de delay
        }
      } while (currentToken && pageCount < maxPages);

      return {
        results: allResults.slice(0, maxResults),
        nextPageToken: currentToken,
      };
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
      throw error;
    }
  }

  /**
   * Buscar detalhes de um lugar específico (incluindo website e redes sociais)
   * @param {string} placeId - ID do lugar
   * @param {string} [language] - Idioma (padrão: pt-BR)
   * @returns {Promise<Object>}
   */
  async getPlaceDetails(placeId, language = 'pt-BR') {
    try {
      // Buscar campos completos incluindo website, redes sociais e contatos
      const fields = [
        'name',
        'formatted_address',
        'formatted_phone_number',
        'international_phone_number',
        'website',
        'rating',
        'user_ratings_total',
        'geometry',
        'types',
        'opening_hours',
        'business_status',
        'url', // URL do Google Maps
        'editorial_summary',
        'reviews'
      ].join(',');
      
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&language=${language}&fields=${fields}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        return data.result;
      }

      if (data.status === 'NOT_FOUND') {
        return null;
      }

      throw new Error(`Erro ao obter detalhes: ${data.status} - ${data.error_message || ''}`);
    } catch (error) {
      console.error('Erro ao obter detalhes do lugar:', error);
      // Retornar null em vez de lançar erro para não quebrar o fluxo
      return null;
    }
  }

  /**
   * Calcular distância entre dois pontos usando fórmula de Haversine
   * @param {number} lat1 - Latitude do ponto 1
   * @param {number} lon1 - Longitude do ponto 1
   * @param {number} lat2 - Latitude do ponto 2
   * @param {number} lon2 - Longitude do ponto 2
   * @returns {number} - Distância em quilômetros
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Buscar prospects com cálculo de distância
   * @param {Object} params
   * @param {string} params.nicho - Nicho de negócio
   * @param {string} params.cidade - Cidade para busca
   * @param {string} [params.type] - Tipo de lugar (opcional)
   * @returns {Promise<Array>} - Array de prospects com distância calculada
   */
  async searchProspects({ nicho, cidade, type = null, maxResults = 60 }) {
    try {
      // 1. Geocodificar cidade para obter coordenadas
      const cidadeLocation = await this.geocode(`${cidade}, Brasil`);
      
      // 2. Buscar lugares - fazer duas buscas para incluir empresas E profissionais autônomos
      // A query deve ser: "nicho cidade Brasil" (em minúsculas parece funcionar melhor)
      // Extrair apenas o nome da cidade (antes da primeira vírgula) e adicionar "Brasil"
      const cidadeLimpa = cidade.split(',')[0].trim();
      const query = `${nicho.toLowerCase()} ${cidadeLimpa} Brasil`;
      let places = [];
      const seenPlaceIds = new Set(); // Para evitar duplicatas
      
      // Busca 1: SEM type primeiro (inclui profissionais autônomos e todos os estabelecimentos)
      // Esta busca é mais abrangente e captura tanto empresas quanto profissionais
      // PRIORIDADE: Esta busca é mais importante pois inclui profissionais autônomos
      const resultWithoutType = await this.textSearch({ query, type: null, maxResults });
      resultWithoutType.results.forEach(place => {
        if (!seenPlaceIds.has(place.place_id)) {
          places.push(place);
          seenPlaceIds.add(place.place_id);
        }
      });
      
      // Busca 2: Com type específico (apenas se type foi fornecido, para complementar)
      // Esta busca pode encontrar estabelecimentos que não apareceram na busca sem type
      // Mas só adiciona se não estiverem já na lista (para não duplicar)
      if (type && places.length < maxResults) {
        const remaining = maxResults - places.length;
        const resultWithType = await this.textSearch({ query, type, maxResults: remaining });
        resultWithType.results.forEach(place => {
          if (!seenPlaceIds.has(place.place_id)) {
            places.push(place);
            seenPlaceIds.add(place.place_id);
          }
        });
      }

      // 3. Buscar detalhes completos (website, redes sociais) para cada lugar
      // Fazer em paralelo para otimizar, mas limitar a 10 por vez para não sobrecarregar
      const batchSize = 10;
      const enrichedPlaces = [];
      
      for (let i = 0; i < places.length; i += batchSize) {
        const batch = places.slice(i, i + batchSize);
        const detailsPromises = batch.map(async (place) => {
          try {
            const details = await this.getPlaceDetails(place.place_id);
            if (details) {
              // Combinar dados do text search com detalhes
              return {
                ...place,
                website: details.website || place.website || null,
                formatted_phone_number: details.formatted_phone_number || place.formatted_phone_number || null,
                international_phone_number: details.international_phone_number || null,
                rating: details.rating || place.rating || null,
                user_ratings_total: details.user_ratings_total || place.user_ratings_total || 0,
                google_maps_url: details.url || null,
                business_status: details.business_status || place.business_status || null,
              };
            }
            return place;
          } catch (error) {
            console.error(`Erro ao buscar detalhes de ${place.place_id}:`, error);
            return place; // Retornar dados básicos se falhar
          }
        });
        
        const batchResults = await Promise.all(detailsPromises);
        enrichedPlaces.push(...batchResults);
        
        // Pequeno delay entre batches para não exceder rate limits
        if (i + batchSize < places.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // 4. Processar resultados com distância
      const prospects = enrichedPlaces.map(place => {
        let distancia = null;
        
        // Calcular distância se tivermos coordenadas
        if (cidadeLocation && place.geometry && place.geometry.location) {
          distancia = this.calculateDistance(
            cidadeLocation.lat,
            cidadeLocation.lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          );
        }

        // Extrair website e redes sociais
        let website = place.website || null;
        let redesSociais = [];
        
        // Se não tem website, tentar extrair de reviews ou outros campos
        // (Google Places não retorna redes sociais diretamente, mas podemos tentar detectar)
        if (!website && place.reviews) {
          // Tentar encontrar URLs em reviews
          const reviewText = place.reviews.map(r => r.text).join(' ');
          const urlMatches = reviewText.match(/https?:\/\/[^\s]+/g);
          if (urlMatches) {
            redesSociais = urlMatches.filter(url => 
              !url.includes('google.com') && !url.includes('maps.google.com')
            );
          }
        }

        return {
          id: place.place_id,
          nome: place.name,
          endereco: place.formatted_address,
          cidade: cidade,
          nicho: nicho,
          telefone: place.formatted_phone_number || place.international_phone_number || null,
          website: website,
          redes_sociais: redesSociais.length > 0 ? redesSociais : null,
          google_maps_url: place.google_maps_url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          rating: place.rating || null,
          total_avaliacoes: place.user_ratings_total || 0,
          localizacao: place.geometry ? {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          } : null,
          distancia: distancia ? Math.round(distancia * 10) / 10 : null, // 1 casa decimal
          tipos: place.types || [],
          business_status: place.business_status || null,
        };
      });

      // 5. Ordenar por distância (mais próximos primeiro)
      prospects.sort((a, b) => {
        if (a.distancia === null && b.distancia === null) return 0;
        if (a.distancia === null) return 1;
        if (b.distancia === null) return -1;
        return a.distancia - b.distancia;
      });

      return prospects;
    } catch (error) {
      console.error('Erro ao buscar prospects:', error);
      throw error;
    }
  }
}

