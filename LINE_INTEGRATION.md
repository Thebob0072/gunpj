# 📱 LINE Integration Guide สำหรับ GUNPJ

## 🎯 วัตถุประสงค์

ระบบ GUNPJ สามารถส่งการแจ้งเตือน Task ไปยัง LINE Groups ได้อัตโนมัติ เมื่อ:
- ✅ สร้าง Task ใหม่
- ✅ อัพเดท Task status
- ✅ Assign ผู้รับผิดชอบ
- ✅ ส่งข้อความที่กำหนดเอง

---

## 📋 ขั้นตอนการตั้งค่า (5 ขั้น)

### ขั้นที่ 1: สร้าง LINE Official Account 🆕

**สำเร็จใน 5 นาที:**

1. ไปที่ https://developers.line.biz
2. คลิก "Create account"
3. ลงทะเบียนด้วย Email
4. สร้าง New Channel
   - Channel type: **Messaging API**
   - Channel name: `GUNPJ Bot`
   - Company: ใส่ชื่อ
   - Description: `Task Management Notifications`

---

### ขั้นที่ 2: ได้รับ Credentials 🔑

ไปที่ **Channels > GUNPJ Bot > Basic Settings**

```
✓ Channel ID          : 1234567890 (จดไว้)2009188562
✓ Channel Secret      : abc123def456... (คัดลอก)eea4667fc8b60613cc9b67262beb55ae
```

ไปที่ **Channels > GUNPJ Bot > Messaging API > Channel access token**

```
✓ Channel Access Token: 1A2B3C4D5E6F7G8H9I0J... (คัดลอก)
```

---

### ขั้นที่ 3: ตั้งค่า Webhook URL 🔗

ในส่วน **Messaging API** → ค้นหา "Webhook URL"

```
https://yourdomain.com/api/line-webhook

⚠️ **หากใช้ localhost:**
```
สำหรับการทดสอบ เราต้องใช้ ngrok หรือ server สาธารณะ
```

**ใช้ ngrok (ง่าย):**
```bash
# ติดตั้ง ngrok
brew install ngrok

# รันใน terminal เพิ่มเติม
ngrok http 3001

# จะให้ URL แบบ: https://abc123.ngrok.io
# ใส่ลงใน Webhook URL: https://abc123.ngrok.io/api/line-webhook
```

---

### ขั้นที่ 4: ใส่ Credentials ใน .env.local 📝

```bash
# แก้ไขไฟล์ .env.local
nano .env.local
```

แล้วเพิ่มบรรทัดเหล่านี้:

```bash
# LINE Configuration
LINE_CHANNEL_ACCESS_TOKEN=1A2B3C4D5E6F7G8H9I0J...
LINE_CHANNEL_SECRET=abc123def456...
```

💾 Save ไฟล์ (Ctrl+O, Enter, Ctrl+X)

---

### ขั้นที่ 5: เพิ่มบอทเข้ากลุ่ม LINE 👥

1. เปิด LINE app
2. สร้างกลุ่มใหม่ (หรือเลือกกลุ่มที่มี)
3. ค้นหาบอท GUNPJ ของคุณ (ด้วย QR code หรือ LINE ID)
4. เชิญเข้ากลุ่ม

**บอทจะส่งข้อความแบบนี้:**
```
Bot joined LINE group: Cxxx...
Group ID: Cxxx...
```

---

## 🧪 ทดสอบการเชื่อมต่อ

### วิธีที่ 1: ทดสอบด้วย cURL

```bash
# ได้ Group ID จากบอท เมื่อเข้ากลุ่ม
GROUP_ID="Cxxx..."

curl -X POST http://localhost:3001/api/send-line-notification \
  -H "Content-Type: application/json" \
  -d '{
    "groupId":"'$GROUP_ID'",
    "message":"สวัสดีจากระบบ GUNPJ ✅",
    "taskTitle":"Task Management",
    "assignee":"John Doe"
  }'

# ควรได้ response:
# {"success":true,"message":"Notification sent to LINE group"}
```

### วิธีที่ 2: ส่งจาก Frontend

1. สร้าง Task ใหม่ในระบบ
2. ค่าข้อมูล:
   - **Title**: "Design Database Schema"
   - **Assignee**: "John Doe"
   - **Date**: วันนี้

3. บอทควรส่งข้อความไปยัง LINE group:
```
📌 Design Database Schema

สวัสดीแล้วเข้าระบบมีการอัปเดท Task...

