const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// LINE Configuration
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_API_URL = 'https://api.line.biz/v1';
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot';

// In-memory storage for LINE groups (should be moved to database in production)
const lineGroups = new Map();

// Use cors to allow requests from your React app
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000' // Replace with your actual frontend URL (Vercel)
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
    const response = await fetch(telegramSetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
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

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.' });
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
      return res.status(response.status).json({ error: errorText });
    }

    console.log('Telegram notification sent successfully.');
    res.status(200).json({ success: true, message: 'Notification sent.' });

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// LINE Webhook Endpoint
app.post('/api/line-webhook', (req, res) => {
  if (!Array.isArray(req.body.events)) {
    return res.status(400).json({ error: 'Invalid webhook event' });
  }

  req.body.events.forEach(event => {
    if (event.type === 'join' && event.source.type === 'group') {
      const groupId = event.source.groupId;
      if (!lineGroups.has(groupId)) {
        lineGroups.set(groupId, {
          groupId: groupId,
          groupName: 'Group ' + groupId.slice(0, 10),
          members: [],
          createdAt: new Date().toISOString()
        });
        console.log('Bot joined new LINE group:', groupId);
      }
    }
  });

  res.status(200).json({ message: 'OK' });
});

// Get LINE Groups
app.get('/api/line-groups', (req, res) => {
  const groups = Array.from(lineGroups.values());
  res.status(200).json({ groups });
});

// Send LINE notification to group
app.post('/api/send-line-notification', async (req, res) => {
  const { groupId, message, taskTitle, assignee } = req.body;

  if (!groupId || !message) {
    return res.status(400).json({ error: 'groupId and message are required' });
  }

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not set' });
  }

  try {
    const payload = {
      to: groupId,
      messages: [
        {
          type: 'text',
          text: `📌 ${taskTitle || 'Task Update'}\n\n${message}\n\n👤 ผู้รับผิดชอบ: ${assignee}`,
          wrap: true
        }
      ]
    };

    const response = await fetch(`${LINE_MESSAGING_API}/message/push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send LINE notification:', errorData);
      return res.status(response.status).json({ error: errorData.message || 'Failed to send' });
    }

    console.log('LINE notification sent successfully to group:', groupId);
    res.status(200).json({ success: true, message: 'Notification sent to LINE group' });
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get LINE group members (requires LINE Bot SDK)
app.get('/api/line-group-members/:groupId', async (req, res) => {
  const { groupId } = req.params;

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not set' });
  }

  try {
    const response = await fetch(`${LINE_MESSAGING_API}/group/${groupId}/members/ids`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch members' });
    }

    const data = await response.json();
    const memberIds = data.memberIds || [];

    // Store members in memory (in production, use database)
    if (lineGroups.has(groupId)) {
      const group = lineGroups.get(groupId);
      group.members = memberIds.map((id, index) => ({
        userId: id,
        displayName: `Member ${index + 1}`,
        pictureUrl: ''
      }));
    }

    res.status(200).json({
      groupId,
      memberCount: memberIds.length,
      members: memberIds.slice(0, 20) // Limit to 20 members
    });
  } catch (error) {
    console.error('Error fetching LINE group members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
  console.log(`Server is running on http://localhost:${port}`);
  setTelegramWebhook();
});
