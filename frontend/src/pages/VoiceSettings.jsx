import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, RefreshCw, CheckCircle, Loader2, AlertTriangle, Play, Sliders } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { fetchVoices, synthesizeSpeech } from '../services/elevenLabsTTS';

const VOICES_CACHE_KEY = 'el_voices_cache';

export default function VoiceSettings() {
  const [voices,       setVoices]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [saved,        setSaved]        = useState(false);

  // Settings (persisted in localStorage so all pages can read them if needed)
  const [selectedVoice, setSelectedVoice] = useState(
    () => localStorage.getItem('el_voice_id') || import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'
  );
  const [stability,      setStability]      = useState(() => Number(localStorage.getItem('el_stability')       || 0.5));
  const [similarity,     setSimilarity]     = useState(() => Number(localStorage.getItem('el_similarity')      || 0.75));
  const [speed,          setSpeed]          = useState(() => Number(localStorage.getItem('el_speed')           || 1));

  const [previewText,    setPreviewText]    = useState('Hello! I have completed the analysis of your document. Here is what I found.');
  const [isPreviewing,   setIsPreviewing]   = useState(false);
  const [previewError,   setPreviewError]   = useState(null);
  const [currentAudio,   setCurrentAudio]   = useState(null);

  /* ── Load voices ── */
  useEffect(() => {
    const cached = sessionStorage.getItem(VOICES_CACHE_KEY);
    if (cached) {
      try { setVoices(JSON.parse(cached)); setLoading(false); return; } catch {}
    }

    fetchVoices()
      .then((v) => {
        setVoices(v);
        sessionStorage.setItem(VOICES_CACHE_KEY, JSON.stringify(v));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── Save settings ── */
  const handleSave = () => {
    localStorage.setItem('el_voice_id',   selectedVoice);
    localStorage.setItem('el_stability',  stability);
    localStorage.setItem('el_similarity', similarity);
    localStorage.setItem('el_speed',      speed);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  /* ── Preview voice ── */
  const handlePreview = async () => {
    if (!previewText.trim()) return;
    setPreviewError(null);

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPreviewing(false);
      return;
    }

    setIsPreviewing(true);
    try {
      const url   = await synthesizeSpeech(previewText, {
        voiceId:        selectedVoice,
        stability,
        similarityBoost: similarity,
        speed,
      });
      const audio = new Audio(url);
      setCurrentAudio(audio);
      audio.onended = () => { setIsPreviewing(false); setCurrentAudio(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsPreviewing(false); setCurrentAudio(null); };
      audio.play();
    } catch (e) {
      setPreviewError(e.message);
      setIsPreviewing(false);
    }
  };

  const selectedVoiceObj = voices.find((v) => v.voice_id === selectedVoice);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <Volume2 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Voice Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Powered by ElevenLabs AI text-to-speech</p>
            </div>
          </div>
        </div>

        {/* ── API Key status ── */}
        <div className={`mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium ${
          import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here'
            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here' ? (
            <>
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>ElevenLabs API key is configured and active.</span>
            </>
          ) : (
            <>
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                API key not configured. Add <code className="bg-red-100 dark:bg-red-500/20 px-1 rounded font-mono text-xs">VITE_ELEVENLABS_API_KEY</code> to your <code className="bg-red-100 dark:bg-red-500/20 px-1 rounded font-mono text-xs">.env</code> file and restart the dev server.
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* ── Voice selector ── */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Mic size={16} className="text-blue-500" />
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Select Voice</h2>
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm py-4">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                Loading available voices from ElevenLabs…
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && voices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {voices.map((voice) => (
                  <button
                    key={voice.voice_id}
                    onClick={() => setSelectedVoice(voice.voice_id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${
                      selectedVoice === voice.voice_id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500'
                        : 'border-gray-200 dark:border-[#1F2937] hover:border-blue-300 dark:hover:border-blue-500/40 bg-gray-50 dark:bg-[#1A1D27]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{voice.name}</span>
                      {selectedVoice === voice.voice_id && (
                        <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    {voice.labels && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                        {Object.values(voice.labels).filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!loading && !error && voices.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No voices found. Check your API key.</p>
            )}
          </div>

          {/* ── Voice parameters ── */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Sliders size={16} className="text-blue-500" />
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Voice Parameters</h2>
            </div>

            <div className="space-y-6">
              {/* Stability */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Stability</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Higher = more consistent, lower = more expressive</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{stability.toFixed(2)}</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={stability}
                  onChange={(e) => setStability(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-[#1F2937] rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Similarity Boost */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Similarity Boost</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">How closely the voice matches the original</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{similarity.toFixed(2)}</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={similarity}
                  onChange={(e) => setSimilarity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-[#1F2937] rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Speed */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Speed</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Playback speed (0.7 × – 1.2 ×)</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{speed.toFixed(2)}×</span>
                </div>
                <input type="range" min={0.7} max={1.2} step={0.05} value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-[#1F2937] rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* ── Voice preview ── */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Play size={16} className="text-blue-500" />
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Preview Voice</h2>
              {selectedVoiceObj && (
                <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1A1D27] px-2 py-1 rounded">
                  {selectedVoiceObj.name}
                </span>
              )}
            </div>

            <textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 dark:bg-[#0F111A] border border-gray-200 dark:border-[#1F2937] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              placeholder="Type something to preview…"
            />

            {previewError && (
              <div className="mb-3 flex items-start gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                {previewError}
              </div>
            )}

            <button
              onClick={handlePreview}
              disabled={!previewText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                previewText.trim()
                  ? 'bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-md hover:scale-105'
                  : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPreviewing ? (
                <><Loader2 size={14} className="animate-spin" /> Generating… (click to stop)</>
              ) : (
                <><Play size={14} /> Preview Audio</>
              )}
            </button>
          </div>

          {/* ── Save ── */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 text-sm"
            >
              {saved ? (
                <><CheckCircle size={16} /> Settings Saved!</>
              ) : (
                <><RefreshCw size={16} /> Save Voice Settings</>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
