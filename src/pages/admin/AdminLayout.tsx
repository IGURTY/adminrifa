import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gift,
  Users,
  ShoppingCart,
  Percent,
  UserPlus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
  { to: "/admin/sorteios", label: "Sorteios", icon: <Gift size={22} /> },
  { to: "/admin/afiliados", label: "Afiliados", icon: <UserPlus size={22} /> },
  { to: "/admin/clientes", label: "Clientes", icon: <Users size={22} /> },
  { to: "/admin/vendas", label: "Vendas", icon: <ShoppingCart size={22} /> },
  { to: "/admin/comissoes", label: "Comissões", icon: <Percent size={22} /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erro ao sair: " + error.message);
    } else {
      showSuccess("Logout realizado com sucesso!");
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="bg-[#23272b] min-h-screen flex">
      {/* Sidebar fixa */}
      <aside className="fixed top-0 left-0 h-screen w-20 z-30 flex flex-col items-center py-6 bg-[#181c1f] border-r border-[#23272b] shadow-lg">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            M
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {adminLinks.map((link) => {
            const active = location.pathname === link.to || (link.to === "/admin" && location.pathname === "/admin");
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                  active
                    ? "bg-gray-700 text-white shadow-lg"
                    : "text-gray-400 hover:bg-[#23272b] hover:text-white"
                )}
                title={link.label}
              >
                {link.icon}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto mb-2 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 rounded-lg text-gray-400 hover:bg-red-900 hover:text-white transition-colors"
            title="Sair do Sistema"
          >
            <LogOut size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
            <span>M</span>
          </div>
        </div>
      </aside>
      {/* Conteúdo principal */}
      <div className="flex-1 ml-20 min-h-screen flex flex-col">
        <main className="flex-1 p-8 bg-[#23272b] min-h-[calc(100vh-48px)]">
          <Outlet />
        </main>
        {/* Footer fixo */}
        <footer className="h-12 flex items-center justify-center bg-[#181c1f] border-t border-[#23272b] text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Mira Milionária. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}