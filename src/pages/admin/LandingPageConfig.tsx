import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Save, Plus, Trash2, Pencil, X, Check,
  Image, Type, Link as LinkIcon, MessageSquare, Instagram,
  Settings, ChevronDown, ChevronRight, Globe, Palette, Upload
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ===== SUPABASE STORAGE CONFIG =====
const BUCKET_NAME = "imagens";
const SUPABASE_URL = "https://xanrdtzebzwwfbwwbixa.supabase.co";

// Função para fazer upload de imagem
async function uploadImage(file: File, folder: string = "landing"): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error("Erro no upload:", error);
    showError("Erro ao fazer upload da imagem");
    return null;
  }
  
  // Retorna a URL pública
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${data.path}`;
  return publicUrl;
}

// Componente de Upload de Imagem
function ImageUpload({ 
  value, 
  onChange, 
  label,
  folder = "landing"
}: { 
  value: string | null; 
  onChange: (url: string) => void; 
  label: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      showError("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    const url = await uploadImage(file, folder);
    setUploading(false);

    if (url) {
      onChange(url);
      showSuccess("Imagem enviada com sucesso!");
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 block font-medium">{label}</label>
      <div className="flex gap-2">
        <Input 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL da imagem"
          className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg flex-1"
        />
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {uploading ? "Enviando..." : "Upload"}
        </Button>
      </div>
      {value && (
        <div className="mt-2 relative group">
          <img 
            src={value} 
            alt="Preview" 
            className="h-24 w-auto rounded-lg border border-gray-700 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ===== TYPES =====
type LandingPageConfig = {
  id: string;
  logo_url: string | null;
  logo_alt: string | null;
  favicon_url: string | null;
  site_name: string;
  site_description: string | null;
  meta_keywords: string | null;
  hero_banner_url: string | null;
  hero_banner_alt: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  steps_section_title: string | null;
  steps_section_subtitle: string | null;
  steps_section_badge: string | null;
  cta_title: string | null;
  cta_subtitle: string | null;
  cta_button_text: string | null;
  cta_button_link: string | null;
  faq_section_title: string | null;
  faq_section_badge: string | null;
  instagram_section_title: string | null;
  instagram_section_subtitle: string | null;
  instagram_section_badge: string | null;
  instagram_username: string | null;
  instagram_profile_url: string | null;
  footer_description: string | null;
  footer_copyright: string | null;
  footer_disclaimer: string | null;
  whatsapp_number: string | null;
  whatsapp_display: string | null;
  email_contact: string | null;
  address: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  is_active: boolean;
};

type Step = {
  id: string;
  config_id: string | null;
  icon: string;
  title: string;
  description: string;
  ordem: number;
  is_active: boolean;
};

type FAQ = {
  id: string;
  config_id: string | null;
  question: string;
  answer: string;
  ordem: number;
  is_active: boolean;
};

type InstagramPost = {
  id: string;
  config_id: string | null;
  post_id: string;
  post_url: string | null;
  image_url: string | null;
  caption: string | null;
  ordem: number;
  is_active: boolean;
};

type NavLink = {
  id: string;
  config_id: string | null;
  label: string;
  href: string;
  ordem: number;
  is_external: boolean;
  is_active: boolean;
};

type FooterLink = {
  id: string;
  config_id: string | null;
  label: string;
  href: string;
  category: string | null;
  ordem: number;
  is_active: boolean;
};

type SocialLink = {
  id: string;
  config_id: string | null;
  platform: string;
  url: string;
  icon: string | null;
  ordem: number;
  is_active: boolean;
};

// ===== HOOKS =====
const CONFIG_ID = "a0000000-0000-0000-0000-000000000001";

function useConfig() {
  return useQuery<LandingPageConfig | null>({
    queryKey: ["landing-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_config")
        .select("*")
        .eq("id", CONFIG_ID)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });
}

function useSteps() {
  return useQuery<Step[]>({
    queryKey: ["landing-steps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_steps")
        .select("*")
        .eq("config_id", CONFIG_ID)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });
}

function useFAQs() {
  return useQuery<FAQ[]>({
    queryKey: ["landing-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_faqs")
        .select("*")
        .eq("config_id", CONFIG_ID)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });
}

function useInstagramPosts() {
  return useQuery<InstagramPost[]>({
    queryKey: ["landing-instagram"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_instagram_posts")
        .select("*")
        .eq("config_id", CONFIG_ID)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });
}

function useNavLinks() {
  return useQuery<NavLink[]>({
    queryKey: ["landing-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_nav_links")
        .select("*")
        .eq("config_id", CONFIG_ID)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });
}

function useFooterLinks() {
  return useQuery<FooterLink[]>({
    queryKey: ["landing-footer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_footer_links")
        .select("*")
        .eq("config_id", CONFIG_ID)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });
}

function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ["landing-social"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_social_links")
        .select("*")
        .eq("config_id", CONFIG_ID)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });
}

// ===== STYLES =====
const cardStyle = {
  background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.9) 50%, rgba(17,17,17,0.9) 100%)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
  border: "1px solid rgba(245, 158, 11, 0.15)",
};

const inputClass = "bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg";

// ===== SECTION COMPONENT =====
function Section({ title, icon, children, defaultOpen = false }: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            {icon}
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        {open ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
      </button>
      {open && <div className="p-4 pt-0 border-t border-gray-800/50">{children}</div>}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function LandingPageConfig() {
  const queryClient = useQueryClient();
  const { data: config, isLoading: loadingConfig } = useConfig();
  const { data: steps } = useSteps();
  const { data: faqs } = useFAQs();
  const { data: instagramPosts } = useInstagramPosts();
  const { data: navLinks } = useNavLinks();
  const { data: footerLinks } = useFooterLinks();
  const { data: socialLinks } = useSocialLinks();

  const [form, setForm] = useState<Partial<LandingPageConfig>>({});
  const [saving, setSaving] = useState(false);

  // Modal states
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [instaModalOpen, setInstaModalOpen] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setForm(config);
    }
  }, [config]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Save config
  const saveConfig = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("landing_page_config")
        .upsert({
          id: CONFIG_ID,
          ...form,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["landing-config"] });
    },
    onError: () => showError("Erro ao salvar configurações."),
  });

  // Generic delete mutation
  async function deleteItem(table: string, id: string, queryKey: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      showError("Erro ao excluir item.");
    } else {
      showSuccess("Item excluído!");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  }

  // Save Step
  async function saveStep(step: Partial<Step>) {
    if (step.id) {
      const { error } = await supabase
        .from("landing_page_steps")
        .update({ icon: step.icon, title: step.title, description: step.description, ordem: step.ordem, updated_at: new Date().toISOString() })
        .eq("id", step.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("landing_page_steps")
        .insert({ config_id: CONFIG_ID, icon: step.icon, title: step.title, description: step.description, ordem: step.ordem || 0 });
      if (error) throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["landing-steps"] });
    setStepModalOpen(false);
    showSuccess("Passo salvo!");
  }

  // Save FAQ
  async function saveFAQ(faq: Partial<FAQ>) {
    if (faq.id) {
      const { error } = await supabase
        .from("landing_page_faqs")
        .update({ question: faq.question, answer: faq.answer, ordem: faq.ordem, updated_at: new Date().toISOString() })
        .eq("id", faq.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("landing_page_faqs")
        .insert({ config_id: CONFIG_ID, question: faq.question, answer: faq.answer, ordem: faq.ordem || 0 });
      if (error) throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["landing-faqs"] });
    setFaqModalOpen(false);
    showSuccess("FAQ salva!");
  }

  // Save Instagram Post
  async function saveInstagram(post: Partial<InstagramPost>) {
    if (post.id) {
      const { error } = await supabase
        .from("landing_page_instagram_posts")
        .update({ post_id: post.post_id, post_url: post.post_url, caption: post.caption, ordem: post.ordem, updated_at: new Date().toISOString() })
        .eq("id", post.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("landing_page_instagram_posts")
        .insert({ config_id: CONFIG_ID, post_id: post.post_id, post_url: post.post_url, caption: post.caption, ordem: post.ordem || 0 });
      if (error) throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["landing-instagram"] });
    setInstaModalOpen(false);
    showSuccess("Post salvo!");
  }

  // Save Nav Link
  async function saveNavLink(link: Partial<NavLink>) {
    if (link.id) {
      const { error } = await supabase
        .from("landing_page_nav_links")
        .update({ label: link.label, href: link.href, ordem: link.ordem, is_external: link.is_external, updated_at: new Date().toISOString() })
        .eq("id", link.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("landing_page_nav_links")
        .insert({ config_id: CONFIG_ID, label: link.label, href: link.href, ordem: link.ordem || 0, is_external: link.is_external || false });
      if (error) throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["landing-nav"] });
    setNavModalOpen(false);
    showSuccess("Link salvo!");
  }

  // Save Footer Link
  async function saveFooterLink(link: Partial<FooterLink>) {
    if (link.id) {
      const { error } = await supabase
        .from("landing_page_footer_links")
        .update({ label: link.label, href: link.href, category: link.category, ordem: link.ordem, updated_at: new Date().toISOString() })
        .eq("id", link.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("landing_page_footer_links")
        .insert({ config_id: CONFIG_ID, label: link.label, href: link.href, category: link.category || "links", ordem: link.ordem || 0 });
      if (error) throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["landing-footer"] });
    setFooterModalOpen(false);
    showSuccess("Link salvo!");
  }

  // Save Social Link
  async function saveSocialLink(link: Partial<SocialLink>) {
    if (link.id) {
      const { error } = await supabase
        .from("landing_page_social_links")
        .update({ platform: link.platform, url: link.url, icon: link.icon, ordem: link.ordem, updated_at: new Date().toISOString() })
        .eq("id", link.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("landing_page_social_links")
        .insert({ config_id: CONFIG_ID, platform: link.platform, url: link.url, icon: link.icon, ordem: link.ordem || 0 });
      if (error) throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["landing-social"] });
    setSocialModalOpen(false);
    showSuccess("Rede social salva!");
  }

  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
            Configurações da Landing Page
          </h1>
          <p className="text-gray-500 text-sm mt-1">Personalize sua página inicial</p>
        </div>
        <Button
          onClick={() => saveConfig.mutate()}
          disabled={saveConfig.isPending}
          className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
        >
          {saveConfig.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Salvar Tudo
        </Button>
      </div>

      <div className="space-y-4">
        {/* Identidade Visual */}
        <Section title="Identidade Visual" icon={<Image size={20} />} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <ImageUpload 
                label="Logo" 
                value={form.logo_url || null} 
                onChange={(url) => setForm(prev => ({ ...prev, logo_url: url }))}
                folder="landing/logo"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Alt do Logo</label>
              <Input name="logo_alt" value={form.logo_alt || ""} onChange={handleChange} className={inputClass} placeholder="Logo" />
            </div>
            <div>
              <ImageUpload 
                label="Favicon" 
                value={form.favicon_url || null} 
                onChange={(url) => setForm(prev => ({ ...prev, favicon_url: url }))}
                folder="landing/favicon"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Nome do Site</label>
              <Input name="site_name" value={form.site_name || ""} onChange={handleChange} className={inputClass} placeholder="Mira Milionária" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Descrição do Site (SEO)</label>
              <Textarea name="site_description" value={form.site_description || ""} onChange={handleChange} className={inputClass} rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-2 block">Keywords (SEO)</label>
              <Input name="meta_keywords" value={form.meta_keywords || ""} onChange={handleChange} className={inputClass} placeholder="sorteio, rifa, prêmios" />
            </div>
          </div>
        </Section>

        {/* Cores */}
        <Section title="Cores do Tema" icon={<Palette size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Cor Primária</label>
              <div className="flex gap-2">
                <input type="color" name="primary_color" value={form.primary_color || "#FFD700"} onChange={(e) => setForm(prev => ({ ...prev, primary_color: e.target.value }))} className="w-12 h-10 rounded cursor-pointer" />
                <Input value={form.primary_color || "#FFD700"} onChange={handleChange} name="primary_color" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Cor Secundária</label>
              <div className="flex gap-2">
                <input type="color" name="secondary_color" value={form.secondary_color || "#1a1a1a"} onChange={(e) => setForm(prev => ({ ...prev, secondary_color: e.target.value }))} className="w-12 h-10 rounded cursor-pointer" />
                <Input value={form.secondary_color || "#1a1a1a"} onChange={handleChange} name="secondary_color" className={inputClass} />
              </div>
            </div>
          </div>
        </Section>

        {/* Banner Hero */}
        <Section title="Banner Principal (Hero)" icon={<Image size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <ImageUpload 
                label="Banner Principal" 
                value={form.hero_banner_url || null} 
                onChange={(url) => setForm(prev => ({ ...prev, hero_banner_url: url }))}
                folder="landing/banner"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Alt do Banner</label>
              <Input name="hero_banner_alt" value={form.hero_banner_alt || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Título</label>
              <Input name="hero_title" value={form.hero_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Subtítulo</label>
              <Input name="hero_subtitle" value={form.hero_subtitle || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Texto do Botão CTA</label>
              <Input name="hero_cta_text" value={form.hero_cta_text || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Link do Botão CTA</label>
              <Input name="hero_cta_link" value={form.hero_cta_link || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </Section>

        {/* Passos */}
        <Section title="Como Funciona (Passos)" icon={<Type size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Título da Seção</label>
              <Input name="steps_section_title" value={form.steps_section_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Subtítulo</label>
              <Input name="steps_section_subtitle" value={form.steps_section_subtitle || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Badge</label>
              <Input name="steps_section_badge" value={form.steps_section_badge || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Lista de Passos</span>
            <Button size="sm" onClick={() => { setEditingItem(null); setStepModalOpen(true); }} className="gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {steps?.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">{s.ordem}.</span>
                  <span className="text-white font-medium">{s.title}</span>
                  <span className="text-gray-500 text-sm truncate max-w-xs">{s.description}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingItem(s); setStepModalOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteItem("landing_page_steps", s.id, "landing-steps")}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="Perguntas Frequentes (FAQ)" icon={<MessageSquare size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Título da Seção</label>
              <Input name="faq_section_title" value={form.faq_section_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Badge</label>
              <Input name="faq_section_badge" value={form.faq_section_badge || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Lista de FAQs</span>
            <Button size="sm" onClick={() => { setEditingItem(null); setFaqModalOpen(true); }} className="gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {faqs?.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div>
                  <span className="text-white font-medium">{f.question}</span>
                  <p className="text-gray-500 text-sm truncate max-w-lg">{f.answer}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingItem(f); setFaqModalOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteItem("landing_page_faqs", f.id, "landing-faqs")}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Instagram */}
        <Section title="Instagram" icon={<Instagram size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Título da Seção</label>
              <Input name="instagram_section_title" value={form.instagram_section_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Subtítulo</label>
              <Input name="instagram_section_subtitle" value={form.instagram_section_subtitle || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Username</label>
              <Input name="instagram_username" value={form.instagram_username || ""} onChange={handleChange} className={inputClass} placeholder="@miramilionariaoficial" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">URL do Perfil</label>
              <Input name="instagram_profile_url" value={form.instagram_profile_url || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Posts</span>
            <Button size="sm" onClick={() => { setEditingItem(null); setInstaModalOpen(true); }} className="gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {instagramPosts?.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 text-center">
                <span className="text-white text-sm">{p.post_id}</span>
                <div className="flex justify-center gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingItem(p); setInstaModalOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteItem("landing_page_instagram_posts", p.id, "landing-instagram")}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA Section */}
        <Section title="Seção CTA" icon={<Type size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Título</label>
              <Input name="cta_title" value={form.cta_title || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Subtítulo</label>
              <Input name="cta_subtitle" value={form.cta_subtitle || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Texto do Botão</label>
              <Input name="cta_button_text" value={form.cta_button_text || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Link do Botão</label>
              <Input name="cta_button_link" value={form.cta_button_link || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </Section>

        {/* Menu de Navegação */}
        <Section title="Menu de Navegação" icon={<Globe size={20} />}>
          <div className="flex justify-between items-center mt-4 mb-3">
            <span className="text-sm text-gray-400">Links do Menu</span>
            <Button size="sm" onClick={() => { setEditingItem(null); setNavModalOpen(true); }} className="gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {navLinks?.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">{l.ordem}.</span>
                  <span className="text-white">{l.label}</span>
                  <span className="text-gray-500 text-sm">{l.href}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingItem(l); setNavModalOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteItem("landing_page_nav_links", l.id, "landing-nav")}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <Section title="Rodapé (Footer)" icon={<Settings size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-2 block">Descrição</label>
              <Textarea name="footer_description" value={form.footer_description || ""} onChange={handleChange} className={inputClass} rows={2} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Copyright</label>
              <Input name="footer_copyright" value={form.footer_copyright || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Disclaimer</label>
              <Input name="footer_disclaimer" value={form.footer_disclaimer || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Links do Rodapé</span>
            <Button size="sm" onClick={() => { setEditingItem(null); setFooterModalOpen(true); }} className="gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {footerLinks?.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-white">{l.label}</span>
                  <span className="text-gray-500 text-sm">{l.href}</span>
                  <span className="text-amber-400 text-xs">({l.category})</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingItem(l); setFooterModalOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteItem("landing_page_footer_links", l.id, "landing-footer")}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Contato */}
        <Section title="Informações de Contato" icon={<MessageSquare size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">WhatsApp (número)</label>
              <Input name="whatsapp_number" value={form.whatsapp_number || ""} onChange={handleChange} className={inputClass} placeholder="5511999999999" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">WhatsApp (exibição)</label>
              <Input name="whatsapp_display" value={form.whatsapp_display || ""} onChange={handleChange} className={inputClass} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Email de Contato</label>
              <Input name="email_contact" value={form.email_contact || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Endereço</label>
              <Input name="address" value={form.address || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </Section>

        {/* Redes Sociais */}
        <Section title="Redes Sociais" icon={<LinkIcon size={20} />}>
          <div className="flex justify-between items-center mt-4 mb-3">
            <span className="text-sm text-gray-400">Links das Redes</span>
            <Button size="sm" onClick={() => { setEditingItem(null); setSocialModalOpen(true); }} className="gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {socialLinks?.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 capitalize">{s.platform}</span>
                  <span className="text-gray-500 text-sm truncate max-w-xs">{s.url}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingItem(s); setSocialModalOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteItem("landing_page_social_links", s.id, "landing-social")}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* MODALS */}
      {/* Step Modal */}
      <ItemModal
        open={stepModalOpen}
        onOpenChange={setStepModalOpen}
        title={editingItem ? "Editar Passo" : "Novo Passo"}
        item={editingItem}
        fields={[
          { name: "icon", label: "Ícone", placeholder: "gift, star, users, trophy" },
          { name: "title", label: "Título" },
          { name: "description", label: "Descrição", multiline: true },
          { name: "ordem", label: "Ordem", type: "number" },
        ]}
        onSave={saveStep}
      />

      {/* FAQ Modal */}
      <ItemModal
        open={faqModalOpen}
        onOpenChange={setFaqModalOpen}
        title={editingItem ? "Editar FAQ" : "Nova FAQ"}
        item={editingItem}
        fields={[
          { name: "question", label: "Pergunta" },
          { name: "answer", label: "Resposta", multiline: true },
          { name: "ordem", label: "Ordem", type: "number" },
        ]}
        onSave={saveFAQ}
      />

      {/* Instagram Modal */}
      <ItemModal
        open={instaModalOpen}
        onOpenChange={setInstaModalOpen}
        title={editingItem ? "Editar Post" : "Novo Post"}
        item={editingItem}
        fields={[
          { name: "post_id", label: "ID do Post", placeholder: "DEdxmf0xX9x" },
          { name: "post_url", label: "URL do Post (opcional)" },
          { name: "caption", label: "Legenda (opcional)" },
          { name: "ordem", label: "Ordem", type: "number" },
        ]}
        onSave={saveInstagram}
      />

      {/* Nav Link Modal */}
      <ItemModal
        open={navModalOpen}
        onOpenChange={setNavModalOpen}
        title={editingItem ? "Editar Link" : "Novo Link"}
        item={editingItem}
        fields={[
          { name: "label", label: "Texto" },
          { name: "href", label: "URL" },
          { name: "ordem", label: "Ordem", type: "number" },
        ]}
        onSave={saveNavLink}
      />

      {/* Footer Link Modal */}
      <ItemModal
        open={footerModalOpen}
        onOpenChange={setFooterModalOpen}
        title={editingItem ? "Editar Link" : "Novo Link"}
        item={editingItem}
        fields={[
          { name: "label", label: "Texto" },
          { name: "href", label: "URL" },
          { name: "category", label: "Categoria", placeholder: "links, legal" },
          { name: "ordem", label: "Ordem", type: "number" },
        ]}
        onSave={saveFooterLink}
      />

      {/* Social Link Modal */}
      <ItemModal
        open={socialModalOpen}
        onOpenChange={setSocialModalOpen}
        title={editingItem ? "Editar Rede Social" : "Nova Rede Social"}
        item={editingItem}
        fields={[
          { name: "platform", label: "Plataforma", placeholder: "instagram, facebook, youtube" },
          { name: "url", label: "URL" },
          { name: "icon", label: "Ícone (opcional)" },
          { name: "ordem", label: "Ordem", type: "number" },
        ]}
        onSave={saveSocialLink}
      />
    </div>
  );
}

// ===== GENERIC MODAL COMPONENT =====
function ItemModal({ 
  open, 
  onOpenChange, 
  title, 
  item, 
  fields, 
  onSave 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  item: any;
  fields: { name: string; label: string; placeholder?: string; type?: string; multiline?: boolean }[];
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm(item);
    } else {
      const initial: any = {};
      fields.forEach(f => initial[f.name] = f.type === "number" ? 0 : "");
      setForm(initial);
    }
  }, [item, open]);

  async function handleSubmit() {
    setSaving(true);
    try {
      await onSave({ ...form, id: item?.id });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg text-white border-0"
        style={{
          background: "linear-gradient(135deg, rgba(17,17,17,0.95) 0%, rgba(31,31,31,0.95) 50%, rgba(17,17,17,0.95) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-xs text-gray-400 mb-2 block">{f.label}</label>
              {f.multiline ? (
                <Textarea
                  value={form[f.name] || ""}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="bg-gray-900/50 border border-gray-700/50 text-white rounded-lg"
                  rows={3}
                />
              ) : (
                <Input
                  type={f.type || "text"}
                  value={form[f.name] || ""}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                  placeholder={f.placeholder}
                  className="bg-gray-900/50 border border-gray-700/50 text-white rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            <span className="ml-2">Salvar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
