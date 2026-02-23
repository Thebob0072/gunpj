# 💬 LINE Integration Guide

## 📋 Prerequisites

- LINE Official Account (Business account recommended)
- LINE Developers Console access
- Channel Access Token & Channel Secret

---

## 🚀 Step-by-Step Setup

### Step 1: Create LINE Official Account

1. Go to [LINE Developers](https://developers.line.biz)
2. Click "Sign in" → Login with your LINE account
3. Click "Create a Provider"  
4. Enter provider name (e.g., "GUNPJ Company")
5. Click "Create"

---

### Step 2: Create a Channel

1. Click on your Provider
2. Click "Create a channel"
3. Select **"Messaging API"** channel type
4. Fill in channel information:
   - Channel name: `GUNPJ Bot`
   - Category: `Productivity`
   - Description: `Task management notifications`
5. Agree to terms & click "Create"

---

### Step 3: Get Credentials

1. Go to your Channel settings
2. Find **"Messaging API"** tab
3. Copy these credentials to `.env.local`:

```env
LINE_CHANNEL_ACCESS_TOKEN=YOUR_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET=YOUR_CHANNEL_SECRET
```

**Location in Console:**
```
Channel Settings → Messaging API
├─ Channel access token (long string)
└─ Channel secret (another long string)
```

---

### Step 4: Configure Webhook URL

1. In **Messaging API** settings
2. Find **"Webhook URL"** section
3. Set webhook URL to:
   ```
   https://your-domain.com/api/line-webhook
   ```
   (Replace `your-domain.com` with your actual domain)

4. Toggle **"Use webhook"** to **ON**
5. Click "Verify" to test connection

---

### Step 5: Add Bot to GROUP

1. Find your bot's **LINE ID** in Channel settings
2. Open LINE app on your phone
3. Go to **Line Official Accounts** (or search by ID)
4. Add the bot to a group
5. Invite the bot to the group

---

## ✅ Verify Integration

### Test 1: Check Bot in Group

```bash
# The bot should appear in the group members
# Click the bot → you should see its profile
```

### Test 2: Request Members

```bash
# Open app and click LINE button (🟢)
# Should see list of groups where bot is member
# Should show member count (≤ 20)
```

### Test 3: Send Test Message

```bash
# From app, create a task
# Select the LINE group
# Message should appear in LINE
```

---

## 📱 How It Works

### When Bot Joins Group

```javascript
// server.js detects join event
POST /api/line-webhook
{
  "events": [{
    "type": "join",
    "source": { "type": "group", "groupId": "C123..." }
  }]
}

// Stored in: lineGroups Map
lineGroups.set(groupId, {
  groupId: "C123...",
  groupName: "Team A",
  members: []
})
```

### When Notification Sent

```javascript
// From page.tsx
POST /api/send-line-notification
{
  "groupId": "C123...",
  "message": "Task update",
  "taskTitle": "Meeting",
  "assignee": "John"
}

// server.js sends to LINE API
fetch('https://api.line.me/v2/bot/message/push', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: "C123...",
    messages: [{
      type: "text",
      text: "📋 Meeting\n\nTask update\n\n👤 Assignee: John"
    }]
  })
})
```

---

## 🔧 Configuration in .env.local

```env
# LINE Configuration
LINE_CHANNEL_ACCESS_TOKEN=YOUR_TOKEN_HERE
LINE_CHANNEL_SECRET=YOUR_SECRET_HERE
NEXT_PUBLIC_LINE_API_URL=http://localhost:3001/api/send-line-notification
NEXT_PUBLIC_LINE_WEBHOOK_URL=https://your-domain.com/api/line-webhook

# Webhook (if deployed)
# Set in LINE Console: https://your-domain.com/api/line-webhook
```

---

## 📱 Message Format

Messages sent to LINE appear as:

```
📋 Meeting

Task update

👤 ผู้รับผิดชอบงาน: John Doe
```

### Components:
- 📋 Task Title
- Message content
- 👤 Assignee name

---

## 🔐 Security

### Token Security

```javascript
// ✅ Stored in ENV vars
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// ❌ Never hardcode
// const TOKEN = "YOUR_TOKEN"; // DON'T DO THIS
```

### Webhook Signature Verification

```javascript
// Production: Verify X-Line-Signature header
// Current: Basic verification (dev only)
// TODO: Implement proper signature validation
```

---

## 🚧 Troubleshooting

### Issue: "Channels not found"

**Solution:**
```
1. Check if LINE_CHANNEL_ACCESS_TOKEN is set
2. Verify token is not expired
3. Regenerate token from Console
4. Check Environment restart
```

### Issue: "Bot not in group"

**Solution:**
```
1. Add bot to group manually in LINE app
2. Wait 5 seconds for webhook to register
3. Refresh app and try again
```

### Issue: "Message not sent"

**Solution:**
```
1. Check LINE_CHANNEL_ACCESS_TOKEN in .env
2. Verify group ID is correct
3. Check server logs for errors
4. Ensure webhook URL is public
```

### Issue: "Members showing 0"

**Solution:**
```
1. Make sure you're in the group
2. Invite bot to group again
3. Refresh the app
4. Check server console for errors
```

---

## 📊 Group Limitations

| Limit | Value | Note |
|-------|-------|------|
| Max Members | 20 | Configured limit |
| Message Type | Text | Only text messages |
| Media Support | ❌ No | Text only for now |
| @ Mention | ❌ No | Name only |
| Group Count | Unlimited | Can join multiple groups |

---

## 🎯 Features Supported

### ✅ Implemented
- [ ] Send text notifications ✅
- [ ] Get group list ✅
- [ ] Get member count ✅
- [ ] Multiple group support ✅
- [ ] Automatic group detection ✅

### 🎯 Future Features
- [ ] Rich message format (template)
- [ ] Image/file uploads
- [ ] @ mention in messages
- [ ] Typing indicator
- [ ] Read receipts
- [ ] Bot commands (menu)

---

## 📖 LINE Bot Documentation

- [LINE Messaging API Docs](https://developers.line.biz/en/reference/messaging-api/)
- [Channel Access Token Guide](https://developers.line.biz/en/docs/messaging-api/get-channel-access-token/)
- [Webhook Setup Guide](https://developers.line.biz/en/docs/messaging-api/using-webhooks/)

---

## 🔗 Testing the Integration

### Test 1: Manual Group Addition

```
LINE App → Add BOT → Allow grouping → Select group
```

### Test 2: App Integration

```
1. Select LINE group in app
2. Create new task
3. Check LINE group for message
```

### Test 3: Multiple Groups

```
1. Add bot to 2+ groups
2. See all groups in selector
3. Send to different groups
```

---

## 📝 Example Implementation

### Frontend Usage

```typescript
// LineGroupSelector.tsx
const fetchLineGroups = async () => {
  const response = await fetch('/api/proxy?type=line-groups');
  const groups = await response.json();
  setGroups(groups);
};

// When user selects group
const handleSelectGroup = (groupId: string) => {
  setSelectedLineGroupId(groupId);
};

// When creating task
if (selectedLineGroupId) {
  await sendLineNotification(
    selectedLineGroupId,
    message,
    taskTitle,
    assignee
  );
}
```

### Backend Implementation

```javascript
// server.js
app.post('/api/send-line-notification', async (req, res) => {
  const { groupId, message, taskTitle, assignee } = req.body;
  
  // Validate input
  if (!groupId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Construct message
  const lineMessage = `📋 ${taskTitle}\n\n${message}\n\n👤 ${assignee}`;
  
  // Send to LINE API
  const response = await fetch(`${LINE_MESSAGING_API}/message/push`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: groupId,
      messages: [{
        type: 'text',
        text: lineMessage
      }]
    })
  });
  
  return res.json({ success: true });
});
```

---

## 🚀 Deployment Considerations

### Environment Variables

```env
# Production (.env.production)
LINE_CHANNEL_ACCESS_TOKEN=xxxx
LINE_CHANNEL_SECRET=xxxx
NEXT_PUBLIC_LINE_WEBHOOK_URL=https://gunpj.example.com/api/line-webhook
```

### Webhook URL

```bash
# Development (localhost - won't work with LINE)
http://localhost:3000/api/line-webhook ❌

# Production (needed)
https://gunpj.example.com/api/line-webhook ✅
```

### HTTPS Required

```
⚠️ LINE API requires HTTPS
❌ http://localhost won't work
✅ https://yourdomain.com required
```

---

## 💡 Tips & Best Practices

1. **Always use HTTPS** for webhook URL
2. **Rotate tokens regularly** for security
3. **Validate input** before sending
4. **Handle errors gracefully** with retry logic
5. **Log all messages** for debugging
6. **Test in development** before production
7. **Monitor failed deliveries** for issues

---

**Next steps:**
- [API Documentation](./API.md) - All endpoints
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [Telegram Integration](./TELEGRAM_INTEGRATION.md) - Telegram setup
