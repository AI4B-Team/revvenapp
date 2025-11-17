import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
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
import Websites from "./pages/Websites";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BrandLayout from "./pages/brand/BrandLayout";
import Identity from "./pages/brand/Identity";
import Voice from "./pages/brand/Voice";
import KnowledgeBase from "./pages/brand/KnowledgeBase";
import Intelligence from "./pages/brand/Intelligence";
import Characters from "./pages/brand/Characters";
import Review from "./pages/brand/Review";
import Complete from "./pages/brand/Complete";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupFlow from "./pages/SignupFlow";
import OnboardingDashboard from "./pages/OnboardingDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/create" element={<Create />} />
          <Route path="/automate" element={<AIAgents />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/monetize" element={<Monetize />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/community" element={<Community />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/flow" element={<SignupFlow />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding-dashboard" element={<OnboardingDashboard />} />
          <Route path="/account" element={<Settings />} />
          <Route path="/brand" element={<BrandLayout />}>
            <Route index element={<Identity />} />
            <Route path="identity" element={<Identity />} />
            <Route path="voice" element={<Voice />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="intelligence" element={<Intelligence />} />
            <Route path="characters" element={<Characters />} />
            <Route path="review" element={<Review />} />
            <Route path="complete" element={<Complete />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
