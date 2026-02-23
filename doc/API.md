# 🔌 API Documentation

## Base URLs

| Service | URL |
|---------|-----|
| Frontend API | `http://localhost:3001/api` |
| Telegram Notifications | `http://localhost:3001/api/send-telegram-notification` |
| LINE Notifications | `http://localhost:3001/api/send-line-notification` |
| LINE Groups | `http://localhost:3001/api/line-groups` |
| LINE Members | `http://localhost:3001/api/line-group-members/:groupId` |

---

## 📨 Telegram API

### Send Telegram Notification

**Endpoint:**
```http
POST /api/send-telegram-notification
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Task notification text"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | ✅ Yes | Notification text (supports HTML) |

**Example:**
```bash
curl -X POST http://localhost:3001/api/send-telegram-notification \
  -H "Content-Type: application/json" \
  -d '{"message":"✅ Task completed!"}'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Notification sent."
}
```

**Response (Error):**
```json
{
  "error": "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set."
}
```

**Status Codes:**
- `200 OK` - Message sent successfully
- `400 Bad Request` - Invalid input (empty message)
- `500 Internal Server Error` - API error or credentials missing

**HTML Support:**
```html
Bold: <b>text</b>
Italic: <i>text</i>
Code: <code>text</code>
Pre: <pre>text</pre>
```

---

## 📱 LINE Messaging API ✨ NEW

### Get LINE Groups

**Endpoint:**
```http
GET /api/line-groups
accept: application/json
```

**Response (Success):**
```json
{
  "groups": [
    {
      "groupId": "C1234567890abcdef",
      "groupName": "Team A",
      "iconUrl": "https://...",
      "members": [
        {
          "userId": "U1234567890abcdef",
          "displayName": "John Doe",
          "pictureUrl": "https://..."
        }
      ],
      "createdAt": "2026-02-20T10:00:00Z"
    }
  ]
}
```

**Response (Error):**
```json
{
  "error": "Failed to fetch LINE groups"
}
```

**Status Codes:**
- `200 OK` - Groups retrieved
- `500 Internal Server Error` - Server error

---

### Get LINE Group Members

**Endpoint:**
```http
GET /api/line-group-members/:groupId
accept: application/json
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| groupId | string | ✅ Yes | LINE Group ID |

**Example:**
```bash
curl http://localhost:3001/api/line-group-members/C1234567890abcdef
```

**Response (Success):**
```json
{
  "groupId": "C1234567890abcdef",
  "memberCount": 5,
  "members": [
    {
      "userId": "U1234567890abcdef",
      "displayName": "Member 1",
      "pictureUrl": "https://..."
    },
    {
      "userId": "U0987654321fedcba",
      "displayName": "Member 2",
      "pictureUrl": "https://..."
    }
  ]
}
```

**Limitations:**
- Maximum 20 members per group
- Members limited to first 20 (even if group has more)

**Response (Error):**
```json
{
  "error": "Failed to fetch members"
}
```

---

### Send LINE Notification

**Endpoint:**
```http
POST /api/send-line-notification
Content-Type: application/json
```

**Request Body:**
```json
{
  "groupId": "C1234567890abcdef",
  "message": "Task update message",
  "taskTitle": "Meeting with client",
  "assignee": "John Doe"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| groupId | string | ✅ Yes | LINE Group ID (from line-groups) |
| message | string | ✅ Yes | Main message text |
| taskTitle | string | ✅ Yes | Task name/title |
| assignee | string | ✅ Yes | Person responsible |

**Example:**
```bash
curl -X POST http://localhost:3001/api/send-line-notification \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "C1234567890abcdef",
    "message": "Meeting updated to 3:00 PM",
    "taskTitle": "Client Meeting",
    "assignee": "John Doe"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Notification sent to LINE group"
}
```

**Response (Error):**
```json
{
  "error": "groupId and message are required"
}
```

**Message Format:**
Frontend generates:
```
📋 [Task Title]

[Message]

