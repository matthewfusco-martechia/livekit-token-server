// voice-agent.js

import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { VoiceAgent } from '@livekit/agents'; // ✅ Correct import from the installed package
import { v4 as uuidv4 } from 'uuid';

const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:3000';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

/**
 * Fetch a token for the voice agent by calling our token endpoint.
 */
async function getToken(roomName, userName) {
  const tokenServerUrl = TOKEN_SERVER_URL.replace(/\/+$/, "");
  const response = await axios.post(`${tokenServerUrl}/get-token`, { userName, roomName });
  return response.data.token;
}

/**
 * Start the AI-powered voice agent.
 */
export async function startVoiceAgent(roomName) {
  try {
    const agentIdentity = 'voiceAgentBot-' + uuidv4().slice(0, 8);
    console.log(`🟢 Starting LiveKit Voice Agent: ${agentIdentity}`);

    const token = await getToken(roomName, agentIdentity);
    console.log(`🔑 Retrieved Token for Voice Agent: ${token}`);

    // Initialize LiveKit's Voice Agent (for AI-powered speech processing)
    const voiceAgent = new VoiceAgent({
      livekitUrl: LIVEKIT_URL,
      token: token,
      identity: agentIdentity,
    });

    await voiceAgent.connect();
    console.log(`✅ Voice agent joined room "${roomName}" as "${agentIdentity}"`);

    // Listen for audio tracks
    voiceAgent.on('trackSubscribed', (track, participant) => {
      console.log(`🎙️ Voice agent subscribed to audio from ${participant.identity}`);
    });

  } catch (error) {
    console.error("❌ Error starting voice agent:", error);
  }
}
