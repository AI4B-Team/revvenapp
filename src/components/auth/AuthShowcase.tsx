import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';
import { useTranslation } from '@/hooks/useTranslation';

// Slide keys for translation lookup
const slideKeys = [
  'ugcVideoAds',
  'ideaToVideo',
  'aiImageGen',
  'aiMusic',
  'videoEditing',
  'productVideo',
  'aiTwin',
  'aiCharacters',
  'videoTranslation',
  'autoContent',
  'autoScheduling',
  'autoEngagement',
  'digitalProducts',
  'websites',
  'funnels',
  'leadGen',
  'crm',
  'adCampaigns',
  'competitor',
  'brand',
  'analytics',
  'buildApps',
  'whiteLabel',
  'more',
];

// Slide styling config (colors only, no text)
const slideStyles = [
  { bgColor: "bg-rose-50", accentColor: "text-rose-700", pillBg: "bg-rose-200/60" },
  { bgColor: "bg-violet-50", accentColor: "text-violet-700", pillBg: "bg-violet-200/60" },
  { bgColor: "bg-indigo-50", accentColor: "text-indigo-700", pillBg: "bg-indigo-200/60" },
  { bgColor: "bg-teal-50", accentColor: "text-teal-700", pillBg: "bg-teal-200/60" },
  { bgColor: "bg-amber-50", accentColor: "text-amber-700", pillBg: "bg-amber-200/60" },
  { bgColor: "bg-blue-50", accentColor: "text-blue-700", pillBg: "bg-blue-200/60" },
  { bgColor: "bg-fuchsia-50", accentColor: "text-fuchsia-700", pillBg: "bg-fuchsia-200/60" },
  { bgColor: "bg-violet-50", accentColor: "text-violet-700", pillBg: "bg-violet-200/60" },
  { bgColor: "bg-lime-50", accentColor: "text-lime-700", pillBg: "bg-lime-200/60" },
  { bgColor: "bg-sky-50", accentColor: "text-sky-700", pillBg: "bg-sky-200/60" },
  { bgColor: "bg-rose-50", accentColor: "text-rose-700", pillBg: "bg-rose-200/60" },
  { bgColor: "bg-orange-50", accentColor: "text-orange-700", pillBg: "bg-orange-200/60" },
  { bgColor: "bg-emerald-50", accentColor: "text-emerald-700", pillBg: "bg-emerald-200/60" },
  { bgColor: "bg-teal-50", accentColor: "text-teal-700", pillBg: "bg-teal-200/60" },
  { bgColor: "bg-amber-50", accentColor: "text-amber-700", pillBg: "bg-amber-200/60" },
  { bgColor: "bg-cyan-50", accentColor: "text-cyan-700", pillBg: "bg-cyan-200/60" },
  { bgColor: "bg-slate-100", accentColor: "text-slate-700", pillBg: "bg-slate-200/60" },
  { bgColor: "bg-red-50", accentColor: "text-red-700", pillBg: "bg-red-200/60" },
  { bgColor: "bg-slate-50", accentColor: "text-slate-700", pillBg: "bg-slate-200/60" },
  { bgColor: "bg-fuchsia-50", accentColor: "text-fuchsia-700", pillBg: "bg-fuchsia-200/60" },
  { bgColor: "bg-emerald-50", accentColor: "text-emerald-700", pillBg: "bg-emerald-200/60" },
  { bgColor: "bg-indigo-50", accentColor: "text-indigo-700", pillBg: "bg-indigo-200/60" },
  { bgColor: "bg-purple-50", accentColor: "text-purple-700", pillBg: "bg-purple-200/60" },
  { bgColor: "bg-gradient-to-br from-brand-green/10 to-emerald-50", accentColor: "text-brand-green", pillBg: "bg-brand-green/20" },
];

export default function AuthShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useTranslation();

  // Build translated slides
  const showcaseSlides = useMemo(() => {
    return slideKeys.map((key, index) => ({
      title: t(`showcase.${key}.title`),
      description: t(`showcase.${key}.description`),
      features: [
        t(`showcase.${key}.feature1`),
        t(`showcase.${key}.feature2`),
        t(`showcase.${key}.feature3`),
      ],
      ...slideStyles[index],
    }));
  }, [t]);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, showcaseSlides.length]);

  const currentSlideData = showcaseSlides[currentSlide];

  return (
    <div className={`hidden lg:flex flex-1 h-full min-h-0 ${currentSlideData.bgColor} p-12 flex-col relative overflow-hidden transition-colors duration-700`}>
      {/* Logo at top left - clickable to go back to landing */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
        <RevvenLogo size={40} />
        <span className="text-2xl font-bold text-gray-900 tracking-tight">REVVEN</span>
      </Link>

      {/* Slide Content - Fixed height container to prevent layout shifts */}
      <div className="max-w-xl relative z-10 h-[400px] flex flex-col justify-center flex-1">
        <div className="mb-8">
          <span className={`inline-block px-4 py-1.5 ${currentSlideData.pillBg} backdrop-blur-sm rounded-full ${currentSlideData.accentColor} text-sm font-medium mb-6`}>
            ✨ {t('showcase.poweredByAI', 'Powered By AI')}
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold ${currentSlideData.accentColor} mb-4 leading-tight transition-all duration-500 min-h-[120px]`}>
            {currentSlideData.title}
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed transition-all duration-500 min-h-[84px]">
            {currentSlideData.description}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 mb-12 min-h-[44px]">
          {currentSlideData.features.map((feature, idx) => (
            <span 
              key={idx}
              className={`px-4 py-2 ${currentSlideData.pillBg} backdrop-blur-sm rounded-full ${currentSlideData.accentColor} text-sm font-medium`}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-12 left-12 right-12 flex items-center z-10">
        <div className="flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {showcaseSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? `w-8 ${currentSlideData.accentColor.replace('text-', 'bg-')}` 
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          {/* Pause/Play button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-full ${currentSlideData.pillBg} ${currentSlideData.accentColor} hover:opacity-80 transition-opacity`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 ${currentSlideData.pillBg} rounded-full blur-3xl opacity-50`} />
        <div className={`absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 ${currentSlideData.pillBg} rounded-full blur-3xl opacity-30`} />
      </div>
    </div>
  );
}
