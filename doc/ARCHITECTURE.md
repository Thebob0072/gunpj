# 🏗️ Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React 19 + TypeScript)         │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ page.tsx (Main Component)                   │  │  │
│  │  │ - State Management (useState)               │  │  │
│  │  │ - Data Fetching (useEffect)                 │  │  │
│  │  │ - Event Handlers                            │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Components (React)                          │  │  │
│  │  │ - Header, TaskList, TaskItem                │  │  │
│  │  │ - TaskModal, Dashboard                      │  │  │
│  │  │ - LineGroupSelector ✨ NEW                  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Helpers & Utilities                         │  │  │
│  │  │ - formatThaiDateTime()                      │  │  │
│  │  │ - getTaskStatusInfo()                       │  │  │
│  │  │ - sendLineNotification() ✨ NEW             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/REST API
                  │ Fetch/Axios
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (Proxy)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Next.js Route Handler (route.ts)                  │  │
│  │ - GET /api/proxy?type=line-groups ✨              │  │
│  │ - GET /api/proxy?type=line-members ✨             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP
                  ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND SERVER LAYER                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Express.js Server (server.js)                     │  │
│  │ Port: 3001                                        │  │
│  │                                                   │  │
│  │ ROUTES:                                           │  │
│  │ ┌─────────────────────────────────────────────┐  │  │
│  │ │ Telegram                                    │  │  │
│  │ │ - POST /api/send-telegram-notification     │  │  │
│  │ │ - POST /webhook (receive)                  │  │  │
│  │ │ - Function: setTelegramWebhook()           │  │  │
│  │ └─────────────────────────────────────────────┘  │  │
│  │ ┌─────────────────────────────────────────────┐  │  │
│  │ │ LINE ✨ NEW                                 │  │  │
│  │ │ - POST /api/send-line-notification         │  │  │
│  │ │ - POST /api/line-webhook                   │  │  │
│  │ │ - GET /api/line-groups                     │  │  │
│  │ │ - GET /api/line-group-members/:id          │  │  │
│  │ │ - In-Memory Store: lineGroups (Map)        │  │  │
│  │ └─────────────────────────────────────────────┘  │  │
│  │ ┌─────────────────────────────────────────────┐  │  │
│  │ │ Middleware                                  │  │  │
│  │ │ - CORS (Cross-Origin)                       │  │  │
│  │ │ - express.json() (Body Parser)              │  │  │
│  │ └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTPS
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ TELEGRAM API     │  │ LINE API ✨      │
│ api.telegram.org │  │ api.line.me      │
│                  │  │ messaging        │
│ POST             │  │ POST push        │
│ /sendMessage     │  │                  │
│ /setWebhook      │  │ Limitations:     │
│ /getMe           │  │ - ≤ 20 members   │
│                  │  │ - Group ID only  │
│                  │  │ - Rich media     │
└──────────────────┘  └──────────────────┘

┌──────────────────────────────────────────────────────────┐
│            NOTIFICATION DELIVERY                         │
│                                                          │
│  Telegram Chat ID                LINE Group ID          │
│  (Direct Message)                (Broadcast)            │
│         │                                │              │
│         ▼                                ▼              │
│  ┌─────────────────────┐    ┌──────────────────────┐  │
│  │ 🔔 User's Telegram  │    │ 👥 LINE Group Chat  │  │
│  │ Chat                │    │ (≤ 20 members)      │  │
│  └─────────────────────┘    └──────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1️⃣ Create Task Flow

```
User Action: Click "+" button
       │
       ▼
TaskModal Opens
       │
       ▼
User fills: Title, Assignee, Date▼, Time
       │
       ▼
Click "Save"
       │
       ▼
page.tsx: handleSaveTask()
       │
       ├─ POST /api { action: 'createTask', task: {...} }
       │       │
       │       ▼
       │  server.js ← fetch backend
       │       │
       │       ▼
       │  Google Sheets / Database
       │       │
       │       ▼
       │  Response: { task: {...}, id: "123" }
       │
       ├─ setTasks([...tasks, newTask])
       │
       ├─ sendTelegramNotification() ← Telegram
       │       │
       │       ▼
       │  Telegram Chat
       │
       └─ sendLineNotification() ✨ ← LINE
               │
               ▼
          LINE Group
```

### 2️⃣ LINE Group Selection Flow

