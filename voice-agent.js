// voice-agent.js (CommonJS)

require('dotenv').config();
const axios = require('axios');
const { connect } = require('livekit-client');
const { v4: uuidv4 } = require('uuid');

const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:3000';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

async function getToken(roomName, userName) {
  const tokenServerUrl = TOKEN_SERVER_URL.replace(/\/+$/, "");
  const response = await axios.post(`${tokenServerUrl}/get-token`, { userName, roomName });
  return response.data.token;
}

async function startVoiceAgent(roomName) {
  const agentIdentity = 'voiceAgentBot-' + uuidv4().slice(0, 8);
  const token = await getToken(roomName, agentIdentity);
  const room = await connect(LIVEKIT_URL, token);
  console.log(`Voice agent joined room "${roomName}" as "${agentIdentity}"`);

  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'audio') {
      console.log(`Voice agent subscribed to audio track from ${participant.identity}`);
    }
  });
}

module.exports = { startVoiceAgent };
