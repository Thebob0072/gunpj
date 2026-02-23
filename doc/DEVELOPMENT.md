# 👨‍💻 Development Guide

## 🎯 Overview

This guide helps developers understand the GUNPJ codebase architecture, development workflows, and best practices.

---

## 🏗️ Project Architecture

### Technology Stack

```
┌─────────────────────────────────────────────┐
│         FRONTEND - Next.js React            │
│  ├─ React 19 Components                     │
│  ├─ TypeScript 5.9                          │
│  ├─ Tailwind CSS 4                          │
│  └─ Material-UI Icons                       │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼─────────┐  ┌───────▼──────────────────┐
│  Next.js Routes │  │   Google Sheets API     │
│  ├─ /api/proxy  │  │   (Data Persistence)    │
│  └─ /api/*      │  └────────────────────────┘
└───────┬─────────┘
        │
┌───────▼──────────────────────────┐
│    Express Backend Server         │
│    (port 3001)                    │
│  ├─ API Endpoints                 │
│  ├─ Telegram Webhooks             │
│  ├─ LINE Webhooks                 │
│  └─ Notification Service          │
└───────┬──────────────────────────┘
        │
  ┌─────┴─────────┐
  │               │
┌─▼────┐     ┌─────▼────┐
│Telegram│    │ LINE API │
│  Bot   │    └──────────┘
└────────┘
```

---

## 📁 Codebase Structure

### Frontend Components (src/components/)

```typescript
// TaskItem.tsx - Single task display
├─ props: task, onEdit, onComplete, onDelete, selectedLineGroupId
├─ features: status color (green/orange), time display, action buttons
└─ emits: onEdit(), onComplete(), onDelete()

// TaskList.tsx - List of all tasks
├─ props: tasks, onEdit, onComplete, onDelete, selectedLineGroupId
├─ features: filter by status (all/pending/completed), sorting by date
└─ emits: onEdit/Complete/Delete events

// TaskModal.tsx - Create/Edit task form
├─ props: isOpen, task, assignees, onSave, onClose, onOpenLineGroupSelector
├─ features: date/time picker, assignee selector, daily reminder toggle
└─ emits: onSave({task data})

// Header.tsx - Navigation bar
├─ props: onCreateTask, onOpenLineGroupSelector, selectedLineGroupName
├─ features: task creation button, LINE group selector button, status display
└─ emits: onCreateTask(), onOpenLineGroupSelector()

// AssigneeModal.tsx - Manage assignees
├─ features: CRUD assignees, search, validation
└─ API calls: Telegram integration for notifications

// Dashboard.tsx - Stats view
├─ features: task distribution chart, status overview
└─ depends on: Recharts library

// LineGroupSelector.tsx - LINE group selection
├─ features: fetch groups, display members (≤20), select group
└─ API calls: /api/proxy?type=line-groups, ?type=line-members
```

---

## 🔧 Backend Structure (server.js)

### Express Endpoints

```javascript
// Group 1: Telegram Notifications
POST /api/send-telegram-notification
  body: { message: string }
  response: { success: boolean }

// Group 2: LINE Notifications
POST /api/send-line-notification
  body: { groupId, message, taskTitle, assignee }
  response: { success: boolean }

GET /api/line-groups
  response: [{ groupId, groupName, iconUrl, members: [] }]

GET /api/line-group-members/:groupId
  response: [{ userId, displayName, pictureUrl }]

POST /api/line-webhook
  body: webhook event from LINE
  note: validate signature with CHANNEL_SECRET

// Group 3: External Webhooks
POST /webhook
  body: Telegram webhook event
  note: for production use

POST /api/line-webhook
  body: LINE webhook event
```

### In-Memory Storage

```javascript
// Line Groups Cache (Development only)
const lineGroups = new Map([
  [groupId, {
    groupId: string,
    groupName: string,
    iconUrl: string,
    members: [{ userId, displayName, pictureUrl }],
    createdAt: date
  }]
]);

// Production: Replace with database
```

---

## 📝 Data Models

### TypeScript Interfaces (src/types/index.ts)

```typescript
interface Task {
  id: string
  title: string
  description: string
  startDateTime: string  // ISO format
  endDateTime: string    // ISO format
  assignee: Assignee
  status: 'pending' | 'completed'
  dailyReminder: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface Assignee {
  id: string
  name: string
  email: string
  joinDate: string
}

interface LineGroup {
  groupId: string
  groupName: string
  iconUrl: string
  members: LineUser[]
  createdAt: string
}

interface LineUser {
  userId: string
  displayName: string
  pictureUrl: string
  statusMessage?: string
}
```

