import { Suspense, lazy, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useTrackVisitor } from "@/hooks/useLiveVisitors";
import { useRouteTracker } from "@/hooks/useRouteTracker";
import { EbookProvider } from "@/contexts/EbookContext";
import { ArticleProvider } from "@/contexts/ArticleContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { SpaceProvider } from "@/contexts/SpaceContext";

// Preload-heavy route statically to avoid dynamic import fetch failures in preview.
import Create from "./pages/Create";

// Component to track visitor presence and route history
const VisitorTracker = ({ children }: { children: ReactNode }) => {
  useTrackVisitor();
  useRouteTracker();
  return <>{children}</>;
};

// Route-level code-splitting to keep initial preview loads fast
const Landing = lazy(() => import("./pages/Landing"));
const LandingNew = lazy(() => import("./pages/LandingNew"));
const Index = lazy(() => import("./pages/Index"));
const AIAgents = lazy(() => import("./pages/AIAgents"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Templates = lazy(() => import("./pages/Templates"));
const Monetize = lazy(() => import("./pages/Monetize"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Revenue = lazy(() => import("./pages/Revenue"));
const Community = lazy(() => import("./pages/Community"));
const Apps = lazy(() => import("./pages/Apps"));
const Assets = lazy(() => import("./pages/Assets"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Websites = lazy(() => import("./pages/Websites"));
const WebsiteEditor = lazy(() => import("./components/monetize/WebsiteEditor"));
const Funnels = lazy(() => import("./pages/Funnels"));
const Store = lazy(() => import("./pages/Store"));
const Products = lazy(() => import("./pages/Products"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Brand = lazy(() => import("./pages/Brand"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const SignupFlow = lazy(() => import("./pages/SignupFlow"));
const InviteVerification = lazy(() => import("./pages/InviteVerification"));
const OnboardingDashboard = lazy(() => import("./pages/OnboardingDashboard"));
const AIInfluencer = lazy(() => import("./pages/AIInfluencer"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Edit = lazy(() => import("./pages/Edit"));
const VideoDownloader = lazy(() => import("./pages/VideoDownloader"));
const Versus = lazy(() => import("./pages/Versus"));
const Transcribe = lazy(() => import("./pages/Transcribe"));
const TranscriptDetail = lazy(() => import("./pages/TranscriptDetail"));
const VoiceCloner = lazy(() => import("./pages/VoiceCloner"));
const VoiceChanger = lazy(() => import("./pages/VoiceChanger"));
const Voiceovers = lazy(() => import("./pages/Voiceovers"));
const AudioDubber = lazy(() => import("./pages/AudioDubber"));
const NoiseRemover = lazy(() => import("./pages/NoiseRemover"));
const BackgroundRemover = lazy(() => import("./pages/BackgroundRemover"));
const ImageUpscaler = lazy(() => import("./pages/ImageUpscaler"));
const ImageEnhancer = lazy(() => import("./pages/ImageEnhancer"));
const BlogWriter = lazy(() => import("./pages/BlogWriter"));
const SocialPosts = lazy(() => import("./pages/SocialPosts"));
const EmailGenerator = lazy(() => import("./pages/EmailGenerator"));
const AdCopyWriter = lazy(() => import("./pages/AdCopyWriter"));
const ScriptWriter = lazy(() => import("./pages/ScriptWriter"));
const SEOOptimizer = lazy(() => import("./pages/SEOOptimizer"));
const EbookCreator = lazy(() => import("./pages/EbookCreator"));
const NewEbook = lazy(() => import("./pages/NewEbook"));
const ExplainerVideo = lazy(() => import("./pages/ExplainerVideo"));
const ViralShorts = lazy(() => import("./pages/ViralShorts"));
const Sessions = lazy(() => import("./pages/Sessions"));
const AIStory = lazy(() => import("./pages/AIStory"));
const LeadGeneration = lazy(() => import("./pages/LeadGeneration"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const AutoYT = lazy(() => import("./pages/AutoYT"));
const ArticleHub = lazy(() => import("./pages/ArticleHub"));
const NewArticle = lazy(() => import("./pages/NewArticle"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Forms = lazy(() => import("./pages/Forms"));
const InfinityTalk = lazy(() => import("./pages/InfinityTalk"));
const Signature = lazy(() => import("./pages/Signature"));
const MasterCloser = lazy(() => import("./pages/MasterCloser"));
const SpaceSettings = lazy(() => import("./pages/SpaceSettings"));
const LogoDesigner = lazy(() => import("./pages/LogoDesigner"));
const BannerCreator = lazy(() => import("./pages/BannerCreator"));
const FlyerMaker = lazy(() => import("./pages/FlyerMaker"));
const PosterDesigner = lazy(() => import("./pages/PosterDesigner"));
const InfographicBuilder = lazy(() => import("./pages/InfographicBuilder"));
const PresentationMaker = lazy(() => import("./pages/PresentationMaker"));
const DocumentCreator = lazy(() => import("./pages/DocumentCreator"));


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SpaceProvider>
              <BrandProvider>
                <EbookProvider>
                  <ArticleProvider>
                    <VisitorTracker>
                      <Suspense
                        fallback={
                          <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                            <p className="text-muted-foreground">Loading…</p>
                          </div>
                        }
                      >
                        <Routes>
                          <Route path="/sales" element={<Landing />} />
                          <Route path="/landing" element={<LandingNew />} />
                          <Route path="/" element={<LandingNew />} />
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
                          <Route path="/websites/edit/:templateId" element={<WebsiteEditor />} />
                          <Route path="/funnels" element={<Funnels />} />
                          <Route path="/store" element={<Store />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/contacts" element={<Contacts />} />
                          <Route path="/revenue" element={<Revenue />} />
                          <Route path="/marketing" element={<Marketing />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/apps" element={<Apps />} />
                          <Route path="/sessions" element={<Sessions />} />
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
                          <Route path="/ebook-creator" element={<EbookCreator />} />
                          <Route path="/ebook-creator/new" element={<NewEbook />} />
                          <Route path="/document/:type" element={<DocumentCreator />} />
                          <Route path="/explainer-video" element={<ExplainerVideo />} />
                          <Route path="/viral-shorts" element={<ViralShorts />} />
                          <Route path="/ai-story" element={<AIStory />} />
                          <Route path="/lead-generation" element={<LeadGeneration />} />
                          <Route path="/autoyt" element={<AutoYT />} />
                          <Route path="/newsletter" element={<Newsletter />} />
                          <Route path="/article" element={<ArticleHub />} />
                          <Route path="/article/new" element={<NewArticle />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/forms" element={<Forms />} />
                          <Route path="/infinity-talk" element={<InfinityTalk />} />
                          <Route path="/signature" element={<Signature />} />
                          <Route path="/master-closer" element={<MasterCloser />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/terms-of-service" element={<TermsOfService />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/oauth/callback" element={<OAuthCallback />} />
                          <Route path="/assets" element={<Assets />} />
                          <Route path="/integrations" element={<Integrations />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/signup/flow" element={<SignupFlow />} />
                          <Route path="/invite-verification" element={<InviteVerification />} />
                          <Route path="/onboarding" element={<Onboarding />} />
                          <Route path="/onboarding-dashboard" element={<OnboardingDashboard />} />
                          <Route path="/account" element={<Settings />} />
                          <Route path="/brand" element={<Brand />} />
                          <Route path="/space-settings" element={<SpaceSettings />} />
                          <Route path="/logo-designer" element={<LogoDesigner />} />
                          <Route path="/banner-creator" element={<BannerCreator />} />
                          <Route path="/flyer-maker" element={<FlyerMaker />} />
                          <Route path="/poster-designer" element={<PosterDesigner />} />
                          <Route path="/infographic-builder" element={<InfographicBuilder />} />
                          <Route path="/presentation-maker" element={<PresentationMaker />} />
                          {/* Admin is now accessible via /account?tab=admin */}
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </VisitorTracker>
                  </ArticleProvider>
                </EbookProvider>
              </BrandProvider>
            </SpaceProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
