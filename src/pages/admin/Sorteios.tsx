import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

type Sorteio = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_path?: string;
  status: boolean;
  date_of_draw?: string;
};

const PAGE_SIZE = 10;

function useSorteios(page: number) {
  return useQuery<Sorteio[]>({
    queryKey: ["sorteios", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("product_list")
        .select("id, name, description, price, image_path, status, date_of_draw", { count: "exact" })
        .eq("delete_flag", false)
        .order("id", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data as Sorteio[];
    },
  });
}

function useSorteiosCount() {
  return useQuery<number>({
    queryKey: ["sorteios-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("product_list")
        .select("*", { count: "exact", head: true })
        .eq("delete_flag", false);
      if (error) throw error;
      return count || 0;
    },
  });
}

export default function Sorteios() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: sorteios, isLoading } = useSorteios(page);
  const { data: totalCount, isLoading: loadingCount } = useSorteiosCount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Sorteio, "id">>({
    name: "",
    description: "",
    price: 0,
    image_path: "",
    status: true,
    date_of_draw: "",
  });

  // CREATE/UPDATE
  const mutationUpsert = useMutation({
    mutationFn: async (input: Partial<Sorteio> & { id?: number }) => {
      if (input.id) {
        // update
        const { error } = await supabase
          .from("product_list")
          .update({
            name: input.name,
            description: input.description,
            price: input.price,
            image_path: input.image_path,
            status: input.status,
            date_of_draw: input.date_of_draw || null,
            date_updated: new Date().toISOString(),
          })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        // insert
        const { error } = await supabase
          .from("product_list")
          .insert({
            name: input.name,
            description: input.description,
            price: input.price,
            image_path: input.image_path,
            status: input.status,
            date_of_draw: input.date_of_draw || null,
            qty_numbers: "0",
            min_purchase: "1",
            max_purchase: "1",
            slug: input.name?.toLowerCase().replace(/\s+/g, "-") || "",
            pending_numbers: "",
            paid_numbers: "",
            ranking_qty: "",
            enable_ranking: "false",
            enable_progress_bar: "false",
            status_display: "ativo",
            private_draw: "false",
            featured_draw: "false",
            enable_cotapremiada: "false",
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Sorteio salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["sorteios"] });
      queryClient.invalidateQueries({ queryKey: ["sorteios-count"] });
      setModalOpen(false);
    },
    onError: () => showError("Erro ao salvar sorteio."),
  });

  // DELETE
  const mutationDelete = useMutation({
    mutationFn: async (id: number) => {
      // Soft delete (set delete_flag = true)
      const { error } = await supabase
        .from("product_list")
        .update({ delete_flag: true, date_updated: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Sorteio deletado!");
      queryClient.invalidateQueries({ queryKey: ["sorteios"] });
      queryClient.invalidateQueries({ queryKey: ["sorteios-count"] });
    },
    onError: () => showError("Erro ao deletar sorteio."),
  });

  function openCreate() {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      price: 0,
      image_path: "",
      status: true,
      date_of_draw: "",
    });
    setModalOpen(true);
  }

  function openEdit(s: Sorteio) {
    setEditId(s.id);
    setForm({
      name: s.name,
      description: s.description,
      price: s.price,
      image_path: s.image_path || "",
      status: s.status,
      date_of_draw: s.date_of_draw || "",
    });
    setModalOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  }

  function handleSave() {
    if (!form.name || !form.description) return;
    mutationUpsert.mutate(editId ? { ...form, id: editId } : form);
  }

  function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar este sorteio?")) {
      mutationDelete.mutate(id);
    }
  }

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">Sorteios</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os sorteios do sistema</p>
        </div>
        <Button 
          onClick={openCreate} 
          className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 border border-amber-400/30 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-105"
        >
          <Plus size={18} /> Novo Sorteio
        </Button>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sorteios && sorteios.length > 0 ? sorteios.map((s) => (
              <div
                key={s.id}
                className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
                style={{
                  background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.8) 50%, rgba(17,17,17,0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                {/* Efeito de brilho superior */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                
                {s.image_path && (
                  <img
                    src={s.image_path}
                    alt={s.name}
                    className="w-full h-40 object-cover rounded-xl mb-2 border border-amber-500/20"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{s.name}</h2>
                  <p className="text-gray-400 text-sm mb-3">{s.description}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                      R$ {Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      s.status 
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30" 
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>
                      {s.status ? "✓ Ativo" : "Inativo"}
                    </span>
                  </div>
                  {s.date_of_draw && (
                    <div className="text-xs text-gray-500">
                      Sorteio: <span className="text-gray-300">{new Date(s.date_of_draw).toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => openEdit(s)} 
                    className="flex-1 gap-1 bg-gradient-to-r from-amber-600/90 to-yellow-500/90 hover:from-amber-500 hover:to-yellow-400 text-black font-semibold border-0 shadow-md shadow-amber-500/20 transition-all duration-300"
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(s.id)} 
                    className="gap-1 bg-gray-800/80 hover:bg-red-900/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-red-700/50 transition-all duration-300" 
                    disabled={mutationDelete.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                {/* Efeito decorativo */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl group-hover:from-amber-500/20 transition-all duration-500" />
              </div>
            )) : (
              <div className="col-span-full text-center py-16">
                <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(31,31,31,0.8) 50%, rgba(17,17,17,0.9) 100%)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                    <Plus size={32} className="text-amber-400" />
                  </div>
                  <p className="text-gray-400 text-lg">Nenhum sorteio cadastrado</p>
                  <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20">
                    <Plus size={18} /> Criar primeiro sorteio
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
              {editId ? "Editar Sorteio" : "Novo Sorteio"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Nome do Sorteio</label>
              <Input
                name="name"
                placeholder="Nome do sorteio"
                value={form.name}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Descrição</label>
              <Textarea
                name="description"
                placeholder="Descrição"
                value={form.description}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Preço</label>
              <Input
                name="price"
                type="number"
                placeholder="Preço"
                value={form.price}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
                min={0}
                step={0.01}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">URL da Imagem</label>
              <Input
                name="image_path"
                placeholder="URL da imagem"
                value={form.image_path}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Data do Sorteio</label>
              <Input
                name="date_of_draw"
                type="datetime-local"
                placeholder="Data do sorteio"
                value={form.date_of_draw ? form.date_of_draw.slice(0, 16) : ""}
                onChange={handleChange}
                className="bg-gray-900/50 border border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-lg transition-all duration-300"
              />
            </div>
            <label className="flex items-center gap-3 text-white text-sm mt-2 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="w-5 h-5 rounded accent-amber-500 bg-gray-900 border-gray-700"
              />
              <span className="text-gray-300">Sorteio Ativo</span>
            </label>
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