👤 ผู้รับผิดชอบงาน: [Assignee]
```

**Status Codes:**
- `200 OK` - Message sent
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - API error

---

## 🔌 Webhook Endpoints

### LINE Webhook

**Endpoint:**
```http
POST /api/line-webhook
Content-Type: application/json
X-Line-Signature: [signature]
```

**Events Received:**
- `join` - Bot added to group
- `leave` - Bot removed from group
- `message` - Message received

**Example Payload:**
```json
{
  "events": [
    {
      "replyToken": "...",
      "type": "join",
      "timestamp": 1644245600000,
      "source": {
        "type": "group",
        "groupId": "C1234567890abcdef"
      }
    }
  ]
}
```

**Response:**
```json
{
  "message": "OK"
}
```

---

### Telegram Webhook

**Endpoint:**
```http
POST /webhook
Content-Type: application/json
```

**Events Received:**
- Chat ID extraction from messages
- Debug information logging

**Example Payload:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "date": 1644245600,
    "chat": {
      "id": -1001234567890,
      "type": "private"
    },
    "text": "Hello"
  }
}
```

---

## 📊 Frontend API Routes

### Get LINE Groups (via Proxy)

**Endpoint:**
```http
GET /api/proxy?type=line-groups
accept: application/json
```

**Response:**
Same as `GET /api/line-groups`

---

### Get LINE Members (via Proxy)

**Endpoint:**
```http
GET /api/proxy?type=line-members&groupId=C1234567890abcdef
accept: application/json
```

**Response:**
Same as `GET /api/line-group-members/:groupId`

---

## 🔄 Request/Response Examples

### Example 1: Create and Notify

```typescript
// 1. Create task
const response = await fetch('/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'createTask',
    task: {
      title: 'Project Review',
      assignee: 'Jane Smith',
      startDate: '2026-02-20',
      endDate: '2026-02-21'
    }
  })
});

// 2. Send Telegram
await fetch('http://localhost:3001/api/send-telegram-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '✍️ New task: Project Review'
  })
});

// 3. Send LINE (if group selected)
await fetch('http://localhost:3001/api/send-line-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: 'C1234567890abcdef',
    message: 'Project Review assigned',
    taskTitle: 'Project Review',
    assignee: 'Jane Smith'
  })
});
```

---

### Example 2: Select and Send to LINE

```typescript
// 1. Get groups
const groups = await fetch('/api/proxy?type=line-groups').then(r => r.json());
// Returns: [{ groupId, groupName, members[] }]

// 2. Get members
const members = await fetch(
  `/api/proxy?type=line-members&groupId=${groups[0].groupId}`
).then(r => r.json());
// Returns: { memberCount, members[] }

// 3. Send notification to group
await fetch('http://localhost:3001/api/send-line-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: groups[0].groupId,
    message: 'Task assigned to team',
    taskTitle: 'Development Sprint',
    assignee: 'Dev Team'
  })
});
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | ✅ Success | Message sent |
| 400 | ❌ Bad Request | Missing required field |
| 500 | ❌ Server Error | Token not configured |

### Error Response Format

```json
{
  "error": "Descriptive error message",
  "details": "Optional: more details"
}
```

### API Error Handling in Frontend

```typescript
try {
  const response = await fetch('/api/endpoint', { method: 'POST' });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Unknown error');
  }
  
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('API Error:', (error as Error).message);
  showErrorAlert('Failed to complete action');
}
```

---

## 🔐 Authentication (Future)

Currently, there is **NO authentication**. For production:

```typescript
// Add Authorization header
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`
  },
  body: JSON.stringify(data)
});
```

---

## 📈 Rate Limiting (Future)

For production, implement:
- 100 requests per minute per IP
- 1000 requests per day per user
- Exponential backoff for retries

---

## 🧪 Testing API with cURL

### Test Telegram

```bash
curl -X POST http://localhost:3001/api/send-telegram-notification \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message"}'
```

### Test LINE Groups

```bash
curl http://localhost:3001/api/line-groups
```

### Test LINE Send

```bash
curl -X POST http://localhost:3001/api/send-line-notification \
  -H "Content-Type: application/json" \
  -d '{
    "groupId":"C123...",
    "message":"Test",
    "taskTitle":"Test Task",
    "assignee":"Test User"
  }'
```

---

## 📚 API Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { /* optional */ }
}
```

### Error Response

```json
{
  "error": "Error description",
  "status": 400
}
```

---

## 🔗 API Integration Flow

```
Frontend (React)
    ↓
Next.js Route (/api/proxy)
    ↓
Backend Server (Express on 3001)
    ↓
Third-party API (Telegram/LINE)
    ↓
Notification Delivered
```

---

**See also:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [LINE_INTEGRATION.md](./LINE_INTEGRATION.md) - LINE setup guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development tips
