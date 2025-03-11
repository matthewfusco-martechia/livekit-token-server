// voice-agent.js

import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { connect } from 'livekit-client';
import { v4 as uuidv4 } from 'uuid';

// TOKEN_SERVER_URL should be set without a trailing slash (e.g., "https://sea-turtle-app-riq58.ondigitalocean.app")
const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:3000';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

/**
 * Fetch a token for the given room and user by calling our token endpoint.
 */
async function getToken(roomName, userName) {
  // Remove any trailing slashes from TOKEN_SERVER_URL
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
export async function startVoiceAgent(roomName) {
  const agentIdentity = 'voiceAgentBot-' + uuidv4().slice(0, 8);
  const token = await getToken(roomName, agentIdentity);
  const room = await connect(LIVEKIT_URL, token);
  console.log(`Voice agent joined room "${roomName}" as "${agentIdentity}"`);

  room.on('trackSubscribed', (track, publication, participant) => {
    if (track.kind === 'audio') {
      console.log(`Voice agent subscribed to audio track from ${participant.identity}`);
      // Extend here for audio processing (STT → GPT → TTS) if desired.
    }
  });
}
