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
        <Loader2 className="animate-spin text-gray-400" size={32} />
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
      <h1 className="text-2xl font-bold text-white mb-6">Comissões dos Afiliados</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ResumoCard
          title="Total de Vendas"
          value={`R$ ${totalGeralVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-8 h-8 text-emerald-300" />}
        />
        <ResumoCard
          title="Total de Comissões"
          value={`R$ ${totalGeralComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<Percent className="w-8 h-8 text-pink-300" />}
        />
        <ResumoCard
          title="Afiliados"
          value={afiliados?.length || 0}
          icon={<Users className="w-8 h-8 text-blue-400" />}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#181c1f] border border-zinc-800 rounded-xl shadow-xl text-white">
          <thead>
            <tr className="bg-[#23272b]">
              <th className="py-3 px-4 text-left">WhatsApp</th>
              <th className="py-3 px-4 text-left">Comissão (%)</th>
              <th className="py-3 px-4 text-left">Qtd. Vendas</th>
              <th className="py-3 px-4 text-left">Valor Vendido</th>
              <th className="py-3 px-4 text-left">Total Comissão</th>
            </tr>
          </thead>
          <tbody>
            {resumo.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  Nenhum afiliado encontrado.
                </td>
              </tr>
            )}
            {resumo.map((af) => (
              <tr key={af.id} className="border-t border-zinc-800 hover:bg-[#23272b] transition">
                <td className="py-2 px-4">{af.whatsapp}</td>
                <td className="py-2 px-4">{af.comissao_percent}%</td>
                <td className="py-2 px-4">{af.totalVendas}</td>
                <td className="py-2 px-4">
                  R$ {af.valorVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-4 text-emerald-300 font-bold">
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
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#181c1f] border border-zinc-800 rounded-2xl shadow-xl p-6 flex items-center gap-4">
      <div className="bg-white/10 rounded-full p-3 flex items-center justify-center shadow">{icon}</div>
      <div>
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="text-2xl font-extrabold text-white">{value}</div>
      </div>
    </div>
  );
}