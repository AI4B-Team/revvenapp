/**
 * REVVEN — Article Studio (Lovable-ready)
 */
import React, { useMemo, useRef, useState } from "react";
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

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

function generateArticleDraft(args: {
  articleType: ArticleType;
  topic: string;
  tones: string[];
  styles: string[];
  length: LengthPreset;
  seoMode: boolean;
  includeMeta: boolean;
}) {
  const topic = args.topic || "Your topic";
  const keywords = extractKeywords(topic);

  const base = `# ${topic}

## Hook

Most people approach **${topic}** like a checklist. The winners treat it like a system.

## Why it matters

Explain the stakes, who this helps, and what changes when it's done right.

## The framework

### 1) Define the goal

- What outcome are you aiming for?
- What does "success" look like?

### 2) Build the engine

- Inputs
- Process
- Outputs

### 3) Measure and refine

- Track what moves the needle
- Cut what doesn't
- Double down on what works

## Examples

- Example 1: A simple real-world scenario
- Example 2: A more advanced scenario

## Common mistakes

- Doing too much at once
- Skipping the foundation
- Measuring the wrong thing

## Action plan (next 7 days)

1. Pick one KPI
2. Create one repeatable workflow
3. Publish / ship something small
4. Review results and iterate

## Summary

Here's what to remember: clarity beats complexity, systems beat hustle, and consistency beats intensity.

## Next steps

If you want, I can generate:
- A 30-day content plan
- A checklist version
- A social thread + email version

`;

  const meta = args.includeMeta
    ? `## SEO Meta

- SEO Title: ${topic} (Complete Guide)
- Meta Description: Learn ${topic} with a simple framework, examples, and a 7-day action plan.
- Suggested Keywords: ${keywords.join(", ") || "keyword1, keyword2, keyword3"}

`
    : "";

  const lengthBoost =
    args.length === "Short (400-700)"
      ? `\n> Keep it tight. Expand only the Framework section.\n`
      : args.length === "Long (2000-3000)"
      ? `\n## Deep dive\nAdd additional sections: tools, templates, FAQs, and a case study.\n`
      : "";

  return `${meta}${base}${lengthBoost}`.trim();
}

