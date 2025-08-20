const express = require('express');
const cors = require('cors');
const net = require('net');

const app = express();
const port = 3001; // Use a different port from your React app to avoid conflicts

// IMPORTANT: Replace with your actual Telegram credentials
const TELEGRAM_BOT_TOKEN = "8418566183:AAGArbqUQFzQPS2FP5CIxtPVVUN12xmaFTY";
const TELEGRAM_CHAT_ID = "-4944205160"; // Updated with the correct Chat ID from your getUpdates log
const WEBHOOK_URL = "https://7c8aa0e7715b.ngrok-free.app/webhook"; // Corrected webhook URL

// Use cors to allow requests from your React app
app.use(cors({
  origin: 'http://localhost:3000' // Replace with your app's origin
}));

app.use(express.json());

// Function to set the webhook URL in Telegram
const setTelegramWebhook = async () => {
  const telegramSetWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  
  try {
    const response = await fetch(telegramSetWebhookUrl);
    const result = await response.json();
    if (result.ok) {
      console.log('Successfully set Telegram webhook:', WEBHOOK_URL);
    } else {
      console.error('Failed to set Telegram webhook:', result.description);
    }
  } catch (error) {
    console.error('Error setting Telegram webhook:', error);
  }
};

// API Endpoint to handle notifications from your React app
app.post('/api/send-telegram-notification', async (req, res) => {
  const { message } = req.body;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).send('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.');
  }

  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  };

  try {
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send Telegram notification:', errorText);
      return res.status(response.status).send(errorText);
    }

    console.log('Telegram notification sent successfully.');
    res.status(200).send('Notification sent.');

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Webhook Endpoint to receive events from Telegram Platform
app.post('/webhook', (req, res) => {
  // Check for chat ID in the message from Telegram
  if (req.body.message && req.body.message.chat && req.body.message.chat.id) {
    const chatId = req.body.message.chat.id;
    console.log('-------------------------------------------');
    console.log('Found Telegram Chat ID:', chatId);
    console.log('Please copy this ID and paste it into the TELEGRAM_CHAT_ID variable in server.js');
    console.log('-------------------------------------------');
  } else {
    console.log('Received a webhook request, but could not find a Chat ID.');
    // Log the entire body to debug what Telegram is sending
    console.log('Webhook body received:', req.body);
  }

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
    const server = app.listen(port, () => {
      console.log(`Proxy server listening at http://localhost:${port}`);
      // Set the webhook when the server starts
      setTelegramWebhook();
    }).on('error', (err) => {
      console.error('Failed to start proxy server:', err);
    });
  }
});
