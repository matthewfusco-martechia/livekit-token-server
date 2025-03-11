// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const { startVoiceAgent } = require('./voice-agent');

const app = express();
app.use(cors());
app.use(express.json());

// Read environment variables (set these in DigitalOcean App Settings)
const LIVEKIT_URL = process.env.LIVEKIT_URL; // e.g. wss://soar-uxc84hok.livekit.cloud
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const PORT = process.env.PORT || 3000;

/**
 * POST /get-token
 * Expects JSON: { "userName": "yourUser", "roomName": "roomName" }
 * Returns: { "token": "<JWT>", "url": LIVEKIT_URL }
 */
app.post('/get-token', (req, res) => {
  try {
    const { userName, roomName } = req.body;
    if (!userName || !roomName) {
      return res.status(400).json({ error: 'Missing userName or roomName' });
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
    const token = at.toJwt();
    res.json({ token, url: LIVEKIT_URL });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Error generating token' });
  }
});

// Simple health-check route
app.get('/', (req, res) => {
  res.send('LiveKit token server + voice agent is running!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Token server listening on port ${PORT}`);
});

// Launch the voice agent (joins "defaultRoom")
startVoiceAgent('defaultRoom')
  .then(() => console.log('Voice agent started.'))
  .catch(err => console.error('Error starting voice agent:', err));
