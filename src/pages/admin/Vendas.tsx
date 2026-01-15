import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Check, Loader2, Eye } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

type Venda = {
  id: number;
  code: string;
  product_name: string;
  total_amount: number;
  status: string;
  customer_name: string | null;
  payment_method: string | null;
  date_created?: string | null;
  afiliado_id?: string | null;
  customer_id?: string | null;
};

type Afiliado = {
  id: string;
  whatsapp: string;
  comissao_percent: number;
};

function isVendaFinalizada(status: string): boolean {
  const statusLower = status.toLowerCase();
  return statusLower === "1" || statusLower.includes("pago") || statusLower.includes("aprovado");
}

function useAfiliados() {
  return useQuery<Afiliado[]>({
    queryKey: ["afiliados-vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, whatsapp, comissao_percent");
      if (error) throw error;
      return data as Afiliado[];
    },
  });
}

const PAGE_SIZE = 10;

function useVendas(page: number) {
  return useQuery<Venda[]>({
    queryKey: ["vendas", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("order_list")
        .select("id, code, product_name, total_amount, status, customer_name, payment_method, date_created, afiliado_id, customer_id")
        .order("date_created", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data as Venda[];
    },
  });
}

function useVendasCount() {
  return useQuery<number>({
    queryKey: ["vendas-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("order_list")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
}

export default function Vendas() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: vendas, isLoading } = useVendas(page);
  const { data: totalCount, isLoading: loadingCount } = useVendasCount();

  const [modalOpen, setModalOpen] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  const { data: afiliados } = useAfiliados();

  function getAfiliadoNome(afiliadoId: string | null | undefined): string {
    if (!afiliadoId || !afiliados) return "—";
    const afiliado = afiliados.find(a => a.id === afiliadoId);
    return afiliado ? afiliado.whatsapp : afiliadoId;
  }

  function calcularComissao(totalAmount: number, afiliadoId: string | null | undefined): number {
    if (!afiliadoId || !afiliados) return 0;
    const afiliado = afiliados.find(a => a.id === afiliadoId);
    if (!afiliado) return 0;
    return (totalAmount * afiliado.comissao_percent) / 100;
  }

  function openVisualize(v: Venda) {
    setVendaSelecionada(v);
    setModalOpen(true);
  }

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">Vendas</h1>
        <p className="text-gray-500 text-sm mt-1">Visualize todas as vendas do sistema</p>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vendas && vendas.length > 0 ? vendas.map((v) => {
              const comissao = calcularComissao(v.total_amount, v.afiliado_id);
              
              return (
                <div
                  key={v.id}
                  className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
                  style={{
                    background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.8) 50%, rgba(17,17,17,0.9) 100%)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                    border: "1px solid rgba(245,158,11,0.15)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1">NSU: {v.code}</h2>
                    <p className="text-gray-400 text-sm mb-3">{v.product_name}</p>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                        R$ {Number(v.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        v.status === "1" 
                          ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30" 
                          : v.status === "0"
                          ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-500/30"
                          : "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30"
                      }`}>
                        {v.status === "1" ? "✓ Pago" : v.status === "0" ? "Pendente" : "Cancelado"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {v.date_created && <span>Data: {new Date(v.date_created).toLocaleDateString("pt-BR")}</span>}
                    </div>
                    {v.customer_name && (
                      <div className="text-xs text-gray-500 mt-2">
                        Cliente: <span className="text-gray-300">{v.customer_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {v.afiliado_id && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="text-gray-600">Afiliado:</span>
                        <span className="text-amber-400 font-medium">{getAfiliadoNome(v.afiliado_id)}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="text-gray-600">Comissão:</span>
                        <span className="text-amber-300 font-medium">R$ {comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => openVisualize(v)} 
                      className="flex-1 gap-1 bg-amber-900/30 text-amber-300 hover:bg-amber-800/40 border border-amber-700/50 rounded-lg transition-all duration-300"
                    >
                      <Eye size={16} /> Visualizar
                    </Button>
                  </div>
                  
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl group-hover:from-amber-500/20 transition-all duration-500" />

                  <div className="text-xs text-blue-400/60 flex items-center gap-1 mt-2 justify-center">
                    <Eye size={10} /> Modo visualização
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-16">
                <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.8) 50%, rgba(17,17,17,0.9) 100%)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                    <Eye size={32} className="text-amber-400" />
                  </div>
                  <p className="text-gray-400 text-lg">Nenhuma venda cadastrada</p>
                </div>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="secondary"
                className="bg-gray-800/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-amber-500/30 hover:bg-gray-700/80 transition-all duration-300"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Anterior
              </Button>
              <span className="text-gray-400 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                Página <span className="text-amber-400 font-semibold">{page}</span> de <span className="text-amber-400 font-semibold">{totalPages}</span>
              </span>
              <Button
                variant="secondary"
                className="bg-gray-800/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-amber-500/30 hover:bg-gray-700/80 transition-all duration-300"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent 
          className="max-w-lg text-white max-h-[90vh] overflow-y-auto border-0"
          style={{
            background: "linear-gradient(135deg, rgba(17,17,17,0.95) 0%, rgba(31,31,31,0.95) 50%, rgba(17,17,17,0.95) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Visualizar Venda
              </span>
              <span className="flex items-center gap-1 text-blue-400 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                <Eye size={12} /> Somente leitura
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {vendaSelecionada && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Código (NSU)</label>
                <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg">{vendaSelecionada.code}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Produto/Sorteio</label>
                <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg">{vendaSelecionada.product_name}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Valor da Venda</label>
                <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg font-semibold text-amber-400">R$ {Number(vendaSelecionada.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Status</label>
                <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg">{vendaSelecionada.status === "1" ? "Pago" : vendaSelecionada.status === "0" ? "Pendente" : vendaSelecionada.status}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Cliente</label>
                <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg">{vendaSelecionada.customer_name || "Não informado"}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Forma de Pagamento</label>
                <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg">{vendaSelecionada.payment_method || "Não informado"}</p>
              </div>
              
              {vendaSelecionada.afiliado_id && (
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Afiliado</label>
                  <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg">{getAfiliadoNome(vendaSelecionada.afiliado_id)}</p>
                </div>
              )}
              
              {vendaSelecionada.date_created && (
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Data/Hora</label>
                  <p className="bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm">{new Date(vendaSelecionada.date_created).toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-3 mt-6">
            <Button 
              onClick={() => setModalOpen(false)} 
              className="gap-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 border-0 rounded-lg transition-all duration-300"
            >
              <Check size={16} /> Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
