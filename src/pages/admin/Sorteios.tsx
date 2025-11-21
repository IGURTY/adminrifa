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

function useSorteios() {
  return useQuery<Sorteio[]>({
    queryKey: ["sorteios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_list")
        .select("id, name, description, price, image_path, status, date_of_draw")
        .eq("delete_flag", false)
        .order("id", { ascending: false });
      if (error) throw error;
      return data as Sorteio[];
    },
  });
}

export default function Sorteios() {
  const queryClient = useQueryClient();
  const { data: sorteios, isLoading } = useSorteios();

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Sorteios</h1>
        <Button onClick={openCreate} className="gap-2 bg-black hover:bg-zinc-900 text-white">
          <Plus size={18} /> Novo Sorteio
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sorteios && sorteios.length > 0 ? sorteios.map((s) => (
            <div
              key={s.id}
              className="bg-[#181c1f] border border-zinc-800 rounded-2xl shadow-xl p-5 flex flex-col gap-3 backdrop-blur-xl relative"
              style={{
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
                border: "1px solid #23272b",
              }}
            >
              {s.image_path && (
                <img
                  src={s.image_path}
                  alt={s.name}
                  className="w-full h-40 object-cover rounded-xl mb-2 border border-zinc-900"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{s.name}</h2>
                <p className="text-gray-300 text-sm mb-2">{s.description}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-emerald-300 font-bold text-lg">
                    R$ {Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={s.status ? "text-green-400" : "text-red-400"}>
                    {s.status ? "Ativo" : "Inativo"}
                  </span>
                </div>
                {s.date_of_draw && (
                  <div className="text-xs text-gray-400">
                    Sorteio: {new Date(s.date_of_draw).toLocaleString("pt-BR")}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(s)} className="gap-1 bg-zinc-900 text-white hover:bg-zinc-800">
                  <Pencil size={16} /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)} className="gap-1 bg-red-800 text-white hover:bg-red-900" disabled={mutationDelete.isPending}>
                  <Trash2 size={16} /> Deletar
                </Button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-400 py-12">
              Nenhum sorteio cadastrado.
            </div>
          )}
        </div>
      )}

      {/* Modal de criar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-[#181c1f] border border-zinc-800 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-white">
              {editId ? "Editar Sorteio" : "Novo Sorteio"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              name="name"
              placeholder="Nome do sorteio"
              value={form.name}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Textarea
              name="description"
              placeholder="Descrição"
              value={form.description}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="price"
              type="number"
              placeholder="Preço"
              value={form.price}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
              min={0}
              step={0.01}
            />
            <Input
              name="image_path"
              placeholder="URL da imagem"
              value={form.image_path}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="date_of_draw"
              type="datetime-local"
              placeholder="Data do sorteio"
              value={form.date_of_draw ? form.date_of_draw.slice(0, 16) : ""}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <label className="flex items-center gap-2 text-white text-sm mt-2">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="accent-blue-500 bg-zinc-900 border-zinc-700"
              />
              Ativo
            </label>
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