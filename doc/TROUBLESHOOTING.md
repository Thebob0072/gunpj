# 🔧 Troubleshooting Guide

## 🆘 Common Issues & Solutions

---

## 🔴 Frontend Issues

### ❌ "Cannot find module" Error

```
Error: Cannot find module '@/components/LineGroupSelector'
```

**Causes:**
- File not created yet
- Typo in import path
- File in wrong directory

**Solution:**
```bash
# 1. Verify file exists
ls src/components/LineGroupSelector.tsx

# 2. Check import path
// Correct: '@/components/LineGroupSelector'
// Wrong: './components/LineGroupSelector'

# 3. Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ "NEXT_PUBLIC_API_URL is undefined"

```
Warning: NEXT_PUBLIC_API_URL is not set
```

**Causes:**
- Missing `.env.local` file
- Variable name missing `NEXT_PUBLIC_` prefix
- Env file not reloaded

**Solution:**
```bash
# 1. Create .env.local
cp .env.example .env.local

# 2. Check variable has NEXT_PUBLIC_ prefix
NEXT_PUBLIC_API_URL=http://localhost:3001/api ✅
API_URL=http://localhost:3001/api ❌

# 3. Restart dev server
# Ctrl+C
npm run dev
```

---

### ❌ Page keeps loading (spinner forever)

**Causes:**
- API not responding
- Backend server down
- Network error

**Solution:**
```bash
# 1. Check if backend running
curl http://localhost:3001/api/line-groups

# 2. Check server in another terminal
node server.js
# Should show: "Server is running on http://localhost:3001"

# 3. Check Console (F12 → Console tab)
# Look for red errors
```

---

### ❌ "Cannot GET /api/..."

**Causes:**
- Next.js API route not created
- Route file is named wrong
- TypeScript errors

**Solution:**
```bash
# Verify files exist:
ls src/app/api/proxy/route.ts ✅

# Restart dev server
npm run dev

# Check for TypeScript errors
npm run lint
```

---

### ❌ LINE button not showing

**Causes:**
- Component not imported
- Header.tsx not updated
- CSS issue

**Solution:**
```typescript
// In page.tsx, verify import
import LineGroupSelector from '@/components/LineGroupSelector'; ✅

// In Header.tsx, verify prop passed
onOpenLineGroupSelector={() => setIsLineGroupSelectorOpen(true)} ✅

// Verify button code in Header
<button onClick={onOpenLineGroupSelector} ...> ✅
```

---

## 🔴 Backend Issues

### ❌ "Port 3001 already in use"

```
Error: listen EADDRINUSE :::3001
```

**Causes:**
- Another process using port 3001
- Previous server not stopped

**Solution:**
```bash
# Option 1: Kill process on port
lsof -ti:3001 | xargs kill -9

# Option 2: Use different port
PORT=3002 node server.js

# Option 3: Check what's using it
lsof -i :3001
```

---

### ❌ Server starts but no routes work

```
Cannot POST /api/send-telegram-notification
```

**Causes:**
- Routes not defined
- Middleware issue
- Typo in route path

**Solution:**
```javascript
// Verify routes in server.js:
app.post('/api/send-telegram-notification', ...)  ✅
app.post('/api/send-line-notification', ...)      ✅
app.get('/api/line-groups', ...)                  ✅

// Check middleware order
app.use(cors());           // Must be first
app.use(express.json());   // Then parser
app.post('/api/...', ...); // Then routes
```

---

### ❌ Telegram notifications not sending

```
TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set
```

**Causes:**
- Env variables not set
- Wrong formatting
- Quotes around values

**Solution:**
```bash
# .env file should be:
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGhijklmnop ✅

# NOT:
TELEGRAM_BOT_TOKEN="123456789:ABCDEFGhijklmnop" ❌
TELEGRAM_BOT_TOKEN='123456789:ABCDEFGhijklmnop' ❌

# Verify in Node:
console.log(process.env.TELEGRAM_BOT_TOKEN)
```

---

### ❌ LINE notifications not working

**Causes:**
- LINE_CHANNEL_ACCESS_TOKEN not set
- Token expired
- Invalid group ID

**Solution:**
```bash
# 1. Check token in console
node
> console.log(process.env.LINE_CHANNEL_ACCESS_TOKEN)

# 2. Verify token format (long string ~150 chars)

# 3. Test API directly
curl -X POST https://api.line.me/v2/bot/message/push \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"groupId","messages":[{"type":"text","text":"test"}]}'

# 4. If 401: Token invalid/expired
# → Regenerate in LINE Console
```

---

### ❌ Webhook not being called

**Causes:**
- Webhook URL not set in LINE
- Wrong URL format
- HTTPS not used
- Port not exposed

**Solution:**
```bash
# 1. Check webhook URL in LINE Console
Settings → Messaging API → Webhook URL
# Should be: https://your-domain.com/api/line-webhook

# 2. Test webhook (if using ngrok locally)
ngrok http 3001
# Use ngrok URL: https://abc123.ngrok.io/api/line-webhook

# 3. Add webhook URL to .env
NEXT_PUBLIC_LINE_WEBHOOK_URL=https://your-domain.com/api/line-webhook

# 4. Verify webhook is enabled
# In LINE Console: Webhook toggle must be ON
```

---

## 🟡 Data Issues

### ❌ Tasks not saving

**Causes:**
- Backend not configured
- Database connection error
- API endpoint not working

**Solution:**
```bash
# 1. Check if backend routes work
curl -X POST http://localhost:3001/api/send-telegram-notification \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# 2. Check server.js for errors
# Look at terminal where you ran: node server.js