```
User Click: LINE Button 🟢
       │
       ▼
LineGroupSelector Opens
       │
       ▼
fetch('/api/proxy?type=line-groups')
       │
       ├─ Next.js API Route (route.ts)
       │     │
       │     ├─ fetch('http://localhost:3001/api/line-groups')
       │     │     │
       │     │     ▼
       │     │  server.js: GET /api/line-groups
       │     │     │
       │     │     ▼
       │     │  Return: [{ groupId, groupName, members[] }]
       │     │
       │     └─ Response to Client
       │
       ▼
Display Groups List
       │
       ▼
User Click Group
       │
       ▼
fetch('/api/proxy?type=line-members&groupId=...')
       │
       └─ Similar flow as above
           └─ server.js:  GET /api/line-group-members/:groupId
           └─ Return member list (≤ 20)
       │
       ▼
Display Members
       │
       ▼
User Click "Send"
       │
       ▼
setSelectedLineGroupId()
setSelectedLineGroupName()
showMessage()
```

### 3️⃣ Complete Task & Notify Flow

```
User Action: Click "✓ Complete"
       │
       ▼
Confirmation Dialog
       │
       ├─ No → Cancel
       │
       └─ Yes
           │
           ▼
        handleCompleteTask()
           │
           ├─ POST /api { action: 'update', task: { status: 'Completed' } }
           │     │
           │     ▼
           │  Database Updated
           │
           ├─ setTasks() ← Update UI
           │
           ├─ sendTelegramNotification('🎉 Task Done!') ← Telegram
           │
           └─ if (selectedLineGroupId)
               └─ sendLineNotification(groupId, msg, title, assignee) ✨
                       │
                       └─ POST /api/send-line-notification
                         └─ server.js sends to LINE Messaging API
                         └─ Message appears in GROUP
```

---

## Component State Management

### page.tsx State Variables

```typescript
const [tasks, setTasks] = useState<Task[]>([])
// All tasks from DB

const [assignees, setAssignees] = useState<Assignee[]>([])
// All team members

const [isLoading, setIsLoading] = useState(true)
// Loading spinner

const [error, setError] = useState<string | null>(null)
// Error messages

const [isModalOpen, setIsModalOpen] = useState(false)
// Show task form

const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
// Which task to edit (null = create new)

const [view, setView] = useState<'list' | 'dashboard'>('list')
// Current view mode

const [message, setMessage] = useState('')
// Toast notification

const [isLineGroupSelectorOpen, setIsLineGroupSelectorOpen] = useState(false)
// Show LINE modal ✨

const [selectedLineGroupId, setSelectedLineGroupId] = useState<string | null>(null)
// Active LINE group ID ✨

const [selectedLineGroupName, setSelectedLineGroupName] = useState<string | null>(null)
// Active LINE group name ✨
```

---

## API Endpoints

### Telegram Endpoints

```http
POST /api/send-telegram-notification
Content-Type: application/json
{
  "message": "Task notification text"
}

Response: 200 OK
{
  "success": true,
  "message": "Notification sent."
}
```

### LINE Endpoints ✨ NEW

```http
GET /api/line-groups
Response: 200 OK
[
  { groupId: "xxx", groupName: "Team A", members: [... ] }
]

──────────────

GET /api/line-group-members/:groupId
Response: 200 OK
{
  "groupId": "xxx",
  "memberCount": 5,
  "members": ["userId1", "userId2", ...]
}

──────────────

POST /api/send-line-notification
Content-Type: application/json
{
  "groupId": "xxx",
  "message": "Task update",
  "taskTitle": "Meeting",
  "assignee": "John"
}

Response: 200 OK
{
  "success": true,
  "message": "Notification sent to LINE group"
}

──────────────

POST /api/line-webhook
(Receive group join/leave events)
```

---

## Data Models (TypeScript Interfaces)

### Task Model
```typescript
interface Task {
  id: string;              // Unique ID
  title: string;           // Task name
  details?: string;        // Optional description
  assignee: string;        // Person responsible
  startDate: string;       // Format: YYYY-MM-DD
  endDate: string;         // Format: YYYY-MM-DD
  startTime: string;       // Format: HH:mm
  endTime: string;         // Format: HH:mm
  status: 'To Do' | 'In Progress' | 'Completed' | 'Edited';
}

type NewTask = Omit<Task, 'id' | 'status'>;
```

