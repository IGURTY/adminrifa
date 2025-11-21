import { useState } from "react";
import { Sun, Moon, Users, DollarSign, UserPlus, Settings, Percent } from "lucide-react";

const MOCK_AFILIADOS = [
  { id: "1", comissao_percent: 5 },
  { id: "2", comissao_percent: 10 },
];
const MOCK_CLIENTES = [
  { id: "1" },
  { id: "2" },
  { id: "3" },
];
const MOCK_VENDAS = [
  { id: 1, total_amount: 100, afiliado_id: "1" },
  { id: 2, total_amount: 200, afiliado_id: "2" },
  { id: 3, total_amount: 150, afiliado_id: "1" },
];

function getTotalComissao() {
  let total = 0;
  for (const venda of MOCK_VENDAS) {
    const afiliado = MOCK_AFILIADOS.find(a => a.id === venda.afiliado_id);
    if (afiliado) {
      total += (venda.total_amount * afiliado.comissao_percent) / 100;
    }
  }
  return total;
}

export default function Dashboard() {
  const [dark, setDark] = useState(true);

  // Dados mockados
  const totalAfiliados = MOCK_AFILIADOS.length;
  const totalClientes = MOCK_CLIENTES.length;
  const totalVendas = MOCK_VENDAS.length;
  const receita = MOCK_VENDAS.reduce((acc, v) => acc + v.total_amount, 0);
  const totalComissao = getTotalComissao();

  return (
    <div className={dark ? "dark bg-gradient-to-br from-[#181c1f] to-[#23272b] min-h-screen" : "bg-gray-100 min-h-screen"}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white drop-shadow">Dashboard Mira Milionária</h1>
        <button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          onClick={() => setDark((d) => !d)}
          aria-label="Alternar modo escuro"
        >
          {dark ? <Sun className="text-yellow-300" /> : <Moon className="text-gray-800" />}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardGlass
          title="Afiliados"
          value={totalAfiliados}
          icon={<UserPlus className="w-8 h-8 text-blue-300" />}
        />
        <CardGlass
          title="Clientes"
          value={totalClientes}
          icon={<Users className="w-8 h-8 text-green-300" />}
        />
        <CardGlass
          title="Vendas"
          value={totalVendas}
          icon={<DollarSign className="w-8 h-8 text-yellow-300" />}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardGlass
          title="Receita Total"
          value={`R$ ${receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-8 h-8 text-emerald-300" />}
        />
        <CardGlass
          title="Comissão Total"
          value={`R$ ${totalComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<Percent className="w-8 h-8 text-pink-300" />}
        />
        <CardGlass
          title="Configurações Gerais"
          value={<span className="text-sm text-gray-200">Acesse as configurações do sistema</span>}
          icon={<Settings className="w-8 h-8 text-gray-300" />}
        />
      </div>
      <div className="mt-8">
        <CardGlass
          title="Configurações Gerais"
          value={
            <div className="text-gray-200 text-sm">
              <p>• Modo escuro ativado</p>
              <p>• Cards com efeito glass</p>
              <p>• Pronto para conectar ao Supabase</p>
            </div>
          }
          icon={<Settings className="w-8 h-8 text-gray-300" />}
        />
      </div>
    </div>
  );
}

function CardGlass({
  title,
  value,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg p-6 flex flex-col gap-2 glass-card transition hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 rounded-full p-2">{icon}</div>
        <div className="text-lg font-semibold text-white drop-shadow">{title}</div>
      </div>
      <div className="text-2xl font-bold text-white drop-shadow">{value}</div>
    </div>
  );
}