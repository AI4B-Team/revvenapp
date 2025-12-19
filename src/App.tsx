import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Create from "./pages/Create";
import AIAgents from "./pages/AIAgents";
import Assistant from "./pages/Assistant";
import Templates from "./pages/Templates";
import Monetize from "./pages/Monetize";
import Contacts from "./pages/Contacts";
import Revenue from "./pages/Revenue";
import Community from "./pages/Community";
import Apps from "./pages/Apps";
import Assets from "./pages/Assets";
import Integrations from "./pages/Integrations";
import Websites from "./pages/Websites";
import Funnels from "./pages/Funnels";
import Store from "./pages/Store";
import Products from "./pages/Products";
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
import AIInfluencer from "./pages/AIInfluencer";
import Marketing from "./pages/Marketing";
import Edit from "./pages/Edit";
import VideoDownloader from "./pages/VideoDownloader";
import Versus from "./pages/Versus";
import Transcribe from "./pages/Transcribe";
import TranscriptDetail from "./pages/TranscriptDetail";
import VoiceCloner from "./pages/VoiceCloner";
import VoiceChanger from "./pages/VoiceChanger";
import Voiceovers from "./pages/Voiceovers";
import AudioDubber from "./pages/AudioDubber";
import NoiseRemover from "./pages/NoiseRemover";
import BackgroundRemover from "./pages/BackgroundRemover";
import ImageUpscaler from "./pages/ImageUpscaler";
import ImageEnhancer from "./pages/ImageEnhancer";
import BlogWriter from "./pages/BlogWriter";
import SocialPosts from "./pages/SocialPosts";
import EmailGenerator from "./pages/EmailGenerator";
import AdCopyWriter from "./pages/AdCopyWriter";
import ScriptWriter from "./pages/ScriptWriter";
import SEOOptimizer from "./pages/SEOOptimizer";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
          <Route path="/edit" element={<Edit />} />
          <Route path="/ai-influencer" element={<AIInfluencer />} />
          <Route path="/automate" element={<AIAgents />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/monetize" element={<Monetize />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/funnels" element={<Funnels />} />
          <Route path="/store" element={<Store />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/community" element={<Community />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/video-downloader" element={<VideoDownloader />} />
          <Route path="/versus" element={<Versus />} />
          <Route path="/transcribe" element={<Transcribe />} />
          <Route path="/transcribe/:id" element={<TranscriptDetail />} />
          <Route path="/voice-cloner" element={<VoiceCloner />} />
          <Route path="/voice-changer" element={<VoiceChanger />} />
          <Route path="/voiceovers" element={<Voiceovers />} />
          <Route path="/audio-dubber" element={<AudioDubber />} />
          <Route path="/noise-remover" element={<NoiseRemover />} />
          <Route path="/background-remover" element={<BackgroundRemover />} />
          <Route path="/image-upscaler" element={<ImageUpscaler />} />
          <Route path="/image-enhancer" element={<ImageEnhancer />} />
          <Route path="/blog-writer" element={<BlogWriter />} />
          <Route path="/social-posts" element={<SocialPosts />} />
          <Route path="/email-generator" element={<EmailGenerator />} />
          <Route path="/ad-copy-writer" element={<AdCopyWriter />} />
          <Route path="/script-writer" element={<ScriptWriter />} />
          <Route path="/seo-optimizer" element={<SEOOptimizer />} />
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
  </ErrorBoundary>
);

export default App;
