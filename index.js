const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

// Debug: Print API keys to ensure they exist
console.log("LIVEKIT_API_KEY:", LIVEKIT_API_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("LIVEKIT_API_SECRET:", LIVEKIT_API_SECRET ? "✅ Loaded" : "❌ MISSING");

app.post('/get-token', (req, res) => {
  try {
    const { userName, roomName } = req.body;

    if (!userName || !roomName) {
      console.error("❌ Missing parameters:", req.body);
      return res.status(400).json({ error: "userName and roomName are required" });
    }

    console.log(`🔹 Generating token for user: ${userName} in room: ${roomName}`);

    // Create a new access token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // Generate JWT token
    const token = at.toJwt();

    // Debug: Print the token before returning it
    console.log("✅ Generated Token:", token);

    if (!token || token === "{}") {
      console.error("❌ Token generation failed - Empty token");
      return res.status(500).json({ error: "Failed to generate token" });
    }

    res.json({ token, url: LIVEKIT_URL });
  } catch (error) {
    console.error("❌ Error generating token:", error);
    res.status(500).json({ error: "Error generating token" });
  }
});

app.get('/', (req, res) => {
  res.send('LiveKit token server is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
