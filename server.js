const express = require('express');
const cors = require('cors');

const app = express();
const port = parseInt(process.env.PORT) || 3001; // Use parseInt() to convert to a number

// IMPORTANT: Replace with your actual Telegram credentials as Environment Variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Replace with your actual deployed URL

// Use cors to allow requests from your React app
app.use(cors({
  origin: process.env.FRONTEND_URL // Replace with your actual frontend URL (Vercel)
}));

app.use(express.json());

// Function to set the webhook URL in Telegram
const setTelegramWebhook = async () => {
  if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_URL) {
    console.error('TELEGRAM_BOT_TOKEN or WEBHOOK_URL is not set. Skipping webhook setup.');
    return;
  }

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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
