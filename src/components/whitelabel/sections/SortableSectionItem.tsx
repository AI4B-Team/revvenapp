import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import AITextInput from '../AITextInput';
import AIIconGenerator from '../AIIconGenerator';
import type { PageBlock } from './PageSection';

interface SortableSectionItemProps {
  section: PageBlock;
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  Icon: React.ElementType;
  onToggle: () => void;
  onToggleEnabled: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isGenerating: string | null;
  updateSectionContent: (id: string, updates: Record<string, any>) => void;
  handleGenerateCopy: (sectionId: string) => void;
  setIsGenerating: (value: string | null) => void;
}

export function SortableSectionItem({
  section,
  isExpanded,
  isFirst,
  isLast,
  Icon,
  onToggle,
  onToggleEnabled,
  onMoveUp,
  onMoveDown,
  isGenerating,
  updateSectionContent,
  handleGenerateCopy,
  setIsGenerating,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border-2 transition-all ${
        section.enabled ? 'border-border' : 'border-border/50 opacity-60'
      } ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Reorder Controls: Up Arrow, Drag Handle, Down Arrow */}
        <div className="flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1 rounded hover:bg-muted transition-colors ${
              isFirst ? 'opacity-30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1 rounded hover:bg-muted transition-colors ${
              isLast ? 'opacity-30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          section.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon size={16} />
        </div>
        <span className="font-medium text-foreground flex-1">{section.title}</span>

        <Switch
          checked={section.enabled}
          onCheckedChange={onToggleEnabled}
          onClick={(e) => e.stopPropagation()}
        />

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Section Content Editor */}
      {isExpanded && section.enabled && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          {section.type === 'hero' && (
            <>
              <AITextInput
                label="Badge Text"
                value={section.content.badge || ''}
                onChange={(value) => updateSectionContent(section.id, { badge: value })}
                placeholder="e.g., AI-Powered, New, Trusted"
                context="tagline"
              />
              <div>
                <AITextInput
                  label="Tagline"
                  value={section.content.tagline || ''}
                  onChange={(value) => updateSectionContent(section.id, { tagline: value })}
                  placeholder="Enter a catchy tagline"
                  context="tagline"
                />
                <p className="text-xs text-muted-foreground mt-1">{(section.content.tagline?.length || 0)}/60</p>
              </div>
              <div>
                <AITextInput
                  label="Description"
                  value={section.content.description || ''}
                  onChange={(value) => updateSectionContent(section.id, { description: value })}
                  placeholder="Describe your platform's capabilities..."
                  context="description"
                  multiline
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">{(section.content.description?.length || 0)}/300</p>
              </div>

              {/* Hero Visual Image */}
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Hero Visual (Optional)</Label>
                  {section.content.heroImageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSectionContent(section.id, { heroImageUrl: '' })}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload or generate an image for split layouts. Uses app thumbnail by default.
                </p>

                {section.content.heroImageUrl ? (
                  <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border border-border">
                    <img
                      src={section.content.heroImageUrl}
                      alt="Hero visual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-background hover:bg-muted/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateSectionContent(section.id, { heroImageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium text-sm text-foreground">Upload Image</p>
                      <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setIsGenerating('hero-image');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        updateSectionContent(section.id, {
                          heroImageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop'
                        });
                        setIsGenerating(null);
                        toast.success('AI image generated!');
                      }}
                      disabled={isGenerating === 'hero-image'}
                      className="gap-2"
                    >
                      {isGenerating === 'hero-image' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Generate With AI
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {section.type === 'features' && (
            <div className="space-y-4">
              <AITextInput
                label="Section Headline"
                value={section.content.headline || ''}
                onChange={(value) => updateSectionContent(section.id, { headline: value })}
                placeholder="Why Choose Us"
                context="headline"
              />

              {(section.content.features || []).map((feature: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Feature {idx + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newFeatures = [...section.content.features];
                        newFeatures.splice(idx, 1);
                        updateSectionContent(section.id, { features: newFeatures });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-start gap-3">
                    <AIIconGenerator
                      currentIcon={feature.icon}
                      currentIconUrl={feature.iconUrl}
                      onIconChange={(icon, iconUrl) => {
                        const newFeatures = [...section.content.features];
                        newFeatures[idx] = { ...feature, icon, iconUrl };
                        updateSectionContent(section.id, { features: newFeatures });
                      }}
                      context="feature"
                    />
                    <div className="flex-1 space-y-2">
                      <AITextInput
                        value={feature.title}
                        onChange={(value) => {
                          const newFeatures = [...section.content.features];
                          newFeatures[idx] = { ...feature, title: value };
                          updateSectionContent(section.id, { features: newFeatures });
                        }}
                        placeholder="Feature title"
                        context="feature_title"
                      />
                      <AITextInput
                        value={feature.description}
                        onChange={(value) => {
                          const newFeatures = [...section.content.features];
                          newFeatures[idx] = { ...feature, description: value };
                          updateSectionContent(section.id, { features: newFeatures });
                        }}
                        placeholder="Feature description"
                        context="feature_description"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newFeatures = [...(section.content.features || []), { title: '', description: '', icon: '⚡' }];
                  updateSectionContent(section.id, { features: newFeatures });
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Feature
              </Button>
            </div>
          )}

          {section.type === 'capabilities' && (
            <div className="space-y-4">
              <AITextInput
                label="Section Headline"
                value={section.content.headline || ''}
                onChange={(value) => updateSectionContent(section.id, { headline: value })}
                placeholder="What We Offer"
                context="headline"
              />

              {(section.content.cards || []).map((card: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Capability {idx + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newCards = [...section.content.cards];
                        newCards.splice(idx, 1);
                        updateSectionContent(section.id, { cards: newCards });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-start gap-3">
                    <AIIconGenerator
                      currentIcon={card.icon}
                      currentIconUrl={card.iconUrl}
                      onIconChange={(icon, iconUrl) => {
                        const newCards = [...section.content.cards];
                        newCards[idx] = { ...card, icon, iconUrl };
                        updateSectionContent(section.id, { cards: newCards });
                      }}
                      context="capability"
                    />
                    <div className="flex-1 space-y-2">
                      <AITextInput
                        value={card.title}
                        onChange={(value) => {
                          const newCards = [...section.content.cards];
                          newCards[idx] = { ...card, title: value };
                          updateSectionContent(section.id, { cards: newCards });
                        }}
                        placeholder="Title"
                        context="capability_title"
                      />
                      <AITextInput
                        value={card.description}
                        onChange={(value) => {
                          const newCards = [...section.content.cards];
                          newCards[idx] = { ...card, description: value };
                          updateSectionContent(section.id, { cards: newCards });
                        }}
                        placeholder="Description"
                        context="capability_description"
                        multiline
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newCards = [...(section.content.cards || []), { title: '', description: '', icon: '✨' }];
                  updateSectionContent(section.id, { cards: newCards });
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Capability
              </Button>
            </div>
          )}

          {section.type === 'credibility' && (
            <div className="space-y-4">
              <AITextInput
                label="Section Headline"
                value={section.content.headline || ''}
                onChange={(value) => updateSectionContent(section.id, { headline: value })}
                placeholder="Trusted By Industry Leaders"
                context="headline"
              />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Partner Logos</Label>
                <p className="text-xs text-muted-foreground">
                  Upload partner or client logos. They will animate in a smooth carousel.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(section.content.logos || []).map((logo: any, idx: number) => (
                    <div key={logo.id || idx} className="relative group">
                      <div className="aspect-[3/2] rounded-lg border-2 border-border overflow-hidden bg-background flex items-center justify-center p-2">
                        <img
                          src={logo.url}
                          alt={logo.name || `Logo ${idx + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newLogos = [...section.content.logos];
                          newLogos.splice(idx, 1);
                          updateSectionContent(section.id, { logos: newLogos });
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <input
                        type="text"
                        value={logo.name || ''}
                        onChange={(e) => {
                          const newLogos = [...section.content.logos];
                          newLogos[idx] = { ...logo, name: e.target.value };
                          updateSectionContent(section.id, { logos: newLogos });
                        }}
                        placeholder="Alt text"
                        className="mt-1 w-full text-xs px-2 py-1 border border-border rounded bg-background"
                      />
                    </div>
                  ))}

                  {/* Add Logo Button */}
                  <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newLogos = [
                              ...(section.content.logos || []),
                              {
                                id: Date.now().toString(),
                                url: reader.result as string,
                                name: file.name.split('.')[0]
                              }
                            ];
                            updateSectionContent(section.id, { logos: newLogos });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {section.type === 'testimonials' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add testimonials with text, images, or both. All fields are optional for maximum flexibility.
              </p>
              {(section.content.testimonials || []).map((testimonial: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Testimonial {idx + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newTestimonials = [...section.content.testimonials];
                        newTestimonials.splice(idx, 1);
                        updateSectionContent(section.id, { testimonials: newTestimonials });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Profile Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Profile Image (Optional)</Label>
                    <div className="flex items-center gap-3">
                      {testimonial.avatarUrl ? (
                        <div className="relative group">
                          <img
                            src={testimonial.avatarUrl}
                            alt="Avatar"
                            className="w-14 h-14 rounded-full object-cover border-2 border-border"
                          />
                          <button
                            onClick={() => {
                              const newTestimonials = [...section.content.testimonials];
                              newTestimonials[idx] = { ...testimonial, avatarUrl: '' };
                              updateSectionContent(section.id, { testimonials: newTestimonials });
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const newTestimonials = [...section.content.testimonials];
                                  newTestimonials[idx] = { ...testimonial, avatarUrl: reader.result as string };
                                  updateSectionContent(section.id, { testimonials: newTestimonials });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Upload a profile photo or leave empty for initials</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <AITextInput
                      label="Name"
                      value={testimonial.name}
                      onChange={(value) => {
                        const newTestimonials = [...section.content.testimonials];
                        newTestimonials[idx] = { ...testimonial, name: value };
                        updateSectionContent(section.id, { testimonials: newTestimonials });
                      }}
                      placeholder="Name"
                      context="testimonial_name"
                    />
                    <AITextInput
                      label="Role"
                      value={testimonial.role}
                      onChange={(value) => {
                        const newTestimonials = [...section.content.testimonials];
                        newTestimonials[idx] = { ...testimonial, role: value };
                        updateSectionContent(section.id, { testimonials: newTestimonials });
                      }}
                      placeholder="Role"
                      context="testimonial_role"
                    />
                  </div>
                  <AITextInput
                    label="Company"
                    value={testimonial.company}
                    onChange={(value) => {
                      const newTestimonials = [...section.content.testimonials];
                      newTestimonials[idx] = { ...testimonial, company: value };
                      updateSectionContent(section.id, { testimonials: newTestimonials });
                    }}
                    placeholder="Company"
                    context="testimonial_company"
                  />
                  <AITextInput
                    label="Quote"
                    value={testimonial.quote}
                    onChange={(value) => {
                      const newTestimonials = [...section.content.testimonials];
                      newTestimonials[idx] = { ...testimonial, quote: value };
                      updateSectionContent(section.id, { testimonials: newTestimonials });
                    }}
                    placeholder="What they said..."
                    context="testimonial_quote"
                    multiline
                    rows={3}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newTestimonials = [...(section.content.testimonials || []), { name: '', role: '', company: '', quote: '', avatar: '' }];
                  updateSectionContent(section.id, { testimonials: newTestimonials });
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Testimonial
              </Button>
            </div>
          )}

          {section.type === 'pricing' && (
            <div className="space-y-4">
              <AITextInput
                label="Section Headline"
                value={section.content.headline || ''}
                onChange={(value) => updateSectionContent(section.id, { headline: value })}
                placeholder="Simple, Transparent Pricing"
                context="headline"
              />
              <AITextInput
                label="Subheadline"
                value={section.content.subheadline || ''}
                onChange={(value) => updateSectionContent(section.id, { subheadline: value })}
                placeholder="Start free, upgrade when you need more"
                context="subheadline"
              />
              <p className="text-sm text-muted-foreground">
                Pricing tiers are configured in the Pricing section of the sidebar.
              </p>
            </div>
          )}

          {section.type === 'cta' && (
            <div className="space-y-4">
              <AITextInput
                label="Headline"
                value={section.content.headline || ''}
                onChange={(value) => updateSectionContent(section.id, { headline: value })}
                placeholder="Ready to Get Started?"
                context="cta_headline"
              />
              <AITextInput
                label="Subheadline"
                value={section.content.subheadline || ''}
                onChange={(value) => updateSectionContent(section.id, { subheadline: value })}
                placeholder="Join thousands of businesses already using our platform"
                context="cta_subheadline"
              />
              <AITextInput
                label="Primary Button Text"
                value={section.content.buttonText || ''}
                onChange={(value) => updateSectionContent(section.id, { buttonText: value })}
                placeholder="Start Your Free Trial"
                context="button_text"
              />
              <AITextInput
                label="Secondary Button Text"
                value={section.content.secondaryButtonText || ''}
                onChange={(value) => updateSectionContent(section.id, { secondaryButtonText: value })}
                placeholder="Schedule a Demo"
                context="button_text"
              />
            </div>
          )}

          {section.type === 'footer' && (
            <div className="space-y-4">
              <AITextInput
                label="Company Name"
                value={section.content.companyName || ''}
                onChange={(value) => updateSectionContent(section.id, { companyName: value })}
                placeholder="Your Company"
                context="company_name"
              />
              <AITextInput
                label="Tagline"
                value={section.content.tagline || ''}
                onChange={(value) => updateSectionContent(section.id, { tagline: value })}
                placeholder="Empowering businesses with AI"
                context="tagline"
              />
              <div className="flex items-center justify-between">
                <Label>Show Social Links</Label>
                <Switch
                  checked={section.content.showSocialLinks}
                  onCheckedChange={(checked) => updateSectionContent(section.id, { showSocialLinks: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Newsletter Signup</Label>
                <Switch
                  checked={section.content.showNewsletter}
                  onCheckedChange={(checked) => updateSectionContent(section.id, { showNewsletter: checked })}
                />
              </div>
            </div>
          )}

          {section.type === 'faq' && (
            <div className="space-y-4">
              {(section.content.questions || []).map((faq: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Question {idx + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newQuestions = [...section.content.questions];
                        newQuestions.splice(idx, 1);
                        updateSectionContent(section.id, { questions: newQuestions });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <AITextInput
                    value={faq.q}
                    onChange={(value) => {
                      const newQuestions = [...section.content.questions];
                      newQuestions[idx] = { ...faq, q: value };
                      updateSectionContent(section.id, { questions: newQuestions });
                    }}
                    placeholder="Question"
                    context="faq_question"
                  />
                  <AITextInput
                    value={faq.a}
                    onChange={(value) => {
                      const newQuestions = [...section.content.questions];
                      newQuestions[idx] = { ...faq, a: value };
                      updateSectionContent(section.id, { questions: newQuestions });
                    }}
                    placeholder="Answer"
                    context="faq_answer"
                    multiline
                    rows={2}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newQuestions = [...(section.content.questions || []), { q: '', a: '' }];
                  updateSectionContent(section.id, { questions: newQuestions });
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          )}

          {/* Generate with AI Button */}
          <Button
            variant="outline"
            onClick={() => handleGenerateCopy(section.id)}
            disabled={isGenerating === section.id}
            className="gap-2"
          >
            {isGenerating === section.id ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Entire Section With AI
          </Button>
        </div>
      )}
    </div>
  );
}