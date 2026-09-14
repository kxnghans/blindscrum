/**
 * @file useVoiceSearch.ts
 * @description Manages browser SpeechRecognition lifecycle, interim transcription,
 * silence detection timeouts, and microphone state with strict W3C typing.
 * Adapted directly from kxnghans.github.io for voice-enabled story inputs.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";
import { toast } from "sonner";

export interface UseVoiceSearchOptions {
  onTranscript: (transcript: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  micRef?: RefObject<HTMLButtonElement | null>;
}

export interface UseVoiceSearchResult {
  isMicActive: boolean;
  isSpeechSupported: boolean;
  showVisualCues: boolean;
  placeholderText: string;
  toggleMic: () => void;
}

export const useVoiceSearch = ({
  onTranscript,
  inputRef,
  micRef,
}: UseVoiceSearchOptions): UseVoiceSearchResult => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeechSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [showVisualCues, setShowVisualCues] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(
    "Enter story title to size...",
  );

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechTimeRef = useRef<number | null>(null);
  const visualCuesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Initialize SpeechRecognition instance on mount if browser supports it
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Trigger visual indicators and shift focus to input upon recognition start
    recognition.onstart = () => {
      visualCuesTimeoutRef.current = setTimeout(() => {
        setShowVisualCues(true);
        setPlaceholderText("Listening... speak your story title");
        setTimeout(() => {
          inputRef?.current?.focus();
        }, 50);
      }, 300);
    };

    // Process continuous speech stream and trigger auto-stop after 2s of silence
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      let hasNewSpeech = false;

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const item = result[0];
        if (!item) continue;

        if (result.isFinal) {
          finalTranscript += item.transcript;
          hasNewSpeech = true;
        } else {
          interimTranscript += item.transcript;
          if (item.transcript.trim()) {
            hasNewSpeech = true;
          }
        }
      }

      const combined = (finalTranscript + interimTranscript).trim();
      if (combined) {
        onTranscript(combined);
      }

      if (hasNewSpeech) {
        lastSpeechTimeRef.current = Date.now();
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          const timeSinceLastSpeech =
            Date.now() - (lastSpeechTimeRef.current || 0);
          if (timeSinceLastSpeech >= 2000) {
            recognitionRef.current?.stop();
          }
        }, 2000);
      }
    };

    // Clean up visual cues and reset input state when speech recognition halts
    recognition.onend = () => {
      setIsMicActive(false);
      setShowVisualCues(false);
      setPlaceholderText("Enter story title to size...");
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (visualCuesTimeoutRef.current) {
        clearTimeout(visualCuesTimeoutRef.current);
      }
    };

    // Map browser speech recognition errors to human-friendly feedback messages
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "Voice capture failed. Try again.";
      if (event.error === "no-speech") {
        errorMessage = "No speech detected. Speak clearly into the mic.";
      } else if (event.error === "audio-capture") {
        errorMessage = "Microphone unavailable. Check your device settings.";
      } else if (event.error === "not-allowed") {
        errorMessage = "Microphone permission denied.";
      }
      toast.error(errorMessage);
      setPlaceholderText("Enter story title to size...");
      setIsMicActive(false);
      setShowVisualCues(false);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (visualCuesTimeoutRef.current) {
        clearTimeout(visualCuesTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (visualCuesTimeoutRef.current) {
        clearTimeout(visualCuesTimeoutRef.current);
      }
    };
  }, [inputRef, onTranscript]);

  // Toggle microphone capture state with browser capability notification
  const toggleMic = useCallback(() => {
    if (!isSpeechSupported) {
      toast.error("Voice input is not supported in this browser.", {
        description:
          "Please use Google Chrome, Edge, or a Web Speech-enabled browser.",
      });
      return;
    }

    if (recognitionRef.current) {
      if (!isMicActive) {
        setIsMicActive(true);
        lastSpeechTimeRef.current = null;
        setShowVisualCues(false);
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (visualCuesTimeoutRef.current) {
          clearTimeout(visualCuesTimeoutRef.current);
        }
        try {
          recognitionRef.current.start();
        } catch {
          // Ignore if already starting
        }
      } else {
        setIsMicActive(false);
        setShowVisualCues(false);
        setPlaceholderText("Enter story title to size...");
        if (visualCuesTimeoutRef.current) {
          clearTimeout(visualCuesTimeoutRef.current);
        }
        recognitionRef.current.stop();
      }
    }
  }, [isSpeechSupported, isMicActive]);

  // Auto-terminate voice listening on touch or click outside the microphone control
  useEffect(() => {
    const handleScreenInteraction = (event: MouseEvent | TouchEvent) => {
      if (
        isMicActive &&
        micRef?.current &&
        !micRef.current.contains(event.target as Node)
      ) {
        toggleMic();
      }
    };

    window.addEventListener("click", handleScreenInteraction);
    window.addEventListener("touchstart", handleScreenInteraction);

    return () => {
      window.removeEventListener("click", handleScreenInteraction);
      window.removeEventListener("touchstart", handleScreenInteraction);
    };
  }, [isMicActive, micRef, toggleMic]);

  return {
    isMicActive,
    isSpeechSupported,
    showVisualCues,
    placeholderText,
    toggleMic,
  };
};
