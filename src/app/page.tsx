'use client';

import { useState, useEffect, FC } from 'react';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import Dashboard from '@/components/Dashboard';
import TaskModal from '@/components/TaskModal';
import LineGroupSelector from '@/components/LineGroupSelector';
import { Task, NewTask, Assignee, LineUser } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TELEGRAM_API_URL = process.env.NEXT_PUBLIC_TELEGRAM_API_URL;
const LINE_API_URL = process.env.NEXT_PUBLIC_LINE_API_URL;

const sendTelegramNotification = async (message: string) => {
  if (!TELEGRAM_API_URL) return;
  try {
    await fetch(TELEGRAM_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

const sendLineNotification = async (groupId: string, message: string, taskTitle: string, assignee: string, taskId?: string) => {
  if (!LINE_API_URL) return;
  try {
    await fetch(LINE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, message, taskTitle, assignee, taskId })
    });
  } catch (error) {
    console.error('Error sending LINE notification:', error);
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
  const [isLineGroupSelectorOpen, setIsLineGroupSelectorOpen] = useState<boolean>(false);
  const [selectedLineGroupId, setSelectedLineGroupId] = useState<string | null>(null);
  const [selectedLineGroupName, setSelectedLineGroupName] = useState<string | null>(null);
  const [selectedLineGroupMembers, setSelectedLineGroupMembers] = useState<LineUser[]>([]);

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
          fetch(`${API_URL}/tasks`),
          fetch(`${API_URL}/assignees`)
        ]);
        if (!tasksRes.ok || !assigneesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
        
        const tasksData: Task[] = await tasksRes.json();
        const assigneesData: Assignee[] = await assigneesRes.json();

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
    const isUpdate = 'id' in taskData;
    try {
      const url = isUpdate ? `${API_URL}/tasks/${(taskData as Task).id}` : `${API_URL}/tasks`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Could not save task');
      const { task: savedTask } = await response.json();
      if (isUpdate) {
        setTasks(p => p.map(t => t.id === savedTask.id ? savedTask : t));
        sendTelegramNotification(`✅ แก้ไขงาน: "${savedTask.title} " ของผู้รับผิดชอบงาน ${savedTask.assignee}  วันเวลาเริ่ม ${savedTask.startDate} ${savedTask.startTime}  วันเวลาสิ้นสุด ${savedTask.endDate} ${savedTask.endTime}`);
        if (selectedLineGroupId) {
          const lineMsg = `แก้ไขงาน: "${savedTask.title}"\nเวลาเริ่ม: ${savedTask.startDate} ${savedTask.startTime}\nเวลาสิ้นสุด: ${savedTask.endDate} ${savedTask.endTime}`;
          sendLineNotification(selectedLineGroupId, lineMsg, savedTask.title, savedTask.assignee, savedTask.id);
        }
      } else {
        setTasks(p => [...p, savedTask]);
        sendTelegramNotification(`✍️ งานใหม่ชื่อ : "${savedTask.title} \nผู้รับผิดชอบงาน : ${savedTask.assignee} \nวันเวลาเริ่ม : ${savedTask.startDate} ${savedTask.startTime}  \nวันเวลาสิ้นสุด : ${savedTask.endDate} ${savedTask.endTime}`);
        if (selectedLineGroupId) {
          const lineMsg = `งานใหม่: "${savedTask.title}"\nเวลาเริ่ม: ${savedTask.startDate} ${savedTask.startTime}\nเวลาสิ้นสุด: ${savedTask.endDate} ${savedTask.endTime}`;
          sendLineNotification(selectedLineGroupId, lineMsg, savedTask.title, savedTask.assignee, savedTask.id);
        }
      }
    } catch (err) { console.error(err); }
  };
  
const handleCompleteTask = async (task: Task) => {
    const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่างาน "${task.title}" เสร็จสิ้นแล้ว?`);
    if (!isConfirmed) return;

    const completedTask = { ...task, status: 'Completed' as const };

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completedTask),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัปเดตสถานะงานได้');
      }

      const { task: savedTask }: { task: Task } = await response.json();
      
      setTasks(prevTasks => prevTasks.map(t => t.id === savedTask.id ? savedTask : t));
      showMessage(`งาน "${savedTask.title}" เสร็จสิ้นแล้ว!`);
      sendTelegramNotification(`🎉 งานเสร็จสิ้นแล้ว: "${savedTask.title}"`);
      if (selectedLineGroupId) {
        sendLineNotification(selectedLineGroupId, `งานเสร็จสิ้นแล้ว: "${savedTask.title}"`, savedTask.title, savedTask.assignee);
      }

    } catch (err) {
      showMessage(`เกิดข้อผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const isConfirmed = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
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
    if (error) {
      return (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl border-2 border-orange-300 shadow-lg shadow-orange-200/50">
          <div className="flex items-start gap-4">
            <div className="text-orange-600 text-3xl font-black">⚠</div>
            <div>
              <h3 className="text-xl font-black text-orange-900">เกิดข้อผิดพลาด</h3>
              <p className="text-orange-700 mt-2 font-semibold">{error}</p>
            </div>
          </div>
        </div>
      );
    }
    if (view === 'list') {
      return <TaskList tasks={tasks} onEdit={handleOpenModalForEdit} onDelete={handleDeleteTask} onComplete={handleCompleteTask} onSendNotification={handleSendNotification} />;
    }
    return <Dashboard tasks={tasks} dashboardData={[]} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 w-full flex flex-col">
      <div className="w-full flex-1 flex flex-col">
        {/* Message Alert */}
        {message && (
          <div className="px-2 pt-2 pb-0 sm:px-6 sm:pt-6">
            <div className="bg-white border-l-4 border-orange-500 shadow-lg rounded-2xl p-4 flex items-start gap-3 border-2 border-orange-300">
              <div className="text-orange-600 text-2xl flex-shrink-0">✓</div>
              <div>
                <p className="text-orange-900 font-bold">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 bg-gradient-to-br from-white to-orange-50 m-2 mt-2 sm:m-6 sm:mt-4 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 space-y-4 sm:space-y-6 border-2 border-orange-200 overflow-y-auto">
          <Header view={view} setView={setView} onAddTask={handleOpenModalForAdd} onOpenLineGroupSelector={() => setIsLineGroupSelectorOpen(true)} selectedLineGroupName={selectedLineGroupName || undefined} selectedLineGroupMemberCount={selectedLineGroupMembers.length} />
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSaveTask={handleSaveTask} taskToEdit={taskToEdit} assignees={assignees} onUpdateAssignees={setAssignees} selectedLineGroupMembers={selectedLineGroupMembers} />
      <LineGroupSelector isOpen={isLineGroupSelectorOpen} onClose={() => setIsLineGroupSelectorOpen(false)} onSendToGroup={(groupId, groupName, members) => {
        setSelectedLineGroupId(groupId);
        setSelectedLineGroupName(groupName);
        setSelectedLineGroupMembers(members);
        showMessage(`เลือกกลุ่ม: ${groupName}`);
      }} />
    </div>
  );
};

export default HomePage;