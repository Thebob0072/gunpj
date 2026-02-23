# 📲 Telegram Integration Guide

## 📋 Prerequisites

- Telegram account
- @BotFather access (official Telegram bot manager)
- Telegram app or web.telegram.org

---

## 🚀 Step-by-Step Setup

### Step 1: Create Bot with BotFather

1. Open Telegram
2. Search for **@BotFather** (official bot)
3. Click **Start**
4. Type `/newbot`

```
🤖 BotFather responses:

👤 Alright, a new bot. How are we going to call it?
→ Answer: GUNPJ Task Bot

👤 Good. Now let's choose a username for your bot.
→ Answer: gunpj_task_bot
```

5. BotFather gives you:
```
Done! Congratulations on your new bot.
You will find it at t.me/gunpj_task_bot.
Use this token to access the HTTP API:

🔐 TOKEN: 1234567890:ABCDEFGhijklmnopqrstuvwxyz
```

---

### Step 2: Add Token to .env.local

Copy the token to your environment file:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGhijklmnopqrstuvwxyz
```

⚠️ **Important**: Keep this secret! Don't commit to Git.

---

### Step 3: Get Your Chat ID

1. Open your bot: **t.me/gunpj_task_bot**
2. Click **Start**
3. Send any message (e.g., "test")
4. In terminal, run:

```bash
curl "https://api.telegram.org/bot1234567890:ABCDEFGhijklmnopqrstuvwxyz/getUpdates"
```

5. Look for `"chat":{"id":` field:

```json
{
  "result": [
    {
      "message": {
        "chat": {
          "id": -1001234567890,  ← THIS IS YOUR CHAT ID
          "type": "private",
          "first_name": "John"
        }
      }
    }
  ]
}
```

---

### Step 4: Save Chat ID

Add to `.env.local`:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGhijklmnopqrstuvwxyz
TELEGRAM_CHAT_ID=-1001234567890
WEBHOOK_URL=https://your-domain.com/webhook
```

---

## ✅ Verify Integration

### Test 1: Send Test Message

```bash
# From terminal
curl -X POST http://localhost:3001/api/send-telegram-notification \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from GUNPJ!"}'

# Check your Telegram - should receive message
```

### Test 2: Send from App

1. Start the app
2. Create a new task
3. Should receive Telegram notification

### Test 3: Create Multiple Tasks

```
Create Task 1 → ✅ Telegram notification received
Create Task 2 → ✅ Telegram notification received
Complete Task → ✅ Telegram notification received
```

---

## 📊 How It Works

### Message Flow

```
page.tsx (Handles task creation)
    ↓
handleSaveTask()
    ↓
sendTelegramNotification(message)
    ↓
POST /api/send-telegram-notification
    ↓
server.js → Telegram Bot API
    ↓
https://api.telegram.org/bot{TOKEN}/sendMessage
    ↓
✅ Message appears in Telegram chat
```

### Example Message

```
✍️ งานใหม่ชื่อ: "Project Review"

ผู้รับผิดชอบงาน: Jane Smith
วันเวลาเริ่ม: 20 กุมภาพันธ์ 2026 09:00 น.
วันเวลาสิ้นสุด: 21 กุมภาพันธ์ 2026 17:00 น.
```

---

## 🔧 Configuration

### .env.local

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
WEBHOOK_URL=https://your-domain.com/webhook

# For development (local)
WEBHOOK_URL=http://localhost:3001/webhook
```

### Bot Settings (Optional)

In BotFather, you can customize:

```
/setdescription
"Task management bot for GUNPJ"

/setabouttext
"Sends task notifications"

/setuserpic
(Upload a profile picture)

/setcommands
# Add commands if needed
start - Start the bot
help - Show help
```

---

## 📱 Message Types

### Supported HTML Tags

```html
<b>bold</b>
<i>italic</i>
<code>inline code</code>
<pre>code block</pre>
<a href="https://...">link</a>
<u>underline</u>
<s>strikethrough</s>
```

### Example Formatted Message

```html
<b>✍️ งานใหม่</b>

<i>Project Review</i>

👤 ผู้รับผิดชอบ: <b>Jane Smith</b>

วันเวลา:
📅 20 กุมภาพันธ์ 2026
⏰ 09:00 - 17:00
```

---

## 🔐 Security

### Token Management

```javascript
// ✅ CORRECT: Use environment variable
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ❌ WRONG: Hardcoded token
const TOKEN = "1234567890:ABC...";  // DON'T DO THIS

// ❌ WRONG: Commit to Git
git add .env  // DON'T COMMIT .env!
```

### Private Chat ID

- Your Chat ID identifies your private messages
- Keep it secret like your token
- Don't share in public repositories

### .gitignore

```
.env
.env.local
.env.production.local
node_modules/
```

---

## 🚀 Using Telegram Group

### Want notifications in a GROUP instead?

1. Create a Telegram group
2. Add your bot to the group
3. Send a message
4. Get the group Chat ID:

```bash
curl "https://api.telegram.org/botYOUR_TOKEN/getUpdates"
```

5. Group IDs look like: `-100123456789` (starts with -100)
6. Update .env:

```env
TELEGRAM_CHAT_ID=-100123456789
```

---

## 🔔 Message Examples

### Task Created

```
✍️ งานใหม่ชื่อ: "Meeting with Client"

ผู้รับผิดชอบงาน: John
วันเวลาเริ่ม: 20 Feb 2026 10:00 AM
วันเวลาสิ้นสุด: 20 Feb 2026 3:00 PM
```

### Task Updated

```
✅ แก้ไขงาน: "Meeting with Client"

ผู้รับผิดชอบงาน: John
วันเวลาเริ่ม: 20 Feb 2026 10:00 AM
วันเวลาสิ้นสุด: 20 Feb 2026 5:00 PM (Updated)
```

### Task Completed

```
🎉 งานเสร็จสิ้นแล้ว: "Meeting with Client"
```

---

## 🧪 Testing

### Manual Test

```bash
# 1. Export token
export TELEGRAM_BOT_TOKEN="1234567890:ABCDEFGhijklmnopqrstuvwxyz"

# 2. Export chat ID
export TELEGRAM_CHAT_ID="-1001234567890"

# 3. Test API
curl -X POST http://localhost:3001/api/send-telegram-notification \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message from terminal"}'

# 4. Check Telegram - should receive message
```

### With Postman

```
1. Create POST request
2. URL: http://localhost:3001/api/send-telegram-notification
3. Headers: Content-Type: application/json
4. Body (raw):
{
  "message": "📝 Test notification"
}
5. Send
6. Response should be: {"success": true}
```

---

## 🐛 Common Issues

### ❌ "Bot not found"

```
Error: 404 Telegram bot not found
```

**Solution:**
```bash
# Verify token format
echo "1234567890:ABCDEFGhijklmnopqrstuvwxyz"  ✅ Correct

# Test token directly
curl "https://api.telegram.org/bot{TOKEN}/getMe"
# Should return bot info
```

---

### ❌ "No messages received"

**Solution:**
```bash
# 1. Send test message in Telegram
# Open t.me/your_bot_name → Send message

# 2. Get updates
curl "https://api.telegram.org/bot{TOKEN}/getUpdates"

# 3. Find chat ID in response
# Look for: "chat":{"id": ...}

# 4. Update .env
TELEGRAM_CHAT_ID=correct_id
```

---

### ❌ "TELEGRAM_BOT_TOKEN is not set"

**Solution:**
```bash
# 1. Verify .env.local exists
ls -la .env.local

# 2. Check contents
cat .env.local | grep TELEGRAM

# 3. Restart dev server
npm run dev

# 4. No spaces around =
TELEGRAM_BOT_TOKEN=token ✅
TELEGRAM_BOT_TOKEN = token ❌
```

---

## ⚙️ Advanced Setup (Webhooks)

For production, use webhooks instead of polling:

```javascript
// server.js
app.post('/webhook', (req, res) => {
  if (req.body.message) {
    const message = req.body.message;
    console.log('Received:', message.text);
    
    // Process message
    // Update database
    // Send response
  }
  res.status(200).send('OK');
});
```

### Set Webhook URL

```bash
curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://your-domain.com/webhook"
```

---

## 📖 Telegram API Docs

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather Guide](https://core.telegram.org/bots)
- [Getting Bot ID](https://core.telegram.org/bots/tutorial)

---

## 🎯 Next Steps

1. ✅ Create bot with BotFather
2. ✅ Get token and chat ID
3. ✅ Add to `.env.local`
4. ✅ Test with curl
5. ✅ Test with app
6. ✅ Combine with LINE (optional)

---

🎉 **Telegram integration complete!**

Next, try:
- [LINE Integration](./LINE_INTEGRATION.md) - Add LINE group notifications
- [Architecture](./ARCHITECTURE.md) - Understand how it works
- [API Docs](./API.md) - See all endpoints
