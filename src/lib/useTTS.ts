"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  activeParagraphIndex: number;
  activeCharIndex: number;
  rate: number;
  pitch: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
}

export function useTTS(paragraphs: string[]) {
  const [state, setState] = useState<TTSState>(() => {
    if (typeof window === "undefined") {
      return {
        isPlaying: false,
        isPaused: false,
        activeParagraphIndex: -1,
        activeCharIndex: -1,
        rate: 1,
        pitch: 1,
        availableVoices: [],
        selectedVoiceURI: null,
      };
    }
    return {
      isPlaying: false,
      isPaused: false,
      activeParagraphIndex: -1,
      activeCharIndex: -1,
      rate: parseFloat(localStorage.getItem("kotoba_tts_rate") || "1"),
      pitch: parseFloat(localStorage.getItem("kotoba_tts_pitch") || "1"),
      availableVoices: [],
      selectedVoiceURI: localStorage.getItem("kotoba_tts_voice") || null,
    };
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const paragraphsRef = useRef(paragraphs);

  useEffect(() => {
    paragraphsRef.current = paragraphs;
  }, [paragraphs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const play = useCallback(
    (startIndex: number = 0) => {
      if (!synthRef.current) return;
      synthRef.current.cancel(); 

      let currentIndex = startIndex;

      const speakNext = () => {
        if (currentIndex >= paragraphsRef.current.length) {
          setState((s) => ({ ...s, isPlaying: false, isPaused: false, activeParagraphIndex: -1, activeCharIndex: -1 }));
          return;
        }

        const text = paragraphsRef.current[currentIndex];
        if (!text.trim()) {
          currentIndex++;
          speakNext();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = state.rate;
        utterance.pitch = state.pitch;
        
        const voices = synthRef.current?.getVoices() || [];
        const selected = voices.find(v => v.voiceURI === state.selectedVoiceURI);
        const fallback = voices.find(v => v.lang.startsWith('es'));
        
        if (selected) {
          utterance.voice = selected;
          utterance.lang = selected.lang;
        } else if (fallback) {
          utterance.voice = fallback;
          utterance.lang = fallback.lang;
        } else {
          utterance.lang = "es-ES";
        }

        utterance.onstart = () => {
          setState((s) => ({
            ...s,
            isPlaying: true,
            isPaused: false,
            activeParagraphIndex: currentIndex,
            activeCharIndex: 0,
          }));
        };

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            setState((s) => ({ ...s, activeCharIndex: event.charIndex }));
          }
        };

        utterance.onend = () => {
          currentIndex++;
          speakNext();
        };

        utterance.onerror = (e) => {
          console.warn("TTS Warning:", e.error);
          if (e.error !== "canceled") {
            currentIndex++;
            speakNext();
          }
        };

        utteranceRef.current = utterance;
        synthRef.current?.speak(utterance);
      };

      speakNext();
    },
    [state.rate, state.pitch]
  );

  const pause = useCallback(() => {
    if (synthRef.current && state.isPlaying) {
      synthRef.current.pause();
      setState((s) => ({ ...s, isPaused: true }));
    }
  }, [state.isPlaying]);

  const resume = useCallback(() => {
    if (synthRef.current && state.isPaused) {
      synthRef.current.resume();
      setState((s) => ({ ...s, isPaused: false }));
    }
  }, [state.isPaused]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setState((s) => ({
        ...s,
        isPlaying: false,
        isPaused: false,
        activeParagraphIndex: -1,
        activeCharIndex: -1,
      }));
    }
  }, []);

  const setRate = useCallback((newRate: number) => {
    setState((s) => ({ ...s, rate: newRate }));
    localStorage.setItem("kotoba_tts_rate", String(newRate));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    setState((s) => ({ ...s, pitch: newPitch }));
    localStorage.setItem("kotoba_tts_pitch", String(newPitch));
  }, []);

  // Effect to restart current paragraph if rate or pitch changes while playing
  const prevRateRef = useRef(state.rate);
  const prevPitchRef = useRef(state.pitch);
  useEffect(() => {
    const rateChanged = prevRateRef.current !== state.rate;
    const pitchChanged = prevPitchRef.current !== state.pitch;
    if (rateChanged || pitchChanged) {
      prevRateRef.current = state.rate;
      prevPitchRef.current = state.pitch;
      if (state.isPlaying && !state.isPaused && utteranceRef.current) {
        const currentIdx = state.activeParagraphIndex;
        stop();
        setTimeout(() => play(currentIdx), 50);
      }
    }
  }, [state.rate, state.pitch, state.isPlaying, state.isPaused, state.activeParagraphIndex, stop, play]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es') || v.lang.startsWith('en'));
        setState(s => {
          if (s.availableVoices.length > 0) return s; // Already loaded
          return {
            ...s,
            availableVoices: voices,
            selectedVoiceURI: s.selectedVoiceURI || (voices.find(v => v.lang.startsWith('es'))?.voiceURI ?? null)
          };
        });
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const setSelectedVoiceURI = useCallback((uri: string) => {
    setState(s => ({ ...s, selectedVoiceURI: uri }));
    localStorage.setItem("kotoba_tts_voice", uri);
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    setRate,
    setPitch,
    setSelectedVoiceURI,
  };
}
