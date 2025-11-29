import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import LandingPage from "./pages/LandingPage";
import AppLayout from "./pages/AppLayout";
import ComercialPage from "./pages/ComercialPage";
import OperacionalPage from "./pages/OperacionalPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import PerfilPage from "./pages/PerfilPage";
import RecuperarSenhaPage from "./pages/RecuperarSenhaPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route path="comercial" element={<ComercialPage />} />
              <Route path="operacional" element={<OperacionalPage />} />
              <Route path="financeiro" element={<FinanceiroPage />} />
              <Route path="perfil" element={<PerfilPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
