import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

type Sorteio = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_path?: string;
  status: boolean;
  date_of_draw?: string;
};

const MOCK_SORTEIOS: Sorteio[] = [
  {
    id: 1,
    name: "Sorteio Carro 0km",
    description: "Concorra a um carro 0km!",
    price: 10.0,
    image_path: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80",
    status: true,
    date_of_draw: "2025-12-01T20:00:00Z",
  },
  {
    id: 2,
    name: "Sorteio Moto",
    description: "Uma moto novinha esperando por você.",
    price: 5.0,
    image_path: "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80",
    status: false,
    date_of_draw: "2025-11-10T20:00:00Z",
  },
];

export default function Sorteios() {
  const [sorteios, setSorteios] = useState<Sorteio[]>(MOCK_SORTEIOS);
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
    if (editId) {
      setSorteios((prev) =>
        prev.map((s) =>
          s.id === editId
            ? { ...s, ...form, price: Number(form.price) }
            : s
        )
      );
    } else {
      setSorteios((prev) => [
        ...prev,
        {
          ...form,
          id: Math.max(0, ...prev.map((s) => s.id)) + 1,
          price: Number(form.price),
        },
      ]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar este sorteio?")) {
      setSorteios((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Sorteios</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={18} /> Novo Sorteio
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sorteios.map((s) => (
          <div
            key={s.id}
            className="bg-white/10 border border-white/20 rounded-2xl shadow-xl p-5 flex flex-col gap-3 backdrop-blur-xl relative"
            style={{
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {s.image_path && (
              <img
                src={s.image_path}
                alt={s.name}
                className="w-full h-40 object-cover rounded-xl mb-2 border border-white/10"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{s.name}</h2>
              <p className="text-gray-200 text-sm mb-2">{s.description}</p>
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
              <Button variant="secondary" size="sm" onClick={() => openEdit(s)} className="gap-1">
                <Pencil size={16} /> Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)} className="gap-1">
                <Trash2 size={16} /> Deletar
              </Button>
            </div>
          </div>
        ))}
        {sorteios.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            Nenhum sorteio cadastrado.
          </div>
        )}
      </div>

      {/* Modal de criar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editId ? "Editar Sorteio" : "Novo Sorteio"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              name="name"
              placeholder="Nome do sorteio"
              value={form.name}
              onChange={handleChange}
              className="bg-white/10 text-white"
            />
            <Textarea
              name="description"
              placeholder="Descrição"
              value={form.description}
              onChange={handleChange}
              className="bg-white/10 text-white"
            />
            <Input
              name="price"
              type="number"
              placeholder="Preço"
              value={form.price}
              onChange={handleChange}
              className="bg-white/10 text-white"
              min={0}
              step={0.01}
            />
            <Input
              name="image_path"
              placeholder="URL da imagem"
              value={form.image_path}
              onChange={handleChange}
              className="bg-white/10 text-white"
            />
            <Input
              name="date_of_draw"
              type="datetime-local"
              placeholder="Data do sorteio"
              value={form.date_of_draw ? form.date_of_draw.slice(0, 16) : ""}
              onChange={handleChange}
              className="bg-white/10 text-white"
            />
            <label className="flex items-center gap-2 text-white text-sm mt-2">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="accent-blue-500"
              />
              Ativo
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="gap-1">
              <X size={16} /> Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-1">
              <Check size={16} /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}