---

## 🔄 State Management

### React Hooks Pattern (page.tsx)

```typescript
// Main App Component
const TaskManagerPage = () => {
  // Data State
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignees, setAssignees] = useState<Assignee[]>([])
  
  // UI State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)
  const [isLineGroupSelectorOpen, setIsLineGroupSelectorOpen] = useState(false)
  
  // Selected Item State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedLineGroupId, setSelectedLineGroupId] = useState<string | null>(null)
  const [selectedLineGroupName, setSelectedLineGroupName] = useState<string | null>(null)
  
  // Effects
  useEffect(() => { fetchTasks() }, [])
  useEffect(() => { fetchAssignees() }, [])
  
  // Handlers
  const handleSaveTask = (task: Task) => { /* create or update */ }
  const handleCompleteTask = (taskId: string) => { /* mark complete + notify */ }
  const handleDeleteTask = (taskId: string) => { /* delete with confirmation */ }
}
```

---

## 🚀 Development Workflow

### 1. Local Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your tokens

# Start backend (port 3001)
node server.js

# In another terminal, start frontend (port 3000)
npm run dev
```

### 2. Component Development

```bash
# 1. Create component in src/components/
# src/components/MyComponent.tsx

import { FC, useState } from 'react'

interface MyComponentProps {
  prop1: string
  onEvent: (data: string) => void
}

const MyComponent: FC<MyComponentProps> = ({ prop1, onEvent }) => {
  const [state, setState] = useState('')
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}

export default MyComponent

# 2. Import in page.tsx
import MyComponent from '@/components/MyComponent'

# 3. Use in JSX
<MyComponent prop1="value" onEvent={handleEvent} />
```

### 3. API Development

```bash
# Add endpoint to server.js
app.post('/api/my-endpoint', (req, res) => {
  try {
    const { data } = req.body
    
    // Process data
    const result = processData(data)
    
    // Send response
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

# Test with curl
curl -X POST http://localhost:3001/api/my-endpoint \
  -H "Content-Type: application/json" \
  -d '{"data":"value"}'
```

### 4. Testing Workflow

```bash
# 1. Run lint (if configured)
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Manual testing in app
# - Create tasks
# - Edit tasks
# - Complete tasks
# - Check notifications

# 4. Test with different data
# - Empty strings
# - Long text (>200 chars)
# - Special characters (ต, 中, 🎉)
```

---

## 📦 Adding Dependencies

### NPM Packages

```bash
# Install package
npm install package-name

# For development dependencies
npm install --save-dev @types/package-name

# Remove package
npm uninstall package-name
```

### Currently Installed Packages

```json
{
  "dependencies": {
    "next": "15.4.6",
    "react": "19.1.0",
    "dayjs": "1.11.13",
    "axios": (if needed)",
    "recharts": "3.1.2",
    "@mui/icons-material": "7.3.1"
  },
  "devDependencies": {
    "typescript": "5.9.2",
    "tailwindcss": "4.0.0"
  }
}
```

---

## 🔐 Environment Variables

### Development (.env.local)

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# LINE (optional)
NEXT_PUBLIC_LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_ACCESS_TOKEN=your_access_token
LINE_CHANNEL_SECRET=your_channel_secret
NEXT_PUBLIC_LINE_API_URL=https://api.line.biz/your-app

# Google Sheets (if using)
GOOGLE_SHEETS_API_KEY=your_api_key
GOOGLE_SHEET_ID=your_sheet_id

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## 🐛 Debugging

### Common Issues

#### Issue 1: "Cannot find module"
```bash
# Solution 1: Restart dev server
# Solution 2: Check import path
import { Task } from '@/types'  ✅
import { Task } from '../../types'  ❌

# Solution 3: Check exports in types/index.ts
export interface Task { ... }
```

#### Issue 2: "Async operation failed"
```bash
# Add error boundary
try {
  const data = await fetchData()
  setData(data)
} catch (error) {
  console.error('Fetch failed:', error)
  setError(error.message)
}
```

#### Issue 3: "Component not re-rendering"
```bash
# Ensure state is immutable
// ❌ Wrong
tasks.push(newTask)
setTasks(tasks)

// ✅ Correct
setTasks([...tasks, newTask])
```

#### Issue 4: "API call timeout"
```bash
# Add timeout handling
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)

fetch('/api/endpoint', { signal: controller.signal })
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request timed out')
    }
  })
  .finally(() => clearTimeout(timeout))
