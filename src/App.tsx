import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import ArtigoPage from "./pages/ArtigoPage";
import CategoriaPage from "./pages/CategoriaPage";
import EnvioPage from "./pages/EnvioPage";
import AdminPage from "./pages/AdminPage";
import RevistaPage from "./pages/RevistaPage";
import VolumePage from "./pages/VolumePage";
import RevistaArtigoPage from "./pages/RevistaArtigoPage";
import RevistaSecaoPage from "./pages/RevistaSecaoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artigo/:slug" element={<ArtigoPage />} />
          <Route path="/categoria/:slug" element={<CategoriaPage />} />
          <Route path="/envio" element={<EnvioPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/revista" element={<RevistaPage />} />
          <Route path="/revista/secao/:secao" element={<RevistaSecaoPage />} />
          <Route path="/revista/:volumeSlug" element={<VolumePage />} />
          <Route path="/revista/:volumeSlug/:artigoSlug" element={<RevistaArtigoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
