-- Migração: Adicionar RLS (Row Level Security) à tabela product_list
-- Descrição: Habilita RLS e cria policies para controlar acesso aos sorteios
-- Autor: Sistema
-- Data: 2025-01-14

BEGIN;

-- ===================================
-- RLS (Row Level Security) - product_list
-- ===================================

-- Habilitar RLS na tabela product_list
ALTER TABLE public.product_list ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (SELECT) - qualquer um pode ler sorteios não deletados
CREATE POLICY "product_list_select" ON public.product_list
  FOR SELECT USING (delete_flag = false OR delete_flag IS NULL);

-- Política de inserção para usuários autenticados (INSERT)
CREATE POLICY "product_list_insert" ON public.product_list
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política de atualização para usuários autenticados (UPDATE)
CREATE POLICY "product_list_update" ON public.product_list
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Política de deleção para usuários autenticados (DELETE)
CREATE POLICY "product_list_delete" ON public.product_list
  FOR DELETE USING (auth.role() = 'authenticated');

COMMIT;
