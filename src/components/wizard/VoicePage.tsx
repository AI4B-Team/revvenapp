import React, { useState } from 'react';
import { Mic, Check, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';
import TutorialModal from './TutorialModal';

interface VoicePageProps {
  formData: {
    toneOfVoice: string[];
    writingStyle: string;
    communicationGuidelines: string;
    brandPersonality: string[];
    dosList: string[];
    dontsList: string[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const VoicePage: React.FC<VoicePageProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [customDo, setCustomDo] = useState('');
  const [customDont, setCustomDont] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTutorial, setShowTutorial] = useState(false);

  const toneOptions = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'casual', label: 'Casual', icon: '👋' },
    { value: 'formal', label: 'Formal', icon: '🎩' },
    { value: 'enthusiastic', label: 'Enthusiastic', icon: '🎉' },
    { value: 'empathetic', label: 'Empathetic', icon: '💙' },
    { value: 'authoritative', label: 'Authoritative', icon: '⚡' },
    { value: 'playful', label: 'Playful', icon: '🎨' },
  ];

  const writingStyleOptions = [
    { value: 'concise', label: 'Concise & Direct', description: 'Get to the point quickly' },
    { value: 'detailed', label: 'Detailed & Thorough', description: 'Comprehensive explanations' },
    { value: 'conversational', label: 'Conversational', description: 'Like talking to a friend' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative-driven approach' },
  ];

  const personalityTraits = [
    'Innovative', 'Trustworthy', 'Bold', 'Caring', 'Sophisticated', 'Down-to-earth',
    'Energetic', 'Calm', 'Adventurous', 'Reliable', 'Creative', 'Analytical'
  ];

  const toggleTone = (tone: string) => {
    const currentTones = formData.toneOfVoice || [];
    const newTones = currentTones.includes(tone)
      ? currentTones.filter(t => t !== tone)
      : [...currentTones, tone];
    onUpdate({ toneOfVoice: newTones });
  };

  const togglePersonality = (trait: string) => {
    const currentTraits = formData.brandPersonality || [];
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    onUpdate({ brandPersonality: newTraits });
  };

  const addDo = () => {
    if (customDo.trim()) {
      const currentDos = formData.dosList || [];
      onUpdate({ dosList: [...currentDos, customDo.trim()] });
      setCustomDo('');
    }
  };

  const addDont = () => {
    if (customDont.trim()) {
      const currentDonts = formData.dontsList || [];
      onUpdate({ dontsList: [...currentDonts, customDont.trim()] });
      setCustomDont('');
    }
  };

  const removeDo = (index: number) => {
    const currentDos = formData.dosList || [];
    onUpdate({ dosList: currentDos.filter((_, i) => i !== index) });
  };

  const removeDont = (index: number) => {
    const currentDonts = formData.dontsList || [];
    onUpdate({ dontsList: currentDonts.filter((_, i) => i !== index) });
  };

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.toneOfVoice || formData.toneOfVoice.length === 0) {
      newErrors.toneOfVoice = 'Please select at least one tone of voice';
    }

    if (!formData.writingStyle) {
      newErrors.writingStyle = 'Please select a writing style';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Mic size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Brand Voice</h1>
            <p className="text-sm text-gray-600">Define how your brand communicates</p>
          </div>
          <button 
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tutorial
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 2 of 5</span>
            <span>40% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable 2 Column Layout */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN - Inputs */}
            <div className="space-y-6">
              
              {/* Tone of Voice */}
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  TONE OF VOICE <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Select all that apply to describe your brand's communication style
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {toneOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleTone(option.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        (formData.toneOfVoice || []).includes(option.value)
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    </button>
                  ))}
                </div>
                {errors.toneOfVoice && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.toneOfVoice}
                  </p>
                )}
              </div>

              {/* Writing Style */}
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  WRITING STYLE <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {writingStyleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onUpdate({ writingStyle: option.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.writingStyle === option.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </button>
                  ))}
                </div>
                {errors.writingStyle && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.writingStyle}
                  </p>
                )}
              </div>

              {/* Brand Personality */}
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  BRAND PERSONALITY
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Choose traits that best describe your brand (select 3-5)
                </p>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => togglePersonality(trait)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        (formData.brandPersonality || []).includes(trait)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication Guidelines */}
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare size={16} />
                  COMMUNICATION GUIDELINES
                </label>
                <textarea
                  value={formData.communicationGuidelines || ''}
                  onChange={(e) => onUpdate({ communicationGuidelines: e.target.value })}
                  placeholder="Add any specific guidelines for how your brand should communicate (e.g., 'Always use inclusive language', 'Avoid industry jargon', 'Keep it simple and clear')"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                />
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Do's */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    Do's
                  </h3>
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {(formData.dosList || []).map((item, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white p-2 rounded-lg">
                        <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700 flex-1">{item}</span>
                        <button
                          onClick={() => removeDo(index)}
                          className="text-gray-400 hover:text-red-600 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDo}
                      onChange={(e) => setCustomDo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDo()}
                      placeholder="Add a do..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={addDo}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Don'ts */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" />
                    Don'ts
                  </h3>
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {(formData.dontsList || []).map((item, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white p-2 rounded-lg">
                        <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700 flex-1">{item}</span>
                        <button
                          onClick={() => removeDont(index)}
                          className="text-gray-400 hover:text-red-600 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDont}
                      onChange={(e) => setCustomDont(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDont()}
                      placeholder="Add a don't..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={addDont}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - Voice Summary (Sticky) */}
            <div>
              <div className="lg:sticky lg:top-0">
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-600" />
                    VOICE SUMMARY
                  </h3>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    {(formData.toneOfVoice && formData.toneOfVoice.length > 0) || formData.writingStyle || (formData.brandPersonality && formData.brandPersonality.length > 0) ? (
                      <div className="space-y-4">
                        {formData.toneOfVoice && formData.toneOfVoice.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tone</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.toneOfVoice.map((tone) => (
                                <span key={tone} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  {toneOptions.find(opt => opt.value === tone)?.label || tone}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {formData.writingStyle && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Style</p>
                            <p className="text-sm text-gray-900 font-medium">
                              {writingStyleOptions.find(opt => opt.value === formData.writingStyle)?.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {writingStyleOptions.find(opt => opt.value === formData.writingStyle)?.description}
                            </p>
                          </div>
                        )}
                        
                        {formData.brandPersonality && formData.brandPersonality.length > 0 && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Personality</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.brandPersonality.map((trait) => (
                                <span key={trait} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {((formData.dosList && formData.dosList.length > 0) || (formData.dontsList && formData.dontsList.length > 0)) && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Do's & Don'ts</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {formData.dosList && formData.dosList.length > 0 && (
                                <div>
                                  <p className="font-medium text-green-700 mb-1">✓ Do's</p>
                                  <p className="text-gray-600">{formData.dosList.length} items</p>
                                </div>
                              )}
                              {formData.dontsList && formData.dontsList.length > 0 && (
                                <div>
                                  <p className="font-medium text-red-700 mb-1">✗ Don'ts</p>
                                  <p className="text-gray-600">{formData.dontsList.length} items</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-8">
                        Your brand voice summary will appear here as you make selections
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer - Fixed/Sticky */}
      <div className="flex-shrink-0 px-8 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={validateAndProceed}
          className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          Continue
          <Check size={18} />
        </button>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Brand Voice Tutorial"
      />
    </div>
  );
};

export default VoicePage;
