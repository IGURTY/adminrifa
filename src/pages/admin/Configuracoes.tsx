import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Eye, EyeOff, Copy, Settings } from "lucide-react";
import { showSuccess } from "@/utils/toast";

type ConfiguracaoSistema = {
  play_client_id: string;
  play_client_secret: string;
  play_webhook_url: string;
  play_ambiente: "sandbox" | "producao";
  pix_chave: string;
  pix_tipo_chave: string;
  pix_beneficiario: string;
  whatsapp_token: string;
  whatsapp_numero: string;
  whatsapp_instancia: string;
  nome_sistema: string;
  url_sistema: string;
  email_suporte: string;
};

const defaultConfig: ConfiguracaoSistema = {
  play_client_id: "",
  play_client_secret: "",
  play_webhook_url: "",
  play_ambiente: "sandbox",
  pix_chave: "",
  pix_tipo_chave: "cpf",
  pix_beneficiario: "",
  whatsapp_token: "",
  whatsapp_numero: "",
  whatsapp_instancia: "",
  nome_sistema: "Mira Milionária",
  url_sistema: "",
  email_suporte: "",
};

export default function Configuracoes() {
  const [form, setForm] = useState<ConfiguracaoSistema>(defaultConfig);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("system_config");
    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    setSaving(true);
    localStorage.setItem("system_config", JSON.stringify(form));
    setTimeout(() => {
      setSaving(false);
      showSuccess("Configurações salvas com sucesso!");
    }, 500);
  }

  function toggleShowSecret(field: string) {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    showSuccess("Copiado para a área de transferência!");
  }

  const cardStyle = {
    background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.9) 50%, rgba(17,17,17,0.9) 100%)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
    border: "1px solid rgba(245, 158, 11, 0.15)",
  };

  const inputClass = "bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300";

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
          <Settings className="w-8 h-8 text-amber-400" />
          Configurações do Sistema
        </h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie todas as configurações do sistema</p>
      </div>

      {/* Gateway Play */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={cardStyle}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center text-black text-sm font-bold shadow-lg shadow-amber-500/20">P</span>
          Gateway de Pagamento - Play
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Configure as credenciais do gateway Play para processar pagamentos PIX.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Client ID</label>
            <div className="relative">
              <Input
                name="play_client_id"
                placeholder="Seu Client ID"
                value={form.play_client_id}
                onChange={handleChange}
                type={showSecrets.play_client_id ? "text" : "password"}
                className={`${inputClass} pr-20`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => toggleShowSecret("play_client_id")} className="text-gray-500 hover:text-amber-400 p-1 transition-colors">
                  {showSecrets.play_client_id ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => copyToClipboard(form.play_client_id)} className="text-gray-500 hover:text-amber-400 p-1 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Client Secret</label>
            <div className="relative">
              <Input
                name="play_client_secret"
                placeholder="Seu Client Secret"
                value={form.play_client_secret}
                onChange={handleChange}
                type={showSecrets.play_client_secret ? "text" : "password"}
                className={`${inputClass} pr-20`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => toggleShowSecret("play_client_secret")} className="text-gray-500 hover:text-amber-400 p-1 transition-colors">
                  {showSecrets.play_client_secret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => copyToClipboard(form.play_client_secret)} className="text-gray-500 hover:text-amber-400 p-1 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">URL do Webhook</label>
            <Input
              name="play_webhook_url"
              placeholder="https://seusite.com/api/webhook/play"
              value={form.play_webhook_url}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Ambiente</label>
            <select
              name="play_ambiente"
              value={form.play_ambiente}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
            >
              <option value="sandbox">Sandbox (Testes)</option>
              <option value="producao">Produção</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configurações PIX */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={cardStyle}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-emerald-500/20">💰</span>
          Configurações PIX
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Tipo de Chave PIX</label>
            <select
              name="pix_tipo_chave"
              value={form.pix_tipo_chave}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">Email</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave Aleatória</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Chave PIX</label>
            <Input
              name="pix_chave"
              placeholder="Sua chave PIX"
              value={form.pix_chave}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">Nome do Beneficiário</label>
            <Input
              name="pix_beneficiario"
              placeholder="Nome que aparecerá no PIX"
              value={form.pix_beneficiario}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={cardStyle}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-green-500/20">📱</span>
          Integração WhatsApp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Número do WhatsApp</label>
            <Input
              name="whatsapp_numero"
              placeholder="5511999999999"
              value={form.whatsapp_numero}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">ID da Instância</label>
            <Input
              name="whatsapp_instancia"
              placeholder="ID da instância"
              value={form.whatsapp_instancia}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">Token da API</label>
            <div className="relative">
              <Input
                name="whatsapp_token"
                placeholder="Token de autenticação"
                value={form.whatsapp_token}
                onChange={handleChange}
                type={showSecrets.whatsapp_token ? "text" : "password"}
                className={`${inputClass} pr-20`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => toggleShowSecret("whatsapp_token")} className="text-gray-500 hover:text-amber-400 p-1 transition-colors">
                  {showSecrets.whatsapp_token ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => copyToClipboard(form.whatsapp_token)} className="text-gray-500 hover:text-amber-400 p-1 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações Gerais */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={cardStyle}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent" />
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-gray-500/20">⚙️</span>
          Configurações Gerais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Nome do Sistema</label>
            <Input
              name="nome_sistema"
              placeholder="Mira Milionária"
              value={form.nome_sistema}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">URL do Sistema</label>
            <Input
              name="url_sistema"
              placeholder="https://miramilionaria.com.br"
              value={form.url_sistema}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">Email de Suporte</label>
            <Input
              name="email_suporte"
              placeholder="suporte@miramilionaria.com.br"
              value={form.email_suporte}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black px-8 py-3 rounded-lg font-semibold shadow-lg shadow-amber-500/20 border-0 transition-all duration-300 hover:shadow-amber-500/40"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Salvando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check size={18} />
              Salvar Configurações
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}