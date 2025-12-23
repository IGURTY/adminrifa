-- Script para atualizar a estrutura das tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA: product_list (sorteios)
-- ============================================

-- Renomear colunas existentes para o padrão em inglês (se necessário)
ALTER TABLE product_list RENAME COLUMN nome TO name;
ALTER TABLE product_list RENAME COLUMN descricao TO description;
ALTER TABLE product_list RENAME COLUMN preco TO price;

-- Adicionar colunas faltantes
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS image_path TEXT;
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true;
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS date_of_draw TIMESTAMPTZ;
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS delete_flag BOOLEAN DEFAULT false;
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ;
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS qty_numbers TEXT DEFAULT '0';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS min_purchase TEXT DEFAULT '1';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS max_purchase TEXT DEFAULT '1';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS pending_numbers TEXT DEFAULT '';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS paid_numbers TEXT DEFAULT '';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS ranking_qty TEXT DEFAULT '';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS enable_ranking TEXT DEFAULT 'false';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS enable_progress_bar TEXT DEFAULT 'false';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS status_display TEXT DEFAULT 'ativo';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS private_draw TEXT DEFAULT 'false';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS featured_draw TEXT DEFAULT 'false';
ALTER TABLE product_list ADD COLUMN IF NOT EXISTS enable_cotapremiada TEXT DEFAULT 'false';

-- Atualizar o slug baseado no nome para registros existentes
UPDATE product_list SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
