-- Tabela de edições
CREATE TABLE IF NOT EXISTS edicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_sorteio TIMESTAMP,
  data_limite TIMESTAMP,
  hora_limite TEXT,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de cotas
CREATE TABLE IF NOT EXISTS cotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID REFERENCES edicoes(id),
  numero TEXT NOT NULL,
  premiada BOOLEAN DEFAULT false,
  premio TEXT,
  data_compra TIMESTAMP,
  nsu TEXT,
  comprador_id UUID,
  nome_comprador TEXT,
  telefone TEXT,
  email TEXT,
  cpf TEXT,
  afiliado_id UUID,
  nome_afiliado TEXT,
  whatsapp_afiliado TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de brindes
CREATE TABLE IF NOT EXISTS brindes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa TEXT,
  cpf TEXT,
  nsu TEXT,
  quantidade INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID REFERENCES edicoes(id),
  url TEXT,
  ordem INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de combos
CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID REFERENCES edicoes(id),
  quantidade_combos INTEGER,
  numeros_por_combo INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de distribuidores
CREATE TABLE IF NOT EXISTS distribuidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  nome_social TEXT,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  sexo TEXT,
  endereco TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendedores
CREATE TABLE IF NOT EXISTS vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  nome_social TEXT,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  sexo TEXT,
  endereco TEXT,
  distribuidor_id UUID REFERENCES distribuidores(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ofertas
CREATE TABLE IF NOT EXISTS ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT,
  tag TEXT,
  quantidade_itens INTEGER,
  valor NUMERIC,
  quantidade_minima INTEGER,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de reacoes_ganhadores
CREATE TABLE IF NOT EXISTS reacoes_ganhadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id UUID REFERENCES edicoes(id),
  numero TEXT,
  premio TEXT,
  link_reacao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de programacao_brindes
CREATE TABLE IF NOT EXISTS programacao_brindes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT,
  brinde_tag TEXT,
  data_inicio TIMESTAMP,
  data_fim TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campos extras em clientes
ALTER TABLE customer_list
  ADD COLUMN IF NOT EXISTS nome_social TEXT,
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS sexo TEXT,
  ADD COLUMN IF NOT EXISTS endereco TEXT;

-- Campos extras em afiliados
ALTER TABLE afiliados
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ultima_venda TIMESTAMP;