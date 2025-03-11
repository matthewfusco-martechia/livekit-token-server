// voice-agent.js

require('dotenv').config();
const axios = require('axios');
const { connect } = require('livekit-client');
const { v4: uuidv4 } = require('uuid');

// TOKEN_SERVER_URL should be your public DigitalOcean URL,
// for example: "https://sea-turtle-app-riq58.ondigitalocean.app"
const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL; 
const LIVEKIT_URL = process.env.LIVEKIT_URL;

/**
 * Fetch a token for the given room and user by calling our token endpoint.
 */
async function getToken(roomName, userName) {
  const response = await axios.post(`${TOKEN_SERVER_URL}/get-token`, { userName, roomName });
  return response.data.token;
}

/**
 * startVoiceAgent:
 *  - Generates a unique identity for the agent.
 *  - Fetches a token.
 *  - Connects to the LiveKit room.
 *  - Logs when an audio track is subscribed.
 */
async function startVoiceAgent(roomName) {
  const agentIdentity = 'voiceAgentBot-' + uuidv4().slice(0, 8);
  const token = await getToken(roomName, agentIdentity);
  const room = await connect(LIVEKIT_URL, token);
  console.log(`Voice agent joined room "${roomName}" as "${agentIdentity}"`);

  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'audio') {
      console.log(`Voice agent subscribed to audio track from ${participant.identity}`);
      // Here you could extend the logic to process audio:
      // For example, send audio to STT (Deepgram), then chat with GPT, then output TTS.
    }
  });
}

module.exports = { startVoiceAgent };
