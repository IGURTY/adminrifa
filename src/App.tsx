import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Sorteios from "./pages/admin/Sorteios";
import Afiliados from "./pages/admin/Afiliados";
import Clientes from "./pages/admin/Clientes";
import Vendas from "./pages/admin/Vendas";
import Comissoes from "./pages/admin/Comissoes";
import Usuarios from "./pages/admin/Usuarios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Todas as rotas principais usam o AdminLayout */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="admin" element={<Dashboard />} />
            <Route path="admin/sorteios" element={<Sorteios />} />
            <Route path="admin/afiliados" element={<Afiliados />} />
            <Route path="admin/clientes" element={<Clientes />} />
            <Route path="admin/vendas" element={<Vendas />} />
            <Route path="admin/comissoes" element={<Comissoes />} />
            <Route path="admin/usuarios" element={<Usuarios />} />
          </Route>
          {/* Rota de erro */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;