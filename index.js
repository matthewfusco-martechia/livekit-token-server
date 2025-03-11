// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const { startVoiceAgent } = require('./voice-agent');

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables (set these in DigitalOcean App Settings)
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'YOUR_API_KEY';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'YOUR_API_SECRET';
const PORT = process.env.PORT || 3000;

/**
 * POST /get-token
 * Expects JSON: { "userName": "someUser", "roomName": "someRoom" }
 * Returns: { "token": "<jwt>", "url": LIVEKIT_URL }
 */
app.post('/get-token', (req, res) => {
  try {
    const { userName, roomName } = req.body;

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

    res.json({
      token,
      url: LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Error in /get-token:', error);
    res.status(500).json({ error: 'Error generating token' });
  }
});

// Health-check route
app.get('/', (req, res) => {
  res.send('LiveKit token server + voice agent is running!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Token server listening on port ${PORT}`);
});

// Launch the Voice Agent (joins "defaultRoom" by default)
startVoiceAgent('defaultRoom')
  .then(() => {
    console.log('Voice agent started.');
  })
  .catch(err => {
    console.error('Error starting voice agent:', err);
  });

