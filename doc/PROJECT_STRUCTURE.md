# 🗂️ Project Structure

## Directory Tree

```
gunpj/
│
├── doc/                          # 📚 Documentation
│   ├── README.md                 # หน้าแรก
│   ├── INSTALLATION.md           # วิธีติดตั้ง
│   ├── PROJECT_STRUCTURE.md      # ไฟล์นี้
│   ├── ARCHITECTURE.md           # โครงสร้างระบบ
│   ├── API.md                    # API Endpoints
│   ├── LINE_INTEGRATION.md       # LINE Integration
│   ├── TELEGRAM_INTEGRATION.md   # Telegram Integration
│   ├── TROUBLESHOOTING.md        # แก้ปัญหา
│   └── DEVELOPMENT.md            # Development Guide
│
├── src/
│   │
│   ├── app/                      # 🎨 Next.js App Directory
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page (🔴 MAIN)
│   │   └── api/
│   │       └── proxy/
│   │           └── route.ts      # API proxy for LINE
│   │
│   ├── components/               # 🧩 React Components
│   │   ├── Header.tsx            # Header with buttons
│   │   ├── TaskList.tsx          # Task list display
│   │   ├── TaskItem.tsx          # Single task card
│   │   ├── TaskModal.tsx         # Create/Edit task form
│   │   ├── Dashboard.tsx         # Stats & graphs
│   │   ├── AssigneeModal.tsx     # Manage assignees
│   │   ├── LineGroupSelector.tsx # LINE group picker
│   │   └── Calendar.css          # Calendar styles
│   │
│   ├── helpers/                  # 🔧 Utility Functions
│   │   └── utils.ts              # Date formatting, status
│   │
│   └── types/                    # 📝 TypeScript Types
│       └── index.ts              # All interfaces
│
├── public/                       # 📦 Static Assets
│
├── server.js                     # 🚀 Express Backend (MAIN)
├── next.config.ts               # Next.js Configuration
├── tsconfig.json                # TypeScript Config
├── tailwind.config.js           # Tailwind CSS Config
├── package.json                 # Dependencies
├── .env.example                 # Environment Template
├── eslint.config.mjs            # ESLint Config
├── postcss.config.mjs           # PostCSS Config
└── README.md                    # Project README

```

---

## 📁 Main Directories

### 1️⃣ `/src/app` - Next.js Pages

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout (HTML structure) |
| `page.tsx` | Home page - Main component 🔴 |
| `globals.css` | Global CSS styles |
| `api/proxy/route.ts` | API proxy for LINE groups |

**`page.tsx` ที่สำคัญที่สุด:**
```tsx
- useState: tasks, assignees, isModalOpen, etc.
- useEffect: ดึงข้อมูลจากเซิร์ฟเวอร์
- Handlers: handleSaveTask, handleDeleteTask, etc.
- Render: <Header>, <TaskList>, <Dashboard>
```

---

### 2️⃣ `/src/components` - React Components

| Component | ความใจความ | Props |
|-----------|-----------|-------|
| `Header.tsx` | Header with navigation | view, setView, onAddTask, onOpenLineGroupSelector |
| `TaskList.tsx` | Display all tasks | tasks, onEdit, onDelete, onComplete |
| `TaskItem.tsx` | Single task card | task, onEdit, onDelete, onComplete |
| `TaskModal.tsx` | Create/Edit form | isOpen, onClose, onSaveTask, taskToEdit 🔴 |
| `Dashboard.tsx` | Stats & charts | tasks, dashboardData |
| `AssigneeModal.tsx` | Manage people | isOpen, onClose, assignees |
| `LineGroupSelector.tsx` | Pick LINE group | isOpen, onClose, onSendToGroup 🔴 |

**ที่สำคัญ:**
- `TaskModal.tsx` - ฟอร์มสร้าง/แก้ไจงาน ซับซ้อนที่สุด
- `LineGroupSelector.tsx` - ใหม่! เลือกกลุ่ม LINE

---

### 3️⃣ `/src/helpers` - Utility Functions

```typescript
// utils.ts
formatThaiDateTime() → "20 กุมภาพันธ์ 2026 09:00 น."
getTaskStatusInfo() → { text: string, state: string }
```

**ใช้ dayjs** สำหรับการจัดการวันที่

---

### 4️⃣ `/src/types` - TypeScript Interfaces

```typescript
// index.ts
interface Assignee { id, name, position, role }
interface Task { id, title, details, assignee, date, time, status }
interface LineUser { userId, displayName, pictureUrl }
interface LineGroup { groupId, groupName, members[] }
interface LineNotification { groupId, type, taskId, message }
```

---

## 🚀 Backend Structure

### `server.js` (Express Server)

```javascript
// Port: 3001

// Middleware
app.use(cors())      // CORS
app.use(express.json()) // JSON parser

// Routes
POST /api/send-telegram-notification  // Send Telegram
POST /api/send-line-notification      // Send LINE ✨
GET  /api/line-groups                 // Get LINE groups
GET  /api/line-group-members/:groupId // Get members
POST /webhook                         // Telegram webhook
POST /api/line-webhook                // LINE webhook ✨

// Telegram Functions
setTelegramWebhook()  // Set up webhook

// LINE Functions
sendLineNotification() // Send message ✨
getLineGroups()        // List groups ✨
```

