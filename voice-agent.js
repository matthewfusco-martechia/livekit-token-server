// voice-agent.js

require('dotenv').config();
const axios = require('axios');
const { connect } = require('livekit-client');

// TOKEN_SERVER_URL should be set to your public DigitalOcean URL.
// For example: "https://sea-turtle-app-riq58.ondigitalocean.app"
const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'https://sea-turtle-app-riq58.ondigitalocean.app';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

/**
 * getToken - Fetches a token from the token endpoint.
 */
async function getToken(roomName, userName) {
  const response = await axios.post(`${TOKEN_SERVER_URL}/get-token`, {
    userName,
    roomName,
  });
  return response.data.token;
}

/**
 * startVoiceAgent:
 *  - Obtains a token for "voiceAgentBot"
 *  - Connects to the LiveKit room
 *  - Logs audio track subscriptions
 */
async function startVoiceAgent(roomName) {
  console.log('Starting voice agent...');

  // 1) Get a token for the agent
  const token = await getToken(roomName, 'voiceAgentBot');

  // 2) Connect to LiveKit as a participant
  const room = await connect(LIVEKIT_URL, token);
  console.log(`Voice Agent joined room: ${roomName}`);

  // 3) Listen for audio track subscriptions
  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'audio') {
      console.log(`Voice Agent subscribed to audio track from ${participant.identity}`);
      // Implement STT → LLM → TTS here if desired.
    }
  });
}

module.exports = {
  startVoiceAgent,
};

