// voice-agent.js

require('dotenv').config();
const axios = require('axios');
const LiveKitClient = require('livekit-client'); // Import the full module
const { v4: uuidv4 } = require('uuid');

// TOKEN_SERVER_URL should be set without a trailing slash
const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:3000';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

/**
 * Fetch a token for the given room and user by calling our token endpoint.
 * This function removes any trailing slashes from TOKEN_SERVER_URL.
 */
async function getToken(roomName, userName) {
  const tokenServerUrl = TOKEN_SERVER_URL.replace(/\/+$/, "");
  const response = await axios.post(`${tokenServerUrl}/get-token`, { userName, roomName });
  return response.data.token;
}

/**
 * startVoiceAgent:
 *  - Generates a unique identity for the voice agent.
 *  - Fetches a token.
 *  - Connects to the LiveKit room.
 *  - Logs when an audio track is subscribed.
 */
async function startVoiceAgent(roomName) {
  const agentIdentity = 'voiceAgentBot-' + uuidv4().slice(0, 8);
  const token = await getToken(roomName, agentIdentity);
  const room = await LiveKitClient.connect(LIVEKIT_URL, token);
  console.log(`Voice agent joined room "${roomName}" as "${agentIdentity}"`);

  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'audio') {
      console.log(`Voice agent subscribed to audio track from ${participant.identity}`);
      // Here you can extend the logic to process audio (STT → GPT → TTS)
    }
  });
}

module.exports = { startVoiceAgent };
