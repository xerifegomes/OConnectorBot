/**
 * Lista completa de nichos para prospecção
 * Mapeados para tipos de lugares do Google Places API
 * Baseado em: https://developers.google.com/maps/documentation/places/web-service/place-types
 */

export interface Nicho {
  label: string;
  value: string;
  categoria: string;
}

export const NICHOS_CATEGORIAS: Record<string, Nicho[]> = {
  'Imobiliária e Construção': [
    { label: 'Imobiliária', value: 'Imobiliária', categoria: 'Imobiliária e Construção' },
    { label: 'Construtora', value: 'Construtora', categoria: 'Imobiliária e Construção' },
  ],
  'Saúde': [
    { label: 'Clínica/Consultório', value: 'Clínica/Consultório', categoria: 'Saúde' },
    { label: 'Hospital', value: 'Hospital', categoria: 'Saúde' },
    { label: 'Farmácia', value: 'Farmácia', categoria: 'Saúde' },
    { label: 'Dentista', value: 'Dentista', categoria: 'Saúde' },
    { label: 'Veterinário', value: 'Veterinário', categoria: 'Saúde' },
  ],
  'Beleza e Estética': [
    { label: 'Salão de Beleza/Estética', value: 'Salão de Beleza/Estética', categoria: 'Beleza e Estética' },
    { label: 'Estética', value: 'Estética', categoria: 'Beleza e Estética' },
    { label: 'Design de Sobrancelhas', value: 'Design de Sobrancelhas', categoria: 'Beleza e Estética' },
    { label: 'Barbearia', value: 'Barbearia', categoria: 'Beleza e Estética' },
    { label: 'Spa', value: 'Spa', categoria: 'Beleza e Estética' },
    { label: 'Academia', value: 'Academia', categoria: 'Beleza e Estética' },
  ],
  'Alimentação': [
    { label: 'Restaurante', value: 'Restaurante', categoria: 'Alimentação' },
    { label: 'Café', value: 'Café', categoria: 'Alimentação' },
    { label: 'Padaria', value: 'Padaria', categoria: 'Alimentação' },
    { label: 'Bar', value: 'Bar', categoria: 'Alimentação' },
    { label: 'Pizzaria', value: 'Pizzaria', categoria: 'Alimentação' },
    { label: 'Lanchonete', value: 'Lanchonete', categoria: 'Alimentação' },
    { label: 'Açaí', value: 'Açaí', categoria: 'Alimentação' },
    { label: 'Sorveteria', value: 'Sorveteria', categoria: 'Alimentação' },
  ],
  'Comércio': [
    { label: 'Supermercado', value: 'Supermercado', categoria: 'Comércio' },
    { label: 'Shopping', value: 'Shopping', categoria: 'Comércio' },
    { label: 'Pet Shop', value: 'Pet Shop', categoria: 'Comércio' },
    { label: 'Loja de Roupas', value: 'Loja de Roupas', categoria: 'Comércio' },
    { label: 'Loja de Calçados', value: 'Loja de Calçados', categoria: 'Comércio' },
    { label: 'Loja de Eletrônicos', value: 'Loja de Eletrônicos', categoria: 'Comércio' },
    { label: 'Loja de Móveis', value: 'Loja de Móveis', categoria: 'Comércio' },
    { label: 'Livraria', value: 'Livraria', categoria: 'Comércio' },
    { label: 'Ótica', value: 'Ótica', categoria: 'Comércio' },
    { label: 'Joalheria', value: 'Joalheria', categoria: 'Comércio' },
  ],
  'Serviços Profissionais': [
    { label: 'Advogado', value: 'Advogado', categoria: 'Serviços Profissionais' },
    { label: 'Contador', value: 'Contador', categoria: 'Serviços Profissionais' },
    { label: 'Banco', value: 'Banco', categoria: 'Serviços Profissionais' },
    { label: 'Consultoria', value: 'Consultoria', categoria: 'Serviços Profissionais' },
    { label: 'Marketing', value: 'Marketing', categoria: 'Serviços Profissionais' },
    { label: 'Design Gráfico', value: 'Design Gráfico', categoria: 'Serviços Profissionais' },
    { label: 'Agência de Publicidade', value: 'Agência de Publicidade', categoria: 'Serviços Profissionais' },
  ],
  'Educação': [
    { label: 'Escola', value: 'Escola', categoria: 'Educação' },
    { label: 'Universidade', value: 'Universidade', categoria: 'Educação' },
    { label: 'Curso', value: 'Curso', categoria: 'Educação' },
    { label: 'Idiomas', value: 'Idiomas', categoria: 'Educação' },
    { label: 'Creche', value: 'Creche', categoria: 'Educação' },
  ],
  'Automotivo': [
    { label: 'Oficina', value: 'Oficina', categoria: 'Automotivo' },
    { label: 'Concessionária', value: 'Concessionária', categoria: 'Automotivo' },
    { label: 'Auto Peças', value: 'Auto Peças', categoria: 'Automotivo' },
    { label: 'Posto de Gasolina', value: 'Posto de Gasolina', categoria: 'Automotivo' },
    { label: 'Lavagem de Carros', value: 'Lavagem de Carros', categoria: 'Automotivo' },
  ],
  'Turismo e Hotelaria': [
    { label: 'Hotel', value: 'Hotel', categoria: 'Turismo e Hotelaria' },
    { label: 'Pousada', value: 'Pousada', categoria: 'Turismo e Hotelaria' },
    { label: 'Agência de Turismo', value: 'Agência de Turismo', categoria: 'Turismo e Hotelaria' },
  ],
  'Entretenimento': [
    { label: 'Cinema', value: 'Cinema', categoria: 'Entretenimento' },
    { label: 'Teatro', value: 'Teatro', categoria: 'Entretenimento' },
    { label: 'Museu', value: 'Museu', categoria: 'Entretenimento' },
  ],
  'Outros': [
    { label: 'Lavanderia', value: 'Lavanderia', categoria: 'Outros' },
    { label: 'Igreja', value: 'Igreja', categoria: 'Outros' },
    { label: 'Biblioteca', value: 'Biblioteca', categoria: 'Outros' },
  ],
};

/**
 * Retorna todos os nichos em uma lista plana
 */
export function getAllNichos(): Nicho[] {
  const allNichos: Nicho[] = [];
  Object.values(NICHOS_CATEGORIAS).forEach(categoria => {
    allNichos.push(...categoria);
  });
  return allNichos;
}

/**
 * Retorna todos os nichos organizados por categoria
 */
export function getNichosByCategory(): Record<string, Nicho[]> {
  return NICHOS_CATEGORIAS;
}

