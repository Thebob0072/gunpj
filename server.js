const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const { Tasks, Assignees, LineGroups, LineMembers } = require('./db-mysql');

// Load environment variables from .env file
dotenv.config();

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

// Store raw body BEFORE parsing
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/line-webhook') {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      req.rawBody = data;
      // Convert string to buffer for parsing
      req._body = Buffer.from(data);
      next();
    });
  } else {
    next();
  }
});

// Regular JSON parser for all routes
app.use(express.json());

// Webhook signature verification middleware for LINE
function verifyLineSignature(req, res, next) {
  const signature = req.get('X-Line-Signature');
  const secret = LINE_CHANNEL_SECRET;
  const body = req.rawBody || '';
  
  console.log('🔍 Checking signature. Body length:', body.length);
  console.log('   Body:', body.slice(0, 100));
  console.log('   Signature header:', signature);
  
  if (!signature || !secret || !body) {
    console.log('❌ Missing signature, secret, or body');
    return res.status(403).json({ message: 'Forbidden' });
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  console.log('   Expected hash:', signature);
  console.log('   Computed hash:', hash);
  
  if (hash !== signature) {
    console.log('❌ Signature mismatch');
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  console.log('✅ Signature verified');
  next();
}

// Use cors to allow requests from your React app
// FRONTEND_URL can be comma-separated for multiple origins
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Allow all vercel.app preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // Allow any custom domain ending in audithebob.art
    if (origin.endsWith('audithebob.art') || origin === 'https://audithebob.art') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Set UTF-8 charset for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// =============================================
// ACTION-BASED API (For frontend compatibility)
// =============================================

app.post('/api/proxy', async (req, res) => {
  const { action, task, id, assignee, type } = req.body;

  try {
    // Handle task actions
    if (action === 'createTask') {
      const newTask = {
        id: uuidv4(),
        ...task
      };
      const created = await Tasks.createTask(newTask);
      return res.status(201).json({ task: created });
    }

    if (action === 'updateTask') {
      const updated = await Tasks.updateTask(task.id, task);
      return res.status(200).json({ task: updated });
    }

    if (action === 'deleteTask') {
      await Tasks.deleteTask(id);
      return res.status(200).json({ success: true });
    }

    if (action === 'update' || action === 'updateTask') {
      const updated = await Tasks.updateTask(task.id, task);
      return res.status(200).json({ task: updated });
    }

    // Handle assignee actions
    if (action === 'createAssignee') {
      const newAssignee = {
        id: uuidv4(),
        ...assignee
      };
      const created = await Assignees.createAssignee(newAssignee);
      return res.status(201).json({ assignee: created });
    }

    if (action === 'updateAssignee') {
      const updated = await Assignees.updateAssignee(assignee.id, assignee);
      return res.status(200).json({ assignee: updated });
    }

    if (action === 'deleteAssignee') {
      await Assignees.deleteAssignee(id);
      return res.status(200).json({ success: true });
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Error handling action:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint for fetching lists (for frontend compatibility)
app.get('/api/proxy', async (req, res) => {
  try {
    const { type, groupId } = req.query;

    if (type === 'tasks') {
      const tasks = await Tasks.getAllTasks();
      return res.status(200).json(tasks);
    }

    if (type === 'assignees') {
      const assignees = await Assignees.getAllAssignees();
      return res.status(200).json(assignees);
    }

    if (type === 'line-groups') {
      const groups = await LineGroups.getAllGroups();
      return res.status(200).json({ groups });
    }

    if (type === 'line-members' && groupId) {
      const members = await LineMembers.getMembersByGroupId(groupId);
      return res.status(200).json(members);
    }

    res.status(400).json({ error: 'Invalid type parameter' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mirror the proxy endpoint at /api for frontend compatibility
app.get('/api', async (req, res) => {
  try {
    const { type, groupId } = req.query;

    if (type === 'tasks') {
      const tasks = await Tasks.getAllTasks();
      return res.status(200).json(tasks);
    }

    if (type === 'assignees') {
      const assignees = await Assignees.getAllAssignees();
      return res.status(200).json(assignees);
    }

    if (type === 'line-groups') {
      const groups = await LineGroups.getAllGroups();
      return res.status(200).json({ groups });
    }

    if (type === 'line-members' && groupId) {
      const members = await LineMembers.getMembersByGroupId(groupId);
      return res.status(200).json(members);
    }

    res.status(400).json({ error: 'Invalid type parameter' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// TASK ENDPOINTS
// =============================================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Tasks.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Tasks.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, details, assignee, startDate, endDate, startTime, endTime, status } = req.body;

    if (!title || !assignee || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTask = {
      id: uuidv4(),
      title,
      details,
      assignee,
      startDate,
      endDate,
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      status: status || 'To Do'
    };

    const task = await Tasks.createTask(newTask);
    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Tasks.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await Tasks.updateTask(req.params.id, {
      title: req.body.title || task.title,
      details: req.body.details || task.details,
      assignee: req.body.assignee || task.assignee,
      startDate: req.body.startDate || task.startDate,
      endDate: req.body.endDate || task.endDate,
      startTime: req.body.startTime || task.startTime,
      endTime: req.body.endTime || task.endTime,
      status: req.body.status || task.status
    });

    res.status(200).json({ task: updatedTask, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Tasks.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Tasks.deleteTask(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =============================================
// ASSIGNEE ENDPOINTS
// =============================================

// Get all assignees
app.get('/api/assignees', async (req, res) => {
  try {
    const assignees = await Assignees.getAllAssignees();
    res.status(200).json(assignees);
  } catch (error) {
    console.error('Error fetching assignees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single assignee
app.get('/api/assignees/:id', async (req, res) => {
  try {
    const assignee = await Assignees.getAssigneeById(req.params.id);
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee not found' });
    }
    res.status(200).json(assignee);
  } catch (error) {
    console.error('Error fetching assignee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create assignee
app.post('/api/assignees', async (req, res) => {
  try {
    const { name, position, role } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if assignee already exists
    const existing = await Assignees.getAssigneeByName(name);
    if (existing) {
      return res.status(400).json({ error: 'Assignee already exists' });
    }

    const newAssignee = {
      id: uuidv4(),
      name,
      position,
      role
    };

    const assignee = await Assignees.createAssignee(newAssignee);
    res.status(201).json({ assignee, message: 'Assignee created successfully' });
  } catch (error) {
    console.error('Error creating assignee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update assignee
app.put('/api/assignees/:id', async (req, res) => {
  try {
    const assignee = await Assignees.getAssigneeById(req.params.id);
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee not found' });
    }

    const updatedAssignee = await Assignees.updateAssignee(req.params.id, {
      name: req.body.name || assignee.name,
      position: req.body.position || assignee.position,
      role: req.body.role || assignee.role
    });

    res.status(200).json({ assignee: updatedAssignee, message: 'Assignee updated successfully' });
  } catch (error) {
    console.error('Error updating assignee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete assignee
app.delete('/api/assignees/:id', async (req, res) => {
  try {
    const assignee = await Assignees.getAssigneeById(req.params.id);
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee not found' });
    }

    await Assignees.deleteAssignee(req.params.id);
    res.status(200).json({ message: 'Assignee deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =============================================
// TELEGRAM ENDPOINTS
// =============================================

// Set the webhook URL in Telegram
const setTelegramWebhook = async () => {
  if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_URL) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN or WEBHOOK_URL is not set. Skipping webhook setup.');
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
      console.log('✅ Telegram webhook set:', WEBHOOK_URL);
    } else {
      console.error('❌ Failed to set Telegram webhook:', result.description);
    }
  } catch (error) {
    console.error('Error setting Telegram webhook:', error);
  }
};

// Send Telegram notification
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send Telegram notification:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    console.log('✅ Telegram notification sent');
    res.status(200).json({ success: true, message: 'Notification sent.' });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Telegram webhook endpoint
app.post('/webhook', (req, res) => {
  if (req.body.message && req.body.message.chat && req.body.message.chat.id) {
    const chatId = req.body.message.chat.id;
    console.log('-------------------------------------------');
    console.log('Found Telegram Chat ID:', chatId);
    console.log('Please copy this ID and set it in TELEGRAM_CHAT_ID');
    console.log('-------------------------------------------');
  }
  res.sendStatus(200);
});

// =============================================
// LINE ENDPOINTS
// =============================================

// Get LINE groups
app.get('/api/line-groups', async (req, res) => {
  try {
    const groups = await LineGroups.getAllGroups();
    res.status(200).json({ groups });
  } catch (error) {
    console.error('Error fetching LINE groups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get LINE group members
app.get('/api/line-group-members/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await LineMembers.getMembersByGroupId(groupId);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching LINE group members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all LINE groups with their members
app.get('/api/line-groups-with-members', async (req, res) => {
  try {
    const groups = await LineGroups.getAllGroups();
    
    // For each group, fetch its members
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await LineMembers.getMembersByGroupId(group.groupId);
        return {
          groupId: group.groupId,
          groupName: group.groupName,
          memberCount: members.length,
          members: members
        };
      })
    );
    
    res.status(200).json({ groups: groupsWithMembers });
  } catch (error) {
    console.error('Error fetching LINE groups with members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sync members to a group - Manual entry
app.post('/api/groups/:groupId/members/sync', async (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body; // members = [{ userId, displayName, pictureUrl }, ...]

  if (!groupId || !Array.isArray(members)) {
    return res.status(400).json({ error: 'groupId and members array are required' });
  }

  try {
    // Add each member to the database
    for (const member of members) {
      if (member.userId && member.displayName) {
        await LineMembers.addMember(
          groupId,
          member.userId,
          member.displayName,
          member.pictureUrl || ''
        );
      }
    }

    console.log(`✅ Synced ${members.length} members to group ${groupId}`);
    
    // Return updated group with members
    const updatedMembers = await LineMembers.getMembersByGroupId(groupId);
    return res.status(200).json({
      success: true,
      message: `Added ${members.length} members`,
      groupId: groupId,
      memberCount: updatedMembers.length,
      members: updatedMembers
    });
  } catch (error) {
    console.error('Error syncing members:', error);
    res.status(500).json({ error: 'Failed to sync members' });
  }
});

// Sync ALL members from LINE group using getGroupMemberIds API
app.post('/api/groups/:groupId/members/sync-all', async (req, res) => {
  const { groupId } = req.params;
  try {
    // Step 1: Get all member IDs from LINE API (paginated)
    let memberIds = [];
    let start = null;
    do {
      const url = `${LINE_MESSAGING_API}/group/${groupId}/members/ids` + (start ? `?start=${start}` : '');
      const idsRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
      });
      if (!idsRes.ok) {
        const err = await idsRes.text();
        return res.status(500).json({ error: 'LINE API error: ' + err });
      }
      const idsData = await idsRes.json();
      memberIds = memberIds.concat(idsData.memberIds || []);
      start = idsData.next || null;
    } while (start);

    console.log(`👥 Found ${memberIds.length} members in group ${groupId}`);

    // Step 2: Fetch profile for each member
    const results = [];
    for (const userId of memberIds) {
      try {
        const profileRes = await fetch(`${LINE_MESSAGING_API}/group/${groupId}/member/${userId}`, {
          headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          await LineMembers.addMember(groupId, userId, profile.displayName || userId, profile.pictureUrl || '');
          results.push({ userId, displayName: profile.displayName, status: 'added' });
        } else {
          await LineMembers.addMember(groupId, userId, userId, '');
          results.push({ userId, status: 'id_only' });
        }
      } catch (e) {
        results.push({ userId, status: 'error', reason: e.message });
      }
    }

    const updatedMembers = await LineMembers.getMembersByGroupId(groupId);
    res.json({ success: true, total: memberIds.length, results, members: updatedMembers });
  } catch (error) {
    console.error('Error syncing members:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-fix member names: fetch profile from LINE for members with missing/userId-style names
app.post('/api/groups/:groupId/members/fix-names', async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const members = await LineMembers.getMembersByGroupId(groupId);
    
    // Find members whose displayName looks like a userId (starts with 'U' and is 33 chars)
    // or is empty/null
    const membersToFix = members.filter(m => 
      !m.displayName || 
      m.displayName === m.userId || 
      /^U[0-9a-f]{32}$/.test(m.displayName)
    );
    
    console.log(`🔧 Found ${membersToFix.length}/${members.length} members needing name fix`);
    
    const results = [];
    for (const member of membersToFix) {
      try {
        // Try to get profile from LINE API (works if user has friended the bot)
        const profileRes = await fetch(`${LINE_MESSAGING_API}/profile/${member.userId}`, {
          headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
        });
        
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.displayName) {
            await LineMembers.addMember(groupId, member.userId, profile.displayName, profile.pictureUrl || '');
            console.log(`  ✅ Fixed: ${member.userId} → ${profile.displayName}`);
            results.push({ userId: member.userId, displayName: profile.displayName, status: 'fixed' });
          }
        } else {
          // Try group member profile endpoint
          const groupProfileRes = await fetch(`${LINE_MESSAGING_API}/group/${groupId}/member/${member.userId}`, {
            headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
          });
          if (groupProfileRes.ok) {
            const profile = await groupProfileRes.json();
            if (profile.displayName) {
              await LineMembers.addMember(groupId, member.userId, profile.displayName, profile.pictureUrl || '');
              console.log(`  ✅ Fixed via group endpoint: ${member.userId} → ${profile.displayName}`);
              results.push({ userId: member.userId, displayName: profile.displayName, status: 'fixed' });
            }
          } else {
            console.log(`  ⚠️  Cannot fetch profile for ${member.userId} - user not friend with bot`);
            results.push({ userId: member.userId, status: 'unfetchable', reason: 'User has not added bot as friend' });
          }
        }
      } catch (err) {
        console.log(`  ❌ Error for ${member.userId}:`, err.message);
        results.push({ userId: member.userId, status: 'error', reason: err.message });
      }
    }
    
    const updatedMembers = await LineMembers.getMembersByGroupId(groupId);
    res.status(200).json({
      success: true,
      fixed: results.filter(r => r.status === 'fixed').length,
      unfetchable: results.filter(r => r.status === 'unfetchable').length,
      results,
      members: updatedMembers
    });
  } catch (error) {
    console.error('Error fixing member names:', error);
    res.status(500).json({ error: 'Failed to fix member names' });
  }
});

// LINE webhook
app.post('/api/line-webhook', verifyLineSignature, (req, res) => {
  // Return 200 OK immediately (synchronously!) to LINE
  res.status(200).json({ message: 'OK' });
  
  // Parse JSON from rawBody since we intercepted it
  let body;
  try {
    body = JSON.parse(req.rawBody);
  } catch (e) {
    console.log('❌ Failed to parse JSON:', e.message);
    return;
  }
  
  const events = Array.isArray(body.events) ? body.events : [];
  
  // Log the event
  console.log('📨 LINE Webhook received:', events.length, 'events');

  // Process events and wait for all to complete
  Promise.all(events.map(async (event) => {
    try {
      console.log('Processing event:', event.type);
      
      if (event.type === 'join' && event.source?.type === 'group' && event.source?.groupId) {
        const groupId = event.source.groupId;
        console.log('✅ Bot joining group:', groupId);
        
        // Fetch group name from LINE API
        try {
          const groupSummary = await fetch(`${LINE_MESSAGING_API}/group/${groupId}/summary`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            }
          });
          
          const groupData = await groupSummary.json();
          const groupName = groupData.groupName || 'Group ' + groupId.slice(0, 10);
          
          console.log('📱 Group name:', groupName);
          
          // Store in database with real group name
          await LineGroups.createGroup(groupId, groupName);
          console.log('✅ Group saved to DB:', groupId, '-', groupName);
          
          // Send welcome message to group
          try {
            await fetch(`${LINE_MESSAGING_API}/message/push`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: groupId,
                messages: [
                  {
                    type: 'text',
                    text: '🎉 Bot เข้า Group สำเร็จแล้ว!\n\n📌 สมาชิกของ group จะแสดงในแอปพลิเคชันโดยอัตโนมัติเมื่อมีคนเข้า group ใหม่\n\nคุณสามารถสร้างงานและมอบหมายให้คนในกลุ่มได้ 👥'
                  }
                ]
              })
            });
            console.log('✅ Welcome message sent to group');
          } catch (error) {
            console.log('⚠️  Could not send welcome message:', error.message);
          }
          
          // ℹ️ Note: LINE Bot API doesn't support getting all group members directly
          // Members will be tracked via memberJoined/memberLeft webhook events
        } catch (error) {
          console.log('⚠️  Could not fetch group name:', error.message);
          // Fallback to basic name if API fails
          await LineGroups.createGroup(groupId, 'Group ' + groupId.slice(0, 10));
          console.log('✅ Group saved to DB (fallback):', groupId);
        }
      }
      
      // Handle memberJoined events
      if (event.type === 'memberJoined' && event.source?.type === 'group' && event.source?.groupId) {
        const groupId = event.source.groupId;
        console.log('👥 Member(s) joined group:', groupId);
        
        if (Array.isArray(event.joined?.members)) {
          for (const member of event.joined.members) {
            console.log('  👤 Member object:', JSON.stringify(member));
            let displayName = member.displayName;
            let pictureUrl = member.pictureUrl;
            
            // If displayName is missing, fetch from LINE API
            if (!displayName && member.userId) {
              try {
                const userProfile = await fetch(`${LINE_MESSAGING_API}/profile/${member.userId}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                  }
                });
                const profileData = await userProfile.json();
                console.log('  📱 API Response:', JSON.stringify(profileData));
                displayName = profileData.displayName || member.userId;
                pictureUrl = profileData.pictureUrl || '';
                console.log('  📱 Fetched profile:', displayName);
              } catch (error) {
                console.log('  ⚠️  Could not fetch user profile, error:', error.message, 'using userId:', member.userId);
                displayName = member.userId;
              }
            }
            
            console.log('  - Adding member:', displayName);
            await LineMembers.addMember(groupId, member.userId, displayName, pictureUrl || '');
          }
          console.log('✅ New members added to DB');
        }
      }
      
      // Handle follow event - Auto capture user info
      if (event.type === 'follow' && event.source?.type === 'user' && event.source?.userId) {
        const userId = event.source.userId;
        console.log('👤 User followed bot:', userId);
        
        // Fetch user profile from LINE API
        try {
          const userProfile = await fetch(`${LINE_MESSAGING_API}/profile/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            }
          });
          
          const profileData = await userProfile.json();
          console.log('📱 User profile:', profileData.displayName);
          
          // Send welcome message to user
          try {
            await fetch(`${LINE_MESSAGING_API}/message/push`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: userId,
                messages: [
                  {
                    type: 'text',
                    text: `👋 สวัสดี ${profileData.displayName}!\n\nยินดีต้อนรับสู่ระบบจัดการงาน นกฮูก 🦉\n\nเพื่อเพิ่มคุณเข้าในกลุ่มสั่งงาน โปรดรอการเชิญจากเจ้าของกลุ่ม`
                  }
                ]
              })
            });
          } catch (error) {
            console.log('⚠️  Could not send welcome message to user:', error.message);
          }
        } catch (error) {
          console.log('⚠️  Could not fetch user profile:', error.message);
        }
      }
      
      // Handle memberLeft events
      if (event.type === 'memberLeft' && event.source?.type === 'group' && event.source?.groupId) {
        const groupId = event.source.groupId;
        console.log('🚫 Member(s) left group:', groupId);
        // Could implement member removal logic here
      }
      
      // Handle postback from LINE buttons
      if (event.type === 'postback' && event.postback?.data) {
        console.log('📮 Postback received:', event.postback.data);
        const data = new URLSearchParams(event.postback.data);
        const action = data.get('action');
        const taskId = data.get('taskId');
        
        if (action === 'complete' && taskId) {
          try {
            // Update task status to Completed
            const task = await Tasks.getTaskById(taskId);
            if (task) {
              const updatedTask = await Tasks.updateTask(taskId, {
                ...task,
                status: 'Completed'
              });
              console.log('✅ Task marked as complete from LINE:', taskId);
              
              // Send confirmation message
              try {
                await fetch(`${LINE_MESSAGING_API}/message/push`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    to: event.source.groupId,
                    messages: [
                      {
                        type: 'text',
                        text: `✅ งาน "${task.title}" ทำเสร็จแล้ว! 🎉\nผู้รับผิดชอบ: ${task.assignee}`
                      }
                    ]
                  })
                });
              } catch (err) {
                console.log('⚠️ Could not send confirmation:', err.message);
              }
            }
          } catch (err) {
            console.log('⚠️ Error completing task:', err.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing event:', error.message);
      // Don't throw - just log it
    }
  })).catch(err => {
    console.error('❌ Error processing webhook events:', err.message);
  });
});

// Send LINE notification
app.post('/api/send-line-notification', async (req, res) => {
  const { groupId, message, taskTitle, assignee, taskId } = req.body;

  if (!groupId || !message) {
    return res.status(400).json({ error: 'groupId and message are required' });
  }

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not set' });
  }

  try {
    // Create a Flex Message with better formatting and buttons
    const payload = {
      to: groupId,
      messages: [
        {
          type: 'flex',
          altText: `📌 ${taskTitle || 'Task Update'} - ผู้รับผิดชอบ: ${assignee}`,
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '📌 งานใหม่',
                  weight: 'bold',
                  color: '#FF6B35',
                  size: 'lg'
                }
              ],
              backgroundColor: '#FFF3E0'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: taskTitle || 'Task Update',
                  weight: 'bold',
                  size: 'xl',
                  wrap: true
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  margin: 'md',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'box',
                      layout: 'vertical',
                      spacing: 'xs',
                      contents: [
                        {
                          type: 'text',
                          text: '⏱️ เวลา',
                          size: 'sm',
                          color: '#999999'
                        },
                        {
                          type: 'text',
                          text: message,
                          size: 'sm',
                          wrap: true
                        }
                      ]
                    }
                  ]
                },
                {
                  type: 'separator',
                  margin: 'md'
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  margin: 'md',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '👤 ผู้รับผิดชอบ',
                      size: 'sm',
                      color: '#999999'
                    },
                    {
                      type: 'box',
                      layout: 'baseline',
                      margin: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: assignee,
                          weight: 'bold',
                          size: 'lg',
                          color: '#FF6B35',
                          flex: 0
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  height: 'sm',
                  action: {
                    type: 'postback',
                    label: '✅ จบงาน',
                    data: `action=complete&taskId=${taskId || ''}`
                  },
                  color: '#17C950'
                },
                {
                  type: 'button',
                  style: 'secondary',
                  height: 'sm',
                  action: {
                    type: 'uri',
                    label: '📱 ดูรายละเอียด',
                    uri: process.env.FRONTEND_URL || 'http://localhost:3000'
                  },
                  color: '#FF6B35'
                }
              ],
              flex: 0
            }
          }
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

    console.log('✅ LINE notification sent to group:', groupId);
    res.status(200).json({ success: true, message: 'Notification sent to LINE group' });
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get LINE group members
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

    // Store members in database
    await LineMembers.clearGroupMembers(groupId);
    for (const [index, id] of memberIds.entries()) {
      await LineMembers.addMember(groupId, id, `Member ${index + 1}`, '');
    }

    const members = await LineMembers.getMembersByGroupId(groupId);

    res.status(200).json({
      groupId,
      memberCount: memberIds.length,
      members: members.slice(0, 20)
    });
  } catch (error) {
    console.error('Error fetching LINE group members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =============================================
// HEALTH CHECK
// =============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// =============================================
// START SERVER
// =============================================

app.listen(port, () => {
  console.log(`\n🚀 Server is running on http://localhost:${port}`);
  console.log('✅ Database is connected and tables initialized');
  console.log('📊 API Endpoints:');
  console.log('   GET    /api/tasks');
  console.log('   POST   /api/tasks');
  console.log('   PUT    /api/tasks/:id');
  console.log('   DELETE /api/tasks/:id');
  console.log('   GET    /api/assignees');
  console.log('   POST   /api/assignees');
  console.log('   PUT    /api/assignees/:id');
  console.log('   DELETE /api/assignees/:id');
  console.log('   GET    /api/line-groups');
  console.log('   GET    /api/line-groups-with-members');
  console.log('   GET    /api/line-group-members/:groupId');
  console.log('   GET    /api/health\n');
  setTelegramWebhook();
});
