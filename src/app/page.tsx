'use client';

import { useState, useEffect, FC } from 'react';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import Dashboard from '@/components/Dashboard';
import TaskModal from '@/components/TaskModal';
import { Task, NewTask, DashboardData } from '@/types';
// --- Import centralized helper ---
import { formatDateForInput as formatThaiDate } from '@/helpers/utils';


// Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbx_OO5WocNocXbw_Yr8yb6JI-pfezhlbX61gfLsBwSEPqpLqMKJo-d267sGqGXRa_Oh/exec";

// ... (The rest of the component is the same as your version)
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
        setTasks(Array.isArray(data) ? (data as Task[]) : []);
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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, task: taskData }),
      });

      if (!response.ok) throw new Error(`ไม่สามารถ${isEditing ? 'แก้ไข' : 'เพิ่ม'}งานได้`);
      
      const { task: savedTask }: { task: Task } = await response.json();
      
      if (isEditing) {
        setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t));
        showMessage(`แก้ไขงาน "${savedTask.title}" สำเร็จ!`);
        handleSendNotification(savedTask, `✅ <b>งานถูกแก้ไขแล้ว</b>`);
      } else {
        setTasks(prevTasks => [...prevTasks, savedTask]);
        showMessage(`มอบหมายงาน "${savedTask.title}" สำเร็จ!`);
        handleSendNotification(savedTask, `✍️ <b>งานใหม่ถูกมอบหมาย</b>`);
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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'update', task: completedTask }),
      });

      if (!response.ok) throw new Error('ไม่สามารถอัปเดตสถานะงานได้');
      
      const { task: savedTask }: { task: Task } = await response.json();
      
      setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t));
      showMessage(`งาน "${savedTask.title}" เสร็จสิ้นแล้ว!`);
      handleSendNotification(savedTask, `🎉 <b>งานเสร็จสิ้นแล้ว</b>`);

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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', id: taskId }),
      });

      if (!response.ok) throw new Error('ไม่สามารถลบงานได้');
      
      await response.json();
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      showMessage('ลบงานสำเร็จ!');

    } catch (err) {
      showMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleSendNotification = async (task: Task, customTitle?: string) => {
    const isConfirmed = customTitle ? true : window.confirm(`คุณต้องการส่งข้อความแจ้งเตือนสำหรับงาน "${task.title}" หรือไม่?`);
    if (!isConfirmed) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'sendNotification', task }),
      });

      if (!response.ok) throw new Error('ไม่สามารถส่งการแจ้งเตือนได้');
      
      if(!customTitle) showMessage(`ส่งข้อความแจ้งเตือนสำหรับงาน "${task.title}" แล้ว!`);

    } catch (err) {
      showMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const calculateDashboardData = (tasks: Task[]): DashboardData[] => {
    const monthlyData: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      if (task.status === 'Completed' && task.endDate) {
        try {
            const monthName = new Date(task.endDate).toLocaleString('th-TH', { month: 'short' });
            monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;
        } catch (e) {
            console.error("Invalid date for task:", task);
        }
      }
    });

    return Object.entries(monthlyData).map(([name, count]) => ({
      name,
      'งานเสร็จสิ้น': count,
    }));
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
    return <Dashboard tasks={tasks} dashboardData={calculateDashboardData(tasks)} />;
  }
  
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