### Assignee Model
```typescript
interface Assignee {
  id: string;
  name: string;
  position?: string;
  role?: string;
}
```

### LINE Integration Models ✨
```typescript
interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LineGroup {
  groupId: string;
  groupName: string;
  iconUrl?: string;
  members: LineUser[];
  createdAt?: string;
}

interface LineNotification {
  groupId: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted';
  taskId: string;
  taskTitle: string;
  assignee: string;
  message: string;
  timestamp: string;
}
```

---

## Technology Decisions

### Why Next.js?
- ✅ Built-in API routes
- ✅ Server-side rendering
- ✅ Excellent TypeScript support
- ✅ Optimal performance

### Why Express (Separate Server)?
- ✅ Telegram/LINE webhooks need dedicated endpoint
- ✅ Can run independently
- ✅ Easier to scale

### Why Tailwind CSS?
- ✅ Rapid UI development
- ✅ Responsive design
- ✅ Utility-first approach
- ✅ Small bundle size

### Why dayjs instead of Moment?
- ✅ Smaller bundle (only ~2KB)
- ✅ Immutable date objects
- ✅ Locale support (Thai)
- ✅ Plugin system

### Why Line Integration ✨
- ✅ Popular in Thailand & Japan
- ✅ Group messaging (up to 20 members)
- ✅ @ mention support
- ✅ Rich media messages

---

## Scalability Considerations

### Current Limitations
- 🔴 In-memory storage for LINE groups
- 🔴 No rate limiting
- 🔴 No authentication
- 🔴 No database (uses Google Sheets)

### Production Ready Recommendations
- ✅ Migrate to PostgreSQL/MongoDB
- ✅ Add JWT authentication
- ✅ Implement rate limiting
- ✅ Use Redis for caching
- ✅ Docker containerization
- ✅ CI/CD pipeline
- ✅ Error monitoring (Sentry)
- ✅ Logging system (Winston)

---

## Security Considerations

### Current Implementation
```javascript
// Environment variables for secrets
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// CORS enabled for frontend
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Input validation for messages
if (!message || typeof message !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}
```

### Recommendations
- ✅ Add request signing for webhooks
- ✅ Implement API key authentication
- ✅ Add SSL/TLS certificates
- ✅ Use environment variables for all secrets
- ✅ Validate all user inputs
- ✅ Sanitize HTML output
- ✅ Implement CSRF protection
- ✅ Add brute force protection

---

## Performance Metrics

### Target Performance
- Page Load: < 2 seconds
- API Response: < 500ms
- Notification Delivery: < 2 seconds

### Optimization Techniques
- ✅ Memoization (useMemo)
- ✅ Code splitting (Next.js)
- ✅ Image optimization
- ✅ Caching headers
- ✅ Database indexing

---

## Error Handling Strategy

```
Frontend Error
       │
       ├─ Try-catch block
       │
       ├─ Show toast/alert to user
       │
       ├─ Log to console (dev)
       │
       └─ Call API (error reporting)

backend Error
       │
       ├─ Try-catch in route handler
       │
       ├─ Return error JSON
       │
       ├─ Log to file/service
       │
       └─ Alert admin (Optional)
```

---

## Deployment Architecture

```
┌─────────────────────┐
│  GitHub / Git       │
│  (Source Code)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  CI/CD Pipeline     │
│  (GitHub Actions)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Docker Image       │
│  (Container)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Server             │
│  (Production)       │
│  - Port 3000 (Next) │
│  - Port 3001 (Expr) │
└─────────────────────┘
```

---

## Future Architecture Improvements

```
Phase 2:
├─ Database migration (PostgreSQL)
├─ Authentication (JWT)
├─ Real-time updates (WebSocket)
└─ Admin dashboard

Phase 3:
├─ Mobile app (React Native)
├─ Desktop app (Electron)
├─ Analytics dashboard
└─ Advanced reporting

Phase 4:
├─ AI task suggestions
├─ Slack integration
├─ Microsoft Teams integration
└─ Microservices architecture
```

---

**ดูข้อมูลเพิ่มเติมใน:**
- [API.md](./API.md) - Detailed API Docs
- [LINE_INTEGRATION.md](./LINE_INTEGRATION.md) - LINE Setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development Guide
