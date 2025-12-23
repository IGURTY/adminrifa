-- Migração: Criar tabelas de configuração da Landing Page
-- Descrição: Tabelas para armazenar todas as informações dinâmicas da landing page
-- Autor: Sistema
-- Data: 2024-12-23

BEGIN;

-- ===================================
-- TABELA PRINCIPAL: landing_page_config
-- Configurações gerais da landing page
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identidade Visual
  logo_url TEXT,
  logo_alt TEXT DEFAULT 'Logo',
  favicon_url TEXT,
  
  -- SEO
  site_name TEXT NOT NULL DEFAULT 'Mira Milionária',
  site_description TEXT,
  meta_keywords TEXT,
  
  -- Banner Principal (Hero)
  hero_banner_url TEXT,
  hero_banner_alt TEXT DEFAULT 'Banner Principal',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_text TEXT DEFAULT 'GARANTIR MEU BILHETE',
  hero_cta_link TEXT DEFAULT '/sorteios',
  
  -- Seção Passos (Como Funciona)
  steps_section_title TEXT DEFAULT 'É FÁCIL PARTICIPAR!',
  steps_section_subtitle TEXT DEFAULT 'Concorra a prêmios incríveis com apenas algumas moedas. Processo 100% seguro e transparente.',
  steps_section_badge TEXT DEFAULT 'Simples e Rápido',
  
  -- Seção CTA
  cta_title TEXT DEFAULT 'NÃO PERCA ESSA OPORTUNIDADE!',
  cta_subtitle TEXT DEFAULT 'Garanta já seus bilhetes e concorra aos melhores prêmios do Brasil!',
  cta_button_text TEXT DEFAULT 'GARANTIR MEU BILHETE',
  cta_button_link TEXT DEFAULT '/sorteios',
  
  -- Seção FAQ
  faq_section_title TEXT DEFAULT 'PERGUNTAS FREQUENTES',
  faq_section_badge TEXT DEFAULT 'Tire suas dúvidas',
  
  -- Seção Instagram
  instagram_section_title TEXT DEFAULT 'SIGA A MIRA MILIONÁRIA',
  instagram_section_subtitle TEXT DEFAULT 'Fique por dentro de todos os sorteios e novidades!',
  instagram_section_badge TEXT DEFAULT 'Siga nas redes',
  instagram_username TEXT DEFAULT '@miramilionariaoficial',
  instagram_profile_url TEXT DEFAULT 'https://www.instagram.com/miramilionariaoficial/',
  
  -- Footer
  footer_description TEXT DEFAULT 'A melhor plataforma de sorteios do Brasil. Concorra a prêmios incríveis com bilhetes a partir de R$ 0,99!',
  footer_copyright TEXT DEFAULT '© 2025 Mira Milionária. Todos os direitos reservados.',
  footer_disclaimer TEXT DEFAULT 'Imagens meramente ilustrativas. Consulte o regulamento. Proibido para menores de 18 anos.',
  
  -- Contato
  whatsapp_number TEXT,
  whatsapp_display TEXT DEFAULT '(11) 99999-9999',
  email_contact TEXT DEFAULT 'contato@miramilionaria.com',
  address TEXT DEFAULT 'São Paulo, SP - Brasil',
  
  -- Cores do tema (opcional para customização futura)
  primary_color TEXT DEFAULT '#FFD700',
  secondary_color TEXT DEFAULT '#1a1a1a',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_steps
-- Passos do processo (Como Funciona)
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  icon TEXT NOT NULL DEFAULT 'gift', -- gift, star, users, trophy, etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_faqs
-- Perguntas Frequentes
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_instagram_posts
-- Posts do Instagram
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_instagram_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  post_id TEXT NOT NULL, -- ID do post do Instagram (ex: DEdxmf0xX9x)
  post_url TEXT, -- URL completa do post (opcional)
  image_url TEXT, -- URL da imagem (opcional, para cache local)
  caption TEXT, -- Legenda do post (opcional)
  ordem INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_social_links
