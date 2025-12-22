import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Check, X, Loader2, Lock, Eye, AlertTriangle } from "lucide-react";
import { showSuccess, showError, showWarning } from "@/utils/toast";
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

// Verifica se uma venda está finalizada (paga/aprovada)
function isVendaFinalizada(status: string): boolean {
  const statusLower = status.toLowerCase();
  return statusLower === "1" || statusLower.includes("pago") || statusLower.includes("aprovado") || statusLower.includes("finalizado");
}

// Hook para buscar afiliados
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
  const [editId, setEditId] = useState<number | null>(null);
  const [vendaOriginal, setVendaOriginal] = useState<Venda | null>(null); // Para saber se estava finalizada
  const [form, setForm] = useState<Omit<Venda, "id" | "date_created">>({
    code: "",
    product_name: "",
    total_amount: 0,
    status: "1",
    customer_name: "",
    payment_method: "",
    afiliado_id: "",
  });

  // Busca afiliados para exibir nome
  const { data: afiliados } = useAfiliados();

  // Verifica se a venda sendo editada está finalizada (campos financeiros bloqueados)
  const isEditandoVendaFinalizada = editId !== null && vendaOriginal && isVendaFinalizada(vendaOriginal.status);

  // Helper para obter nome do afiliado
  function getAfiliadoNome(afiliadoId: string | null | undefined): string {
    if (!afiliadoId || !afiliados) return "—";
    const afiliado = afiliados.find(a => a.id === afiliadoId);
    return afiliado ? afiliado.whatsapp : afiliadoId;
  }

  // Calcula comissão (somente visualização)
  function calcularComissao(totalAmount: number, afiliadoId: string | null | undefined): number {
    if (!afiliadoId || !afiliados) return 0;
    const afiliado = afiliados.find(a => a.id === afiliadoId);
    if (!afiliado) return 0;
    return (totalAmount * afiliado.comissao_percent) / 100;
  }

  // CREATE/UPDATE
  const mutationUpsert = useMutation({
    mutationFn: async (input: Partial<Venda> & { id?: number }) => {
      if (input.id) {
        // update
        const { error } = await supabase
          .from("order_list")
          .update({
            code: input.code,
            product_name: input.product_name,
            total_amount: input.total_amount,
            status: input.status,
            customer_name: input.customer_name,
            payment_method: input.payment_method,
            date_created: new Date().toISOString(),
          })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        // insert
        const { error } = await supabase
          .from("order_list")
          .insert({
            code: input.code,
            product_name: input.product_name,
            total_amount: input.total_amount,
            status: input.status,
            customer_name: input.customer_name,
            payment_method: input.payment_method,
            date_created: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Venda salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
      queryClient.invalidateQueries({ queryKey: ["vendas-count"] });
      setModalOpen(false);
    },
    onError: () => showError("Erro ao salvar venda."),
  });

  // DELETE
  const mutationDelete = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("order_list")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Venda excluída!");
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
      queryClient.invalidateQueries({ queryKey: ["vendas-count"] });
    },
    onError: () => showError("Erro ao excluir venda."),
  });

  function openCreate() {
    setEditId(null);
    setVendaOriginal(null);
    setForm({
      code: "",
      product_name: "",
      total_amount: 0,
      status: "1",
      customer_name: "",
      payment_method: "",
      afiliado_id: "",
    });
    setModalOpen(true);
  }

  function openEdit(v: Venda) {
    setEditId(v.id);
    setVendaOriginal(v); // Armazena a venda original para verificar se estava finalizada
    setForm({
      code: v.code,
      product_name: v.product_name,
      total_amount: v.total_amount,
      status: v.status,
      customer_name: v.customer_name || "",
      payment_method: v.payment_method || "",
      afiliado_id: v.afiliado_id || "",
    });
    
    // Mostra aviso se a venda está finalizada
    if (isVendaFinalizada(v.status)) {
      showWarning("Esta venda está finalizada. Os campos financeiros (valor, comissão e afiliado) estão bloqueados para edição.");
    }
    
    setModalOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleSave() {
    if (!form.code || !form.product_name) return;
    mutationUpsert.mutate(editId ? { ...form, id: editId } : form);
  }

  function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja excluir esta venda?")) {
      mutationDelete.mutate(id);
    }
  }

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">Vendas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie todas as vendas do sistema</p>
        </div>
        <Button 
          onClick={openCreate} 
          className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 border border-amber-400/30 backdrop-blur-sm transition-all duration-300 hover:shadow-amber-500/40 hover:scale-105"
        >
          <Plus size={18} /> Nova Venda
        </Button>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vendas && vendas.length > 0 ? vendas.map((v) => {
              const finalizada = isVendaFinalizada(v.status);
              const comissao = calcularComissao(v.total_amount, v.afiliado_id);
              
              return (
              <div
                key={v.id}
                className={`relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  finalizada 
                    ? "bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-amber-500/30 shadow-lg shadow-amber-500/10" 
                    : "bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/80 border border-gray-700/50"
                }`}
                style={{
                  backdropFilter: "blur(20px)",
                  boxShadow: finalizada 
                    ? "0 8px 32px 0 rgba(245, 158, 11, 0.15), inset 0 1px 0 0 rgba(255,255,255,0.05)" 
                    : "0 8px 32px 0 rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Efeito de brilho superior */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                
                {/* Badge de status finalizado */}
                {finalizada && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg font-semibold">
                    <Lock size={10} /> Finalizada
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white break-all mb-1">{v.product_name}</h2>
                  <div className="text-gray-400 text-sm mb-3 break-all">{v.customer_name}</div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                      R$ {Number(v.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`font-semibold text-sm px-3 py-1 rounded-full ${
                      finalizada 
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30" 
                        : "bg-gray-700/50 text-gray-300 border border-gray-600/30"
                    }`}>
                      {finalizada ? "✓ Pago" : v.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-500 flex items-center gap-2">
                      <span className="text-gray-600">Código:</span>
                      <span className="text-gray-300 break-all">{v.code}</span>
                    </div>
                    <div className="text-gray-500 flex items-center gap-2">
                      <span className="text-gray-600">Pagamento:</span>
                      <span className="text-gray-300 break-all">{v.payment_method}</span>
                    </div>
                    <div className="text-gray-500 flex items-center gap-2">
                      <span className="text-gray-600">Data:</span>
                      <span className="text-gray-300 break-all">{v.date_created ? new Date(v.date_created).toLocaleString("pt-BR") : ""}</span>
                    </div>
                  </div>
                  
                  {/* Informações do afiliado e comissão */}
                  {v.afiliado_id && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="text-gray-600">Afiliado:</span>
                        <span className="text-amber-400 font-medium">{getAfiliadoNome(v.afiliado_id)}</span>
                        {finalizada && <Lock size={10} className="text-amber-500/70" />}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="text-gray-600">Comissão:</span>
                        <span className="text-amber-300 font-medium">R$ {comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        {finalizada && <Lock size={10} className="text-amber-500/70" />}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => openEdit(v)} 
                    className="flex-1 gap-1 bg-gradient-to-r from-amber-600/90 to-yellow-500/90 hover:from-amber-500 hover:to-yellow-400 text-black font-semibold border-0 shadow-md shadow-amber-500/20 transition-all duration-300"
                  >
                    {finalizada ? <Eye size={16} /> : <Pencil size={16} />}
                    {finalizada ? "Ver/Editar" : "Editar"}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(v.id)} 
                    className="gap-1 bg-gray-800/80 hover:bg-red-900/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-red-700/50 transition-all duration-300" 
                    disabled={mutationDelete.isPending || finalizada}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                {/* Indicador de proteção */}
                {finalizada && (
                  <div className="text-xs text-amber-400/60 flex items-center gap-1 mt-2 justify-center">
                    <Lock size={10} /> Campos financeiros protegidos
                  </div>
                )}
              </div>
            )}) : (
              <div className="col-span-full text-center py-16">
                <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/80 border border-gray-700/50" style={{ backdropFilter: "blur(20px)" }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                    <Plus size={32} className="text-amber-400" />
                  </div>
                  <p className="text-gray-400 text-lg">Nenhuma venda cadastrada</p>
                  <Button 
                    onClick={openCreate}
                    className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                  >
                    <Plus size={18} /> Criar primeira venda
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="secondary"
                className="bg-gray-800/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-amber-500/30 hover:bg-gray-700/80 transition-all duration-300 backdrop-blur-sm"
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
                className="bg-gray-800/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-amber-500/30 hover:bg-gray-700/80 transition-all duration-300 backdrop-blur-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de criar/editar */}
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
          {/* Efeito de brilho superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                {editId ? "Editar Venda" : "Nova Venda"}
              </span>
              {isEditandoVendaFinalizada && (
                <span className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  <Lock size={12} /> Finalizada
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {/* Aviso de campos bloqueados */}
          {isEditandoVendaFinalizada && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl mb-4">
              <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-gray-300">
                <strong className="text-amber-300">Atenção:</strong> Esta venda está finalizada. Os campos de <span className="text-amber-300">Valor da Venda</span>, <span className="text-amber-300">Comissão</span> e <span className="text-amber-300">Afiliado</span> estão bloqueados para manter a integridade dos registros financeiros.
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Código (NSU)</label>
              <Input
                name="code"
                placeholder="Código"
                value={form.code}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Produto/Sorteio</label>
              <Input
                name="product_name"
                placeholder="Produto"
                value={form.product_name}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            
            {/* CAMPO BLOQUEADO: Valor da Venda */}
            <div className="relative">
              <label className="text-xs text-gray-400 mb-2 flex items-center gap-2 font-medium">
                Valor da Venda
                {isEditandoVendaFinalizada && <Lock size={10} className="text-amber-400" />}
              </label>
              <Input
                name="total_amount"
                type="number"
                placeholder="Valor"
                value={form.total_amount}
                onChange={handleChange}
                className={`bg-gray-900/50 border text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 rounded-lg transition-all duration-300 ${
                  isEditandoVendaFinalizada 
                    ? "border-amber-500/30 bg-amber-500/5 cursor-not-allowed opacity-60" 
                    : "border-gray-700/50 focus:border-amber-500/50"
                }`}
                min={0}
                step={0.01}
                disabled={isEditandoVendaFinalizada}
                readOnly={isEditandoVendaFinalizada}
              />
              {isEditandoVendaFinalizada && (
                <Lock size={14} className="absolute right-3 top-9 text-amber-400" />
              )}
            </div>
            
            {/* CAMPO BLOQUEADO: Afiliado */}
            <div className="relative">
              <label className="text-xs text-gray-400 mb-2 flex items-center gap-2 font-medium">
                Código do Afiliado
                {isEditandoVendaFinalizada && <Lock size={10} className="text-amber-400" />}
              </label>
              <Input
                name="afiliado_id"
                placeholder="ID do Afiliado"
                value={form.afiliado_id || ""}
                onChange={handleChange}
                className={`bg-gray-900/50 border text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 rounded-lg transition-all duration-300 ${
                  isEditandoVendaFinalizada 
                    ? "border-amber-500/30 bg-amber-500/5 cursor-not-allowed opacity-60" 
                    : "border-gray-700/50 focus:border-amber-500/50"
                }`}
                disabled={isEditandoVendaFinalizada}
                readOnly={isEditandoVendaFinalizada}
              />
              {isEditandoVendaFinalizada && (
                <Lock size={14} className="absolute right-3 top-9 text-amber-400" />
              )}
              {form.afiliado_id && (
                <div className="text-xs text-amber-400/80 mt-2">
                  Afiliado: {getAfiliadoNome(form.afiliado_id)}
                </div>
              )}
            </div>
            
            {/* CAMPO CALCULADO (SOMENTE LEITURA): Comissão */}
            {form.afiliado_id && (
              <div className="relative">
                <label className="text-xs text-gray-400 mb-2 flex items-center gap-2 font-medium">
                  Comissão (calculada automaticamente)
                  <Lock size={10} className="text-amber-400" />
                </label>
                <div className={`bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border px-4 py-3 rounded-lg flex items-center gap-3 ${
                  isEditandoVendaFinalizada ? "border-amber-500/30" : "border-gray-700/50"
                }`}>
                  <Lock size={14} className="text-amber-400" />
                  <span className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    R$ {calcularComissao(form.total_amount, form.afiliado_id).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({afiliados?.find(a => a.id === form.afiliado_id)?.comissao_percent || 0}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Este valor é calculado automaticamente e não pode ser editado.
                </p>
              </div>
            )}
            
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Status</label>
              <Input
                name="status"
                placeholder="Status"
                value={form.status}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Cliente</label>
              <Input
                name="customer_name"
                placeholder="Cliente"
                value={form.customer_name || ""}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Forma de Pagamento</label>
              <Input
                name="payment_method"
                placeholder="Forma de Pagamento"
                value={form.payment_method || ""}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            
          </div>
          
          <DialogFooter className="gap-3 mt-6">
            <Button 
              variant="secondary" 
              onClick={() => setModalOpen(false)} 
              className="gap-2 bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 rounded-lg transition-all duration-300"
            >
              <X size={16} /> Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 border-0 rounded-lg transition-all duration-300 hover:shadow-amber-500/40" 
              disabled={mutationUpsert.isPending}
            >
              {mutationUpsert.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}