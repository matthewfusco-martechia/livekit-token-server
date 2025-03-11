// index.js

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';
import { startVoiceAgent } from './voice-agent.js';

const app = express();
app.use(cors());
app.use(express.json());

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

// Debug: Log that API keys are loaded
console.log("LIVEKIT_API_KEY:", LIVEKIT_API_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("LIVEKIT_API_SECRET:", LIVEKIT_API_SECRET ? "✅ Loaded" : "❌ MISSING");

app.post('/get-token', async (req, res) => {
  try {
    const { userName, roomName } = req.body;
    if (!userName || !roomName) {
      console.error("❌ Missing parameters:", req.body);
      return res.status(400).json({ error: "userName and roomName are required" });
    }

    console.log(`🔹 Generating token for user: ${userName} in room: ${roomName}`);

    // Create a new access token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity: userName });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // Await token generation (toJwt returns a Promise)
    const token = await at.toJwt();
    console.log("✅ Generated Token:", token);

    if (!token) {
      console.error("❌ Token generation failed - Empty token");
      return res.status(500).json({ error: "Failed to generate token" });
    }

    res.json({ token, url: LIVEKIT_URL });
  } catch (error) {
    console.error("❌ Error generating token:", error);
    res.status(500).json({ error: "Error generating token" });
  }
});

// Simple health-check route
app.get('/', (req, res) => {
  res.send('LiveKit token server is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Launch the voice agent for room "defaultRoom"
startVoiceAgent('defaultRoom')
  .then(() => console.log('Voice agent started.'))
  .catch(err => console.error('Error starting voice agent:', err));
