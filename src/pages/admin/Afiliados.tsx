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

function useAfiliados() {
  return useQuery<Afiliado[]>({
    queryKey: ["afiliados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, customer_id, whatsapp, link, comissao_percent, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Afiliado[];
    },
  });
}

export default function Afiliados() {
  const queryClient = useQueryClient();
  const { data: afiliados, isLoading } = useAfiliados();

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Afiliados</h1>
        <Button onClick={openCreate} className="gap-2 bg-black hover:bg-zinc-900 text-white">
          <Plus size={18} /> Novo Afiliado
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {afiliados && afiliados.length > 0 ? afiliados.map((a) => (
            <div
              key={a.id}
              className="bg-[#181c1f] border border-zinc-800 rounded-2xl shadow-xl p-5 flex flex-col gap-3 backdrop-blur-xl relative"
              style={{
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
                border: "1px solid #23272b",
              }}
            >
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white break-all">{a.whatsapp}</h2>
                <p className="text-gray-300 text-sm mb-2 break-all">{a.link}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-300 font-bold text-lg">
                    Comissão: {a.comissao_percent}%
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  ID Cliente: <span className="break-all">{a.customer_id}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(a)} className="gap-1 bg-zinc-900 text-white hover:bg-zinc-800">
                  <Pencil size={16} /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)} className="gap-1 bg-red-800 text-white hover:bg-red-900" disabled={mutationDelete.isPending}>
                  <Trash2 size={16} /> Excluir
                </Button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-400 py-12">
              Nenhum afiliado cadastrado.
            </div>
          )}
        </div>
      )}

      {/* Modal de criar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-[#181c1f] border border-zinc-800 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-white">
              {editId ? "Editar Afiliado" : "Novo Afiliado"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              name="customer_id"
              placeholder="ID do Cliente"
              value={form.customer_id}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="whatsapp"
              placeholder="WhatsApp"
              value={form.whatsapp}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="link"
              placeholder="Link"
              value={form.link}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="comissao_percent"
              type="number"
              placeholder="Comissão (%)"
              value={form.comissao_percent}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
              min={0}
              step={0.01}
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