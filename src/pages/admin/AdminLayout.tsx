import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gift,
  Users,
  ShoppingCart,
  Percent,
  UserPlus,
  LogOut,
  Settings,
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
  { to: "/admin/configuracoes", label: "Configurações", icon: <Settings size={22} /> },
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
    <div className="bg-gradient-to-br from-gray-950 via-black to-gray-900 min-h-screen flex">
      {/* Sidebar fixa com efeito glass */}
      <aside 
        className="fixed top-0 left-0 h-screen w-20 z-30 flex flex-col items-center py-6 border-r border-amber-500/10"
        style={{
          background: "linear-gradient(180deg, rgba(17,17,17,0.95) 0%, rgba(0,0,0,0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "4px 0 30px rgba(0,0,0,0.5), inset -1px 0 0 rgba(245,158,11,0.1)",
        }}
      >
        {/* Logo com brilho dourado */}
        <div className="mb-8">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
              boxShadow: "0 4px 20px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            M
          </div>
        </div>
        
        {/* Links de navegação */}
        <nav className="flex-1 flex flex-col gap-2">
          {adminLinks.map((link) => {
            const active = location.pathname === link.to || (link.to === "/admin" && location.pathname === "/admin");
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                  active
                    ? "text-black shadow-lg"
                    : "text-gray-500 hover:text-amber-400 hover:bg-amber-500/10"
                )}
                style={active ? {
                  background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
                } : {}}
                title={link.label}
              >
                {link.icon}
              </Link>
            );
          })}
        </nav>
        
        {/* Botão de logout */}
        <div className="mt-auto mb-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 rounded-xl text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
            title="Sair do Sistema"
          >
            <LogOut size={22} />
          </button>
        </div>
        
        {/* Linha decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </aside>
      
      {/* Conteúdo principal */}
      <div className="flex-1 ml-20 min-h-screen flex flex-col">
        <main 
          className="flex-1 p-8 min-h-[calc(100vh-48px)]"
          style={{
            background: "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(0,0,0,1) 50%, rgba(17,17,17,1) 100%)",
          }}
        >
          <Outlet />
        </main>
        
        {/* Footer com estilo glass dourado */}
        <footer 
          className="h-12 flex items-center justify-center text-sm border-t border-amber-500/10"
          style={{
            background: "linear-gradient(90deg, rgba(17,17,17,0.95) 0%, rgba(0,0,0,0.98) 50%, rgba(17,17,17,0.95) 100%)",
          }}
        >
          <span className="text-gray-600">
            &copy; {new Date().getFullYear()}{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent font-semibold">
              Mira Milionária
            </span>
            . Todos os direitos reservados.
          </span>
        </footer>
      </div>
    </div>
  );
}