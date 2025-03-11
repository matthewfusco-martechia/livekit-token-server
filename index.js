const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your actual environment variables or pass them in via DigitalOcean environment config
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'YOUR_LIVEKIT_API_KEY';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'YOUR_LIVEKIT_API_SECRET';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://soar-uxc84hok.livekit.cloud';

app.post('/get-token', (req, res) => {
  try {
    const { userName, roomName } = req.body;

    // Create a new access token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userName, // The identity of the user
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // Generate JWT
    const token = at.toJwt();

    res.json({
      token,
      url: LIVEKIT_URL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating token' });
  }
});

// A simple test route
app.get('/', (req, res) => {
  res.send('LiveKit token server is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

