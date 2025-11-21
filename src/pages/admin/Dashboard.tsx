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
    <div className={dark ? "dark bg-[#181c1f] min-h-screen" : "bg-gray-100 min-h-screen"}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">Dashboard Mira Milionária</h1>
        <button
          className="p-2 rounded-full bg-[#23272b] hover:bg-[#23272b] transition"
          onClick={() => setDark((d) => !d)}
          aria-label="Alternar modo escuro"
        >
          {dark ? <Sun className="text-gray-400" /> : <Moon className="text-gray-800" />}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <CardGlass
          title="Afiliados"
          value={totalAfiliados}
          icon={<UserPlus className="w-10 h-10 text-gray-400" />}
        />
        <CardGlass
          title="Clientes"
          value={totalClientes}
          icon={<Users className="w-10 h-10 text-gray-400" />}
        />
        <CardGlass
          title="Vendas"
          value={totalVendas}
          icon={<DollarSign className="w-10 h-10 text-gray-400" />}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <CardGlass
          title="Receita Total"
          value={<span className="text-3xl font-bold text-white">R$ {receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
          icon={<DollarSign className="w-10 h-10 text-gray-400" />}
        />
        <CardGlass
          title="Comissão Total"
          value={<span className="text-3xl font-bold text-white">R$ {totalComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
          icon={<Percent className="w-10 h-10 text-gray-400" />}
        />
        <CardGlass
          title="Configurações Gerais"
          value={<span className="text-base text-gray-300">Acesse as configurações do sistema</span>}
          icon={<Settings className="w-10 h-10 text-gray-400" />}
        />
      </div>
      <div className="mt-8">
        <CardGlass
          title="Configurações Gerais"
          value={
            <ul className="text-gray-300 text-base list-disc pl-5 space-y-1">
              <li>Modo escuro ativado</li>
              <li>Cards com efeito glass</li>
              <li>Pronto para conectar ao Supabase</li>
            </ul>
          }
          icon={<Settings className="w-10 h-10 text-gray-400" />}
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
    <div
      className="backdrop-blur-xl bg-[#23272b] border border-zinc-700 rounded-2xl shadow-2xl p-7 flex flex-col gap-3 glass-card transition hover:scale-[1.02] hover:shadow-2xl"
      style={{
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
        border: "1px solid #23272b",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="bg-[#23272b] rounded-full p-3 flex items-center justify-center shadow">
          {icon}
        </div>
        <div className="text-lg md:text-xl font-semibold text-white drop-shadow">{title}</div>
      </div>
      <div className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">{value}</div>
    </div>
  );
}