---

## 📊 Data Flow

```
┌─────────────────┐
│  Browser (UI)   │
│    (page.tsx)   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ /api/   │
    │ (route) │
    └────┬────┘
         │
    ┌────▼────────────┐
    │ server.js       │
    │ (Express)       │
    └────┬────────────┘
         │
    ┌────┴─────────────────┐
    │                      │
┌───▼──────┐      ┌─────────▼───────┐
│ Telegram │      │ LINE Messaging  │
│ API      │      │ API             │
└──────────┘      └─────────────────┘
```

---

## 🔄 Request/Response Flow

### 1. Create New Task

```
page.tsx (handleSaveTask)
  ↓
POST /api/ + {action: 'createTask', task: {...}}
  ↓
server.js (Express)
  ↓
fetch() → Google Sheets / Database
  ↓
Response: {task: {...}}
  ↓
page.tsx (setTasks)
  ↓
sendTelegramNotification() + sendLineNotification()
```

### 2. Send LINE Notification

```
page.tsx (sendLineNotification)
  ↓
POST /api/send-line-notification
  ↓
server.js (new endpoint)
  ↓
fetch() → LINE Messaging API
  ↓
Response: 200 OK
  ↓
Message appears in LINE Group
```

---

## 📦 Package Dependencies

### Frontend (React/Next.js)
```json
{
  "next": "15.4.6",           // Framework
  "react": "19.1.0",          // UI Library
  "@mui/material": "7.3.1",   // Components
  "recharts": "3.1.2",        // Charts
  "lucide-react": "0.539.0",  // Icons
  "sweetalert2": "11.22.4"    // Alerts
}
```

### Backend (Server)
```json
{
  "express": "5.1.0",         // Server
  "cors": "2.8.5",            // CORS
  "dotenv": "17.2.1"          // Env vars
}
```

### Utilities
```json
{
  "dayjs": "1.11.13",         // Date handling
  "google-spreadsheet": "4.1.1" // Google Sheets
}
```

---

## 🔐 Environment & Config

### .env.local (Not in Git)
```env
NEXT_PUBLIC_API_URL=...
TELEGRAM_BOT_TOKEN=...
LINE_CHANNEL_ACCESS_TOKEN=...
```

### .env.example (Template)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
TELEGRAM_BOT_TOKEN=your_token_here
...
```

### tsconfig.json
```json
{
  "paths": {
    "@/*": ["./src/*"]  // Import alias
  }
}
```

---

## 🎯 File Purposes

| File | Size | Purpose |
|------|------|---------|
| `page.tsx` | ~260 lines | Main app logic 🔴 |
| `TaskModal.tsx` | ~300 lines | Form for tasks 🔴 |
| `server.js` | ~180 lines | Backend APIs 🔴 |
| `utils.ts` | ~80 lines | Helpers |
| `index.ts` (types) | ~50 lines | Interfaces |
| `Header.tsx` | ~55 lines | Navigation |

---

## 🔴 Critical Files

These files are essential to functionality:

1. **page.tsx** - Main component
2. **server.js** - Backend server
3. **TaskModal.tsx** - Task creation
4. **LineGroupSelector.tsx** - LINE integration
5. **types/index.ts** - Type definitions

---

## 📱 Component Hierarchy

```
HomePage (page.tsx)
├── Header
│   ├── List Button
│   ├── Dashboard Button
│   ├── LINE Button ✨
│   └── Add Button
├── TaskList
│   └── TaskItem (multiple)
│       ├── Edit Button
│       ├── Delete Button
│       ├── Complete Button
│       └── Notify Button
├── Dashboard
│   └── StatCards + Charts
├── TaskModal
│   ├── Input: Title, Details
│   ├── Select: Assignee
│   ├── Calendar: Start/End Date
│   ├── Time: Start/End Time
│   └── Button: Save
└── LineGroupSelector ✨
    ├── Group List
    ├── Member List
    └── Button: Send
```

---

## 🚀 Deployment Structure

### For Production

```bash
dist/                   # Build output
.env.production        # Production env
node_modules/          # Dependencies
server.js              # Run as service
next start             # Start Next.js
```

---

## 📊 Database Schema (Example - Google Sheets)

### Sheet: "Tasks"
```
| ID | Title | Assignee | Start Date | Start Time | End Date | End Time | Status | Details |
```

### Sheet: "Assignees"
```
| ID | Name | Position | Role |
```

---

## ✅ Structure Checklist

- ✅ TypeScript enabled
- ✅ Components organized
- ✅ Helpers separated
- ✅ Types defined
- ✅ API routes correct
- ✅ Backend configured
- ✅ Environment variables
- ✅ Documentation complete

---

**ดูรายละเอียดเพิ่มเติมใน:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - ออกแบบ
- [API.md](./API.md) - Endpoints
- [LINE_INTEGRATION.md](./LINE_INTEGRATION.md) - LINE setup
