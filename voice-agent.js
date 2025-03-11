// voice-agent.js

import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import LiveKitClient from 'livekit-client';  // ✅ Import the default export
import { v4 as uuidv4 } from 'uuid';

const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:3000';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

/**
 * Fetch a token for the given room and user by calling our token endpoint.
 */
async function getToken(roomName, userName) {
  const tokenServerUrl = TOKEN_SERVER_URL.replace(/\/+$/, "");
  const response = await axios.post(`${tokenServerUrl}/get-token`, { userName, roomName });
  return response.data.token;
}

/**
 * Start the voice agent:
 * - Generates a unique identity.
 * - Fetches a token.
 * - Connects to LiveKit as a participant.
 * - Listens for audio tracks.
 */
export async function startVoiceAgent(roomName) {
  try {
    const agentIdentity = 'voiceAgentBot-' + uuidv4().slice(0, 8);
    console.log(`🟢 Starting Voice Agent: ${agentIdentity}`);

    const token = await getToken(roomName, agentIdentity);
    console.log(`🔑 Retrieved Token for Agent: ${token}`);

    // Create a LiveKit room instance
    const room = new LiveKitClient.Room();  // ✅ Correct usage
    await room.connect(LIVEKIT_URL, token);  // ✅ Corrected function call
    console.log(`✅ Voice agent joined room "${roomName}" as "${agentIdentity}"`);

    // Listen for new audio tracks
    room.on('trackSubscribed', (track, publication, participant) => {
      if (track.kind === 'audio') {
        console.log(`🎙️ Voice agent subscribed to audio track from ${participant.identity}`);
      }
    });
  } catch (error) {
    console.error("❌ Error starting voice agent:", error);
  }
}
