"use client";

import { useCallback } from "react";

export function useSpeech() {
  const speak = useCallback((text: string, lang: string = "ar-SA") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { speak };
}
