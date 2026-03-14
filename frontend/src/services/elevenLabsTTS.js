/**
 * ElevenLabs TTS Service
 * Converts text to speech using the ElevenLabs API.
 * All API calls are made directly from the browser using the VITE env vars.
 */

const API_KEY   = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID  = import.meta.env.VITE_ELEVENLABS_VOICE_ID  || 'EXAVITQu4vr4xnSDxMaL';
const MODEL_ID  = import.meta.env.VITE_ELEVENLABS_MODEL_ID  || 'eleven_multilingual_v2';

/**
 * Fetches audio from ElevenLabs and returns a Blob URL ready for playback.
 * @param {string} text  - The text to synthesize
 * @param {object} [opts] - Optional overrides
 * @param {string} [opts.voiceId]
 * @param {string} [opts.modelId]
 * @param {number} [opts.stability]        0–1, default 0.5
 * @param {number} [opts.similarityBoost]  0–1, default 0.75
 * @param {number} [opts.speed]            0.7–1.2, default 1
 * @returns {Promise<string>} Object URL for the audio blob
 */
export async function synthesizeSpeech(text, opts = {}) {
  const {
    voiceId        = VOICE_ID,
    modelId        = MODEL_ID,
    stability      = 0.5,
    similarityBoost = 0.75,
    speed          = 1,
  } = opts;

  if (!API_KEY || API_KEY === 'your_elevenlabs_api_key_here') {
    throw new Error('ElevenLabs API key is not configured. Please set VITE_ELEVENLABS_API_KEY in your .env file.');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept':       'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key':   API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          speed,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errorBody}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Convenience: fetch all available ElevenLabs voices for the account.
 * Useful for the VoiceSettings page.
 */
export async function fetchVoices() {
  if (!API_KEY || API_KEY === 'your_elevenlabs_api_key_here') {
    throw new Error('ElevenLabs API key is not configured.');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.voices || [];
}
