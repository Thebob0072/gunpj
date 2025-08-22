'use client';
import { FC, useEffect, useState } from 'react';
import { User, Calendar, Edit, Trash2, CheckCircle, MessageSquareWarning } from 'lucide-react';
import { Task } from '@/types';
// --- Import centralized helper ---
import { formatDateForInput as formatThaiDate } from '@/helpers/utils';

// ... (The rest of the component is the same as your version)
interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onSendNotification: (task: Task) => void;
}

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
    }, 60000);

    return () => clearInterval(timer);
  }, [task.endDate, task.endTime, task.status]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div className='flex-1'>
        <h3 className="text-lg font-bold text-neutral-900">{task.title}</h3>
        {task.details && <p className='text-sm text-neutral-500 mt-1'>{task.details}</p>}
        <div className="flex items-center text-neutral-600 mt-2 space-x-4">
          <div className='flex items-center space-x-2'>
            <User size={16} className="text-neutral-500" />
            <span>{task.assignee}</span>
          </div>
          <div className='flex items-center text-sm text-neutral-500 space-x-2'>
            <Calendar size={16}/>
            <span>
                {formatThaiDate(task.startDate)} ({task.startTime}) - {formatThaiDate(task.endDate)} ({task.endTime})
            </span>
          </div>
        </div>
        {(task.status !== 'Completed') && (
          <div className={`mt-2 text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
            <span className={`px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-amber-100'}`}>
              {isOverdue ? `เกินกำหนดเวลา` : `เหลือเวลา: ${timeLeft}`}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-1 mt-3 sm:mt-0 sm:pl-4">
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