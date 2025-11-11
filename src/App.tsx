import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
import AIAgents from "./pages/AIAgents";
import Assistant from "./pages/Assistant";
import Monetize from "./pages/Monetize";
import Contacts from "./pages/Contacts";
import Revenue from "./pages/Revenue";
import Onboarding from "./pages/Onboarding";
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
          <Route path="/create" element={<Create />} />
          <Route path="/automate" element={<AIAgents />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/monetize" element={<Monetize />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
