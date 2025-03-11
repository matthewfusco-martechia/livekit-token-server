// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const { startVoiceAgent } = require('./voice-agent'); // Ensure this exists

const app = express();
app.use(cors());
app.use(express.json());

// Load environment variables (Ensure these are set in DigitalOcean)
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const PORT = process.env.PORT || 3000;

// 🔍 Debug: Print API keys to ensure they exist
console.log("LIVEKIT_API_KEY:", LIVEKIT_API_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("LIVEKIT_API_SECRET:", LIVEKIT_API_SECRET ? "✅ Loaded" : "❌ MISSING");

// 🚀 POST /get-token - Generate a token for LiveKit
app.post('/get-token', async (req, res) => {
  try {
    const { userName, roomName } = req.body;

    // Validate input
    if (!userName || !roomName) {
      console.error("❌ Missing userName or roomName:", req.body);
      return res.status(400).json({ error: "userName and roomName are required" });
    }

    console.log(`🔹 Generating token for user: ${userName} in room: ${roomName}`);

    // Ensure API keys exist before generating the token
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      console.error("❌ LIVEKIT API KEY or SECRET is missing");
      return res.status(500).json({ error: "LiveKit API credentials are missing" });
    }

    // Create a new LiveKit AccessToken
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // ✅ Ensure `toJwt()` is properly awaited
    const token = await at.toJwt();

    // If the token is empty, log an error
    if (!token) {
      console.error("❌ Token generation failed - Empty token");
      return res.status(500).json({ error: "Failed to generate token" });
    }

    console.log("✅ Token successfully generated:", token);

    res.json({
      token,
      url: LIVEKIT_URL,
    });
  } catch (error) {
    console.error("❌ Error in /get-token:", error);
    res.status(500).json({ error: "Error generating token" });
  }
});

// Health-check route
app.get('/', (req, res) => {
  res.send('LiveKit token server + voice agent is running!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Token server listening on port ${PORT}`);
});

// 🚀 Start the Voice Agent (joins "defaultRoom" by default)
(async () => {
  try {
    await startVoiceAgent('defaultRoom');
    console.log("✅ Voice agent started successfully");
  } catch (error) {
    console.error("❌ Error starting voice agent:", error);
  }
})();
