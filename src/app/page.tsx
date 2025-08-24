'use client';

import { useState, useEffect, FC } from 'react';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import Dashboard from '@/components/Dashboard';
import TaskModal from '@/components/TaskModal';
import { Task, NewTask, DashboardData, Assignee } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TELEGRAM_API_URL = process.env.NEXT_PUBLIC_TELEGRAM_API_URL;

const sendTelegramNotification = async (message: string) => {
  if (!TELEGRAM_API_URL) return;
  try {
    await fetch(TELEGRAM_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

const HomePage: FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [view, setView] = useState<'list' | 'dashboard'>('list');
    const [message, setMessage] = useState<string>('');

  console.log("HomePage Render Log: ", { tasks, assignees, isLoading, error, isModalOpen, taskToEdit, view });
   const showMessage = (msg: string): void => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  useEffect(() => {
    if (!API_URL) {
      setError('กรุณาตั้งค่า NEXT_PUBLIC_API_URL');
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [tasksRes, assigneesRes] = await Promise.all([
          fetch(`${API_URL}?type=tasks`),
          fetch(`${API_URL}?type=assignees`)
        ]);
        if (!tasksRes.ok || !assigneesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
        
        const tasksData: Task[] = await tasksRes.json();
        const assigneesData: Assignee[] = await assigneesRes.json();

        // --- ADD THIS LINE TO DEBUG ---
        console.log("Raw data fetched from server:", tasksData);

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setAssignees(Array.isArray(assigneesData) ? assigneesData : []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
}, []);

  const handleSaveTask = async (taskData: NewTask | Task) => {
      console.log("Input Log (Frontend): Sending this data ->", taskData);

    const action = 'id' in taskData ? 'updateTask' : 'createTask';
    try {
      const response = await fetch(API_URL!, { method: 'POST', body: JSON.stringify({ action, task: taskData }) });
      if (!response.ok) throw new Error('Could not save task');
      const { task: savedTask } = await response.json();
      if (action === 'updateTask') {
        setTasks(p => p.map(t => t.id === savedTask.id ? savedTask : t));
        sendTelegramNotification(`✅ แก้ไขงาน: "${savedTask.title} " ของผู้รับผิดชอบงาน ${savedTask.assignee}  วันเวลาเริ่ม ${savedTask.startDate} ${savedTask.startTime}  วันเวลาสิ้นสุด ${savedTask.endDate} ${savedTask.endTime}`);
      } else {
        setTasks(p => [...p, savedTask]);
        sendTelegramNotification(`✍️ งานใหม่ชื่อ : "${savedTask.title} \nผู้รับผิดชอบงาน : ${savedTask.assignee} \nวันเวลาเริ่ม : ${savedTask.startDate} ${savedTask.startTime}  \nวันเวลาสิ้นสุด : ${savedTask.endDate} ${savedTask.endTime}`);
      }
    } catch (err) { console.error(err); }
  };
  
const handleCompleteTask = async (task: Task) => {
    const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่างาน "${task.title}" เสร็จสิ้นแล้ว?`);
    if (!isConfirmed) return;

    const completedTask = { ...task, status: 'Completed' as const };

    try {
      const response = await fetch(API_URL!, {
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
      const response = await fetch(API_URL!, {
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
  const handleOpenModalForAdd = () => { setTaskToEdit(null); setIsModalOpen(true); };
  const handleOpenModalForEdit = (task: Task) => { setTaskToEdit(task); setIsModalOpen(true); };

  const renderContent = () => {
    if (isLoading) return <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
  {/* Header Skeleton */}
  <div className="flex justify-between items-start">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
  </div>

  {/* Details and Metadata Skeleton */}
  <div className="mt-4 space-y-2">
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>

  <div className="flex flex-col space-y-2 text-sm text-neutral-500 mt-4">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-gray-200"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-gray-200"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
  
  {/* Footer Skeleton */}
  <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
    <div className="h-4 bg-gray-200 rounded w-2/5"></div>
    <div className="flex space-x-2">
      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
    </div>
  </div>
</div>;
    if (error) return <div>Error: {error}</div>;
    if (view === 'list') {
      return <TaskList tasks={tasks} onEdit={handleOpenModalForEdit} onDelete={handleDeleteTask} onComplete={handleCompleteTask} onSendNotification={handleSendNotification} />;
    }
    return <Dashboard tasks={tasks} dashboardData={[]} />;
  };

  return (
    <div className="min-h-screen bg-neutral-100 w-full py-10 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6">
        <Header view={view} setView={setView} onAddTask={handleOpenModalForAdd} />
        {renderContent()}
      </div>
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSaveTask={handleSaveTask} taskToEdit={taskToEdit} assignees={assignees} onUpdateAssignees={setAssignees} />
    </div>
  );
};

export default HomePage;