👤 ผู้รับผิดชอบ: John Doe
```

### วิธีที่ 3: ตรวจสอบ Logs

```bash
# ตรวจสอบ logs จากเซิร์ฟเวอร์
tail -n 20 <server-log-file>

# ควรเห็น:
# ✅ LINE notification sent to group: Cxxx...
#    Message: Design Database Schema
```

---

## 📦 API Endpoints ที่ใช้

### 1. ส่งข้อความตามเอกสำหรับ

```http
POST /api/send-line-notification
Content-Type: application/json

{
  "groupId": "Cxxxxxxxxxxxxxxxxxxxxxxxxx",
  "message": "ข้อความที่ต้องการส่ง",
  "taskTitle": "ชื่อ Task (optional)",
  "assignee": "ชื่อผู้รับผิดชอบ (optional)"
}

Response:
{
  "success": true,
  "message": "Notification sent to LINE group"
}
```

### 2. รับ Webhook จาก LINE (อัตโนมัติ)

```http
POST /api/line-webhook

# LINE จะส่ง events เมื่อ:
# - บอทเข้ากลุ่มใหม่
# - ได้รับข้อความ
# - บอทออกจากกลุ่ม
```

### 3. ดึงรายชื่อ Groups

```http
GET /api/line-groups

Response:
{
  "groups": [
    {
      "groupId": "Cxxxxxxxxxxxxxxxxxxxxxxxxx",
      "groupName": "GUNPJ Team",
      "createdAt": "2026-02-20T15:57:04Z"
    }
  ]
}
```

---

## 🔧 ปัญหาที่อาจเจอ

### ❌ "LINE_CHANNEL_ACCESS_TOKEN is not set"

**สาเหตุ**: ไม่ได้ใส่ token ใน .env.local

**แก้ไข**:
```bash
nano .env.local

# เพิ่มบรรทัด:
LINE_CHANNEL_ACCESS_TOKEN=your_token_here
```

**รีสตาร์ทเซิร์ฟเวอร์**:
```bash
pkill -f "node server.js"
node server.js
```

---

### ❌ "Invalid access token"

**สาเหตุ**: Token ไม่ถูกต้อง หรือหมดอายุ

**แก้ไข**:
1. ไปที่ LINE Developers Console
2. สร้าง Token ใหม่
3. ใส่ค่าใหม่ใน .env.local

---

### ❌ "Failed to connect to webhook"

**สาเหตุ**: Webhook URL ไม่ถูกต้องหรือเซิร์ฟเวอร์ปิด

**แก้ไข**:
1. ตรวจสอบว่า `/api/line-webhook` ทำงาน:
```bash
curl http://localhost:3001/api/health
```

2. หากใช้ ngrok ให้สร้าง URL ใหม่:
```bash
ngrok http 3001
# ได้ URL: https://abc123.ngrok.io
# ใส่: https://abc123.ngrok.io/api/line-webhook
```

---

## 📊 Architecture

```
User Creates Task
       ↓
   API POST /api/tasks
       ↓
   Server.js
       ↓
   Tasks.createTask()
       ↓
   MySQL Database
       ↓
   Send LINE Notification
       ↓
   POST to LINE API
       ↓
   Message appears in GROUP
```

---

## 💡 Tips

1. **ได้รับ Group ID**: บอทจะส่ง log เมื่อเข้ากลุ่ม
2. **ทดสอบก่อน Production**: ใช้กลุ่มทดสอบ
3. **Token ควรเก็บ Secret**: ไม่ต้องเก็บไว้ในโค้ด
4. **Webhook ต้องสาธารณะ**: localhost ต้องใช้ ngrok

---

## ✅ Checklist

- [ ] สร้าง LINE Official Account
- [ ] ได้ Channel Access Token
- [ ] ได้ Channel Secret
- [ ] ตั้งค่า Webhook URL (ngrok หรือ domain)
- [ ] ใส่ credentials ใน .env.local
- [ ] รีสตาร์ทเซิร์ฟเวอร์
- [ ] เพิ่มบอทเข้ากลุ่ม LINE
- [ ] ทดสอบส่งข้อความ
- [ ] สร้าง Task และตรวจสอบ notification

---

## 📞 ต้องการความช่วยเหลือ?

1. ตรวจสอบ logs: `npm run dev` ดูข้อความข้อผิดพลาด
2. ทดสอบ API: `curl http://localhost:3001/api/health`
3. ดู LINE Developers Console ตรวจสอบ webhook history

---

**สำเร็จแล้ว! ระบบพร้อมส่ง notification ไป LINE ✅**