# 3. Check if Google Sheets connected
# Verify credentials are set up
```

---

### ❌ LINE groups not showing

**Causes:**
- Bot not added to group
- Group ID not stored
- API request failed

**Solution:**
```bash
# 1. Manually add bot to group
LINE app → Add bot ID → Select group

# 2. Check if webhook was triggered
# Look at server logs when bot joins

# 3. Verify /api/line-groups works
curl http://localhost:3001/api/line-groups

# 4. Check browser console for errors
# F12 → Console → Look for red errors
```

---

### ❌ "Members showing 0"

**Causes:**
- Bot just added (needs webhook)
- Group ID wrong
- API rate limiting

**Solution:**
```bash
# 1. Wait 5-10 seconds after adding bot

# 2. Refresh the app

# 3. Check member fetch API
curl http://localhost:3001/api/line-group-members/C123...

# 4. Check server logs for "fetch members" message
```

---

## 🟡 Performance Issues

### ⚠️ App is slow / freezing

**Causes:**
- Large dataset
- Unoptimized components
- Network latency

**Solution:**
```typescript
// 1. Check React DevTools Profiler
// F12 → Components → Profiler → Record

// 2. Look for:
// - Unnecessary re-renders
// - Long lists (100+ items)
// - Heavy computations

// 3. Optimize:
// Use useMemo for expensive calculations
// Use memo() for list components
// Implement pagination
```

---

### ⚠️ API calls taking long time

**Causes:**
- Network slow
- Server overloaded
- Large database

**Solution:**
```bash
# 1. Check network tab (F12 → Network)
# - Red items = failed requests
# - Long bars = slow requests

# 2. Test API directly
time curl http://localhost:3001/api/line-groups
# Should be < 500ms

# 3. Check server performance
# top → Look for high CPU/memory
```

---

## 🔵 Deployment Issues

### ❌ Works locally, not in production

**Causes:**
- Environment variables not set
- CORS configuration
- HTTPS/SSL issues
- Port mismatch

**Solution:**
```bash
# 1. Set environment variables on server
# Check: echo $NEXT_PUBLIC_API_URL

# 2. Update CORS origin
# In server.js:
app.use(cors({
  origin: 'https://your-domain.com'  // Production domain
}))

# 3. Verify HTTPS
# Test with: curl -I https://your-domain.com

# 4. Check ports
# Frontend: 3000
# Backend: 3001
# Both accessible from internet?: YES
```

---

### ❌ "Mixed content" error

```
Blocked loading mixed content from 'http://...' from 'https://...'
```

**Causes:**
- Trying to load HTTP from HTTPS page
- API URL is http:// but site is https://

**Solution:**
```env
# In production .env:
NEXT_PUBLIC_API_URL=https://your-domain.com/api  ✅
# NOT:
NEXT_PUBLIC_API_URL=http://your-domain.com/api   ❌
```

---

## 🧪 Debugging Tips

### Enable Debug Logging

```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

### Check Console Errors

```javascript
// Browser Console (F12)
// Frontend errors in red

// Terminal 1 (npm run dev)
// Next.js errors in yellow/red

// Terminal 2 (node server.js)
// Backend errors in yellow/red
```

### Use Network Tab

```
F12 → Network tab → Do action
→ Look for failed requests (red)
→ Click request → Response tab
→ See error details
```

### Testing APIs with Postman

```
1. Download Postman
2. Create POST request
3. URL: http://localhost:3001/api/send-telegram-notification
4. Headers: Content-Type: application/json
5. Body: {"message":"test"}
6. Click Send
7. See response
```

---

## 📞 Getting Help

### Before asking for help, check:

1. ✅ All environment variables set
2. ✅ Both servers running (dev server + node server.js)
3. ✅ No errors in console (F12)
4. ✅ Firewall not blocking ports
5. ✅ Latest code from repository

### Debugging checklist:

```
[ ] Backend server running?         node server.js
[ ] Frontend server running?         npm run dev
[ ] .env.local file exists?          ls .env.local
[ ] PORT 3000 free?                  lsof -i :3000
[ ] PORT 3001 free?                  lsof -i :3001
[ ] No red errors in console?        F12 → Console
[ ] Network requests succeeding?     F12 → Network
[ ] Git repo up to date?             git pull
```

---

## 📊 Common Error Codes

| Error | Meaning | Fix |
|-------|---------|-----|
| 400 Bad Request | Invalid input | Check request format |
| 404 Not Found | Route doesn't exist | Check path |
| 500 Server Error | Server crashed | Check server logs |
| 401 Unauthorized | Credentials invalid | Regenerate tokens |
| 429 Too Many | Rate limited | Wait & retry |
| CORS Error | Cross-origin blocked | Check CORS config |

---

## 🚀 Performance Checklist

- [ ] Memoize expensive components
- [ ] Use pagination for long lists
- [ ] Optimize images
- [ ] Cache data locally
- [ ] Lazy load components
- [ ] Remove console.log() in production
- [ ] Enable gzip compression

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [React Dev Tools](https://react-devtools-tutorial.vercel.app/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**Still stuck? Check:**
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [LINE Integration](./LINE_INTEGRATION.md)
- [GitHub Issues](https://github.com/yourusername/gunpj/issues)
