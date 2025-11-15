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
import Community from "./pages/Community";
import Apps from "./pages/Apps";
import Assets from "./pages/Assets";
import Integrations from "./pages/Integrations";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import BrandWizard from "./components/wizard/BrandWizard";

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
          <Route path="/community" element={<Community />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/brand-wizard" element={<BrandWizard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