function improveDraft(draft: string, mode: "hook" | "seo" | "structure" | "credibility") {
  if (!draft) return draft;
  switch (mode) {
    case "hook": {
      return draft.replace(
        /## Hook[\s\S]*?(?=\n## )/m,
        `## Hook

You can spend months producing content on **guesswork**, or you can build a system that compounds. This guide gives you the system for **repeatable results**—without burning out.

`
      );
    }
    case "seo": {
      const add = `

## FAQs

### What is the fastest way to get started?

Start with one workflow and one metric. Ship something small within 24 hours.

### How long does it take to see results?

Typically 2–4 weeks of consistent execution, depending on distribution and baseline.

### What tools help the most?

A simple editor, a planning board, and analytics you actually check.

`;
      return draft.includes("## FAQs") ? draft : draft + add;
    }
    case "structure": {
      if (hasHeadings(draft) && /(^|\n)\s*[-*•]\s+/m.test(draft)) return draft;
      return draft + `

## Checklist

- Define the outcome
- Choose the inputs
- Create the workflow
- Publish/ship
- Review and iterate

`;
    }
    case "credibility": {
      const add = `

## Credibility signals

- Add one data point or study (even a directional one).
- Include one mini case study ("before/after").
- Define what would disprove your claim (shows rigor).

`;
      return draft.includes("Credibility signals") ? draft : draft + add;
    }
    default:
      return draft;
  }
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const onGenerate = () => {
    const nextDraft = generateArticleDraft({
      articleType,
      topic,
      tones,
      styles,
      length: lengthPreset,
      seoMode,
      includeMeta,
    });
    setDraft(nextDraft);
    setActiveTab("Details");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const onImprove = (mode: "hook" | "seo" | "structure" | "credibility") => {
    setDraft((d) => improveDraft(d, mode));
  };

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
      alert("Prompt copied.");
    } catch {
      alert("Copy failed. Your browser may block clipboard access.");
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
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">✦</span>
                </div>
                <div>
                  <div className="font-semibold leading-tight">Article Studio</div>
                  <div className="text-xs text-slate-500">Create publish-ready content in seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                  Save Template
                </button>
                <button
                  onClick={onGenerate}
                  className="px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Generate Draft
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT: Controls */}
              <div className="space-y-4">
                <Card title="Article Type" subtitle="Pick a format that matches the goal">
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={articleType}
                      onChange={(e) => setArticleType(e.target.value as ArticleType)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
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
                    />
                    <button
                      onClick={() => setTopic((t) => (t ? t : "digital marketing for business"))}
                      className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                      title="Reset"
                    >
                      ↺
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
                      >
                        Randomize
                      </button>
                    </span>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {tonesList.map((t) => (
                      <button key={t} onClick={() => toggleInList(t, tones, setTones)} className={chipClass(tones.includes(t))}>
                        {t}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card title="Style" subtitle="How it should feel when someone reads it.">
                  <div className="flex flex-wrap gap-2">
                    {stylesList.map((s) => (
                      <button key={s} onClick={() => toggleInList(s, styles, setStyles)} className={chipClass(styles.includes(s))}>
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
                    <Toggle label="SEO Mode" checked={seoMode} onChange={setSeoMode} />
                    <Toggle label="Include Meta" checked={includeMeta} onChange={setIncludeMeta} />
                    <Toggle label="Avoid Direct Address" checked={noDirectAddress} onChange={setNoDirectAddress} />
                  </div>
                </Card>

                <Card title="Quick Start Templates" subtitle="Start with a proven format.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickStarts.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => applyQuickStart(q)}
                        className="text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
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
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                        title="Copy prompt"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          setDraft((d) => (d ? d : `<!-- PROMPT -->\n${livePrompt}\n\n<!-- DRAFT -->\n`));
                        }}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                        title="Insert prompt into editor"
                      >
                        Insert
                      </button>
                    </div>
                  }
                >
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700">
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
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${scoreLabel.tone}`}>
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

                  <div className="p-4">
                    {activeTab === "Details" ? (
                      <>
                        <div className="mb-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
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
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                          >
                            Improve Hook
                          </button>
                          <button
                            onClick={() => onImprove("structure")}
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                          >
                            Improve Structure
                          </button>
                          <button
                            onClick={() => onImprove("credibility")}
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                          >
                            Add Credibility
                          </button>
                          <button
                            onClick={() => onImprove("seo")}
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                            disabled={!seoMode}
                            title={!seoMode ? "Enable SEO Mode first" : "Add FAQs and SEO sections"}
                          >
                            Improve SEO
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
                        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                          Tip: SEO-first formats typically win over time; story-first formats spike early.
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Editor */}
                <Card
                  title="Draft Editor"
                  subtitle="Edit your draft. Replace this stub with your LLM output."
                  right={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadDraft}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => setDraft("")}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
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
                    placeholder='Click "Generate Draft" to create an article. Or paste your own content here.'
                    className="w-full min-h-[420px] rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Words: {wordCount(draft)} · Sentences: {sentenceCount(draft)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Draft</span>
                    </div>
                  </div>
                </Card>

                {/* Bottom actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("Details")}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    Edit Inputs
                  </button>
                  <button
                    onClick={onGenerate}
                    className="w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  >
                    Generate Draft
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
              REVVEN · Article Studio prototype — wire-ready for your production LLM integration
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{props.title}</div>
          {props.subtitle ? <div className="text-xs text-slate-500 mt-0.5">{props.subtitle}</div> : null}
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
      <div className="p-4">{props.children}</div>
    </div>
  );
}

function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => props.onChange(!props.checked)}
      className={[
        "px-3 py-2 rounded-xl border text-sm transition inline-flex items-center gap-2",
        props.checked ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={props.checked}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{props.title}</div>
      <div className="text-2xl font-semibold mt-1">{props.value}</div>
      <div className="text-xs text-slate-500 mt-1">{props.subtitle}</div>
    </div>
  );
}
