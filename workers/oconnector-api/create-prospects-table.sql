-- Criar tabela para armazenar prospects salvos
CREATE TABLE IF NOT EXISTS prospects_salvos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  google_place_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  website TEXT,
  rating REAL,
  total_avaliacoes INTEGER DEFAULT 0,
  nicho TEXT,
  cidade TEXT,
  distancia REAL,
  localizacao_lat REAL,
  localizacao_lng REAL,
  status TEXT DEFAULT 'novo', -- novo, enviado, contactado, convertido
  contactado INTEGER DEFAULT 0, -- 0 = não contactado, 1 = contactado
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_prospects_cliente ON prospects_salvos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_prospects_google_place ON prospects_salvos(google_place_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects_salvos(status);
CREATE INDEX IF NOT EXISTS idx_prospects_contactado ON prospects_salvos(contactado);

