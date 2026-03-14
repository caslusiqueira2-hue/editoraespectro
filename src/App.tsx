import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import ScrollToTop from "@/components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const ArtigoPage = lazy(() => import("./pages/ArtigoPage"));
const CategoriaPage = lazy(() => import("./pages/CategoriaPage"));
const EnvioPage = lazy(() => import("./pages/EnvioPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const RevistaPage = lazy(() => import("./pages/RevistaPage"));
const VolumePage = lazy(() => import("./pages/VolumePage"));
const RevistaArtigoPage = lazy(() => import("./pages/RevistaArtigoPage"));
const RevistaSecaoPage = lazy(() => import("./pages/RevistaSecaoPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
    Carregando…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
