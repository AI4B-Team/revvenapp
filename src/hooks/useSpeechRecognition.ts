import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onstart: (() => void) | null;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const { onResult, onEnd, continuous = true, interimResults = true } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef('');
  const isCancelledRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Don't process results if cancelled
        if (isCancelledRef.current) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Update base text with final results
        if (finalTranscript) {
          baseTextRef.current += finalTranscript + ' ';
        }

        const fullTranscript = baseTextRef.current + interimTranscript;
        setTranscript(fullTranscript);
        onResult?.(fullTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (!isCancelledRef.current) {
          onEnd?.();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, onResult, onEnd]);

  const startListening = useCallback((initialText: string = '') => {
    if (recognitionRef.current && !isListening) {
      isCancelledRef.current = false;
      baseTextRef.current = initialText ? initialText + ' ' : '';
      setTranscript(baseTextRef.current);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isCancelledRef.current = true;
      recognitionRef.current.abort();
      setIsListening(false);
      baseTextRef.current = '';
      setTranscript('');
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    baseTextRef.current = '';
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
  };
};
