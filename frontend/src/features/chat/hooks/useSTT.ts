"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The Web Speech API has no official TS lib coverage — declare the minimal
// shape this hook actually uses.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

/** Speech-to-text using the browser's native Web Speech API. */
export function useSTT(language: string = "en-US") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // Computed once during render (not in an effect) since it only reflects
  // static browser capability, not something that changes over time.
  const [error, setError] = useState<string | null>(() =>
    typeof window !== "undefined" && !(window.SpeechRecognition || window.webkitSpeechRecognition)
      ? "Speech recognition not supported in this browser."
      : null,
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) finalTranscript += result[0].transcript;
          else interimTranscript += result[0].transcript;
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        if (event.error !== "no-speech") {
          console.error("[stt] recognition error:", event.error);
          setError(event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
    }

    return () => recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = language;
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      try {
        recognitionRef.current.start();
      } catch {
        // already listening or unsupported — ignore
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const hasSupport =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return { isListening, transcript, startListening, stopListening, error, hasSupport };
}
