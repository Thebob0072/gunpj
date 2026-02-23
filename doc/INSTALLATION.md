# 📦 Installation Guide

## ข้อกำหนดเบื้องต้น

- **Node.js**: v18 ขึ้นไป
- **npm**: v9 ขึ้นไป หรือ **yarn** v4+
- **Git**: สำหรับ clone repository
- **Text Editor**: VS Code, WebStorm, etc.

---

## Step 1: Download/Clone Project

```bash
# ถ้าเป็น Git repository
git clone https://github.com/yourusername/gunpj.git
cd gunpj

# หรือ download ไฟล์ ZIP มาแล้วแตกออก
cd gunpj
```

---

## Step 2: Install Dependencies

```bash
# ใช้ npm
npm install

# หรือใช้ yarn
yarn install
```

⏳ รอสักครู่ให้โหลดแพ็คเกจทั้งหมด (อาจใช้เวลา 2-5 นาที)

---

## Step 3: Setup Environment Variables

### สร้างไฟล์ .env.local

```bash
# สำเนากำหนดค่าจากไฟล์ example
cp .env.example .env.local
```

### แก้ไขไฟล์ .env.local

```env
# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TELEGRAM_API_URL=http://localhost:3001/api/send-telegram-notification
NEXT_PUBLIC_LINE_API_URL=http://localhost:3001/api/send-line-notification

# Server
FRONTEND_URL=http://localhost:3000
PORT=3001

# Telegram (ไม่บังคับ - ถ้าไม่ใช้ให้ว่างไว้)
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
WEBHOOK_URL=https://yourdomain.com/webhook

# LINE (ไม่บังคับ - ถ้าไม่ใช้ให้ว่างไว้)
LINE_CHANNEL_ACCESS_TOKEN=your_token_here
LINE_CHANNEL_SECRET=your_secret_here
```

---

## Step 4: (Optional) Setup Integrations

### 4.1 Telegram Integration

ดู [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md) เพื่อรายละเอียดเต็ม

```bash
1. ไป Telegram บน @BotFather
2. สร้าง Bot ใหม่
3. คัดลอก Bot Token ไปยัง TELEGRAM_BOT_TOKEN
4. ส่งข้อความถึง bot ของคุณ
5. คัดลอก Chat ID ไปยัง TELEGRAM_CHAT_ID
```

### 4.2 LINE Integration

ดู [LINE_INTEGRATION.md](./LINE_INTEGRATION.md) เพื่อรายละเอียดเต็ม

```bash
1. ไปที่ https://developers.line.biz
2. สร้าง LINE Official Account
3. ตั้ง Messaging API
4. คัดลอก Channel Access Token → LINE_CHANNEL_ACCESS_TOKEN
5. คัดลอก Channel Secret → LINE_CHANNEL_SECRET
6. ตั้ง Webhook URL
```

---

## Step 5: เรียกใช้โปรเจ็ค

### Development Mode

```bash
npm run dev
```

Output จะแสดง:
```
> next dev

  ▲ Next.js 15.4.6
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in 2.3s
```

### เปิด Browser

```
http://localhost:3000
```

---

## Step 6: ตรวจสอบการติดตั้ง

### ✅ Frontend

1. เปิด http://localhost:3000
2. ควรเห็นหน้า "กำหนดงาน"
3. แสดงปุ่ม: รายการ, แดชบอร์ด, เพิ่มงาน, LINE

### ✅ Backend

1. Server.js ควรรันที่ port 3001
2. ดู terminal ของ dev server

```
Server is running on http://localhost:3001
```

### ✅ Database

- ตัวอย่างใช้ Google Sheets (ถ้าติดตั้งแล้ว)
- ถ้ายังไม่ได้ติดตั้ง ให้ดู [troubleshooting](./TROUBLESHOOTING.md)

---

## การโหลดข้อมูลตัวอย่าง

### สร้างข้อมูลตัวอย่าง

ขณะนี้โปรเจ็คจะเก็บข้อมูลใน Google Sheets ดู [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) สำหรับการตั้งค่า

### วิธี Manual

1. เปิด App
2. กด "ปุ่ม +" เพื่อสร้างงานใหม่
3. กรอก: ชื่องาน, ผู้รับผิดชอบ, วันเวลา
4. บันทึก

---

## Production Build

### สร้าง Production Version

```bash
npm run build
```

### เรียกใช้ Production

```bash
npm run start
```

---

## Troubleshooting Installation

| ปัญหา | วิธีแก้ |
|--------|--------|
| `npm install` ค้าง | ลบ node_modules และ package-lock.json, รันใหม่ |
| Port 3000 ใช้ไปแล้ว | ใช้ `PORT=3002 npm run dev` |
| Error: Cannot find module | รัน `npm install` อีกครั้ง |
| `NEXT_PUBLIC_API_URL undefined` | ตรวจสอบ .env.local มี NEXT_PUBLIC_ prefix |
| Telegram/LINE ไม่ทำงาน | ดู [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |

---

## หลังจากติดตั้งเสร็จ

### ขั้นตอนต่อไป

1. ❌ ลบ Google Sheets credentials ที่ไม่ใช้
2. 🔐 เปลี่ยน Environment Variables
3. 📚 อ่าน [API Documentation](./API.md)
4. 🎨 ปรับแต่ง UI ตามต้องการ
5. 🚀 Deploy ไป Production

---

## Update โปรเจ็ค

```bash
# ถ้าเป็น Git repository
git pull origin main

# Update dependencies
npm install
npm run build
npm run start
```

---

## ติดต้องการความช่วยเหลือ?

1. ดู [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. ตรวจสอบ Console Errors
3. อ่าน [Architecture](./ARCHITECTURE.md)

---

**ยินดีต้อนรับเข้าสู่ GUNPJ! 🎉**
