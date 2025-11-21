import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, UserPlus, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Afiliado = {
  id: string;
  comissao_percent: number;
};

type Cliente = {
  id: string;
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
        .select("id, comissao_percent");
      if (error) throw error;
      return data as Afiliado[];
    },
  });
}

function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_list")
        .select("id");
      if (error) throw error;
      return data as Cliente[];
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

export default function Dashboard() {
  const { data: afiliados, isLoading: loadingAfiliados } = useAfiliados();
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: vendas, isLoading: loadingVendas } = useVendas();

  if (loadingAfiliados || loadingClientes || loadingVendas) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-gray-400 text-lg">Carregando...</span>
      </div>
    );
  }

  // Totais reais
  const totalAfiliados = afiliados?.length || 0;
  const totalClientes = clientes?.length || 0;
  const totalVendas = vendas?.length || 0;
  const receita = vendas?.reduce((acc, v) => acc + Number(v.total_amount), 0) || 0;

  // Comissão total dos afiliados
  let totalComissao = 0;
  if (afiliados && vendas) {
    for (const venda of vendas) {
      if (venda.afiliado_id) {
        const afiliado = afiliados.find(a => a.id === venda.afiliado_id);
        if (afiliado) {
          totalComissao += (Number(venda.total_amount) * Number(afiliado.comissao_percent)) / 100;
        }
      }
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">Dashboard Mira Milionária</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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