```

---

## 🧪 Testing Workflow

### Unit Testing (Future Setup)

```bash
# Install Jest
npm install --save-dev jest @testing-library/react

# Test file: src/utils.test.ts
import { formatThaiDateTime } from '@/helpers/utils'

describe('formatThaiDateTime', () => {
  test('should format date correctly', () => {
    const result = formatThaiDateTime('2026-02-20T09:00:00')
    expect(result).toBe('20 กุมภาพันธ์ 2026 09:00 น.')
  })
})

# Run tests
npm test
```

### Integration Testing

```bash
# Manual workflow
1. Start server: node server.js
2. Start frontend: npm run dev
3. Test creating task → Check Telegram notification
4. Test LINE group selection → Check LINE notification
5. Test completing task → Check both notifications
```

---

## 📊 Performance Optimization

### Component Memoization

```typescript
import { useMemo } from 'react'

// Before: generateTimeOptions() called on every render
const TaskModal = () => {
  const timeOptions = generateTimeOptions()  // ❌ Inefficient
  return <TimeSelect options={timeOptions} />
}

// After: useMemo caches result
const TaskModal = () => {
  const timeOptions = useMemo(
    () => generateTimeOptions(),
    []  // Empty dependencies = cache forever
  )
  return <TimeSelect options={timeOptions} />
}
```

### Lazy Loading Components

```typescript
import dynamic from 'next/dynamic'

// Lazy load heavy component
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <div>Loading...</div>
})

// Use in main component
export default function Page() {
  return <Dashboard />
}
```

---

## 🔍 Monitoring & Logging

### Server Logs

```javascript
// server.js - Add logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Error logging
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
```

### Client Logs

```typescript
// page.tsx - Safe logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// Remove before production:
// console.log() statements
// debugger statements
```

---

## 📚 Code Style Guidelines

### TypeScript

```typescript
// ✅ Use interfaces for data structures
interface User {
  id: string
  name: string
}

// ✅ Use type annotations
const handleClick = (taskId: string): void => {
  // ...
}

// ✅ Use const for components
const MyComponent: FC<Props> = (props) => {
  return <div>{/* JSX */}</div>
}
```

### CSS

```css
/* ✅ Use Tailwind classes */
<div className="bg-blue-50 rounded-lg shadow-sm p-4">

/* ❌ Avoid inline styles */
<div style={{ backgroundColor: 'blue' }}>
```

### React

```typescript
// ✅ Use hooks
const [state, setState] = useState(initialValue)

// ❌ Avoid class components
class OldComponent extends React.Component { }

// ✅ Use arrow functions
const handleEvent = () => { }

// ✅ Extract logic to custom hooks
const useTaskData = () => {
  const [tasks, setTasks] = useState([])
  // ...
  return { tasks, setTasks }
}
```

---

## 🚀 Building for Production

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build next.js
npm run build

# 3. Build server (if needed)
# No build needed for server.js

# 4. Test production build locally
npm run start

# 5. Deploy
# - Push to Git
# - Deploy to Vercel (Next.js) or custom server
# - Set environment variables on server
```

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [LINE Messaging API](https://developers.line.biz/en/reference/messaging-api/)

---

## 📞 Developer Resources

### Key Contacts
- **Frontend Issues**: Check components/ folder
- **Backend Issues**: Check server.js
- **Data Issues**: Check Google Sheets setup
- **API Issues**: Check API.md documentation

### Debugging Checklist

- [ ] Check console for errors (F12 → Console)
- [ ] Check Network tab for API calls
- [ ] Verify environment variables are set
- [ ] Check .env.local file permissions
- [ ] Restart dev server
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Check TypeScript types with `npm run type-check`

---

## 🎯 Next Development Goals

1. **Database Migration**: Replace Google Sheets with PostgreSQL
2. **Authentication**: Add user login system
3. **API Rate Limiting**: Protect endpoints from abuse
4. **Testing Suite**: Add Jest + React Testing Library
5. **Dark Mode**: Add theme support
6. **Mobile App**: React Native version
7. **Advanced Analytics**: Usage tracking dashboard

---

🚀 **Happy coding!**

Questions? Check the [README.md](./README.md) or [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
