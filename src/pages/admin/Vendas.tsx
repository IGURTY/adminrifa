import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
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
};

const PAGE_SIZE = 10;

function useVendas(page: number) {
  return useQuery<Venda[]>({
    queryKey: ["vendas", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("order_list")
        .select("id, code, product_name, total_amount, status, customer_name, payment_method, date_created")
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
  const [form, setForm] = useState<Omit<Venda, "id" | "date_created">>({
    code: "",
    product_name: "",
    total_amount: 0,
    status: "1",
    customer_name: "",
    payment_method: "",
  });

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
    setForm({
      code: "",
      product_name: "",
      total_amount: 0,
      status: "1",
      customer_name: "",
      payment_method: "",
    });
    setModalOpen(true);
  }

  function openEdit(v: Venda) {
    setEditId(v.id);
    setForm({
      code: v.code,
      product_name: v.product_name,
      total_amount: v.total_amount,
      status: v.status,
      customer_name: v.customer_name || "",
      payment_method: v.payment_method || "",
    });
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Vendas</h1>
        <Button onClick={openCreate} className="gap-2 bg-black hover:bg-zinc-900 text-white">
          <Plus size={18} /> Nova Venda
        </Button>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {vendas && vendas.length > 0 ? vendas.map((v) => (
              <div
                key={v.id}
                className="bg-[#181c1f] border border-zinc-800 rounded-2xl shadow-xl p-5 flex flex-col gap-3 backdrop-blur-xl relative"
                style={{
                  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
                  border: "1px solid #23272b",
                }}
              >
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white break-all">{v.product_name}</h2>
                  <div className="text-gray-300 text-sm mb-2 break-all">{v.customer_name}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-300 font-bold text-lg">
                      R$ {Number(v.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-blue-300 font-bold text-base">
                      {v.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Código: <span className="break-all">{v.code}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Pagamento: <span className="break-all">{v.payment_method}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Data: <span className="break-all">{v.date_created ? new Date(v.date_created).toLocaleString("pt-BR") : ""}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(v)} className="gap-1 bg-zinc-900 text-white hover:bg-zinc-800">
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id)} className="gap-1 bg-red-800 text-white hover:bg-red-900" disabled={mutationDelete.isPending}>
                    <Trash2 size={16} /> Excluir
                  </Button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-400 py-12">
                Nenhuma venda cadastrada.
              </div>
            )}
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="secondary"
                className="bg-zinc-800 text-white"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-gray-300">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                className="bg-zinc-800 text-white"
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
        <DialogContent className="max-w-lg bg-[#181c1f] border border-zinc-800 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-white">
              {editId ? "Editar Venda" : "Nova Venda"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              name="code"
              placeholder="Código"
              value={form.code}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="product_name"
              placeholder="Produto"
              value={form.product_name}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="total_amount"
              type="number"
              placeholder="Valor"
              value={form.total_amount}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
              min={0}
              step={0.01}
            />
            <Input
              name="status"
              placeholder="Status"
              value={form.status}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="customer_name"
              placeholder="Cliente"
              value={form.customer_name || ""}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="payment_method"
              placeholder="Forma de Pagamento"
              value={form.payment_method || ""}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="gap-1 bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700">
              <X size={16} /> Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-1 bg-blue-900 text-white hover:bg-blue-800 border border-blue-800" disabled={mutationUpsert.isPending}>
              {mutationUpsert.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}