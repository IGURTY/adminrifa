import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SessionContextProvider } from "@/components/SessionContextProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Sorteios from "./pages/admin/Sorteios";
import Afiliados from "./pages/admin/Afiliados";
import Clientes from "./pages/admin/Clientes";
import Vendas from "./pages/admin/Vendas";
import Comissoes from "./pages/admin/Comissoes";
import Configuracoes from "./pages/admin/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="sorteios" element={<Sorteios />} />
                      <Route path="afiliados" element={<Afiliados />} />
                      <Route path="clientes" element={<Clientes />} />
                      <Route path="vendas" element={<Vendas />} />
                      <Route path="comissoes" element={<Comissoes />} />
                      <Route path="configuracoes" element={<Configuracoes />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;