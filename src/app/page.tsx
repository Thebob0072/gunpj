'use client';

import { useState, useEffect, FC } from 'react';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import Dashboard from '@/components/Dashboard';
import TaskModal from '@/components/TaskModal';
import { Task, NewTask, DashboardData } from '@/types';

// !!! IMPORTANT: Paste your new Google Apps Script Web App URL here !!!
const API_URL = "https://script.google.com/macros/s/AKfycbx_OO5WocNocXbw_Yr8yb6JI-pfezhlbX61gfLsBwSEPqpLqMKJo-d267sGqGXRa_Oh/exec";

// Telegram API settings
const TELEGRAM_BOT_TOKEN = "8418566183:AAGArbqUQFzQPS2FP5CIxtPVVUN12xmaFTY";
const TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID";

const sendTelegramNotification = async (message: string) => {
  const telegramApiUrl = 'http://localhost:3001/api/send-telegram-notification';
  
  try {
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram notification:', await response.text());
    } else {
      console.log('Telegram notification sent successfully.');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

const mockDashboardData: DashboardData[] = [
  { name: 'ส.ค.', 'งานเสร็จสิ้น': 5 },
  { name: 'ก.ย.', 'งานเสร็จสิ้น': 8 },
  { name: 'ต.ค.', 'งานเสร็จสิ้น': 12 },
];

const HomePage: FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'list' | 'dashboard'>('list');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL.startsWith('https')) {
      setError('กรุณาใส่ URL ของ Google Apps Script Web App ในไฟล์ app/page.tsx');
      setIsLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลงานจากฐานข้อมูลได้');
        }
        const data: unknown = await response.json();

        if (Array.isArray(data)) {
          setTasks(data as Task[]);
        } else {
          // If the API returns an empty object or null, treat it as an empty array.
          setTasks([]);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const showMessage = (msg: string): void => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleOpenModalForAdd = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenModalForEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: NewTask | Task) => {
    const isEditing = (taskData as Task).id !== undefined;
    const action = isEditing ? 'update' : 'create';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, task: taskData }),
      });

      if (!response.ok) {
        throw new Error(`ไม่สามารถ${isEditing ? 'แก้ไข' : 'เพิ่ม'}งานได้`);
      }

      const { task: savedTask }: { task: Task } = await response.json();
      
      if (isEditing) {
        setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t));
        showMessage(`แก้ไขงาน "${savedTask.title}" สำเร็จ!`);
        sendTelegramNotification(`✅ งานถูกแก้ไขแล้ว: "${savedTask.title}" (ผู้รับผิดชอบ: ${savedTask.assignee})`);
      } else {
        setTasks(prevTasks => [...prevTasks, savedTask]);
        showMessage(`มอบหมายงาน "${savedTask.title}" สำเร็จ!`);
        sendTelegramNotification(`✍️ งานใหม่ถูกมอบหมาย: "${savedTask.title}" (ผู้รับผิดชอบ: ${savedTask.assignee}) กำหนดส่ง: ${savedTask.endDate}`);
      }

    } catch (err) {
      showMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่างาน "${task.title}" เสร็จสิ้นแล้ว?`);
    if (!isConfirmed) return;

    const completedTask = { ...task, status: 'Completed' as const };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'update', task: completedTask }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัปเดตสถานะงานได้');
      }

      const { task: savedTask }: { task: Task } = await response.json();
      
      setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t));
      showMessage(`งาน "${savedTask.title}" เสร็จสิ้นแล้ว!`);
      sendTelegramNotification(`🎉 งานเสร็จสิ้นแล้ว: "${savedTask.title}"`);

    } catch (err) {
      showMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const isConfirmed = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'delete', id: taskId }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถลบงานได้');
      }

      await response.json();
      
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      showMessage('ลบงานสำเร็จ!');

    } catch (err) {
      showMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleSendNotification = (task: Task) => {
    const isConfirmed = window.confirm(`คุณต้องการส่งข้อความแจ้งเตือนสำหรับงาน "${task.title}" หรือไม่?`);
    if (!isConfirmed) return;

    const calculateTimeLeft = (endDate: string) => {
      const now = new Date();
      const end = new Date(endDate);
      const timeLeft = end.getTime() - now.getTime();
    
      if (timeLeft <= 0) {
        return 'เกินกำหนดเวลา';
      }
    
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    
      let result = '';
      if (days > 0) result += `${days} วัน `;
      if (hours > 0) result += `${hours} ชั่วโมง `;
      if (minutes > 0) result += `${minutes} นาที`;
    
      return result.trim() || 'เหลือไม่ถึง 1 นาที';
    };

    const notificationMessage = `🔔 แจ้งเตือน: งาน "${task.title}" (ผู้รับผิดชอบ: ${task.assignee}) เหลือเวลา: ${calculateTimeLeft(task.endDate)}`;
    sendTelegramNotification(notificationMessage);
    showMessage(`ส่งข้อความแจ้งเตือนสำหรับงาน "${task.title}" แล้ว!`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-12 text-neutral-500">กำลังโหลดข้อมูลจาก Google Sheet...</div>;
    }
    if (error) {
      return <div className="text-center p-12 text-red-600 bg-red-50 rounded-lg">เกิดข้อผิดพลาด: {error}</div>;
    }
    if (view === 'list' && tasks.length === 0) {
        return <div className="text-center text-neutral-500 p-8 border-2 border-dashed border-neutral-300 rounded-xl">ไม่พบงานค้าง</div>;
    }
    if (view === 'list') {
      return <TaskList tasks={tasks} onEdit={handleOpenModalForEdit} onDelete={handleDeleteTask} onComplete={handleCompleteTask} onSendNotification={handleSendNotification} />;
    }
    return <Dashboard tasks={tasks} dashboardData={mockDashboardData} />;
  }

  const calculateTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeLeft = end.getTime() - now.getTime();
  
    if (timeLeft <= 0) {
      return 'เกินกำหนดเวลา';
    }
  
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  
    let result = '';
    if (days > 0) result += `${days} วัน `;
    if (hours > 0) result += `${hours} ชั่วโมง `;
    if (minutes > 0) result += `${minutes} นาที`;
  
    return result.trim() || 'เหลือไม่ถึง 1 นาที';
  };

  return (
    <div className="min-h-screen bg-neutral-100 w-full py-10 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6">
        <Header 
          view={view}
          setView={setView}
          onAddTask={handleOpenModalForAdd}
        />

        {message && (
          <div className="bg-amber-100 text-amber-800 p-3 rounded-xl my-4 text-center font-medium">
            {message}
          </div>
        )}

        {renderContent()}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveTask={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default HomePage;
