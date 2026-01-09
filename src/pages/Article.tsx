/**
 * REVVEN — Article Studio with AI Generation
 */
import React, { useMemo, useRef, useState, useCallback } from "react";
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Download, Copy, RotateCcw, Wand2, CheckCircle2 } from "lucide-react";

type ArticleType =
  | "Blog Post"
  | "Ultimate Guide"
  | "Listicle"
  | "Thought Leadership"
  | "Case Study"
  | "Press Article";

type LengthPreset = "Short (400-700)" | "Medium (1000-1500)" | "Long (2000-3000)";
type LanguagePreset = "English (US)" | "English (UK)" | "Spanish" | "Portuguese" | "French";

type ScoreBreakdown = {
  total: number;
  clarity: number;
  structure: number;
  seo: number;
  engagement: number;
  credibility: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function wordCount(text: string) {
  const words = (text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}

function sentenceCount(text: string) {
  const s = (text || "").split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
  return s.length;
}

function hasHeadings(text: string) {
  return /(^|\n)#{1,6}\s+.+/m.test(text) || /\n[A-Z][^\n]{0,60}\n[-=]{3,}\n/.test(text);
}

function extractKeywords(topic: string): string[] {
  const cleaned = (topic || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const unique: string[] = [];
  for (const w of cleaned) {
    if (!unique.includes(w)) unique.push(w);
  }
  return unique.slice(0, 6);
}

function scoreContent(draft: string, topic: string, seoMode: boolean): ScoreBreakdown {
  const wc = wordCount(draft);
  const sc = sentenceCount(draft);
  const avgWordsPerSentence = sc > 0 ? wc / sc : wc;

  const hasOutline = hasHeadings(draft);
  const hasBullets = /(^|\n)\s*[-*•]\s+/m.test(draft);
  const hasNumbers = /\b\d+(\.\d+)?\b/.test(draft);
  const hasExamples = /\b(example|for instance|e\.g\.)\b/i.test(draft);
  const hasCTA = /\b(call to action|try this|next step|download|subscribe|book a call|get started)\b/i.test(draft);
  const hasSourcesLanguage = /\b(source|study|data|research|according to)\b/i.test(draft);

  const keywords = extractKeywords(topic);
  const keywordHits = keywords.reduce((acc, k) => (draft.toLowerCase().includes(k) ? acc + 1 : acc), 0);
  const keywordCoverage = keywords.length > 0 ? keywordHits / keywords.length : 0;

  let clarity = 72;
  clarity += avgWordsPerSentence < 26 ? 10 : avgWordsPerSentence < 34 ? 2 : -10;
  clarity += draft.length > 0 && /\n\n/.test(draft) ? 6 : -6;
  clarity = clamp(clarity);

  let structure = 60;
  structure += hasOutline ? 25 : 0;
  structure += hasBullets ? 10 : 0;
  structure += wc > 800 ? 5 : 0;
  structure = clamp(structure);

  let seo = seoMode ? 55 : 0;
  if (seoMode) {
    seo += hasOutline ? 10 : -5;
    seo += keywordCoverage * 20;
    seo += /\bmeta\b|\btitle\b|\bslug\b/i.test(draft) ? 10 : 0;
    seo = clamp(seo);
  } else {
    seo = 0;
  }

  let engagement = 62;
  engagement += hasNumbers ? 6 : 0;
  engagement += hasExamples ? 8 : -3;
  engagement += hasCTA ? 6 : 0;
  engagement = clamp(engagement);

  let credibility = 58;
  credibility += hasSourcesLanguage ? 12 : 0;
  credibility += /\bframework\b|\bchecklist\b|\bsteps?\b/i.test(draft) ? 10 : 0;
  credibility = clamp(credibility);

  const total = clamp(Math.round((clarity + structure + (seoMode ? seo : 70) + engagement + credibility) / 5));

  return {
    total,
    clarity: Math.round(clarity),
    structure: Math.round(structure),
    seo: Math.round(seoMode ? seo : 0),
    engagement: Math.round(engagement),
    credibility: Math.round(credibility),
  };
}

function labelFromScore(score: number) {
  if (score >= 80) return { label: "Great", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 65) return { label: "Good", tone: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Needs Work", tone: "bg-rose-50 text-rose-700 border-rose-200" };
}

function pillClass(active: boolean) {
  return [
    "px-3 py-1.5 rounded-full text-sm border transition",
    active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
  ].join(" ");
}

function chipClass(active: boolean) {
  return [
    "px-3 py-1.5 rounded-lg text-sm border transition inline-flex items-center gap-2",
    active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
  ].join(" ");
}

function generateLivePrompt(args: {
  articleType: ArticleType;
  topic: string;
  tones: string[];
  styles: string[];
  length: LengthPreset;
  language: LanguagePreset;
  seoMode: boolean;
  includeMeta: boolean;
  noDirectAddress: boolean;
}) {
  const { articleType, topic, tones, styles, length, language, seoMode, includeMeta, noDirectAddress } = args;
  const kw = extractKeywords(topic);
  const toneStr = tones.length ? tones.join(", ") : "Neutral";
  const styleStr = styles.length ? styles.join(", ") : "Professional";
  const constraints: string[] = [];
  if (seoMode) constraints.push("Optimize for SEO (headings, internal structure, keyword coverage).");
  if (includeMeta) constraints.push("Include: SEO title, meta description, and suggested keywords.");
  if (noDirectAddress) constraints.push("Avoid 'welcome/get ready' and avoid direct audience address like 'you' where possible.");
  constraints.push(`Target length: ${length}.`);
  constraints.push(`Language: ${language}.`);

  const prompt = [
    `Write a ${articleType.toLowerCase()} about: "${topic || "___"}".`,
    `Tone: ${toneStr}. Style: ${styleStr}.`,
    kw.length ? `Primary keywords: ${kw.join(", ")}.` : null,
    "",
    "Requirements:",
    "- Start with a strong hook.",
    "- Use clear sections with headings and short paragraphs.",
    "- Include concrete examples and actionable steps.",
    "- End with a concise summary + next steps.",
    "",
    `Constraints: ${constraints.join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  return prompt;
}

export default function Article() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [articleType, setArticleType] = useState<ArticleType>("Blog Post");
  const [topic, setTopic] = useState<string>("digital marketing for business");
  const [tones, setTones] = useState<string[]>(["Friendly"]);
  const [styles, setStyles] = useState<string[]>(["Professional"]);
  const [lengthPreset, setLengthPreset] = useState<LengthPreset>("Medium (1000-1500)");
  const [language, setLanguage] = useState<LanguagePreset>("English (US)");
  const [seoMode, setSeoMode] = useState<boolean>(true);
  const [includeMeta, setIncludeMeta] = useState<boolean>(true);
  const [noDirectAddress, setNoDirectAddress] = useState<boolean>(true);
  const [draft, setDraft] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"Details" | "Analytics">("Details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const livePrompt = useMemo(() => {
    return generateLivePrompt({
      articleType,
      topic,
      tones,
      styles,
      length: lengthPreset,
      language,
      seoMode,
      includeMeta,
      noDirectAddress,
    });
  }, [articleType, topic, tones, styles, lengthPreset, language, seoMode, includeMeta, noDirectAddress]);

  const scores = useMemo(() => scoreContent(draft, topic, seoMode), [draft, topic, seoMode]);
  const scoreLabel = useMemo(() => labelFromScore(scores.total), [scores.total]);

  const predicted = useMemo(() => {
    const wc = wordCount(draft);
    const base = clamp(scores.total);
    const lengthFactor = wc > 1400 ? 1.1 : wc > 900 ? 1.0 : 0.9;
    const seoFactor = seoMode ? 1.05 : 0.95;
    const engagementRate = clamp(Math.round((base * 0.03) * lengthFactor * seoFactor * 100) / 100, 0, 9.99);
    const estReach = Math.round(400 + base * 18 * lengthFactor);
    const audienceMatch = clamp(Math.round(60 + base * 0.4));
    const estLikes = Math.round(estReach * (engagementRate / 100) * 0.35);
    const estComments = Math.max(1, Math.round(estReach * (engagementRate / 100) * 0.08));
    const estShares = Math.max(0, Math.round(estReach * (engagementRate / 100) * 0.04));
    return { engagementRate, estReach, audienceMatch, estLikes, estComments, estShares };
  }, [draft, scores.total, seoMode]);

  const tonesList = ["Friendly", "Formal", "Assertive", "Optimistic", "Informative", "Curious", "Persuasive", "Witty"];
  const stylesList = ["Professional", "Conversational", "Humorous", "Empathic", "Simple", "Academic", "Creative", "Bold"];

  const toggleInList = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  const onGenerate = useCallback(async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationPhase("Analyzing topic...");
    setDraft("");
    setActiveTab("Details");

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Simulate initial phases
      await new Promise(r => setTimeout(r, 500));
      setGenerationProgress(10);
      setGenerationPhase("Building prompt...");
      
      await new Promise(r => setTimeout(r, 300));
      setGenerationProgress(15);
      setGenerationPhase("Generating content...");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            articleType,
            topic,
            tones,
            styles,
            length: lengthPreset,
            language,
            seoMode,
            includeMeta,
            noDirectAddress,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status === 402) {
          toast.error("AI credits exhausted. Please add funds to continue.");
        } else {
          toast.error(errorData.error || "Failed to generate article");
        }
        throw new Error(errorData.error || "Generation failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";
      let tokenCount = 0;

      setGenerationProgress(20);
      setGenerationPhase("Writing article...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              tokenCount++;
              setDraft(fullContent);
              
              // Update progress based on estimated tokens
              const progressEstimate = Math.min(95, 20 + (tokenCount / 20));
              setGenerationProgress(progressEstimate);
              
              // Update phase based on content
              if (tokenCount < 50) {
                setGenerationPhase("Writing introduction...");
              } else if (tokenCount < 150) {
                setGenerationPhase("Developing main content...");
              } else if (tokenCount < 300) {
                setGenerationPhase("Adding examples...");
              } else {
                setGenerationPhase("Finishing up...");
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setDraft(fullContent);
            }
          } catch { /* ignore */ }
        }
      }

      setGenerationProgress(100);
      setGenerationPhase("Complete!");
      toast.success("Article generated successfully!");
      
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info("Generation cancelled");
      } else {
        console.error('Generation error:', error);
        toast.error("Failed to generate article. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationPhase("");
    }
  }, [articleType, topic, tones, styles, lengthPreset, language, seoMode, includeMeta, noDirectAddress]);

  const onCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const onImprove = useCallback(async (mode: "hook" | "seo" | "structure" | "credibility") => {
    if (!draft.trim()) {
      toast.error("Generate a draft first");
      return;
    }

    setIsGenerating(true);
    setGenerationPhase(`Improving ${mode}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const improvementPrompts: Record<string, string> = {
        hook: `Rewrite only the introduction/hook section of this article to be more compelling and attention-grabbing. Keep everything else the same. Return the full article with the improved hook.\n\nArticle:\n${draft}`,
        seo: `Add an FAQ section with 3-4 relevant questions and answers to this article for better SEO. Also ensure all headings are keyword-optimized. Return the full improved article.\n\nArticle:\n${draft}`,
        structure: `Improve the structure of this article by adding a clear checklist or step-by-step summary. Ensure proper heading hierarchy and add bullet points where appropriate. Return the full improved article.\n\nArticle:\n${draft}`,
        credibility: `Add credibility signals to this article: include at least one data point or statistic, add a mini case study or before/after example, and reference relevant research or studies. Return the full improved article.\n\nArticle:\n${draft}`,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            articleType,
            topic: improvementPrompts[mode],
            tones,
            styles,
            length: lengthPreset,
            language,
            seoMode: false,
            includeMeta: false,
            noDirectAddress: false,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Improvement failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setDraft(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} improved!`);

    } catch (error) {
      console.error('Improvement error:', error);
      toast.error("Failed to improve. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationPhase("");
    }
  }, [draft, articleType, tones, styles, lengthPreset, language]);

  const quickStarts: { label: string; type: ArticleType; preset: Partial<{ seoMode: boolean; includeMeta: boolean; length: LengthPreset }> }[] =
    [
      { label: "SEO Blog Post", type: "Blog Post", preset: { seoMode: true, includeMeta: true, length: "Medium (1000-1500)" } },
      { label: "Viral Listicle", type: "Listicle", preset: { seoMode: false, includeMeta: false, length: "Short (400-700)" } },
      { label: "Ultimate Guide", type: "Ultimate Guide", preset: { seoMode: true, includeMeta: true, length: "Long (2000-3000)" } },
      { label: "Thought Leadership", type: "Thought Leadership", preset: { seoMode: false, includeMeta: false, length: "Medium (1000-1500)" } },
    ];

  const applyQuickStart = (q: (typeof quickStarts)[number]) => {
    setArticleType(q.type);
    if (typeof q.preset.seoMode === "boolean") setSeoMode(q.preset.seoMode);
    if (typeof q.preset.includeMeta === "boolean") setIncludeMeta(q.preset.includeMeta);
    if (q.preset.length) setLengthPreset(q.preset.length);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(livePrompt);
      toast.success("Prompt copied to clipboard");
    } catch {
      toast.error("Failed to copy. Your browser may block clipboard access.");
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("Article copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadDraft = () => {
    const blob = new Blob([draft || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(topic || "article").replace(/[^\w]+/g, "-").toLowerCase()}-draft.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Article downloaded");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur">
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold leading-tight">Article Studio</div>
                  <div className="text-xs text-slate-500">Create publish-ready content in seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm rounded-xl bg-slate-100 hover:bg-slate-200">
                  Save Template
                </button>
                {isGenerating ? (
                  <button
                    onClick={onCancelGeneration}
                    className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-sm flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={onGenerate}
                    disabled={!topic.trim()}
                    className="px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate Draft
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Generation Progress Overlay */}
          {isGenerating && generationPhase && (
            <div className="px-6 py-3">
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span className="text-sm font-medium text-emerald-700">{generationPhase}</span>
                </div>
                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-emerald-600">
                  {wordCount(draft) > 0 && `${wordCount(draft)} words generated`}
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT: Controls */}
              <div className="space-y-4">
                <Card title="Article Type" subtitle="Pick a format that matches the goal">
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={articleType}
                      onChange={(e) => setArticleType(e.target.value as ArticleType)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={isGenerating}
                    >
                      {["Blog Post", "Ultimate Guide", "Listicle", "Thought Leadership", "Case Study", "Press Article"].map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>

                <Card title="Topic" subtitle="Be specific. Clear topic = better output.">
                  <div className="flex items-center gap-2">
                    <input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., digital marketing for local businesses"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={() => setTopic("")}
                      className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                      title="Clear"
                      disabled={isGenerating}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">
                      Keywords: {extractKeywords(topic).join(", ") || "—"}
                    </span>
                  </div>
                </Card>

                <Card
                  title="Tone"
                  subtitle={
                    <span className="inline-flex items-center gap-2">
                      Multi-select.{" "}
                      <button
                        className="text-emerald-700 hover:underline"
                        onClick={() => setTones([tonesList[Math.floor(Math.random() * tonesList.length)]])}
                        disabled={isGenerating}
                      >
                        Randomize
                      </button>
                    </span>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {tonesList.map((t) => (
                      <button 
                        key={t} 
                        onClick={() => toggleInList(t, tones, setTones)} 
                        className={chipClass(tones.includes(t))}
                        disabled={isGenerating}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card title="Style" subtitle="How it should feel when someone reads it.">
                  <div className="flex flex-wrap gap-2">
                    {stylesList.map((s) => (
                      <button 
                        key={s} 
                        onClick={() => toggleInList(s, styles, setStyles)} 
                        className={chipClass(styles.includes(s))}
                        disabled={isGenerating}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card title="Length" subtitle="Targets word count range">
                    <select
                      value={lengthPreset}
                      onChange={(e) => setLengthPreset(e.target.value as LengthPreset)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={isGenerating}
                    >
                      {["Short (400-700)", "Medium (1000-1500)", "Long (2000-3000)"].map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 text-xs text-slate-500">Draft words: {wordCount(draft)}</div>
                  </Card>

                  <Card title="Language" subtitle="Output language locale">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as LanguagePreset)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={isGenerating}
                    >
                      {["English (US)", "English (UK)", "Spanish", "Portuguese", "French"].map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </Card>
                </div>

                <Card title="Optimization" subtitle="Keep it simple for most users, powerful for pros.">
                  <div className="flex flex-wrap gap-3">
                    <Toggle label="SEO Mode" checked={seoMode} onChange={setSeoMode} disabled={isGenerating} />
                    <Toggle label="Include Meta" checked={includeMeta} onChange={setIncludeMeta} disabled={isGenerating} />
                    <Toggle label="Avoid Direct Address" checked={noDirectAddress} onChange={setNoDirectAddress} disabled={isGenerating} />
                  </div>
                </Card>

                <Card title="Quick Start Templates" subtitle="Start with a proven format.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickStarts.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => applyQuickStart(q)}
                        className="text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                        disabled={isGenerating}
                      >
                        <div className="text-sm font-medium">{q.label}</div>
                        <div className="text-xs text-slate-500">{q.type}</div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* RIGHT: Live prompt + actions + editor */}
              <div className="space-y-4">
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Live Prompt
                      </span>
                      <span className="text-xs text-slate-400">Updates in real-time</span>
                    </div>
                  }
                  right={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyPrompt}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5"
                        title="Copy prompt"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  }
                >
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 max-h-48 overflow-auto">
                    {livePrompt}
                  </pre>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Topic: {topic || "—"}
                    </span>
                    {tones.slice(0, 2).map((t) => (
                      <span key={t} className="px-2 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-600">
                        {t}
                      </span>
                    ))}
                    {styles.slice(0, 2).map((s) => (
                      <span key={s} className="px-2 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-600">
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-600">
                      {lengthPreset.split(" ")[0]}
                    </span>
                  </div>
                </Card>

                {/* Content Score / Tabs */}
                <div className="rounded-2xl bg-slate-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${scoreLabel.tone}`}>
                          <span className="font-semibold">{scores.total || 0}</span>
                        </div>
                        <div>
                          <div className="font-semibold leading-tight">Content Score</div>
                          <div className="text-xs text-slate-500">{scoreLabel.label}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab("Details")}
                        className={pillClass(activeTab === "Details")}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setActiveTab("Analytics")}
                        className={pillClass(activeTab === "Analytics")}
                        title="Predicted performance"
                      >
                        Predicted
                      </button>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    {activeTab === "Details" ? (
                      <>
                        <div className="mb-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                          <span className="font-medium">Biggest opportunity:</span>{" "}
                          {scores.credibility < 65
                            ? "Add credibility signals (data, examples, mini case study)."
                            : scores.structure < 70
                            ? "Tighten structure with headings + checklist."
                            : scores.engagement < 70
                            ? "Strengthen hook + add a sharper CTA."
                            : "Polish and ship."}
                        </div>
                        <ScoreRow label="Clarity" value={scores.clarity} hint="Shorter sentences + more whitespace improves this." />
                        <ScoreRow label="Structure" value={scores.structure} hint="Headings + bullets increase scanability." />
                        <ScoreRow label="Engagement" value={scores.engagement} hint="Hook, examples, and a CTA lift engagement." />
                        {seoMode && <ScoreRow label="SEO" value={scores.seo} hint="Add headings, keywords, and meta fields." />}
                        <ScoreRow label="Credibility" value={scores.credibility} hint="Add data, sources language, and mini case study." />

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            onClick={() => onImprove("hook")}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            disabled={isGenerating || !draft}
                          >
                            <Wand2 className="w-3 h-3" />
                            Hook
                          </button>
                          <button
                            onClick={() => onImprove("structure")}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            disabled={isGenerating || !draft}
                          >
                            <Wand2 className="w-3 h-3" />
                            Structure
                          </button>
                          <button
                            onClick={() => onImprove("credibility")}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            disabled={isGenerating || !draft}
                          >
                            <Wand2 className="w-3 h-3" />
                            Credibility
                          </button>
                          <button
                            onClick={() => onImprove("seo")}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            disabled={isGenerating || !draft || !seoMode}
                            title={!seoMode ? "Enable SEO Mode first" : "Add FAQs and SEO sections"}
                          >
                            <Wand2 className="w-3 h-3" />
                            SEO
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-slate-600 mb-3">
                          This is <span className="font-medium">predicted performance</span> (pre-publish). Actual analytics should live in a separate "Results" view after posting.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <MetricCard title="Predicted Engagement Rate" value={`${predicted.engagementRate}%`} subtitle="Based on content score + length" />
                          <MetricCard title="Est. Reach" value={`${predicted.estReach.toLocaleString()}`} subtitle="Directional estimate" />
                          <MetricCard title="Audience Match" value={`${predicted.audienceMatch}%`} subtitle="Topic + structure heuristic" />
                          <MetricCard title="Est. Comments" value={`${predicted.estComments}`} subtitle="More examples → more comments" />
                          <MetricCard title="Est. Likes" value={`${predicted.estLikes}`} subtitle="Hook + clarity lift this" />
                          <MetricCard title="Est. Shares" value={`${predicted.estShares}`} subtitle="Frameworks + checklists lift this" />
                        </div>
                        <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          Tip: SEO-first formats typically win over time; story-first formats spike early.
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Editor */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      Draft Editor
                      {draft && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </div>
                  }
                  subtitle="Edit your draft or let AI generate it for you."
                  right={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyDraft}
                        className="px-3 py-2 text-sm rounded-xl bg-white hover:bg-slate-100 flex items-center gap-1.5 disabled:opacity-50"
                        disabled={!draft}
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <button
                        onClick={downloadDraft}
                        className="px-3 py-2 text-sm rounded-xl bg-white hover:bg-slate-100 flex items-center gap-1.5 disabled:opacity-50"
                        disabled={!draft}
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                      <button
                        onClick={() => setDraft("")}
                        className="px-3 py-2 text-sm rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50"
                        disabled={!draft || isGenerating}
                      >
                        Clear
                      </button>
                    </div>
                  }
                >
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder='Click "Generate Draft" to create an article, or paste your own content here to analyze and improve it.'
                    className="w-full min-h-[420px] rounded-xl bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                    disabled={isGenerating}
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Words: {wordCount(draft)} · Sentences: {sentenceCount(draft)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-white">
                        Markdown
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Bottom actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("Details")}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200"
                  >
                    Edit Inputs
                  </button>
                  {isGenerating ? (
                    <button
                      onClick={onCancelGeneration}
                      className="w-full px-4 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 shadow-sm flex items-center justify-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancel Generation
                    </button>
                  ) : (
                    <button
                      onClick={onGenerate}
                      disabled={!topic.trim()}
                      className="w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 className="w-4 h-4" />
                      Generate Draft
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
              REVVEN · Article Studio — Powered by AI
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Card(props: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50">
      <div className="px-4 py-3 flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{props.title}</div>
          {props.subtitle ? <div className="text-xs text-slate-500 mt-0.5">{props.subtitle}</div> : null}
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
      <div className="px-4 pb-4">{props.children}</div>
    </div>
  );
}

function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => props.onChange(!props.checked)}
      className={[
        "px-3 py-2 rounded-xl border text-sm transition inline-flex items-center gap-2",
        props.checked ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
        props.disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
      aria-pressed={props.checked}
      disabled={props.disabled}
    >
      <span
        className={[
          "h-4 w-7 rounded-full border flex items-center px-0.5 transition",
          props.checked ? "bg-emerald-600 border-emerald-600 justify-end" : "bg-slate-100 border-slate-200 justify-start",
        ].join(" ")}
      >
        <span className="h-3 w-3 rounded-full bg-white shadow-sm" />
      </span>
      {props.label}
    </button>
  );
}

function ScoreRow(props: { label: string; value: number; hint: string }) {
  const v = clamp(props.value);
  const color =
    v >= 80 ? "bg-emerald-500" : v >= 65 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-800">{props.label}</div>
        <div className="text-sm text-slate-600">{v}/100</div>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-2 ${color}`} style={{ width: `${v}%` }} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{props.hint}</div>
    </div>
  );
}

function MetricCard(props: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <div className="text-xs text-slate-500">{props.title}</div>
      <div className="text-2xl font-semibold mt-1">{props.value}</div>
      <div className="text-xs text-slate-500 mt-1">{props.subtitle}</div>
    </div>
  );
}
