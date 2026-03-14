const { elevenLabs, defaultVoiceId } = require('../config/elevenlabs');

/**
 * Generate audio stream from text
 * @param {string} text 
 * @param {string} voiceId 
 * @returns {Stream}
 */
const generateAudioStream = async (text, voiceId = defaultVoiceId) => {
  try {
    // The elevenlabs-node package gives us access to textToSpeechStream
    // Usage: elevenLabs.textToSpeechStream(...) API might vary by package version
    // Another approach using standard fetch to ElevenLabs API for stream:
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error((errorData.detail && errorData.detail.message) || 'Failed to generate speech');
    }

    return response.body; // Returns a readable stream
    
  } catch (error) {
    console.error("Voice Generation Error:", error);
    throw new Error("Failed to generate voice response.");
  }
};

module.exports = {
  generateAudioStream
};
