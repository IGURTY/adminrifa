import { useQuery } from "@tanstack/react-query";
import { Loader2, Percent, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Afiliado = {
  id: string;
  whatsapp: string;
  comissao_percent: number;
};

type Venda = {
  id: number;
  total_amount: number;
  afiliado_id: string | null;
};

function useAfiliados() {
  return useQuery<Afiliado[]>({
    queryKey: ["afiliados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, whatsapp, comissao_percent");
      if (error) throw error;
      return data as Afiliado[];
    },
  });
}

function useVendas() {
  return useQuery<Venda[]>({
    queryKey: ["vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_list")
        .select("id, total_amount, afiliado_id");
      if (error) throw error;
      return data as Venda[];
    },
  });
}

export default function Comissoes() {
  const { data: afiliados, isLoading: loadingAfiliados } = useAfiliados();
  const { data: vendas, isLoading: loadingVendas } = useVendas();

  if (loadingAfiliados || loadingVendas) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  // Calcula totais por afiliado
  const resumo = (afiliados || []).map((af) => {
    const vendasAfiliado = (vendas || []).filter((v) => v.afiliado_id === af.id);
    const totalVendas = vendasAfiliado.length;
    const valorVendas = vendasAfiliado.reduce((acc, v) => acc + Number(v.total_amount), 0);
    const totalComissao = valorVendas * (af.comissao_percent / 100);
    return {
      ...af,
      totalVendas,
      valorVendas,
      totalComissao,
    };
  });

  const totalGeralVendas = resumo.reduce((acc, af) => acc + af.valorVendas, 0);
  const totalGeralComissao = resumo.reduce((acc, af) => acc + af.totalComissao, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
          Comissões dos Afiliados
        </h1>
        <p className="text-gray-400 text-sm mt-1">Acompanhe o desempenho da sua rede</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ResumoCard
          title="Total de Vendas"
          value={`R$ ${totalGeralVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-8 h-8 text-emerald-400" />}
          accentColor="emerald"
        />
        <ResumoCard
          title="Total de Comissões"
          value={`R$ ${totalGeralComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<Percent className="w-8 h-8 text-amber-400" />}
          accentColor="amber"
        />
        <ResumoCard
          title="Afiliados"
          value={afiliados?.length || 0}
          icon={<Users className="w-8 h-8 text-purple-400" />}
          accentColor="purple"
        />
      </div>
      <div 
        className="overflow-x-auto rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.9) 50%, rgba(17,17,17,0.9) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
          border: "1px solid rgba(245, 158, 11, 0.15)",
        }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <table className="min-w-full text-white">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="py-4 px-6 text-left text-gray-400 font-medium text-sm">WhatsApp</th>
              <th className="py-4 px-6 text-left text-gray-400 font-medium text-sm">Comissão (%)</th>
              <th className="py-4 px-6 text-left text-gray-400 font-medium text-sm">Qtd. Vendas</th>
              <th className="py-4 px-6 text-left text-gray-400 font-medium text-sm">Valor Vendido</th>
              <th className="py-4 px-6 text-left text-gray-400 font-medium text-sm">Total Comissão</th>
            </tr>
          </thead>
          <tbody>
            {resumo.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-12">
                  Nenhum afiliado encontrado.
                </td>
              </tr>
            )}
            {resumo.map((af, idx) => (
              <tr 
                key={af.id} 
                className={`border-t border-gray-800/30 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-black/20' : ''}`}
              >
                <td className="py-4 px-6 font-medium">{af.whatsapp}</td>
                <td className="py-4 px-6">
                  <span className="bg-amber-900/30 text-amber-300 px-3 py-1 rounded-full text-sm font-medium">
                    {af.comissao_percent}%
                  </span>
                </td>
                <td className="py-4 px-6">{af.totalVendas}</td>
                <td className="py-4 px-6">
                  R$ {af.valorVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-6 text-amber-400 font-bold">
                  R$ {af.totalComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResumoCard({
  title,
  value,
  icon,
  accentColor = "amber",
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accentColor?: "amber" | "emerald" | "purple";
}) {
  const gradients = {
    amber: "from-amber-500/20 to-amber-500/5",
    emerald: "from-emerald-500/20 to-emerald-500/5",
    purple: "from-purple-500/20 to-purple-500/5",
  };

  const borders = {
    amber: "rgba(245, 158, 11, 0.2)",
    emerald: "rgba(16, 185, 129, 0.2)",
    purple: "rgba(168, 85, 247, 0.2)",
  };

  return (
    <div 
      className={`rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}
      style={{
        background: `linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.9) 50%, rgba(17,17,17,0.9) 100%)`,
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
        border: `1px solid ${borders[accentColor]}`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[accentColor]} opacity-30`} />
      <div 
        className="relative z-10 rounded-full p-3 flex items-center justify-center"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${borders[accentColor]}`,
        }}
      >
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-sm font-medium text-gray-400">{title}</div>
        <div className="text-2xl font-extrabold text-white">{value}</div>
      </div>
    </div>
  );
}