/**
 * Mapeamento de Nichos para Tipos de Lugares do Google Places API
 * Baseado na documentação: https://developers.google.com/maps/documentation/places/web-service/place-types
 * 
 * Tabela A - Tipos que podem ser usados em requisições
 */

export const NICHOS_TO_PLACE_TYPES = {
  // Imobiliária e Construção
  'Imobiliária': 'real_estate_agency',
  'Construtora': 'establishment',
  
  // Saúde e Beleza
  'Clínica/Consultório': 'doctor',
  'Hospital': 'hospital',
  'Farmácia': 'pharmacy',
  'Dentista': 'dentist',
  'Veterinário': 'veterinary_care',
  'Salão de Beleza': 'beauty_salon',
  'Salão de Beleza/Estética': 'beauty_salon',
  'Estética': 'spa',
  'Design de Sobrancelhas': 'beauty_salon',
  'Spa': 'spa',
  'Barbearia': 'hair_care',
  'Academia': 'gym',
  'Academia de Ginástica': 'gym',
  
  // Alimentação
  'Restaurante': 'restaurant',
  'Café': 'cafe',
  'Padaria': 'bakery',
  'Bar': 'bar',
  'Lanchonete': 'meal_takeaway',
  'Pizzaria': 'restaurant',
  'Açaí': 'restaurant',
  'Sorveteria': 'cafe',
  'Delivery': 'meal_delivery',
  
  // Comércio
  'Supermercado': 'supermarket',
  'Mercado': 'market',
  'Loja': 'store',
  'Shopping': 'shopping_mall',
  'Pet Shop': 'pet_store',
  'Loja de Roupas': 'clothing_store',
  'Loja de Calçados': 'shoe_store',
  'Loja de Eletrônicos': 'electronics_store',
  'Loja de Móveis': 'furniture_store',
  'Livraria': 'book_store',
  'Ótica': 'optical',
  'Joaia': 'jewelry_store',
  
  // Serviços
  'Advogado': 'lawyer',
  'Contador': 'accounting',
  'Banco': 'bank',
  'Corretora': 'insurance_agency',
  'Escritório': 'establishment',
  'Consultoria': 'establishment',
  'Design Gráfico': 'establishment',
  'Marketing': 'establishment',
  'Agência de Publicidade': 'establishment',
  
  // Educação
  'Escola': 'school',
  'Curso': 'establishment',
  'Universidade': 'university',
  'Creche': 'school',
  'Idiomas': 'school',
  
  // Automotivo
  'Oficina': 'car_repair',
  'Concessionária': 'car_dealer',
  'Auto Peças': 'car_parts_store',
  'Posto de Gasolina': 'gas_station',
  'Lavagem de Carros': 'car_wash',
  
  // Turismo e Hotelaria
  'Hotel': 'lodging',
  'Pousada': 'lodging',
  'Restaurante Hotel': 'restaurant',
  'Agência de Turismo': 'travel_agency',
  
  // Entretenimento
  'Cinema': 'movie_theater',
  'Teatro': 'establishment',
  'Parque': 'park',
  'Zoológico': 'zoo',
  'Museu': 'museum',
  
  // Outros
  'Lavanderia': 'laundry',
  'Funerária': 'funeral_home',
  'Igreja': 'church',
  'Templo': 'church',
  'Biblioteca': 'library',
  'Fábrica': 'establishment',
  'Depósito': 'establishment',
};

/**
 * Lista completa de nichos disponíveis (organizados por categoria)
 */
export const NICHOS_CATEGORIAS = {
  'Imobiliária e Construção': [
    { label: 'Imobiliária', value: 'Imobiliária' },
    { label: 'Construtora', value: 'Construtora' },
  ],
  'Saúde': [
    { label: 'Clínica/Consultório', value: 'Clínica/Consultório' },
    { label: 'Hospital', value: 'Hospital' },
    { label: 'Farmácia', value: 'Farmácia' },
    { label: 'Dentista', value: 'Dentista' },
    { label: 'Veterinário', value: 'Veterinário' },
  ],
  'Beleza e Estética': [
    { label: 'Salão de Beleza/Estética', value: 'Salão de Beleza/Estética' },
    { label: 'Barbearia', value: 'Barbearia' },
    { label: 'Spa', value: 'Spa' },
    { label: 'Academia', value: 'Academia' },
  ],
  'Alimentação': [
    { label: 'Restaurante', value: 'Restaurante' },
    { label: 'Café', value: 'Café' },
    { label: 'Padaria', value: 'Padaria' },
    { label: 'Bar', value: 'Bar' },
    { label: 'Pizzaria', value: 'Pizzaria' },
    { label: 'Lanchonete', value: 'Lanchonete' },
    { label: 'Açaí', value: 'Açaí' },
    { label: 'Sorveteria', value: 'Sorveteria' },
  ],
  'Comércio': [
    { label: 'Supermercado', value: 'Supermercado' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Pet Shop', value: 'Pet Shop' },
    { label: 'Loja de Roupas', value: 'Loja de Roupas' },
    { label: 'Loja de Calçados', value: 'Loja de Calçados' },
    { label: 'Loja de Eletrônicos', value: 'Loja de Eletrônicos' },
    { label: 'Loja de Móveis', value: 'Loja de Móveis' },
    { label: 'Livraria', value: 'Livraria' },
    { label: 'Ótica', value: 'Ótica' },
  ],
  'Serviços Profissionais': [
    { label: 'Advogado', value: 'Advogado' },
    { label: 'Contador', value: 'Contador' },
    { label: 'Banco', value: 'Banco' },
    { label: 'Consultoria', value: 'Consultoria' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Design Gráfico', value: 'Design Gráfico' },
  ],
  'Educação': [
    { label: 'Escola', value: 'Escola' },
    { label: 'Universidade', value: 'Universidade' },
    { label: 'Curso', value: 'Curso' },
    { label: 'Idiomas', value: 'Idiomas' },
  ],
  'Automotivo': [
    { label: 'Oficina', value: 'Oficina' },
    { label: 'Concessionária', value: 'Concessionária' },
    { label: 'Auto Peças', value: 'Auto Peças' },
    { label: 'Posto de Gasolina', value: 'Posto de Gasolina' },
    { label: 'Lavagem de Carros', value: 'Lavagem de Carros' },
  ],
  'Turismo e Hotelaria': [
    { label: 'Hotel', value: 'Hotel' },
    { label: 'Pousada', value: 'Pousada' },
    { label: 'Agência de Turismo', value: 'Agência de Turismo' },
  ],
  'Outros': [
    { label: 'Cinema', value: 'Cinema' },
    { label: 'Lavanderia', value: 'Lavanderia' },
    { label: 'Igreja', value: 'Igreja' },
    { label: 'Biblioteca', value: 'Biblioteca' },
  ],
};

/**
 * Obter tipo de lugar do Google Places API baseado no nicho
 */
export function getPlaceTypeForNicho(nicho) {
  return NICHOS_TO_PLACE_TYPES[nicho] || null;
}

/**
 * Lista plana de todos os nichos (para uso em selects)
 */
export function getAllNichos() {
  const allNichos = [];
  Object.values(NICHOS_CATEGORIAS).forEach(categoria => {
    allNichos.push(...categoria);
  });
  return allNichos;
}

