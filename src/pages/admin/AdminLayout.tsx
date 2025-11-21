import { Link, Outlet, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/sorteios", label: "Sorteios" },
  { to: "/admin/afiliados", label: "Afiliados" },
  { to: "/admin/clientes", label: "Clientes" },
  { to: "/admin/vendas", label: "Vendas" },
  { to: "/admin/comissoes", label: "Comissões" },
  { to: "/admin/usuarios", label: "Usuários" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? "dark bg-gradient-to-br from-[#181c1f] to-[#23272b] min-h-screen" : "bg-gray-100 min-h-screen"}>
      {/* Header fixo */}
      <header className="fixed top-0 left-0 w-full z-30 backdrop-blur-md bg-white/10 border-b border-white/20 flex items-center justify-between px-8 h-16">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-white drop-shadow">Mira Milionária Admin</span>
        </div>
        <button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          onClick={() => setDark((d) => !d)}
          aria-label="Alternar modo escuro"
        >
          {dark ? <Sun className="text-yellow-300" /> : <Moon className="text-gray-800" />}
        </button>
      </header>

      {/* Sidebar + Main */}
      <div className="flex pt-16 pb-16 min-h-screen">
        <aside className="w-56 bg-white/10 border-r border-white/20 flex flex-col py-6 px-4 min-h-[calc(100vh-64px)]">
          <nav className="flex-1">
            <ul className="space-y-2">
              {adminLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={cn(
                      "block px-3 py-2 rounded transition-colors",
                      location.pathname === link.to
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100/10 text-gray-200"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      {/* Footer fixo */}
      <footer className="fixed bottom-0 left-0 w-full z-30 backdrop-blur-md bg-white/10 border-t border-white/20 flex items-center justify-center h-12">
        <span className="text-gray-300 text-sm">
          &copy; {new Date().getFullYear()} Mira Milionária. Todos os direitos reservados.
        </span>
      </footer>
    </div>
  );
}