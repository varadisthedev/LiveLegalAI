/**
 * useTTS – React hook for Text-to-Speech
 *
 * Priority order:
 *  1. ElevenLabs API  (high quality)
 *  2. Browser Web Speech API  (free fallback — kicks in automatically on ElevenLabs 401/403)
 *
 * Behaviour:
 *  - Speech is ALWAYS generated (even when muted) so audio is ready.
 *  - Muting silences playback; un-muting plays any pending audio.
 *  - Exposes: speak(text), isSpeaking, isMuted, toggleMute, stopSpeech, usingFallback, ttsError
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { synthesizeSpeech } from '../services/elevenLabsTTS';

export function useTTS(lang = 'en-US') {
  const [isSpeaking,    setIsSpeaking]    = useState(false);
  const [isMuted,       setIsMuted]       = useState(false);
  const [ttsError,      setTtsError]      = useState(null);
  const [usingFallback, setUsingFallback] = useState(false); // true when on browser TTS

  const audioRef      = useRef(null);   // HTMLAudioElement for ElevenLabs blob
  const isMutedRef    = useRef(false);
  const pendingUrlRef = useRef(null);   // blob URL queued while muted

  // Keep ref in sync with state
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ── Browser Web Speech API fallback ────────────────────────────────────────

  const speakWithBrowser = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any current utterance

    if (isMutedRef.current) return;  // muted — skip playback (no pending storage for browser tts)

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang   = lang;
    utterance.rate   = 1;
    utterance.pitch  = 1;
    utterance.volume = 1;

    // Try to find a specific voice for the requested language if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, []);

  // ── ElevenLabs helpers ─────────────────────────────────────────────────────

  const revokeUrl = (url) => {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const stopSpeech = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    // Stop browser TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const playUrl = useCallback((url) => {
    stopSpeech();

    if (isMutedRef.current) {
      revokeUrl(pendingUrlRef.current);
      pendingUrlRef.current = url;
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setIsSpeaking(true);

    audio.onended = () => { setIsSpeaking(false); revokeUrl(url); audioRef.current = null; };
    audio.onerror = () => { setIsSpeaking(false); revokeUrl(url); audioRef.current = null; };

    audio.play().catch((err) => {
      console.warn('TTS playback error:', err);
      setIsSpeaking(false);
    });
  }, [stopSpeech]);

  // ── Main speak function ────────────────────────────────────────────────────

  /**
   * speak(text) — tries ElevenLabs first, silently falls back to browser TTS
   * on any auth error (401 / 403) or if the API key is missing.
   */
  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;
    setTtsError(null);

    try {
      const url = await synthesizeSpeech(text);
      setUsingFallback(false);
      playUrl(url);
    } catch (err) {
      const msg = err.message || '';

      // Determine if this is an auth / account block — if so, use browser TTS silently
      const isAuthError = msg.includes('401') || msg.includes('402') || msg.includes('403')
        || msg.includes('payment_required') || msg.includes('paid_plan')
        || msg.includes('unusual_activity') || msg.includes('not configured');

      if (isAuthError) {
        // Switch to browser TTS silently — user still gets voice
        setUsingFallback(true);
        setTtsError(null); // clear error so no scary red banner
        speakWithBrowser(text);
      } else {
        // Genuine unknown error — show it
        console.error('ElevenLabs TTS error:', err);
        setTtsError(msg);
        setIsSpeaking(false);
      }
    }
  }, [playUrl, speakWithBrowser]);

  // ── Toggle mute ────────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nowMuted = !prev;
      isMutedRef.current = nowMuted;

      if (!nowMuted && pendingUrlRef.current) {
        // Un-muted with queued ElevenLabs audio — play it
        const url = pendingUrlRef.current;
        pendingUrlRef.current = null;
        playUrl(url);
      } else if (nowMuted) {
        // Muted — stop everything
        if (audioRef.current) { audioRef.current.pause(); }
        if (window.speechSynthesis) { window.speechSynthesis.cancel(); }
        setIsSpeaking(false);
      }

      return nowMuted;
    });
  }, [playUrl]);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopSpeech();
      revokeUrl(pendingUrlRef.current);
    };
  }, [stopSpeech]);

  return { speak, isSpeaking, isMuted, toggleMute, stopSpeech, usingFallback, ttsError };
}
