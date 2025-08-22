'use client';
import { FC, useEffect, useState } from 'react';
import { User, Calendar, Edit, Trash2, CheckCircle, MessageSquareWarning } from 'lucide-react';
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onSendNotification: (task: Task) => void;
}

// --- 1. สร้างฟังก์ชันสำหรับจัดรูปแบบวันที่เป็นแบบไทย ---
const formatThaiDate = (dateString: string) => {
  if (!dateString) return 'ไม่ได้ระบุ';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
  return `${day}/${month}/${year}`;
};


const renderTaskStatus = (status: Task['status']) => {
  let color = '', text = '';
  switch (status) {
    case 'To Do': color = 'bg-neutral-200 text-neutral-800'; text = 'ยังไม่เริ่ม'; break;
    case 'In Progress': color = 'bg-amber-200 text-amber-800'; text = 'กำลังดำเนินงาน'; break;
    case 'Completed': color = 'bg-green-200 text-green-800'; text = 'เสร็จสิ้น'; break;
    default: color = 'bg-neutral-100 text-neutral-600'; text = 'ไม่ระบุ';
  }
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
};

const calculateTimeLeft = (endDate: string, endTime: string) => {
  // รวมวันที่และเวลาเข้าด้วยกันเพื่อการคำนวณที่แม่นยำ
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const now = new Date();
  const timeLeft = endDateTime.getTime() - now.getTime();

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

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete, onComplete, onSendNotification }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(task.endDate, task.endTime));
  const isOverdue = timeLeft === 'เกินกำหนดเวลา';

  useEffect(() => {
    if (task.status === 'Completed') return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(task.endDate, task.endTime));
    }, 60000); // อัปเดตทุกนาที

    return () => clearInterval(timer);
  }, [task.endDate, task.endTime, task.status]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h3 className="text-lg font-bold text-neutral-900">{task.title}</h3>
        <div className="flex items-center text-neutral-600 mt-1 space-x-2">
          <User size={16} className="text-neutral-500" /><span>{task.assignee}</span>
        </div>
        {/* --- 2. ปรับปรุงการแสดงผลวันที่และเวลา --- */}
        <div className="flex items-center text-sm text-neutral-500 mt-2 space-x-2">
            <Calendar size={16}/>
            <span>
                {formatThaiDate(task.startDate)} ({task.startTime} น.) - {formatThaiDate(task.endDate)} ({task.endTime} น.)
            </span>
        </div>
        {(task.status !== 'Completed') && (
          <div className={`mt-2 text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
            <span className={`px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-amber-100'}`}>
              {isOverdue ? `เกินกำหนดเวลา` : `เหลือเวลา: ${timeLeft}`}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-3 mt-3 sm:mt-0">
        {renderTaskStatus(task.status)}
        {task.status !== 'Completed' && (
          <button onClick={() => onComplete(task)} className="p-2 rounded-full text-green-500 hover:bg-neutral-100 transition-colors" title="ทำเครื่องหมายว่าเสร็จสิ้น">
            <CheckCircle size={16} />
          </button>
        )}
        <button onClick={() => onEdit(task)} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-amber-500 transition-colors" title="แก้ไขงาน"><Edit size={16} /></button>
        <button onClick={() => onDelete(task.id)} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-red-500 transition-colors" title="ลบงาน"><Trash2 size={16} /></button>
        <button onClick={() => onSendNotification(task)} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-blue-500 transition-colors" title="ส่งการแจ้งเตือน"><MessageSquareWarning size={16} /></button>
      </div>
    </div>
  );
};

export default TaskItem;