-- Links das Redes Sociais
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL, -- instagram, facebook, twitter, youtube, tiktok, etc.
  url TEXT NOT NULL,
  icon TEXT, -- Nome do ícone (opcional)
  ordem INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_nav_links
-- Links do Menu de Navegação
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_nav_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  is_external BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_footer_links
-- Links Úteis do Rodapé
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  category TEXT DEFAULT 'links', -- links, legal, etc.
  ordem INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: landing_page_banners
-- Banners Adicionais (Carousel)
-- ===================================
CREATE TABLE IF NOT EXISTS public.landing_page_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.landing_page_config(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  alt_text TEXT,
  link_url TEXT,
  title TEXT,
  subtitle TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================
CREATE INDEX IF NOT EXISTS idx_landing_page_steps_config ON public.landing_page_steps(config_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_steps_ordem ON public.landing_page_steps(ordem);

CREATE INDEX IF NOT EXISTS idx_landing_page_faqs_config ON public.landing_page_faqs(config_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_faqs_ordem ON public.landing_page_faqs(ordem);

CREATE INDEX IF NOT EXISTS idx_landing_page_instagram_config ON public.landing_page_instagram_posts(config_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_instagram_ordem ON public.landing_page_instagram_posts(ordem);

CREATE INDEX IF NOT EXISTS idx_landing_page_social_config ON public.landing_page_social_links(config_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_nav_config ON public.landing_page_nav_links(config_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_footer_config ON public.landing_page_footer_links(config_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_banners_config ON public.landing_page_banners(config_id);

-- ===================================
-- RLS (Row Level Security)
-- Leitura pública, escrita apenas para autenticados/admins
-- ===================================
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_banners ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (SELECT)
CREATE POLICY "landing_page_config_select" ON public.landing_page_config
  FOR SELECT USING (true);

CREATE POLICY "landing_page_steps_select" ON public.landing_page_steps
  FOR SELECT USING (true);

CREATE POLICY "landing_page_faqs_select" ON public.landing_page_faqs
  FOR SELECT USING (true);

CREATE POLICY "landing_page_instagram_posts_select" ON public.landing_page_instagram_posts
  FOR SELECT USING (true);

CREATE POLICY "landing_page_social_links_select" ON public.landing_page_social_links
  FOR SELECT USING (true);

CREATE POLICY "landing_page_nav_links_select" ON public.landing_page_nav_links
  FOR SELECT USING (true);

CREATE POLICY "landing_page_footer_links_select" ON public.landing_page_footer_links
  FOR SELECT USING (true);

CREATE POLICY "landing_page_banners_select" ON public.landing_page_banners
  FOR SELECT USING (true);

-- Políticas de escrita para usuários autenticados
CREATE POLICY "landing_page_config_insert" ON public.landing_page_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_config_update" ON public.landing_page_config FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_config_delete" ON public.landing_page_config FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_steps_insert" ON public.landing_page_steps FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_steps_update" ON public.landing_page_steps FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_steps_delete" ON public.landing_page_steps FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_faqs_insert" ON public.landing_page_faqs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_faqs_update" ON public.landing_page_faqs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_faqs_delete" ON public.landing_page_faqs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_instagram_posts_insert" ON public.landing_page_instagram_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_instagram_posts_update" ON public.landing_page_instagram_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_instagram_posts_delete" ON public.landing_page_instagram_posts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_social_links_insert" ON public.landing_page_social_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_social_links_update" ON public.landing_page_social_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_social_links_delete" ON public.landing_page_social_links FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_nav_links_insert" ON public.landing_page_nav_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_nav_links_update" ON public.landing_page_nav_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_nav_links_delete" ON public.landing_page_nav_links FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_footer_links_insert" ON public.landing_page_footer_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_footer_links_update" ON public.landing_page_footer_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_footer_links_delete" ON public.landing_page_footer_links FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "landing_page_banners_insert" ON public.landing_page_banners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "landing_page_banners_update" ON public.landing_page_banners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "landing_page_banners_delete" ON public.landing_page_banners FOR DELETE USING (auth.role() = 'authenticated');

-- ===================================
-- DADOS INICIAIS (SEED)
-- ===================================

-- Inserir configuração inicial
INSERT INTO public.landing_page_config (
  id,
  logo_url,
  site_name,
  site_description,
  hero_banner_url,
  hero_banner_alt,
  whatsapp_number,
  whatsapp_display,
  email_contact,
  address
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '/logo.png',
  'Mira Milionária',
  'A melhor plataforma de sorteios do Brasil',
  '/banner.webp',
  'Mira Milionária - Sorteio',
  '5511999999999',
  '(11) 99999-9999',
  'contato@miramilionaria.com',
  'São Paulo, SP - Brasil'
) ON CONFLICT DO NOTHING;

-- Inserir passos
INSERT INTO public.landing_page_steps (config_id, icon, title, description, ordem) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'gift', '1. Escolha', 'Selecione quantos bilhetes quiser. Mais bilhetes = mais chances!', 1),
  ('a0000000-0000-0000-0000-000000000001', 'star', '2. Pague', 'Pagamento instantâneo via PIX. Fácil, seguro e rápido!', 2),
  ('a0000000-0000-0000-0000-000000000001', 'users', '3. Concorra', 'Acompanhe seus números e aguarde o sorteio. Boa sorte!', 3)
ON CONFLICT DO NOTHING;

-- Inserir FAQs
INSERT INTO public.landing_page_faqs (config_id, question, answer, ordem) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Esse sorteio é legal?', 'Sim! O Mira Milionária é autorizado e auditado, seguindo todas as normas legais para sorteios no Brasil.', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Como funciona o sorteio?', 'Você escolhe quantos bilhetes quiser, paga via PIX e recebe seus números da sorte. O sorteio é realizado ao vivo e divulgado em nossas redes.', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Onde o prêmio será entregue?', 'O prêmio é entregue em todo o Brasil, sem custo para o ganhador.', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Tem outras dúvidas?', 'Fale conosco pelo WhatsApp ou consulte nossos canais oficiais.', 4)
ON CONFLICT DO NOTHING;

-- Inserir posts do Instagram
INSERT INTO public.landing_page_instagram_posts (config_id, post_id, ordem) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'DEdxmf0xX9x', 1),
  ('a0000000-0000-0000-0000-000000000001', 'DELhMK4xzjt', 2),
  ('a0000000-0000-0000-0000-000000000001', 'DDxnVPPR-fT', 3),
  ('a0000000-0000-0000-0000-000000000001', 'DDvGWLqxsxs', 4),
  ('a0000000-0000-0000-0000-000000000001', 'DDqBzImRVjY', 5),
  ('a0000000-0000-0000-0000-000000000001', 'DDhv78dRe3w', 6)
ON CONFLICT DO NOTHING;

-- Inserir links de navegação
INSERT INTO public.landing_page_nav_links (config_id, label, href, ordem) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Início', '/', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Sorteios', '/sorteios', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Ganhadores', '/ganhadores', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Regulamento', '/regulamento', 4),
  ('a0000000-0000-0000-0000-000000000001', 'Contato', '/contato', 5)
ON CONFLICT DO NOTHING;

-- Inserir links do footer
INSERT INTO public.landing_page_footer_links (config_id, label, href, category, ordem) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sorteios', '/sorteios', 'links', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Ganhadores', '/ganhadores', 'links', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Regulamento', '/regulamento', 'links', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Ajuda', '/contato', 'links', 4)
ON CONFLICT DO NOTHING;

-- Inserir link social (Instagram)
INSERT INTO public.landing_page_social_links (config_id, platform, url, icon, ordem) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'instagram', 'https://www.instagram.com/miramilionariaoficial/', 'Instagram', 1)
ON CONFLICT DO NOTHING;

COMMIT;
