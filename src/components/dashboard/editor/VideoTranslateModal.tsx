import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Languages,
  Subtitles,
  Mic,
  ChevronLeft,
  ChevronDown,
  Check,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface VideoTranslateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranslate?: (settings: TranslateSettings) => void;
}

interface TranslateSettings {
  type: 'dub' | 'subtitle';
  sourceLanguage: string;
  targetLanguage: string;
  voiceCloning: boolean;
}

const languages = [
  'Auto-detect',
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
  'Dutch',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Turkish',
];

const VideoTranslateModal: React.FC<VideoTranslateModalProps> = ({
  open,
  onOpenChange,
  onTranslate,
}) => {
  const [step, setStep] = useState<'choose' | 'dub' | 'subtitle'>('choose');
  const [sourceLanguage, setSourceLanguage] = useState('Auto-detect');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [voiceCloning, setVoiceCloning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    setStep('choose');
    setTargetLanguage('');
  };

  const handleProcess = async () => {
    if (!targetLanguage) {
      toast.error('Please select a target language');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);

    toast.success(
      step === 'dub' ? 'Video dubbing started' : 'Subtitle translation started',
      {
        description: `Translating to ${targetLanguage}...`,
      }
    );

    if (onTranslate) {
      onTranslate({
        type: step as 'dub' | 'subtitle',
        sourceLanguage,
        targetLanguage,
        voiceCloning,
      });
    }

    onOpenChange(false);
    setStep('choose');
    setTargetLanguage('');
  };

  const credits = step === 'dub' ? 25 : 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 bg-gray-900 border-gray-800 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          {step !== 'choose' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <DialogTitle className="text-lg font-semibold flex-1 text-center">
            {step === 'choose' ? 'TRANSLATE' : step === 'dub' ? 'DUB VIDEO' : 'SUBTITLES'}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'choose' ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 space-y-4"
            >
              {/* Dub Video Option */}
              <button
                onClick={() => setStep('dub')}
                className="w-full p-6 bg-gradient-to-br from-gray-800 to-gray-800/50 hover:from-gray-750 hover:to-gray-800 border border-gray-700 hover:border-primary/50 rounded-2xl transition-all group text-left"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mic className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Dub video</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Dub voiceover into a new language
                    </p>
                  </div>
                </div>
              </button>

              {/* Translate Subtitles Option */}
              <button
                onClick={() => setStep('subtitle')}
                className="w-full p-6 bg-gradient-to-br from-gray-800 to-gray-800/50 hover:from-gray-750 hover:to-gray-800 border border-gray-700 hover:border-emerald-500/50 rounded-2xl transition-all group text-left"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Subtitles className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Translate subtitles</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Automatically generate translated subtitles
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 space-y-5"
            >
              {/* Source Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Original language</label>
                <div className="relative">
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Target Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Translate to</label>
                <div className="relative">
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      targetLanguage ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    <option value="" disabled>
                      Please select a language
                    </option>
                    {languages.filter((l) => l !== 'Auto-detect').map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Voice Cloning Toggle (only for dub) */}
              {step === 'dub' && (
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Voice Cloning</p>
                      <p className="text-gray-400 text-xs">Preserve original voice characteristics</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVoiceCloning(!voiceCloning)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      voiceCloning ? 'bg-primary' : 'bg-gray-700'
                    }`}
                  >
                    <motion.div
                      animate={{ x: voiceCloning ? 22 : 2 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleProcess}
                disabled={!targetLanguage || isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 disabled:from-gray-700 disabled:to-gray-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 'dub' ? 'Dub Video' : 'Auto Subtitle'}
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </>
                )}
              </button>

              {/* Cancel */}
              <button
                onClick={() => onOpenChange(false)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>

              {/* Credits */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                Cost: 0 / {credits} credits
                <button className="text-primary hover:underline">Get more</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default VideoTranslateModal;
