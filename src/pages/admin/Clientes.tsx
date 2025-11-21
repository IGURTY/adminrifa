import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

type Cliente = {
  id: string;
  firstname: string | null;
  phone: string;
  email: string | null;
  cpf: string | null;
  avatar?: string | null;
  date_created?: string;
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
        .select("id, firstname, phone, email, cpf, avatar, date_created")
        .order("date_created", { ascending: false })
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

export default function Clientes() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: clientes, isLoading } = useClientes(page);
  const { data: totalCount, isLoading: loadingCount } = useClientesCount();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id" | "date_created" | "avatar">>({
    firstname: "",
    phone: "",
    email: "",
    cpf: "",
  });

  // CREATE/UPDATE
  const mutationUpsert = useMutation({
    mutationFn: async (input: Partial<Cliente> & { id?: string }) => {
      if (input.id) {
        // update
        const { error } = await supabase
          .from("customer_list")
          .update({
            firstname: input.firstname,
            phone: input.phone,
            email: input.email,
            cpf: input.cpf,
            date_updated: new Date().toISOString(),
          })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        // insert
        const { error } = await supabase
          .from("customer_list")
          .insert({
            firstname: input.firstname,
            phone: input.phone,
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
      firstname: "",
      phone: "",
      email: "",
      cpf: "",
    });
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditId(c.id);
    setForm({
      firstname: c.firstname || "",
      phone: c.phone,
      email: c.email || "",
      cpf: c.cpf || "",
    });
    setModalOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSave() {
    if (!form.phone) return;
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <Button onClick={openCreate} className="gap-2 bg-black hover:bg-zinc-900 text-white">
          <Plus size={18} /> Novo Cliente
        </Button>
      </div>
      {isLoading || loadingCount ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {clientes && clientes.length > 0 ? clientes.map((c) => (
              <div
                key={c.id}
                className="bg-[#181c1f] border border-zinc-800 rounded-2xl shadow-xl p-5 flex flex-col gap-3 backdrop-blur-xl relative"
                style={{
                  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
                  border: "1px solid #23272b",
                }}
              >
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white break-all">{c.firstname || "Sem nome"}</h2>
                  <div className="text-gray-300 text-sm mb-2 break-all">{c.email}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-300 font-bold text-lg">
                      {c.phone}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    CPF: <span className="break-all">{c.cpf}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(c)} className="gap-1 bg-zinc-900 text-white hover:bg-zinc-800">
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)} className="gap-1 bg-red-800 text-white hover:bg-red-900" disabled={mutationDelete.isPending}>
                    <Trash2 size={16} /> Excluir
                  </Button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-400 py-12">
                Nenhum cliente cadastrado.
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
              {editId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              name="firstname"
              placeholder="Nome"
              value={form.firstname || ""}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="phone"
              placeholder="Telefone"
              value={form.phone}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="email"
              placeholder="Email"
              value={form.email || ""}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-700"
            />
            <Input
              name="cpf"
              placeholder="CPF"
              value={form.cpf || ""}
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