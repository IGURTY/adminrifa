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
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
            Dashboard Mira Milionária
          </h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do sistema</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardGlass
          title="Afiliados"
          value={totalAfiliados}
          icon={<UserPlus className="w-8 h-8" />}
          color="amber"
        />
        <CardGlass
          title="Clientes"
          value={totalClientes}
          icon={<Users className="w-8 h-8" />}
          color="amber"
        />
        <CardGlass
          title="Vendas"
          value={totalVendas}
          icon={<DollarSign className="w-8 h-8" />}
          color="amber"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CardGlass
          title="Receita Total"
          value={<span className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">R$ {receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
        />
        <CardGlass
          title="Comissão Total"
          value={<span className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">R$ {totalComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
          icon={<Percent className="w-8 h-8" />}
          color="purple"
        />
      </div>
    </div>
  );
}

function CardGlass({
  title,
  value,
  icon,
  color = "amber",
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color?: "amber" | "green" | "purple";
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
      style={{
        background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.8) 50%, rgba(17,17,17,0.9) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        border: "1px solid rgba(245,158,11,0.15)",
      }}
    >
      {/* Efeito de brilho superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      
      <div className="flex items-center gap-4">
        <div 
          className="rounded-xl p-3 flex items-center justify-center text-black"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
            boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
          }}
        >
          {icon}
        </div>
        <div className="text-lg font-semibold text-gray-300">{title}</div>
      </div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      
      {/* Efeito decorativo de canto */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl group-hover:from-amber-500/20 transition-all duration-500" />
    </div>
  );
}