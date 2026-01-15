import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Pencil, Trash2, Plus, Check, X, Loader2, Eye, User, Calendar, DollarSign, Hash, CreditCard, ShoppingCart, ChevronDown, ChevronRight, Ticket 
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

type Cliente = {
  id: string;
  nome: string | null;
  telefone: string;
  email: string | null;
  cpf: string | null;
  created_at?: string;
};

type Transacao = {
  id: number;
  code: string;
  product_name: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  date_created: string | null;
  afiliado_id: string | null;
};

type Afiliado = {
  id: string;
  whatsapp: string;
  comissao_percent: number;
};

const PAGE_SIZE = 10;

function useClientes(page: number) {
  return useQuery<Cliente[]>({
    queryKey: ["clientes", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("customer_list")
        .select("id, nome, telefone, email, cpf, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data as Cliente[];
    },
  });
}

function useClientesCount() {
  return useQuery<number>({
    queryKey: ["clientes-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("customer_list")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
}

// Hook para buscar transações de um cliente específico
function useClienteTransacoes(clienteId: string | null) {
  return useQuery<Transacao[]>({
    queryKey: ["cliente-transacoes", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      const { data, error } = await supabase
        .from("order_list")
        .select("id, code, product_name, total_amount, status, payment_method, date_created, afiliado_id")
        .eq("customer_id", clienteId)
        .order("date_created", { ascending: false });
      if (error) throw error;
      return data as Transacao[];
    },
    enabled: !!clienteId,
  });
}

// Hook para buscar afiliados (para mostrar info do afiliado nas transações)
function useAfiliados() {
  return useQuery<Afiliado[]>({
    queryKey: ["afiliados-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, whatsapp, comissao_percent");
      if (error) throw error;
      return data as Afiliado[];
    },
  });
}


// Componente do Modal de Histórico do Cliente (Drill-down)
function HistoricoClienteModal({
  cliente,
  open,
  onClose,
}: {
  cliente: Cliente | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: transacoes, isLoading } = useClienteTransacoes(cliente?.id || null);
  const { data: afiliados } = useAfiliados();
  const [expandedTransacoes, setExpandedTransacoes] = useState<Set<number>>(new Set());

  const toggleTransacao = (id: number) => {
    setExpandedTransacoes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getAfiliadoInfo = (afiliadoId: string | null) => {
    if (!afiliadoId || !afiliados) return null;
    return afiliados.find(a => a.id === afiliadoId);
  };

  const calcularTotalGasto = () => {
    if (!transacoes) return 0;
    return transacoes.reduce((acc, t) => acc + Number(t.total_amount), 0);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pago") || statusLower === "1" || statusLower === "aprovado") {
      return "text-emerald-400 bg-emerald-900/30";
    }
    if (statusLower.includes("pendente") || statusLower === "0") {
      return "text-yellow-400 bg-yellow-900/30";
    }
    if (statusLower.includes("cancelado") || statusLower === "-1") {
      return "text-red-400 bg-red-900/30";
    }
    return "text-gray-400 bg-gray-900/30";
  };

  const getStatusLabel = (status: string) => {
    if (status === "1") return "Pago";
    if (status === "0") return "Pendente";
    if (status === "-1") return "Cancelado";
    return status;
  };

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden text-white border-0"
        style={{
          background: "linear-gradient(135deg, rgba(17,17,17,0.98) 0%, rgba(31,31,31,0.98) 50%, rgba(17,17,17,0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
            <User className="w-6 h-6 text-amber-400" />
            Histórico do Cliente
          </DialogTitle>
        </DialogHeader>

        {/* Informações do Cliente */}
        <div 
          className="rounded-xl p-4 mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(40,40,40,0.8) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.1)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-500 text-xs">Nome</span>
              <p className="text-white font-semibold">{cliente.nome || "Não informado"}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Telefone</span>
              <p className="text-white font-semibold">{cliente.telefone}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Email</span>
              <p className="text-white font-semibold truncate">{cliente.email || "Não informado"}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">CPF</span>
              <p className="text-white font-semibold">{cliente.cpf || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div 
            className="rounded-xl p-4 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <ShoppingCart className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{transacoes?.length || 0}</p>
            <p className="text-gray-400 text-xs">Transações</p>
          </div>
          <div 
            className="rounded-xl p-4 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              R$ {calcularTotalGasto().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-xs">Total Gasto</p>
          </div>
          <div 
            className="rounded-xl p-4 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
            }}
          >
            <Ticket className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">-</p>
            <p className="text-gray-400 text-xs">Cotas Compradas</p>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="overflow-y-auto max-h-[40vh] pr-2">
          <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <ShoppingCart size={18} />
            Transações (NSU)
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-amber-400" size={32} />
            </div>
          ) : transacoes && transacoes.length > 0 ? (
            <div className="space-y-3">
              {transacoes.map((transacao) => {
                const afiliado = getAfiliadoInfo(transacao.afiliado_id);
                const isExpanded = expandedTransacoes.has(transacao.id);
                const comissao = afiliado 
                  ? (Number(transacao.total_amount) * afiliado.comissao_percent / 100)
                  : 0;

                return (
                  <div
                    key={transacao.id}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(40,40,40,0.8) 100%)",
                      border: "1px solid rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    {/* Cabeçalho da Transação - Clicável */}
                    <button
                      onClick={() => toggleTransacao(transacao.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronDown className="text-amber-400" size={20} />
                        ) : (
                          <ChevronRight className="text-gray-500" size={20} />
                        )}
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <Hash size={14} className="text-gray-500" />
                            <span className="text-white font-mono text-sm">{transacao.code}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transacao.status)}`}>
                              {getStatusLabel(transacao.status)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{transacao.product_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-bold">
                          R$ {Number(transacao.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {transacao.date_created 
                            ? new Date(transacao.date_created).toLocaleDateString("pt-BR")
                            : "Data não informada"
                          }
                        </p>
                      </div>
                    </button>

                    {/* Detalhes Expandidos */}
                    {isExpanded && (
                      <div 
                        className="border-t border-gray-800/50"
                        style={{ background: "rgba(0,0,0,0.3)" }}
                      >
                        {/* Informações da Transação */}
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <CreditCard size={12} /> Pagamento
                            </span>
                            <p className="text-white">{transacao.payment_method || "Não informado"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <Calendar size={12} /> Data/Hora
                            </span>
                            <p className="text-white">
                              {transacao.date_created 
                                ? new Date(transacao.date_created).toLocaleString("pt-BR")
                                : "Não informado"
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <User size={12} /> Afiliado
                            </span>
                            <p className="text-white">
                              {afiliado ? afiliado.whatsapp : "Venda direta"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <DollarSign size={12} /> Comissão
                            </span>
                            <p className="text-amber-400 font-semibold">
                              {afiliado 
                                ? `R$ ${comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${afiliado.comissao_percent}%)`
                                : "N/A"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              className="text-center text-gray-500 py-8 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(40,40,40,0.8) 100%)",
                border: "1px solid rgba(245, 158, 11, 0.1)",
              }}
            >
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma transação encontrada para este cliente.</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={onClose}
            className="bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 rounded-lg transition-all duration-300"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Clientes() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: clientes, isLoading } = useClientes(page);
  const { data: totalCount, isLoading: loadingCount } = useClientesCount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id" | "created_at">>({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
  });

  // Estado para o modal de histórico (drill-down)
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  // CREATE/UPDATE
  const mutationUpsert = useMutation({
    mutationFn: async (input: Partial<Cliente> & { id?: string }) => {
      if (input.id) {
        const { error } = await supabase
          .from("customer_list")
          .update({
            nome: input.nome,
            telefone: input.telefone,
            email: input.email,
            cpf: input.cpf,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customer_list")
          .insert({
            nome: input.nome,
            telefone: input.telefone,
            email: input.email,
            cpf: input.cpf,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Cliente salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["clientes-count"] });
      setModalOpen(false);
    },
    onError: () => showError("Erro ao salvar cliente."),
  });

  // DELETE
  const mutationDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customer_list")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Cliente excluído!");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["clientes-count"] });
    },
    onError: () => showError("Erro ao excluir cliente."),
  });

  function openCreate() {
    setEditId(null);
    setForm({
      nome: "",
      telefone: "",
      email: "",
      cpf: "",
    });
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditId(c.id);
    setForm({
      nome: c.nome || "",
      telefone: c.telefone,
      email: c.email || "",
      cpf: c.cpf || "",
    });
    setModalOpen(true);
  }

  function openHistorico(c: Cliente) {
    setClienteSelecionado(c);
    setHistoricoModalOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSave() {
    if (!form.telefone) return;
    mutationUpsert.mutate(editId ? { ...form, id: editId } : form);
  }

  function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      mutationDelete.mutate(id);
    }
  }

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button 
          onClick={openCreate} 
          className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 border-0 transition-all duration-300 hover:shadow-amber-500/40"
        >
          <Plus size={18} /> Novo Cliente
        </Button>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clientes && clientes.length > 0 ? clientes.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.9) 50%, rgba(17,17,17,0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.05)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex-1 relative z-10">
                  {/* Nome clicável para abrir histórico */}
                  <button
                    onClick={() => openHistorico(c)}
                    className="text-xl font-bold text-white break-all hover:text-amber-400 transition-colors text-left flex items-center gap-2 group"
                  >
                    {c.nome || "Sem nome"}
                    <Eye size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                  </button>
                  <div className="text-gray-400 text-sm mb-2 break-all">{c.email}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-bold text-lg">
                      {c.telefone}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    CPF: <span className="break-all text-gray-400">{c.cpf}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 relative z-10 flex-wrap">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => openHistorico(c)} 
                    className="gap-1 bg-amber-900/30 text-amber-300 hover:bg-amber-800/40 border border-amber-700/50 rounded-lg transition-all duration-300"
                  >
                    <Eye size={16} /> Histórico
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => openEdit(c)} 
                    className="gap-1 bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 rounded-lg transition-all duration-300"
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(c.id)} 
                    className="gap-1 bg-red-900/50 text-red-300 hover:bg-red-800/70 border border-red-800/50 rounded-lg transition-all duration-300" 
                    disabled={mutationDelete.isPending}
                  >
                    <Trash2 size={16} /> Excluir
                  </Button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                Nenhum cliente cadastrado.
              </div>
            )}
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="secondary"
                className="bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 rounded-lg transition-all duration-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-amber-400/80 font-medium">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                className="bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 rounded-lg transition-all duration-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
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
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              {editId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Nome</label>
              <Input
                name="nome"
                placeholder="Nome"
                value={form.nome || ""}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Telefone</label>
              <Input
                name="telefone"
                placeholder="Telefone"
                value={form.telefone}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Email</label>
              <Input
                name="email"
                placeholder="Email"
                value={form.email || ""}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">CPF</label>
              <Input
                name="cpf"
                placeholder="CPF"
                value={form.cpf || ""}
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

      {/* Modal de Histórico (Drill-down) */}
      <HistoricoClienteModal
        cliente={clienteSelecionado}
        open={historicoModalOpen}
        onClose={() => {
          setHistoricoModalOpen(false);
          setClienteSelecionado(null);
        }}
      />
    </div>
  );
}