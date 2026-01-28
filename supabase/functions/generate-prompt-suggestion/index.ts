import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, specificMode, characterImages, referenceImages, musicWithVocals, brandContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating prompt for contentType:", contentType, "specificMode:", specificMode);

    const hasImages = (characterImages && characterImages.length > 0) || (referenceImages && referenceImages.length > 0);
    const isVideo = contentType?.toLowerCase() === 'video';
    const isUGC = contentType?.toLowerCase() === 'ugc';
    const isImage = contentType?.toLowerCase() === 'image';
    const isAudio = contentType?.toLowerCase() === 'audio';
    const isDesign = contentType?.toLowerCase() === 'design';
    const isContent = contentType?.toLowerCase() === 'content';
    const isDocument = contentType?.toLowerCase() === 'document';
    const isEbook = contentType?.toLowerCase() === 'ebook';

    // Mode-specific prompt guidance with examples
    const getModeConfig = () => {
      const mode = specificMode?.toLowerCase() || '';

      // VIDEO MODES
      if (isVideo || isUGC) {
        switch (mode) {
          case 'avatar video':
          case 'lip-sync':
            return {
              guidance: `Create SHORT scripts for ${mode === 'lip-sync' ? 'Lip-Sync' : 'Avatar Video'} TALKING HEAD videos.
CRITICAL: Output MUST be 180 characters or less (including spaces and punctuation).
The script should be concise, punchy, natural and conversational with one clear hook.`,
              example: "I tried this product for 2 weeks and honestly? It changed everything. You need to see this for yourself.",
              type: "avatar_script"
            };

          case 'ugc':
            return {
              guidance: `Create prompts for UGC (User Generated Content) product showcase videos.
Focus on: authentic product presentation, natural lighting, lifestyle context, real-world usage scenarios.
The video should feel organic and relatable, not overly polished or commercial.`,
              example: "Close-up of hands unboxing a new skincare product on a bathroom counter, morning light streaming through window, genuine reaction to first application",
              type: "ugc_video"
            };

          case 'podcast':
            return {
              guidance: `Create prompts for PODCAST-STYLE talking head videos.
MUST include: Two or more people in conversation, studio/home office setting, microphones visible, engaged discussion.
Focus on: natural dialogue, hand gestures, nodding, eye contact between speakers, casual professional atmosphere.`,
              example: "Two hosts seated at a modern podcast desk with microphones, animated discussion about tech trends, one gestures enthusiastically while the other nods in agreement, warm studio lighting",
              type: "podcast_video"
            };

          case 'vsl':
            return {
              guidance: `Create prompts for Video Sales Letter (VSL) content.
MUST include: compelling hook, problem-solution narrative, emotional connection, urgency.
Focus on: direct camera address, text overlays, before/after visuals, testimonial-style delivery.`,
              example: "Speaker looks directly at camera with concerned expression, text overlay appears 'Are you struggling with...', scene transitions to relieved smile showing solution",
              type: "vsl_video"
            };

          case 'story':
            return {
              guidance: `Create prompts for STORY-based narrative videos with scene progression.
MUST include: clear beginning-middle-end, character journey, emotional arc.
Focus on: establishing shots, character actions, mood transitions, visual storytelling without dialogue.`,
              example: "Scene 1: Woman wakes up stressed, checks phone anxiously. Scene 2: Takes a deep breath, begins morning routine. Scene 3: Leaves house with confident smile, city awaits",
              type: "story_video"
            };

          case 'recast':
            return {
              guidance: `Create prompts for character RECAST videos where a new character is applied to existing footage.
Focus on: how the character should move, facial expressions to maintain, scene integration, natural blending.`,
              example: "Character walks confidently through busy street, maintaining natural gait, occasional glances at surroundings, seamless integration with crowd",
              type: "recast_video"
            };

          case 'motion-sync':
            return {
              guidance: `Create prompts for MOTION-SYNC videos where a character/person is animated to match movements from a reference video.
MUST describe: the type of motion/action the character should perform, the mood/style of the video, environment details.
Focus on: describing motion quality (smooth, energetic, graceful), character expression, scene atmosphere.
The prompt guides how the reference image character will move based on the reference video's motion.
Keep prompts concise but descriptive (under 200 characters ideal).`,
              example: "Graceful dance movements, flowing dress swaying with each turn, warm sunset lighting, confident and joyful expression",
              type: "motion_sync_video"
            };

          case 'draw':
            return {
              guidance: `Create prompts for ANIMATED/ARTISTIC style videos.
MUST include: specific art style (watercolor, anime, sketch, 3D), animation technique, visual effects.
Focus on: stylized movements, creative transitions, artistic interpretation.`,
              example: "Watercolor animation of cherry blossoms falling, soft brush strokes animate petals drifting, ink wash background gradually reveals mountain landscape",
              type: "draw_video"
            };

          case 'presentation':
            return {
              guidance: `Create prompts for PRESENTATION/EXPLAINER style videos.
MUST include: information hierarchy, motion graphics, data visualization, clean transitions.
Focus on: professional aesthetics, clear messaging, branded elements.`,
              example: "Sleek animated infographic showing statistics appearing one by one, smooth transitions between data points, minimalist design with accent colors",
              type: "presentation_video"
            };

          default: // Animate and general video
            return {
              guidance: `Create prompts for cinematic VIDEO generation.
MUST include: specific camera movements (pan, zoom, tracking, crane), action/motion description, lighting.
Focus on: dynamic movement, scene progression, atmospheric details.`,
              example: "Slow motion tracking shot following a runner through misty forest at dawn, camera rises above treeline revealing mountain vista, golden hour light breaks through clouds",
              type: "animate_video"
            };
        }
      }

      // IMAGE MODES
      if (isImage) {
        switch (mode) {
          case 'photoshoot':
            return {
              guidance: `Create prompts for professional PHOTOSHOOT images.
MUST include: specific pose, lighting setup (studio/natural), fashion/styling details, camera angle.
Focus on: high-end photography techniques, editorial quality, model direction.`,
              example: "Fashion editorial: model in tailored blazer, dramatic side lighting with soft fill, minimalist white cyc wall, three-quarter turn with direct eye contact, 85mm lens",
              type: "photoshoot_image"
            };

          case 'swap':
            return {
              guidance: `Create prompts for FACE or OUTFIT SWAP images.
MUST include: specific swap details (what to change), matching instructions for lighting/style.
Focus on: seamless integration, consistent quality, natural appearance.`,
              example: "Swap outfit to elegant burgundy evening gown with subtle sequin details, maintain current lighting and pose, ensure fabric drapes naturally",
              type: "swap_image"
            };

          case 'draw':
            return {
              guidance: `Create prompts for ARTISTIC/ILLUSTRATED images.
MUST include: specific art style (watercolor, oil painting, digital art, anime, sketch), technique details.
Focus on: artistic interpretation, color palette, unique visual style.`,
              example: "Studio Ghibli-inspired illustration of cozy coffee shop interior, warm color palette, soft hand-painted textures, magical afternoon light through windows",
              type: "draw_image"
            };

          default: // Create and general image
            return {
              guidance: `Create prompts for stunning PHOTOREALISTIC images.
MUST include: subject description, composition (close-up, wide, portrait), lighting mood, style/aesthetic.
Focus on: visual impact, technical quality, artistic direction.`,
              example: "Cinematic portrait of woman in golden hour light, shallow depth of field, soft bokeh background of autumn leaves, warm color grading, contemplative expression",
              type: "create_image"
            };
        }
      }

      // AUDIO MODES
      if (isAudio) {
        switch (mode) {
          case 'voiceover':
            return {
              guidance: `Create scripts for professional VOICEOVER narration.
MUST include: clear pacing markers, emotional tone, natural pauses.
Focus on: engaging delivery, appropriate energy level, clear articulation.`,
              example: "Welcome to the future of productivity. [pause] What if I told you... that everything you thought you knew about time management was wrong?",
              type: "voiceover_audio"
            };

          case 'clone':
            return {
              guidance: `Create natural-sounding text for VOICE CLONING.
MUST include: conversational flow, natural contractions, realistic speech patterns.
Focus on: authenticity, natural pacing, avoiding robotic phrasing.`,
              example: "Hey, so I've been meaning to tell you about this thing I discovered last week. You're gonna love it, seriously.",
              type: "clone_audio"
            };

          case 'revoice':
            return {
              guidance: `Create text for REVOICING/DUBBING existing content.
MUST include: matching original pacing, emotional intent, sync points.
Focus on: lip-sync friendly phrasing, maintaining original meaning.`,
              example: "The moment has arrived. Everything we've worked for comes down to this single decision.",
              type: "revoice_audio"
            };

          case 'sound effects':
          case 'sound_effects':
          case 'sfx':
            return {
              guidance: `Generate a specific SOUND EFFECT description.
MUST output: A precise, detailed sound effect that can be generated.
Examples: "Thunder rumbling in the distance with light rain", "Vintage typewriter keys clicking rapidly", "Spaceship engine powering up with electronic hum"
Focus on: specific sound characteristics, environment, intensity, duration hints.
Return ONLY the sound effect description.`,
              example: "Futuristic UI button click with subtle electronic chime and soft haptic feedback",
              type: "sound_effects_audio"
            };

          case 'music':
            // Generate prose-style music description
            if (musicWithVocals) {
              return {
                guidance: `Generate a flowing, descriptive prose paragraph about a song WITH VOCALS.

OUTPUT FORMAT (write as a single cohesive paragraph, like this example):
"This song blends EDM, Pop-Dance, and Progressive House styles, creating an uplifting, anthemic, and emotionally charged track perfect for a night out, a music festival, or even a high-energy workout. The lyrics are designed to evoke feelings of hope, yearning, and strength, with a male vocalist delivering a melodic, smooth, and emotionally rich performance."

MUST INCLUDE:
- Genre blend (2-3 specific genres)
- Mood/atmosphere descriptors
- Ideal use cases or settings
- Vocalist gender (male/female) and vocal style
- Emotional themes the lyrics convey

Write as ONE flowing paragraph. Return ONLY the prose description.`,
                example: `This song blends R&B, Neo-Soul, and Contemporary Pop styles, creating a smooth, intimate, and emotionally vulnerable track perfect for late-night reflection or romantic moments. The lyrics explore themes of love, longing, and self-discovery, with a female vocalist delivering a sultry, breathy, and deeply expressive performance.`,
                type: "music_vocals_audio"
              };
            }
            // Instrumental mode
            return {
              guidance: `Generate a flowing, descriptive prose paragraph about INSTRUMENTAL music (no vocals).

OUTPUT FORMAT (write as a single cohesive paragraph, like this example):
"This piece blends Ambient, Cinematic, and Electronic styles, creating a vast, atmospheric, and emotionally stirring instrumental track perfect for focus work, meditation, or film scoring. The composition features sweeping synth pads, delicate piano melodies, and subtle percussion that builds to an epic crescendo."

MUST INCLUDE:
- Genre blend (2-3 specific genres)
- Mood/atmosphere descriptors
- Ideal use cases or settings
- Key instruments and arrangement style

This is INSTRUMENTAL - do NOT mention vocals, singers, or lyrics.
Write as ONE flowing paragraph. Return ONLY the prose description.`,
              example: `This piece blends Lo-Fi, Jazz, and Ambient styles, creating a relaxed, nostalgic, and warmly textured instrumental track perfect for studying, creative work, or unwinding after a long day. The arrangement features dusty vinyl crackles, mellow jazz piano chords, soft brushed drums, and warm bass undertones.`,
              type: "music_audio"
            };

          default:
            return {
              guidance: `Create prompts for AUDIO content.
Include: tone, style, pacing, emotional quality.`,
              example: "Warm, friendly narration with gentle pacing and natural pauses for emphasis",
              type: "general_audio"
            };
        }
      }

      // DESIGN MODE - with specific design types
      if (isDesign) {
        switch (mode) {
          case 'logo':
            return {
              guidance: `Generate a brand/company name for a LOGO design.
MUST output: A creative, memorable brand name that would work well as a logo.
Focus on: Modern business names, tech startups, creative agencies, lifestyle brands.
Examples: "Nexus", "Velora", "Quantum Labs", "Bloom Studio", "Arctic Wave"
Return ONLY the brand name, nothing else.`,
              example: "Lumina Tech",
              type: "logo_design"
            };
          case 'business card':
            return {
              guidance: `Generate a professional name and title for a BUSINESS CARD design.
MUST output: A person's name and professional title/company.
Examples: "Sarah Chen, Creative Director at Bloom Agency", "Marcus Webb, CEO - Quantum Ventures"
Return ONLY the name and title.`,
              example: "Alexandra Rivers, Senior Architect at Modern Spaces",
              type: "business_card_design"
            };
          case 'brochure':
            return {
              guidance: `Generate a compelling topic/theme for a BROCHURE design.
MUST output: A specific product, service, or event that needs a brochure.
Examples: "Luxury Spa Resort Weekend Packages", "AI-Powered Marketing Solutions", "2024 Summer Music Festival"
Return ONLY the brochure topic.`,
              example: "Sustainable Living: Eco-Friendly Home Solutions",
              type: "brochure_design"
            };
          case 'cover':
            return {
              guidance: `Generate a captivating title for a BOOK/MAGAZINE COVER design.
MUST output: A compelling book or magazine title with optional subtitle.
Examples: "The Art of Mindful Leadership", "VOGUE: Spring Fashion Forward", "Secrets of the Digital Age"
Return ONLY the cover title.`,
              example: "Rise: How to Build an Empire from Nothing",
              type: "cover_design"
            };
          case 'flyer':
            return {
              guidance: `Generate an event or promotion for a FLYER design.
MUST output: An exciting event, sale, or promotional announcement.
Examples: "Summer Beach Party - August 15th", "50% OFF Flash Sale This Weekend", "Grand Opening Celebration"
Return ONLY the flyer headline/event.`,
              example: "Tech Innovation Summit 2024 - Join the Future",
              type: "flyer_design"
            };
          case 'infographic':
            return {
              guidance: `Generate a data-rich topic for an INFOGRAPHIC design.
MUST output: A topic that can be visualized with data, statistics, or step-by-step information.
Examples: "The Evolution of AI: 1950-2024", "10 Habits of Successful Entrepreneurs", "How Coffee Gets From Farm to Cup"
Return ONLY the infographic topic.`,
              example: "The Future of Remote Work: Statistics & Trends",
              type: "infographic_design"
            };
          case 'invitation':
            return {
              guidance: `Generate an elegant event for an INVITATION design.
MUST output: A special event that requires a formal invitation.
Examples: "Wedding of Emily & James, June 20th", "Annual Charity Gala 2024", "You're Invited: Product Launch Party"
Return ONLY the invitation event.`,
              example: "Celebrate With Us: Anniversary Dinner at The Grand Ballroom",
              type: "invitation_design"
            };
          case 'poster':
            return {
              guidance: `Generate a bold topic for a POSTER design.
MUST output: A movie, concert, exhibition, or campaign that needs a striking poster.
Examples: "ECLIPSE - Coming Summer 2024", "World Music Festival", "Climate Action Now"
Return ONLY the poster title/topic.`,
              example: "NEON DREAMS - Live in Concert",
              type: "poster_design"
            };
          case 'thumbnail':
            return {
              guidance: `Generate a click-worthy topic for a YouTube THUMBNAIL design.
MUST output: An attention-grabbing video title that would make people want to click.
Examples: "I Tried This for 30 Days...", "The SECRET They Don't Want You to Know", "This Changed EVERYTHING"
Return ONLY the thumbnail title.`,
              example: "How I Made $100K in 6 Months (Step by Step)",
              type: "thumbnail_design"
            };
          case 'banner':
            return {
              guidance: `Generate an impactful message for a BANNER design.
MUST output: A promotional message, announcement, or brand tagline for a web/social banner.
Examples: "New Collection Drop - Shop Now", "Join 10,000+ Subscribers", "Limited Time: 40% OFF"
Return ONLY the banner message.`,
              example: "Transform Your Business with AI - Get Started Free",
              type: "banner_design"
            };
          default:
            return {
              guidance: `Create prompts for GRAPHIC DESIGN projects.
MUST include: design type (logo, banner, card), style direction, color scheme, typography hints.
Focus on: visual hierarchy, brand personality, modern aesthetics.`,
              example: "Minimalist tech startup logo, geometric sans-serif wordmark, gradient from electric blue to teal, clean negative space, scalable for app icon",
              type: "design"
            };
        }
      }

      // CONTENT MODE (Social Media)
      if (isContent) {
        return {
          guidance: `Create creative, SPECIFIC topic ideas for a 30-day social media content calendar.

Generate ONE clear, compelling niche/topic theme that could fuel 30 days of engaging content.

GOOD EXAMPLES (specific and actionable):
- "Fitness transformation journey with daily workout tips and meal prep ideas"
- "Behind-the-scenes of starting a coffee shop business"  
- "30-day minimalism challenge with decluttering tips and before/after reveals"
- "Daily AI tools and productivity hacks for entrepreneurs"
- "Plant-based recipe collection with grocery hauls and cooking tutorials"
- "Real estate investing tips with market analysis and deal breakdowns"
- "Personal finance journey: debt payoff, budgeting, and wealth building"
- "Fashion styling tips with outfit ideas for different body types"
- "Mental health awareness with daily mindfulness and self-care practices"
- "Tech reviews and comparisons for busy professionals"

BAD EXAMPLES (too vague):
- "Social media content" (too generic)
- "Business tips" (not specific enough)
- "Lifestyle content" (no clear angle)

Return ONLY the topic/niche description in 1-2 sentences. Be specific about the angle and content style.`,
          example: "30-day home organization challenge with room-by-room decluttering tips, storage hacks, and satisfying before/after transformations",
          type: "social_content"
        };
      }

      // DOCUMENT MODE
      if (isDocument) {
        switch (mode) {
          case 'business plan':
            return {
              guidance: `Generate a compelling BUSINESS IDEA for a business plan.

Generate ONE innovative, realistic business concept that would make an excellent business plan.

MUST INCLUDE:
- Specific business type and industry
- Unique value proposition hint
- Target market indication

DIVERSE CATEGORIES:
- Technology & SaaS
- E-commerce & Retail
- Health & Wellness
- Food & Beverage
- Professional Services
- Education & Training
- Entertainment & Media
- Sustainability & Green Tech

GOOD EXAMPLES:
- "AI-powered personal shopping assistant for sustainable fashion brands"
- "Subscription meal kit service for busy professionals with dietary restrictions"
- "Mobile app connecting local farmers directly with urban consumers"
- "Virtual reality fitness platform for home workouts"
- "On-demand tutoring marketplace for K-12 STEM subjects"
- "Eco-friendly packaging solutions for e-commerce businesses"

Return ONLY the business idea in 1-2 sentences. Be specific and commercially viable.`,
              example: "Subscription-based plant care service with AI diagnosis and expert consultations for urban apartment dwellers",
              type: "business_plan_document"
            };
          case 'report':
            return {
              guidance: `Generate a professional BUSINESS REPORT topic.

Generate ONE specific business or industry report topic that includes data-rich content.

MUST INCLUDE:
- Specific industry or business focus
- Time period or comparison angle
- Metric/KPI focus area

GOOD EXAMPLES:
- "Q4 2024 E-commerce Performance Analysis with YoY Growth Metrics"
- "Customer Acquisition Cost Trends in SaaS Industry"
- "Monthly Marketing ROI Report: Social Media vs Paid Advertising"
- "Employee Productivity Analysis: Remote vs Hybrid Work Models"

Return ONLY the report topic. Be specific and data-focused.`,
              example: "Annual Revenue Performance Report with Regional Breakdown and Growth Projections",
              type: "report_document"
            };
          case 'whitepaper':
            return {
              guidance: `Generate a thought-leadership WHITEPAPER topic.

Generate ONE authoritative whitepaper topic that establishes expertise.

MUST INCLUDE:
- Specific industry challenge or opportunity
- Research or data-backed angle
- Forward-looking insights

GOOD EXAMPLES:
- "The Future of Generative AI in Enterprise Software Development"
- "Sustainable Supply Chain Management: A Framework for 2025"
- "Digital Transformation in Healthcare: Lessons from Top Performing Systems"

Return ONLY the whitepaper topic. Be authoritative and research-focused.`,
              example: "Zero-Trust Security Architecture: Implementation Strategies for Mid-Market Enterprises",
              type: "whitepaper_document"
            };
          case 'case study':
            return {
              guidance: `Generate a compelling CASE STUDY scenario.

Generate ONE success story scenario that demonstrates measurable results.

MUST INCLUDE:
- Company type or industry
- Challenge or problem faced
- Hint at solution area

GOOD EXAMPLES:
- "How a Regional Retailer Increased Online Sales 340% Through Omnichannel Strategy"
- "Reducing Customer Churn by 65% Using Predictive Analytics"
- "Manufacturing Startup Cuts Production Costs 40% with IoT Implementation"

Return ONLY the case study title/topic. Focus on transformation and results.`,
              example: "E-commerce Brand Achieves 5x ROAS Through AI-Powered Personalization",
              type: "case_study_document"
            };
          case 'proposal':
            return {
              guidance: `Generate a professional BUSINESS PROPOSAL topic.

Generate ONE compelling proposal scenario for a business engagement.

MUST INCLUDE:
- Service or solution being proposed
- Target client type
- Value proposition hint

GOOD EXAMPLES:
- "Digital Marketing Strategy Proposal for B2B SaaS Company"
- "Office Space Redesign Proposal for Hybrid Workforce"
- "Enterprise Software Implementation Proposal for Healthcare Provider"

Return ONLY the proposal topic. Be professional and solution-focused.`,
              example: "Brand Identity Refresh Proposal for Established Financial Services Firm",
              type: "proposal_document"
            };
          case 'cover letter':
            return {
              guidance: `Generate a compelling COVER LETTER scenario.

Generate ONE job application scenario that requires a professional cover letter.

MUST INCLUDE:
- Specific job title/role
- Industry or company type
- Key qualifications or experience angle

GOOD EXAMPLES:
- "Senior Product Manager role at a fast-growing fintech startup"
- "Marketing Director position at a Fortune 500 consumer goods company"
- "Software Engineer applying to AI research team at tech giant"
- "UX Designer role at a healthcare innovation company"
- "Sales Executive position at enterprise software company"

Return ONLY the cover letter scenario. Be specific about role and context.`,
              example: "Data Science Lead position at a climate tech startup revolutionizing renewable energy",
              type: "cover_letter_document"
            };
          case 'handbook':
            return {
              guidance: `Generate a compelling HANDBOOK topic.

Generate ONE handbook topic that would serve as a comprehensive reference guide for an organization.

MUST INCLUDE:
- Specific domain or department focus
- Target audience (employees, managers, new hires, etc.)
- Clear organizational context

GOOD EXAMPLES:
- "Employee Onboarding Handbook for Tech Startups"
- "Remote Work Policy and Best Practices Handbook"
- "Customer Service Excellence Handbook for Retail Teams"
- "Safety and Compliance Handbook for Manufacturing"
- "Brand Guidelines and Style Handbook for Marketing Teams"

Return ONLY the handbook topic. Be specific about the domain and audience.`,
              example: "New Manager Leadership Development Handbook for Growing Organizations",
              type: "handbook_document"
            };
          default:
            return {
              guidance: `Generate a professional DOCUMENT topic.

Generate ONE compelling document topic based on common business needs.

GOOD EXAMPLES:
- "Quarterly Business Review with Performance Metrics"
- "Product Launch Strategy Document"
- "Market Research Summary Report"

Return ONLY the document topic.`,
              example: "Annual Strategic Planning Document for Growth-Stage Startup",
              type: "general_document"
            };
        }
      }

      // EBOOK MODE
      if (isEbook) {
        const hasBrand = brandContext && (brandContext.identity || brandContext.voice || brandContext.knowledge);
        
        if (hasBrand) {
          // Use brand context to generate personalized ebook ideas
          const brandInfo = [];
          if (brandContext.identity?.brandName) brandInfo.push(`Brand: ${brandContext.identity.brandName}`);
          if (brandContext.identity?.industry) brandInfo.push(`Industry: ${brandContext.identity.industry}`);
          if (brandContext.identity?.targetAudience) brandInfo.push(`Target Audience: ${brandContext.identity.targetAudience}`);
          if (brandContext.identity?.brandDescription) brandInfo.push(`About: ${brandContext.identity.brandDescription}`);
          if (brandContext.voice?.toneOfVoice) brandInfo.push(`Tone: ${brandContext.voice.toneOfVoice}`);
          if (brandContext.knowledge?.dataSources?.length > 0) {
            brandInfo.push(`Knowledge areas: ${brandContext.knowledge.dataSources.map((d: any) => d.name || d.title).join(', ')}`);
          }
          
          return {
            guidance: `Generate a compelling EBOOK topic idea tailored to this brand:

${brandInfo.join('\n')}

Create an ebook topic that:
- Aligns with the brand's expertise and industry
- Appeals to their target audience
- Showcases their unique perspective
- Could establish them as a thought leader

GOOD EXAMPLES:
- "The Ultimate Guide to Sustainable Fashion for Conscious Consumers"
- "10 Secrets Top Real Estate Investors Don't Want You to Know"
- "From Burnout to Balance: A Working Mom's Guide to Self-Care"
- "The Small Business Owner's Playbook for AI Automation"
- "Mastering Plant-Based Nutrition: A Complete Beginner's Cookbook"

Return ONLY the ebook topic/title idea in 1-2 sentences. Be specific and compelling.`,
            example: "The Complete Guide to Building a Six-Figure Freelance Business in 2024",
            type: "ebook_branded"
          };
        }
        
        // No brand context - generate creative ebook ideas
        return {
          guidance: `Generate a compelling EBOOK topic idea that would make a great digital product.

Create an ebook topic that:
- Solves a real problem or teaches a valuable skill
- Has clear commercial appeal
- Could attract a wide audience
- Offers actionable, valuable content

DIVERSE CATEGORIES TO CHOOSE FROM:
- Business & Entrepreneurship
- Personal Development & Self-Help
- Health & Wellness
- Finance & Investing
- Technology & AI
- Creative Skills (Writing, Design, Photography)
- Lifestyle (Travel, Food, Home)
- Career Development
- Relationships & Communication
- Hobbies & Special Interests

GOOD EXAMPLES:
- "The Side Hustle Blueprint: 50 Business Ideas You Can Start This Weekend"
- "Meal Prep Mastery: 30 Days of Healthy Eating Without the Stress"
- "The Introvert's Guide to Networking and Building Genuine Connections"
- "Crypto for Beginners: A Plain-English Guide to Digital Investing"
- "The Minimalist Home: Declutter Your Space, Transform Your Life"
- "Remote Work Revolution: Thriving in the New World of Work"

Return ONLY the ebook topic/title idea in 1-2 sentences. Be specific, compelling, and marketable.`,
          example: "The Complete Guide to Passive Income: Building Wealth While You Sleep",
          type: "ebook"
        };
      }

      // Default fallback
      return {
        guidance: `Create inspiring and detailed creative prompts.
Focus on: clear subject, visual style, mood, technical details.`,
        example: "A stunning visual composition with dramatic lighting and professional quality",
        type: "general"
      };
    };

    let messages: any[] = [];
    const modeConfig = getModeConfig();

    console.log("Mode config type:", modeConfig.type);

    if (isUGC || specificMode?.toLowerCase() === 'avatar video') {
      // UGC/Avatar Video mode - generate short voice scripts (180 chars max)
      messages = [
        { 
          role: "system", 
          content: `You are a creative scriptwriter for Avatar Video talking head content.
${modeConfig.guidance}

EXAMPLE OUTPUT: "${modeConfig.example}"

Generate a single engaging script that is UNDER 180 CHARACTERS TOTAL.
Return ONLY the script text. No quotes, no stage directions, no explanations.`
        },
        { 
          role: "user", 
          content: "Generate a short, punchy Avatar Video script. MUST be under 180 characters." 
        }
      ];
    } else if (hasImages) {
      // With images - vision analysis
      const content: any[] = [
        { 
          type: "text", 
          text: `Create a NEW creative prompt for ${modeConfig.type.replace('_', ' ')} featuring these images.

REQUIREMENTS:
${modeConfig.guidance}

EXAMPLE FORMAT: "${modeConfig.example}"

Look at the images and create ONE detailed prompt following the requirements above. Return ONLY the prompt.`
        }
      ];

      // Add character images
      if (characterImages && characterImages.length > 0) {
        characterImages.forEach((url: string) => {
          content.push({ type: "image_url", image_url: { url } });
        });
      }

      // Add reference images
      if (referenceImages && referenceImages.length > 0) {
        referenceImages.forEach((url: string) => {
          content.push({ type: "image_url", image_url: { url } });
        });
      }

      messages = [
        { 
          role: "system", 
          content: `You are a creative prompt generator. Generate prompts that EXACTLY match the specified mode requirements. Do not deviate from the format.`
        },
        { role: "user", content }
      ];
    } else {
      // No images - random creative prompt
      messages = [
        { 
          role: "system", 
          content: `You are a creative prompt generator for ${modeConfig.type.replace('_', ' ')}.

STRICT REQUIREMENTS - Your prompt MUST follow this guidance:
${modeConfig.guidance}

EXAMPLE OUTPUT FORMAT: "${modeConfig.example}"

Generate ONE creative prompt that follows the exact same style and structure as the example.
Return ONLY the prompt text. No explanations, no alternatives.`
        },
        { 
          role: "user", 
          content: `Generate a creative ${modeConfig.type.replace('_', ' ')} prompt. Follow the requirements exactly.`
        }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error("Failed to generate prompt suggestion");
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content?.trim() || "";

    console.log("Generated", modeConfig.type, "suggestion:", suggestion.substring(0, 100));

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-prompt-suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
