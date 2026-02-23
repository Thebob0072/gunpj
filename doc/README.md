# 📋 GUNPJ - Task Management System Documentation

> ระบบจัดการงานอัจฉริยะพร้อม Telegram & LINE Integration

## 🎯 ภาพรวม

**GUNPJ** เป็นแอปพลิเคชันจัดการงาน (Task Management) ที่ช่วยทีมงานในการ:
- ✅ สร้าง แก้ไข ลบ งาน
- 👥 มอบหมายงานให้สมาชิก
- 📅 ตั้งกำหนดเวลา และติดตามความคืบหน้า
- 🔔 ส่งแจ้งเตือน ผ่าน Telegram & LINE Group
- 📊 ดูสรุปสถิติ ผ่าน Dashboard

---

## 📚 เอกสาร

| เอกสาร | คำอธิบาย |
|--------|---------|
| [Architecture](./ARCHITECTURE.md) | โครงสร้างระบบและการออกแบบ |
| [Installation Guide](./INSTALLATION.md) | วิธีติดตั้งและตั้งค่า |
| [Project Structure](./PROJECT_STRUCTURE.md) | โครงสร้างโฟลเดอร์และไฟล์ |
| [API Documentation](./API.md) | API Endpoints ทั้งหมด |
| [LINE Integration](./LINE_INTEGRATION.md) | วิธีเชื่อมต่อ LINE |
| [Telegram Integration](./TELEGRAM_INTEGRATION.md) | วิธีเชื่อมต่อ Telegram |
| [Troubleshooting](./TROUBLESHOOTING.md) | แก้ปัญหาทั่วไป |
| [Development](./DEVELOPMENT.md) | แนวทางการพัฒนา |

---

## ⚡ ด่วนเริ่มต้น

### ข้อกำหนด
- Node.js 18+
- npm หรือ yarn
- Telegram Bot Token (optional)
- LINE Channel Access Token (optional)

### การติดตั้งพื้นฐาน
```bash
# 1. Clone/Download project
cd gunpj

# 2. Install dependencies
npm install

# 3. ตั้งค่า Environment Variables
cp .env.example .env.local

# 4. เพิ่ม credentials (Telegram/LINE)
# แก้ไขไฟล์ .env.local

# 5. รันโปรเจ็ค
npm run dev

# 6. เปิด browser
# http://localhost:3000
```

---

## 🏗️ โครงสร้างหลัก

```
gunpj/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── helpers/      # Utility functions
│   └── types/        # TypeScript types
├── doc/              # Documentation
├── server.js         # Express backend
├── package.json      # Dependencies
└── .env.example      # Environment template
```

ดู [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) สำหรับรายละเอียดเต็ม

---

## 🔧 Technology Stack

### Frontend
- **Next.js 15** - React Framework
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Material-UI (MUI)** - Components
- **Recharts** - Charts & Graphs

### Backend
- **Express.js** - Server
- **Node.js** - Runtime
- **CORS** - Cross-Origin Support

### Integrations
- **Telegram Bot API** - Notifications
- **LINE Messaging API** - Notifications
- **Google Sheets** - Data Storage

---

## 🚀 ฟีเจอร์หลัก

### 1. Task Management
- สร้าง/แก้ไข/ลบงาน
- กำหนดวันเวลา เริ่ม-สิ้นสุด
- เพิ่มรายละเอียด (details)
- ตั้งสถานะ: To Do → In Progress → Completed

### 2. Assignment & Responsibility
- เลือกผู้รับผิดชอบแต่ละงาน
- เพิ่มผู้รับผิดชอบใหม่
- จัดการรายชื่อ

### 3. Notifications
- **Telegram**: ส่งแจ้งเตือนไปยังช่วง Chat ID
- **LINE**: ส่งไปยัง LINE Group (≤ 20 คน)
- ข้อความอัตโนมัติเมื่อ: สร้าง/แก้ไข/เสร็จสิ้น

### 4. Dashboard
- แสดงจำนวนงาน (ทั้งหมด/กำลังทำ/เสร็จ)
- กราฟแสดงงานเสร็จรายเดือน
- สรุปความคืบหน้า

### 5. Time Management
- ปฎิทิน (React Calendar)
- เลือกเวลา (30 นาที interval)
- แปลงเป็นวันที่ภาษาไทย
- นับถอยหลัง (countdown) เวลาเหลือ

---

## 📱 Workflow ตัวอย่าง

```
1. Admin ดูรายการงาน
   ↓
2. คลิก "ปุ่ม +" เพื่อสร้างงานใหม่
   ↓
3. กรอก: ชื่อ, ผู้รับผิดชอบ, วันเวลา
   ↓
4. บันทึก
   ↓
5. Telegram & LINE Group ได้รับแจ้งเตือน
   ↓
6. ทีมงานทำงาน
   ↓
7. Admin คลิก "✓ เสร็จสิ้น"
   ↓
8. Telegram & LINE ตรวจสอบสถานะ
```

---

## 🔑 Environment Variables

```env
# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TELEGRAM_API_URL=http://localhost:3001/api/send-telegram-notification
NEXT_PUBLIC_LINE_API_URL=http://localhost:3001/api/send-line-notification

# Telegram
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
WEBHOOK_URL=https://yourdomain.com/webhook

# LINE
LINE_CHANNEL_ACCESS_TOKEN=your_token
LINE_CHANNEL_SECRET=your_secret

# Server
FRONTEND_URL=http://localhost:3000
PORT=3001
```

---

## 📖 เอกสารเพิ่มเติม

- [วิธีติดตั้งทั้งหมด](./INSTALLATION.md)
- [API Reference](./API.md)
- [LINE Integration ขั้นตอนโดยละเอียด](./LINE_INTEGRATION.md)
- [Telegram Integration](./TELEGRAM_INTEGRATION.md)
- [แก้ปัญหา](./TROUBLESHOOTING.md)

---

## 💻 Development

### Commands
```bash
npm run dev       # เรียก dev server
npm run build     # build production
npm run start     # run production
npm run lint      # lint error checking
```

### Code Quality
- ✅ TypeScript สำหรับ type safety
- ✅ Removed console.log debug statements
- ✅ Proper error handling
- ✅ Consistent Content-Type headers
- ✅ Input validation

---

## 🤝 Contribution

เข้าร่วมพัฒนาโปรเจ็ค:
1. Clone repository
2. สร้าง feature branch: `git checkout -b feature/name`
3. Commit: `git commit -m "Add: description"`
4. Push: `git push origin feature/name`
5. สร้าง Pull Request

---

## ⚠️ หมายเหตุ

- **In-memory Storage**: ปัจจุบันข้อมูล LINE Groups เก็บใน Memory (เหมาะสำหรับ dev)
- **Production**: ควรใช้ Database (PostgreSQL, MongoDB, etc.)
- **Security**: ตรวจสอบให้แน่ใจว่า Environment Variables ปลอดภัย
- **Rate Limiting**: ควรเพิ่ม rate limiting สำหรับ API endpoints

---

## 📧 Support

หากมีปัญหา:
1. ดู [Troubleshooting](./TROUBLESHOOTING.md)
2. ตรวจสอบ Environment Variables
3. ดูที่ Browser Console สำหรับ error
4. ดูที่ Server logs

---

## 📅 Version

- **Current**: v0.1.0
- **Last Updated**: 2026-02-20

---

## 📄 License

Project นี้ใช้ได้อย่างอิสระสำหรับการใช้งานส่วนตัวและองค์กร

---

**Happy Coding! 🚀**
