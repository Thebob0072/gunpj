const express = require('express');
const cors = require('cors');
const net = require('net'); // Import 'net' module for port checking

const app = express();
const port = 3001; // Choose a different port from your React app

// IMPORTANT: Replace with your actual LINE Messaging API credentials
const LINE_CHANNEL_ACCESS_TOKEN = "zFjdltqQtbEsziWNjff3yapmj6pTHIR0O72jsvRctsu55dUrDh4SEXGBgIRu/P6Ui7IYIPuWiahGOCrh/jP7EKnqFColz2TKJ2PinE1Ah0UzfvU/TNfDTYA2qPEb3wPP71mkTnwzejUc0Orjef6fygdB04t89/1O/w1cDnyilFU=";
const LINE_GROUP_ID = "YOUR_LINE_GROUP_ID"; // Use Group ID instead of User ID

// Use cors to allow requests from your React app
app.use(cors({
  origin: 'http://localhost:3000' // Replace with your app's origin
}));

app.use(express.json());

// API Endpoint to handle LINE notifications from your React app
app.post('/api/send-line-notification', async (req, res) => {
  const { message } = req.body;

  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_GROUP_ID) {
    return res.status(500).send('LINE_CHANNEL_ACCESS_TOKEN or LINE_GROUP_ID is not set.');
  }

  const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: LINE_GROUP_ID,
    messages: [
      {
        type: 'text',
        text: message
      }
    ]
  };

  try {
    const response = await fetch(lineApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send LINE notification:', errorText);
      return res.status(response.status).send(errorText);
    }

    console.log('LINE notification sent successfully.');
    res.status(200).send('Notification sent.');

  } catch (error) {
    console.error('Error sending LINE notification:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Webhook Endpoint to receive events from LINE Platform
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  events.forEach(event => {
    if (event.source.type === 'group') {
      const groupId = event.source.groupId;
      console.log('-------------------------------------------');
      console.log('Found LINE Group ID:', groupId);
      console.log('Please copy this ID and paste it into the LINE_GROUP_ID variable in server.js');
      console.log('-------------------------------------------');
    }
  });

  // Always respond with a 200 status code to acknowledge the event
  res.sendStatus(200);
});

// Function to check if a port is in use
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', (err) => (err.code === 'EADDRINUSE' ? resolve(true) : reject(err)))
      .once('listening', () => {
        tester.once('close', () => resolve(false)).close();
      })
      .listen(port);
  });
};

// Start the server only if the port is not in use
checkPort(port).then(isUsed => {
  if (isUsed) {
    console.error(`Port ${port} is already in use. Please close the other application or choose a different port.`);
  } else {
    app.listen(port, () => {
      console.log(`Proxy server listening at http://localhost:${port}`);
    }).on('error', (err) => {
      console.error('Failed to start proxy server:', err);
    });
  }
});
