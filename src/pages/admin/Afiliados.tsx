import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

type Afiliado = {
  id: string;
  customer_id: string;
  whatsapp: string;
  link: string;
  comissao_percent: number;
  created_at?: string;
};

const PAGE_SIZE = 10;

function useAfiliados(page: number) {
  return useQuery<Afiliado[]>({
    queryKey: ["afiliados", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, customer_id, whatsapp, link, comissao_percent, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data as Afiliado[];
    },
  });
}

function useAfiliadosCount() {
  return useQuery<number>({
    queryKey: ["afiliados-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("afiliados")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
}

export default function Afiliados() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: afiliados, isLoading } = useAfiliados(page);
  const { data: totalCount, isLoading: loadingCount } = useAfiliadosCount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Afiliado, "id" | "created_at">>({
    customer_id: "",
    whatsapp: "",
    link: "",
    comissao_percent: 5,
  });

  // CREATE/UPDATE
  const mutationUpsert = useMutation({
    mutationFn: async (input: Partial<Afiliado> & { id?: string }) => {
      if (input.id) {
        // update
        const { error } = await supabase
          .from("afiliados")
          .update({
            customer_id: input.customer_id,
            whatsapp: input.whatsapp,
            link: input.link,
            comissao_percent: input.comissao_percent,
          })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        // insert
        const { error } = await supabase
          .from("afiliados")
          .insert({
            customer_id: input.customer_id,
            whatsapp: input.whatsapp,
            link: input.link,
            comissao_percent: input.comissao_percent,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Afiliado salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["afiliados"] });
      queryClient.invalidateQueries({ queryKey: ["afiliados-count"] });
      setModalOpen(false);
    },
    onError: () => showError("Erro ao salvar afiliado."),
  });

  // DELETE
  const mutationDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("afiliados")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Afiliado excluído!");
      queryClient.invalidateQueries({ queryKey: ["afiliados"] });
      queryClient.invalidateQueries({ queryKey: ["afiliados-count"] });
    },
    onError: () => showError("Erro ao excluir afiliado."),
  });

  function openCreate() {
    setEditId(null);
    setForm({
      customer_id: "",
      whatsapp: "",
      link: "",
      comissao_percent: 5,
    });
    setModalOpen(true);
  }

  function openEdit(a: Afiliado) {
    setEditId(a.id);
    setForm({
      customer_id: a.customer_id,
      whatsapp: a.whatsapp,
      link: a.link,
      comissao_percent: a.comissao_percent,
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
    if (!form.customer_id || !form.whatsapp || !form.link) return;
    mutationUpsert.mutate(editId ? { ...form, id: editId } : form);
  }

  function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja excluir este afiliado?")) {
      mutationDelete.mutate(id);
    }
  }

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
            Afiliados
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie sua rede de afiliados</p>
        </div>
        <Button 
          onClick={openCreate} 
          className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 border-0 transition-all duration-300 hover:shadow-amber-500/40"
        >
          <Plus size={18} /> Novo Afiliado
        </Button>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {afiliados && afiliados.length > 0 ? afiliados.map((a) => (
              <div
                key={a.id}
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
                  <h2 className="text-xl font-bold text-white break-all mb-1">{a.whatsapp}</h2>
                  <p className="text-gray-400 text-sm mb-3 break-all">{a.link}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 font-bold text-lg">
                      Comissão: {a.comissao_percent}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID Cliente: <span className="break-all text-gray-400">{a.customer_id}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 relative z-10">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => openEdit(a)} 
                    className="gap-1 bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 rounded-lg transition-all duration-300"
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(a.id)} 
                    className="gap-1 bg-red-900/50 text-red-300 hover:bg-red-800/70 border border-red-800/50 rounded-lg transition-all duration-300" 
                    disabled={mutationDelete.isPending}
                  >
                    <Trash2 size={16} /> Excluir
                  </Button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                Nenhum afiliado cadastrado.
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
              {editId ? "Editar Afiliado" : "Novo Afiliado"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">ID do Cliente</label>
              <Input
                name="customer_id"
                placeholder="ID do Cliente"
                value={form.customer_id}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">WhatsApp</label>
              <Input
                name="whatsapp"
                placeholder="WhatsApp"
                value={form.whatsapp}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Link</label>
              <Input
                name="link"
                placeholder="Link"
                value={form.link}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Comissão (%)</label>
              <Input
                name="comissao_percent"
                type="number"
                placeholder="Comissão (%)"
                value={form.comissao_percent}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
                min={0}
                step={0.01}
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